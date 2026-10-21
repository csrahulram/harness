# agent.md

Read this before changing anything. It is the contract this repository is held to.

The code is TypeScript, run on Node 24, which runs `.ts` directly. There is no build step;
`tsc` only type-checks.

```
src/        all the code: main.ts, common/, agents/, workflows/, chat/, setup/
models/     downloaded weights, named after the model: qwen3_0.6b
workspace/  input/ output/ scratchpad/ training/ - everything read and written
```

`models/` and `workspace/` are git-ignored. The harness creates `workspace/` on startup, and
`src/setup/` fetches the weights, which `npm i` and `npm run dev` both call before anything runs.

An agent holds a model only while it is being used: each one is dropped once nothing has asked
for it in `idle_ms`, and loaded again on the next call.

Some models an agent loads itself; others a server holds for it. `agents/thinker` asks Ollama over
HTTP and the work runs on the graphics card; the guard and the agents that look at pictures load
their own weights, because no server will run a classifier head or Florence-2's task tokens. Which
is which is an agent's own business: `run(task)` looks the same either way.

`src/common/` is the only folder anything may import from freely. A `modules/` folder belongs to
the one agent, workflow or page it sits inside, and nothing outside that folder may reach into it.

---

## The one rule

> **Code orders the steps. A model only does the narrow job it is good at.**

A model is never asked what to do next, which tool to call, or whether to continue. Those are
decisions in code, written by a person, readable without running anything.

Apply this when a question has no obvious answer. If a change would let a model decide the order
of work, the answer is no.

---

## An agent

A folder wrapping one model, several, or none, doing one job. An agent that holds several picks
between them itself - the guard by the kind of work, the thinker by climbing until one copes - and
no caller ever names a model. It exports these and nothing else:

| Export      | Is       | Does                                        |
| ----------- | -------- | ------------------------------------------- |
| `run(task)` | function | takes a task, returns a record              |
| `load()`    | function | brings the model into memory                |
| `unload()`  | function | frees it again                              |
| `state`     | object   | what `load` filled in                       |
| `settings`  | object   | the agent's own `config.json`, already read |

A **task** describes the work. A **record** describes what happened, and always carries:

```
allowed   did this step permit the work to continue
reason    why, in words a person can read
agent     which agent produced it
model     which model it used, or none
seconds   how long it took
```

Anything else the agent returns sits alongside those five: the guard adds `score`, the thinker
adds `text`, and either may add `climb` to say that a bigger model might manage what it could not.
Numbers go in the record as numbers, not buried in `reason`.

Three rules nothing else may break:

- **An agent never imports another agent.** Shared code is a helper, not an agent.
- **An agent never reads another agent's files.** It is given the paths it may use, in its task.
- **An agent never knows who called it.** No caller id, no conditional behaviour by context.

Together these let an agent move to another folder, process or machine with nothing else edited.

---

## A workflow

A folder with its own `main.ts`, exporting `run(task)` and returning an outcome. It decides the
order its agents run in, and stops at the first record with `allowed: false`.

A task names only `{ workspace, step }`. A workflow is handed the workspace, never the project
root, so what it is given describes the boundary it works inside.

Every workflow answers in the same shape, built by the shared `makeOutcome`:

```
allowed   can the work carry on
reason    why, in words a person can read
workflow  which workflow answered
kind      what it decided it was looking at
seconds   how long it took
```

A workflow is code, so it may branch and retry. It still may not ask a model what to do next: the
order is written down, by a person, in the workflow's own file.

---

## A task walks in steps

Work longer than one run is carried by step files in the scratchpad, at
`workspace/scratchpad/task_<id>/step_<n>.json`:

```
task    which job this belongs to
step    how many steps have been taken
about   the file in the workspace the job is about
next    the workflow that should pick this up
from    the workflow that wrote it
done    true when there is nothing left to pass on
note    one line a person can read
facts   what has been learned so far, added to by each step
```

**`next` is the whole routing.** Main reads it and calls that workflow by name; it decides nothing
else. So `default` is not a special case - validating a finished task is just a step whose `next`
is `default`, and publishing to the output is the only thing `default` alone may do.

A step is only ever passed on if `done` is false and `step` is below `max_steps`. Without both,
a workflow that mis-routes writes step files until the disk fills.

---

## How parts talk

**Only files and JSON.** No shared memory, no objects across a service boundary.

Every object crossing a boundary is checked against a declared shape first. A shape is a list of
required keys, kept in config.

---

## Every step is recorded

Each run appends one record to a chain: what went in, what came out, how long, whether it was
allowed. This is not logging. It is the only place the history lives, so nothing may happen that
the chain does not show.

---

## Nothing reaches a model unguarded

Text from outside — a person, a file, a web page, a model's own earlier output — is checked before
any model reads it. How strict is configuration. That it happens is not.

---

## Conventions

- **One function per `.ts` file**, named after the function it holds.
- **`main.ts` only wires**: reads config, imports the pieces, connects them. No logic.
- **One comment per file**: a single line at the top saying what it does.
- **No file over 100 lines.** Past that, it was two things.
- **No constants in code.** Paths, ports, limits, model names and prompts live in `config.json`.
- **Secrets only in `.env`**, never committed.
- **A model folder is named after the model**, lowercase, hyphens to underscores: `qwen3_0.6b`.
  An agent folder is named after its job. `agents/thinker` loads `qwen3_0.6b`.

The point is that any single file can be understood alone, without holding the rest in your head.
That applies to a person and to a model equally.

---

## Adding an agent

1. Make the folder with a `config.json` naming its model and settings.
2. Write its one-function files under its own `modules/`.
3. Write `main.ts` exporting `run`, `load`, `unload`, `state`, `settings`.
4. Name it in a workflow's step list.

Nothing else is edited. Needing a step 5 means the design is wrong, not the agent.

---

Where the code and this file disagree, **this file is right and the code is a bug**. Say so rather
than matching the code.
