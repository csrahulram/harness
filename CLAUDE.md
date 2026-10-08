# CLAUDE.md

Rules for working in this repository. Read PRD.md, ARCHITECTURE.md, PLAN.md and DEVELOPMENT.md before changing anything.

## How to work
- One phase at a time, from PLAN.md, only when the owner says so. Stop and show results after each phase.
- Do only what is asked. Report other problems instead of fixing them. Do not fill in empty placeholder files unasked.
- Short, plain explanations. The owner is learning by building.
- If something breaks: quick diagnosis, one simple option, then ask before digging further.
- Run models offline (`HF_HUB_OFFLINE=1`). Free the GPU after tests.
- Local git commits per phase are fine. Never push.
- Only commercial-friendly model licences (Apache, MIT, OpenRAIL). Never swap to a non-commercial model.

## Code rules
- One function per `.py` file, named after the function, placed in the folder's `modules/`. Always `import`, never copy.
- Each folder's `main.py` does the handling: it reads config, imports the modules and wires them. No logic of its own beyond that.
- No `.py` file over 100 lines. Split when it grows.
- Short lines, small named steps. The only comment is one line at the top of each file saying what the file does.
- All paths, ports, limits and model settings live in `config.json` (root for the application, per agent for models). No constants in code.
- `.env` holds only secrets. It is empty and git-ignored.
- Frontend follows the same grouping: `app.js` wires, `modules/` holds the parts, `vendor/` is third-party and exempt.

## Interfaces (do not break)
- Agent: `run(task) -> record`, `load()`, `unload()`, plus `state` dict and `SETTINGS` dict. Record always has `allowed, reason, agent, model, seconds`.
- Workflow: a `main.md` holding a numbered list of agent names under a `## Steps` heading. No Python. The runner reads the list and runs the agents in that order, stopping at the first refusal.
- Services exchange only files and JSON. Shapes are declared in root `config.json` under `shapes` and checked with `common/check_shape.py` at every boundary.
- Agents never import each other, never read another agent's files, never know who called them.

## Running and testing
See DEVELOPMENT.md. Tests: `python tests\main.py` against the running Docker stack.
