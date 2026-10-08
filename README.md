# harness-master

A personal harness that runs real work on **small language models, on one machine, offline**.

The models are 0.6B and 1.7B parameters. They run on a single consumer graphics card, they cost
nothing per token, and nothing leaves the machine. The point is not to imitate a large hosted
assistant. It is to find where small models actually fail and write code that holds them inside
what they can do.

**The rule the whole design follows: code orders the steps, models only do the narrow job they are
good at.** Small models plan badly, so they are never asked to plan. A workflow is a numbered list
written by a person; the runner walks it and stops at the first refusal.

## What it does today

- **Chat** on Qwen3 1.7B, streamed into the page as it is generated.
- **A guard in front of every input**, which refuses prompt injection before any model reads it,
  including injection hidden inside HTML comments.
- **Accounts** — sign up, sign in, delete — on PostgreSQL, with every route behind a token. Deleting
  an account removes everything belonging to it in one statement.
- **Memory in layers**: the session's own history, hand-written profile and soul notes that go into
  every prompt, and facts the harness notices during conversation, stored as vectors and recalled by
  similarity in later sessions. You can read, edit and delete all of it in the page.
- **A visible chain**: every step of every task is recorded as a linked list, so you can see what
  each model was given, what it returned, how long it took and how much VRAM it held.
- **An evaluation harness** that measures prompt changes instead of guessing at them.

## How it is put together

Each top-level folder becomes a container:

| Service | Does | Reachable at |
|---|---|---|
| `frontend` | serves the page | `127.0.0.1:8765` |
| `input` | accepts tasks, validates and guards them | `127.0.0.1:8001` |
| `output` | serves results, history and files | `127.0.0.1:8002` |
| `workflows` | holds the models and runs the steps | internal only |
| `database` | PostgreSQL 16 with pgvector | internal only |

Two networks. `harness-edge` carries the three services a browser talks to. `harness-internal` is
declared `internal: true`, so **the container holding the models has no route to the internet at
all** — it can reach its neighbours and nothing else.

Services exchange only files and JSON. Agents never import each other, never read each other's
files, and never know who called them.

A session is a linked list of step records in `telemetry/<session>.jsonl`. Every record carries
`allowed, reason, agent, model, seconds`, so a conversation can be replayed, resumed and audited
step by step.

## What you need

**Hardware**

- An NVIDIA GPU with about **8 GB of free VRAM**. The two resident models reserve 6.5 GB
  (thinker 5.5, guard 1.0). Developed on an RTX 4070 SUPER, 12 GB.
- About **7 GB of disk** for model weights.
- 16 GB of system RAM is comfortable.

**Software**

- **Docker Desktop** with the WSL2 backend, and GPU support enabled so containers can see the card.
  Check with `docker run --rm --gpus all nvidia/cuda:12.4.0-base-ubuntu22.04 nvidia-smi` — if that
  prints your card, Docker can reach it.
- A recent **NVIDIA driver**. No CUDA toolkit needed on the host; it lives in the image.
- **Python 3** on the host, to run the tests. They use only the standard library, so there is
  nothing to install. `huggingface_hub` is needed once, to fetch the models.

## Getting started

**1. Clone and set the database password**

`.env` holds secrets only, and is git-ignored. Create it with one line:

```
POSTGRES_PASSWORD=pick-something
```

**2. Download the models**

Nothing is downloaded at runtime, so fetch the weights first. Each goes in `models/` under the
folder name the configuration expects:

```bash
pip install huggingface_hub
python - <<'EOF'
from huggingface_hub import snapshot_download

wanted = {
    "qwen3_1.7b": "Qwen/Qwen3-1.7B",                                  # chat, 3.9 GB
    "qwen3_0.6b": "Qwen/Qwen3-0.6B",                                  # notices facts, 1.4 GB
    "prompt_injection_guard_small": "Horizon-Labs/prompt-injection-guard-small",   # 0.6 GB
    "multi_qa_minilm_l6": "sentence-transformers/multi-qa-MiniLM-L6-cos-v1",       # 88 MB
}
for folder, repo in wanted.items():
    snapshot_download(repo, local_dir=f"models/{folder}")
EOF
```

Only for `evals/`, one more — an entailment model that judges replies:

```python
snapshot_download("MoritzLaurer/DeBERTa-v3-base-mnli-fever-anli",
                  local_dir="models/deberta_v3_base_mnli")      # 361 MB
```

**3. Start it**

```bash
docker compose up -d --build      # first time, or after a Dockerfile change
docker compose up -d              # afterwards
```

Open **http://127.0.0.1:8765/** and create an account on the
sign-in screen and send a message. The first reply takes about forty seconds while the model loads
from disk; after that it streams.

**4. Check it works**

```bash
python tests/main.py
```

Eleven cases against the running stack: a normal question, a direct injection, an injection hidden
in an HTML comment, an over-long input, session list/rename/close, session memory, accounts and
ownership, profile notes, memory notes, learning and recall, and a poisoned fact being refused.
Each prints PASS or FAIL with the chain it produced.

```bash
docker compose logs workflows --tail 20
docker compose down               # stops everything and frees the GPU
```

## Measuring prompt changes

`evals/` exists because you cannot tell whether a prompt change helped by reading one good reply.
It asks the same questions of an invented person under each candidate system message and scores the
replies twice: by keyword, and by a DeBERTa-v3 entailment model that can tell *"Your name is Alex"*
from *"I'm Alex"* — a distinction no amount of string matching will catch.

The judge is itself checked against replies labelled by hand, so it can be distrusted on evidence:

```bash
docker compose run --rm --no-deps workflows python /harness/evals/check_judge.py   # the judge's own test
docker compose run --rm --no-deps workflows python /harness/evals/main.py          # compare prompts
```

## Where things live

| | |
|---|---|
| Application settings — paths, ports, limits, JSON shapes | `config.json` |
| Model settings, one per agent | `agents/<name>/config.json` |
| Workflows, as markdown | `workflows/<name>/main.md` |
| Secrets, git-ignored | `.env` |
| Session data, git-ignored | `input/`, `output/`, `telemetry/` |
| Model weights, git-ignored | `models/` |

Code follows a few rules without exception: one function per `.py`, placed in that folder's
`modules/`; `main.py` only wires things together; no file over 100 lines; one comment line at the
top of each file saying what it does; no paths, ports or model names hard-coded. `CLAUDE.md` is the
full list.

## Known limits

This is a learning project and it is honest about what does not work.

- **The fact extractor is unreliable.** Given `My dog is called X`, the 0.6B model named the dog
  correctly for only 2 of 7 names tried — the rest became *the user's* name. The tests use a name it
  handles, and say so, rather than pretending the problem is solved.
- **The thinker sometimes claims to be you.** Asked who it is, it may answer with the person's name
  from its notes. Labelling the prompt reduces this; it does not remove it.
- **The evaluation is too small to settle close calls.** Ten cases and one invented person; renaming
  that person reversed which of two prompts won. It needs several fixtures averaged.
- **Qwen3 1.7B is weak at long history** and at judging search results.
- **One card, so models mostly do not run in parallel.** Sessions do.
- **Not a security boundary.** Traffic is plain HTTP on `127.0.0.1`, so a token is readable by
  anything already watching your loopback. Exposing this beyond one machine needs HTTPS first.

## The rest of the documents

| | |
|---|---|
| `PRD.md` | what it is for |
| `ARCHITECTURE.md` | how the parts fit, including a multi-machine design not yet built |
| `PLAN.md` | the phases built so far, what is next, and measured GPU figures |
| `DEVELOPMENT.md` | running, testing, and adding an agent or a workflow |
| `CLAUDE.md` | the rules the code is held to |
