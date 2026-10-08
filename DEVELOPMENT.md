# Development

## Run
```powershell
cd D:\Projects\harness-master
docker compose up -d --build      # first time, or after a Dockerfile change
docker compose up -d              # otherwise
```
Open http://127.0.0.1:8765/ — the frontend service serves the `frontend/` folder as its root.

Code folders are bind-mounted: after editing Python, `docker compose restart <service>`; after editing the frontend, refresh the browser.

```powershell
docker compose logs workflows --tail 20
docker compose down               # stops everything and frees the GPU
```

## Test
```powershell
python tests\main.py
```
Runs against the live stack: a normal question, a direct injection, an injection hidden in an HTML comment, an over-long text, a session list/rename/close round-trip, and an image turned into a `.glb` mesh. Each prints PASS or FAIL with the chain it produced. Test sessions are named `test_*` and `test3d_*`.

## Make a 3D model from an image
In the page, set **Mode** to *Image to 3D*, choose a picture, type anything (the text is guarded like any other), and send. The reply is a download link to a `.glb` you can open in Windows 3D Viewer or Blender. It takes about five seconds once the model is on the GPU, plus roughly forty seconds the first time it loads from disk.

## Where things live
- Application settings: `config.json` (paths, ports, limits, shapes).
- Model settings: `agents/<name>/config.json`.
- Workflow registry: `workflows/config.json` (`modes` maps a mode name to a workflow folder).
- Session data: `input/<session>/`, `output/<session>/`, `telemetry/<session>.jsonl` and `.json`. All git-ignored.
- Models: `models/<underscore_name>/`, git-ignored. Download with `huggingface_hub.snapshot_download(..., local_dir="models/<name>")`.

## Add an agent
1. `agents/<name>/config.json` with `agent, model, device, gpu_gb` and its own settings.
2. `agents/<name>/modules/load_model.py` and `run.py` (one function each); `run` returns `make_record(...)`.
3. `agents/<name>/main.py` copied from `context_guard/main.py`: reads config, holds `state`, exposes `load`, `unload`, `run`.
4. Put the model folder under `models/`.

## Add a workflow
1. `workflows/<name>/main.md`: a title, a sentence on what it does, then a `## Steps` heading with a numbered list of agent names.
2. One line in `workflows/config.json` under `modes`.
3. A test case in `tests/main.py`.

## Style checks before a commit
- Every `.py` except `main.py` holds one function and sits in `modules/`.
- Every `.py` starts with one comment line saying what it does.
- No `.py` over 100 lines: `Get-ChildItem -Recurse -Filter *.py | % { (Get-Content $_).Count }`.
- No hard-coded paths, ports or model names.

## Commit
Commit after each phase with a short message saying what the phase built. Never push.
