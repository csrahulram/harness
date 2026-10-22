# harness

A small, offline harness for running tiny models on your own machine. It watches folders, guards
whatever arrives, and answers it with the smallest model that can cope. No subscription, no
tokens, nothing leaves the computer.

It is not a chatbot clone. It exists to find out what models under a couple of gigabytes can
honestly do, and to write code that works inside those limits. What has been measured is kept in
[models/models.md](models/models.md); the rules the code is held to are in [agent.md](agent.md).

## What you need

- **Node 24 or newer.** It runs TypeScript directly, so there is no build step and no bundler.
- **[Ollama](https://ollama.com)**, installed and running. It serves the three models the thinker
  uses, on the graphics card.
- About **3 GB of disk** for models, and an internet connection the first time.

Everything else installs with `npm i`.

## Getting started

```
npm i          # dependencies
npm run init   # fetches 0.69 GB of weights and pulls 2.15 GB into Ollama
npm run dev    # the harness, restarting when the source changes
npm run chat   # the page, at http://127.0.0.1:8080
```

`npm run init` only fetches what is missing, so running it again costs nothing. If Ollama is not
running it says so and stops rather than failing obscurely. Use `npm start` instead of `npm run
dev` to run without the file watcher.

| script           | does                                                                    |
| ---------------- | ----------------------------------------------------------------------- |
| `npm run init`   | fetch every model, both the weights and the served ones                 |
| `npm run dev`    | watch `workspace/` and answer what arrives, reloading on source changes |
| `npm start`      | the same without reloading                                              |
| `npm run chat`   | serve the chat page                                                     |
| `npm run check`  | type-check with `tsc --noEmit`                                          |
| `npm run format` | format everything with Prettier                                         |

## How it works

Drop a file into `workspace/input/` - or type into the chat page, which writes one for you - and
the harness picks it up.

```
workspace/input/session_x__t1/     what arrived: prompt.txt, a picture, the talk so far
   |  the watcher sees it settle, and makes step 0
default      guards every piece, one at a time
   |  writes workspace/scratchpad/session_x__t1/step_1.json
assess       measures what is in the picture        (only if there is one)
check        asks a second model what it makes of it
answer       writes the reply, climbing models until one copes
default      checks the task is complete, and publishes
   |
workspace/output/session_x__t1.md
```

**Every step is a file.** A workflow finishes by writing one small JSON file naming who should
pick the work up next, and `src/main.ts` does nothing but read that name and call it. So no
workflow is special, the whole history of a job is readable on disk, and a job can stop or resume
between any two steps.

## The parts

```
src/main.ts     watches the folders and passes each step to the workflow it names
src/common/     the only code anything may import freely
src/agents/     one folder per model-shaped job: guard, thinker, looker, describer
src/workflows/  the order those agents run in: default, assess, check, answer
src/chat/       the page and the small server behind it
src/setup/      fetches every model `npm run init` needs
models/         downloaded weights, git-ignored
workspace/      input, output, scratchpad, training - git-ignored, made on startup
```

An agent wraps a model and answers `run(task)`. A workflow decides the order agents run in. Agents
never import each other, never read each other's files, and never know who called them.

## Where the work runs

Generation runs on the **GPU** through Ollama. The guard and the models that look at pictures run
on the **CPU**, because no model server will run a classifier head or Florence-2's task tokens.
A warm chat turn takes about a second.

## Honest limits

- **It has no memory between sessions.** It carries a condensed recap within one conversation
  and forgets it when the session ends.
- **Nothing caps what a tool puts into the context.** Asked the time, it once spent 88.6% of the
  window on an encyclopaedia entry about time and answered that it had been told nothing useful.
  Click **context** under any reply to see the blocks; [coding/context.md](coding/context.md)
  explains what they are.
- **The ladder climbs on capacity, not quality.** Nothing judges whether an answer is right.
- **No model this size builds a 3D mesh.** The picture workflows judge and describe photographs;
  real reconstruction would be another step, filled by a real tool.
- **The guard catches instruction overrides, not plainly harmful requests.** The table in
  [models/models.md](models/models.md) says exactly what it has and has not caught.
