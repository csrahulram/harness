# Architecture

## Folders, one container each
```
frontend/    static page: chat, session sidebar, chain panel        port 8765
input/       HTTP: validates tasks, names sessions, writes task files port 8001
workflows/   runner: picks up tasks, runs agents in order, writes results   (GPU, no network)
output/      HTTP: serves results, streams, chains, session list    port 8002
telemetry/   the session chain and session metadata (library today, service later)
agents/      one folder per model agent
models/      model weights, git-ignored
common/      shared one-function helpers (config, shapes, JSON, GPU)
memory/      facts for the thinker (later phase)
workspace/   scratch exchange between services (later phase)
tests/       end-to-end test runner
```
Every folder has `main.py` (wiring) and `modules/` (one function per file). `common/` is flat because it is itself a module pack.

## Data flow for a chat message
```
browser ──POST /task──▶ input ──writes──▶ input/<session>/<task>.json
                          │ records step "input" in telemetry/<session>.jsonl
workflows ◀──polls input folder
   call("context_guard") → record step        telemetry/<session>.jsonl
   call("thinker")       → streams answer     output/<session>/<task>.stream.txt
   writes result                              output/<session>/<task>.json
browser ◀──GET /stream, /result, /history── output
```
No service imports another. The file layout and the JSON shapes in `config.json` are the contract, checked at every boundary by `common/check_shape.py`.

## The session chain
One JSON line per step in `telemetry/<session>.jsonl`:
`step, prev, agent, validation, input, output, seconds, status`. `prev` links to the previous step, so the chain is a linked list. A termination record (`agent: end`, `output: {by, reason, time}`) closes it, written when the guard blocks, a step fails, input rejects, or the user closes the session.

Session metadata (`telemetry/<session>.json`): `session, name, created, updated, ended`. A session closed by the user is hidden from the list; its files are kept.

## Files
Uploads are posted as base64 JSON, so services still exchange nothing but JSON and no multipart parsing is needed. `POST /upload` checks the extension against `media_types` in the root config and the decoded size against `max_upload_bytes`, then saves the bytes under a fresh name in `input/<session>/files/`. A task names them in its `files` list. `GET /file?session=&name=` serves both uploaded inputs and generated results, so the browser can show or download either.

## Interfaces
Agent (`agents/<name>/main.py`):
```
load()            loads the model into state
unload()          frees the GPU
run(task) -> record
state, SETTINGS   dicts the runner may read
```
`task` carries `session, task, mode, text, files` plus what the workflow adds (for the thinker: `guard`, `output_folder`).
`record` carries `allowed, reason, agent, model, seconds` plus the payload (`text`, `files`, `score`).

Workflow (`workflows/<name>/main.md`) — a document, not code:
```markdown
# Chat

Answer a written question with the local chat model.

## Steps
1. context_guard
2. thinker
```
`workflows/modules/read_steps.py` pulls the numbered list out of the markdown, and `run_steps.py` runs those agents in order, handing each one the previous record under `previous` and stopping at the first that refuses. The reply is the last record's `text`, or the first file it made. Adding a capability means writing a markdown file and one line in `workflows/config.json`; no Python is written for a workflow.

`call(agent_name, task)` is built by `workflows/modules/make_call.py`. It waits for GPU memory, loads the model if needed, verifies the weight fingerprint, runs the agent, checks the record shape and writes the chain step.

## GPU policy
- Before loading, the runner waits until free GPU memory covers the agent's `gpu_gb`.
- At load, an exact byte sum of every weight and buffer is stored; before every call it is recomputed (about 0.9 s for a 1.7B model) and the difference is recorded in the chain as `drift`. A byte sum is used because a float sum over billions of values is not reproducible on a GPU. Drift is reported, not corrected: on this machine the transfer itself is lossy, so reloading would not give a clean copy (see PLAN.md). Set `limits.verify_weights` to false to skip the check.
- `gpu_idle_seconds` is **0, meaning models are never moved off the GPU**. Parking them in system RAM and bringing them back fragmented the allocator: after a few cycles the process held about 8 GB with no model resident, and the next load failed with "need 4.5 GB, only 3.4 GB free". Keeping the chat models resident costs 4 GB and removes the failure. A positive value restores parking, which will matter again when more models than fit are in play.
- The container sets `PYTORCH_CUDA_ALLOC_CONF=expandable_segments:True`, which cut total use from about 9.9 GB to 8.2 GB.
- Every step records `allocated_gb` and `reserved_gb` beside free memory. These are **process-wide**, not per agent, and the gap between them is allocator cache: typically 4 GB allocated against 8.45 GB reserved, which settles rather than grows.
- Before a model runs, if free memory is below its `gpu_gb`, every other model is moved off the GPU: one model at a time is the honest ceiling on a 12 GB card shared with the desktop. The chain records which models were freed. Each agent's `gpu_gb` is a measured peak, not a guess: `workspace/calibrate.py` loads an agent, runs a representative task and reports its real peak against what it declares. A reservation must also cover the KV cache, which grows with context length, so the input token limit and `gpu_gb` are set together (see PLAN.md).
- Free GPU memory and the wait before each call are recorded on every step.

## Accounts and ownership
PostgreSQL (with pgvector) holds accounts, tokens, sessions and, later, memories. Everything
references `users(name)` with `ON DELETE CASCADE`, so deleting a profile is one statement rather
than a sweep across folders.

Passwords are hashed with `hashlib.scrypt` from the standard library, about 33 ms a hash. Tokens
are `secrets.token_urlsafe(32)` rows with an expiry. `input` serves `/signup`, `/signin`,
`/signout` and `/account`; every other route on both services requires an `X-Token` header, and
**the user is taken from the token, never from the request body**. `/sessions` lists only that
person's sessions, and `/history`, `/result`, `/stream` and `/file` refuse a session owned by
someone else.

This is a boundary between people sharing a personal machine, not a hardened system: traffic is
plain HTTP on `127.0.0.1`, so a token is readable by anything that can already watch loopback. It
needs HTTPS before the harness is exposed beyond this machine.

The database split: **session metadata** lives in `sessions` (it needs filtering by owner and
ordering by recency), while **the chain** stays in `telemetry/<session>.jsonl` (append-only and
large). That split also separated two things that used to be confused — a task ending in the chain
and a session being closed by its owner are now different events in different places.

Two networks: `harness-edge` carries the published ports, and `harness-internal` is declared
`internal: true` so `workflows` and `database` can reach each other with no route to the internet.

## What the harness remembers about a person
`memory/users/<name>/` holds two markdown notes: `profile.md` (durable facts) and `soul.md` (how to
relate to them). A `memory_recall` step reads them and hands them to the thinker, which folds them
into the **system message**, each capped at 400 tokens so a long note can never crowd out the
conversation. The thinker's `context` record reports how many tokens each contributed, and the
panel shows it.

People edit their own notes in the page: **Memory** in the header opens them, shows how many tokens
each uses against its 400 cap, and saves. Clearing a note deletes its file. `output` serves
`GET /memory` and `input` takes `POST /memory`, both scoped to the token's owner, and `memory/` is
mounted read-only into `output` so reading can never create or change anything.

A note the signed-in owner typed is **trusted and not guarded**. They are the principal: an
assistant its owner cannot configure is not much use, and the guard's false positives on unusual
text would block legitimate instructions. Memory the *model* writes is a different matter and is
guarded before storage, from M2 on.

`memory_recall` is an agent that holds no model, which is why `ensure_loaded` fingerprints only
agents that have one. Making recall a step rather than something the thinker does itself keeps it
visible in the chain, and gives retrieval somewhere to live in M2.

## Remembering across sessions
`memory_keeper` runs after the reply has already streamed, so its slowness costs the conversation
nothing. It asks `qwen3_0.6b` for one lasting fact about the person, **guards that fact**, embeds it
and stores it in `memories` unless something that close in meaning is already there.

Three things keep a small model from filling the store with nonsense:
- **Greedy decoding.** With sampling on, the extractor answered "Nothing." to everything.
- **A pattern filter.** The model is poor at refusing, so it describes questions instead: "The user
  asked a simple math question." `is_durable` rejects those by phrase, in config rather than code.
  Code refuses; the model only writes.
- **The guard runs on the fact itself**, because a stored fact is replayed into every later prompt.
  That is the highest-value target prompt injection has.

Retrieval uses `multi_qa_minilm_l6`, built for matching questions to statements. The symmetric
`all-MiniLM` put "What do I do for work?" **0.865** away from the matching fact, which no sensible
threshold admits. Even so, absolute distance is a poor relevance signal for short facts, so recall
takes the nearest five under a loose ceiling and lets ranking do the work.

Everything the keeper runs — extractor, fact guard and embedder — sits on the **processor**. The
card already holds the guard and the thinker, and the chain confirms allocation stays at 4 GB.

## The knowledge base
`memory/knowledge/` is an Obsidian vault: plain markdown you can open and edit in Obsidian, which
the harness reads and never writes. It is separate from user memory — nothing in it is about a
person. A `knowledge` table holds it, with `owner` NULL for shared notes or a name for a private
vault.

What gets understood:
- **Headings** split a note into sections, so a search returns the section that matched rather than
  a whole file.
- **`[[Wiki links]]`** are followed: when a section is recalled, the notes it links to become
  candidates, which is how a chain of related notes reaches the model.
- **`#tags`** and YAML frontmatter are stored, so notes can be filtered as well as searched.
- A file's modification time decides when it is re-indexed.

Notes are guarded when indexed. A note is text from outside that ends up in a prompt, so it gets
the same prompt-injection check as anything typed into the chat; one that fails is skipped and
named, not silently dropped.

## Session memory and the context budget
The chain already records every message and every reply, so the conversation needs no second
store. `telemetry.turns(session, task)` replays the chain into alternating user and assistant
exchanges, skipping the message being answered and any turn the guard blocked, and the runner
puts that list in the task as `history`.

The thinker owns its own budget, because it owns the tokenizer. `trim_history` assembles the
system prompt, the history and the new message, counts the tokens the template actually produces,
and drops the oldest exchange until it fits `prompt_tokens` (8192). The newest turns therefore
survive and the oldest fall away.

Every thinker step records what it used:

```json
"context": {"turns": 3, "dropped": 1, "prompt_tokens": 1240, "budget": 8192}
```

The chain panel shows that as "3 turns remembered · 1240 / 8192 context tokens", so context length
is visible rather than guessed. This matters for memory as well as quality: the KV cache costs
112 KB a token, so a full prompt adds about 1.3 GB over the weights (measured), which is why the
thinker reserves 5.5 GB.

History never reaches the chain's stored copy of the task. `brief_task` replaces it with a count
first, otherwise every step would store the whole conversation and the chain file would grow with
the square of its length.

## Validation
- Input: text length and token count (Qwen3 tokenizer) against the model's context limit, before a task is saved.
- Guard: prompt-injection classifier on every text that reaches a model.
- Resource: free GPU memory before any model load.
- Shape: every task, record, step and result is checked against `config.json` shapes.

## Docker
`docker-compose.yml` builds four images. Code folders are bind-mounted, so edits apply on restart without a rebuild. `workflows` has the GPU and `network_mode: none`. Ports are published on `127.0.0.1` only. `config.json` and `common/` are mounted read-only into every container.

## Running across several machines (design, not built)

One 12 GB card cannot hold the models the 13 capabilities need. Rather than fight that
ceiling, agents spread across machines on the local network, each with its own GPU. The
total VRAM becomes the sum of the nodes, and a machine with a failing card can be taken
out of rotation instead of poisoning everything.

### The one seam
`call(agent_name, task)` is the only place an agent is ever invoked. Today it runs the
agent in the same process. Across machines it posts the task to wherever that agent lives
and reads the record back:

```
record = POST http://<node>:<port>/run   {task}  ->  record
```

Nothing else changes. The workflow markdown, the chain, the guard-first rule, the shapes
and `check_shape` are all untouched, because agents already exchange nothing but JSON and
never know who called them. That property was the point of the interface rules.

### An agent becomes a small service
Each `agents/<name>/main.py` already holds `load`, `unload`, `run`, `state` and
`SETTINGS`. It gains a `__main__` block that serves them:

| Route | Does |
|---|---|
| `POST /run` | takes a task, returns a record, same shapes as now |
| `GET /health` | `{agent, model, loaded, vram_free_gb, drift}` |

Starting one is `python agents/thinker/main.py`, the same pattern every other folder uses.

### Where agents live is configuration, not code
Root `config.json` gains two blocks:

```json
"nodes": {
  "workstation": { "host": "127.0.0.1",   "vram_gb": 12 },
  "studio":      { "host": "192.168.1.42", "vram_gb": 24 }
},
"placement": {
  "context_guard": { "node": "workstation", "port": 8101 },
  "thinker":       { "node": "studio",      "port": 8102 }
}
```

Moving a model to another machine is an edit to this file. Placement is **static and
declared**, never decided at runtime: the same rule that keeps a model from choosing the
workflow steps keeps it from choosing the hardware. The runner refuses at startup if an
agent is placed on a node whose `vram_gb` is below its `gpu_gb`.

### Moving files between nodes
Agents already take `input_folder` and `output_folder` from the task and read and write
plain files, so the simplest transport is a **shared folder** on the LAN holding `input/`,
`output/` and `telemetry/`. No code changes, and streamed replies keep working because the
stream is a file.

Where a node cannot mount the share, it falls back to fetching through the output
service's existing `GET /file` route and posting results back. Base64 inside the task is
kept only for small payloads; it is wasteful for meshes and video.

### Each node governs its own GPU
The whole GPU policy above becomes per-node and therefore simpler: a node holds the models
placed on it, applies its own idle unloading, and reports what it has. The runner stops
being a memory manager and becomes a dispatcher.

### Failure is a first-class case
- The runner checks `/health` before dispatching, and a node that does not answer ends the
  chain with a clear termination record naming the node.
- **A node reporting weight drift is marked unhealthy and taken out of rotation.** The
  drift check that caught the faulty card becomes the mechanism that routes around one.
- Timeouts are per agent, since a 3D render and a guard check are not comparable.

### Security
Agent services must not be open on the network. They bind to the LAN interface, accept a
shared token, and reject anything else. This is the first real use for `.env`, which holds
only secrets and is git-ignored. The chain records which node served each step.

### Migration, each step leaving a working system
1. Today: `call` runs agents in-process on one machine.
2. Agents can also run as services; `call` speaks HTTP to `127.0.0.1`. Same machine, same
   results, now over a socket.
3. Change one agent's `node` in `config.json` and it runs on another machine.
4. Nothing else is rewritten at any point.

### What this costs
- One network round trip per step: a few milliseconds on a LAN, against model times
  measured in seconds. Not a concern.
- Each node loads its own copies of the models it serves, so disk and RAM are duplicated.
- More moving parts: service discovery, health, tokens and timeouts are new failure modes
  that do not exist in a single process.
