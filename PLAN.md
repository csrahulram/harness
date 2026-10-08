# Plan

Built one phase at a time, each only on the owner's instruction, each ending with `python tests\main.py` passing and a local commit.

The history was squashed to a single commit on 2026-10-08, so the phases below record what was
built and in what order, not commits that can still be checked out.

## Done
| Phase | Built |
|---|---|
| 0 | git repository, `.gitignore` (models, session data, `.env`) |
| 1 | Session chain in telemetry, termination records, input token validation, GPU resource check, Qwen3 1.7B, chain panel |
| 2 | Streaming replies, session sidebar (new, open, rename, close), history rebuilt from the chain, active session in localStorage |
| 2a | Weight fingerprint with auto reload, GPU memory per step, safe stream reads |
| 2b | `modules/` grouping, one-line file headers, idle GPU unload after 2 minutes, visible Edit and Close buttons, root documents, deterministic weight hash |

| 4 | Uploads: base64 upload route, file serving, mode selector and image picker in the page |
| 8 | Image to 3D with Shap-E, exported as .glb; one model on the GPU at a time; built, then set aside |

## Set aside
Image to 3D worked (a glb mesh in about five seconds). It was removed on 2026-10-07 so the harness is only chat while the graphics
card is replaced, since every extra model meant another GPU transfer on a card that
corrupts them. The Shap-E weights stay in `models/shap_e_img2img` so nothing needs
downloading again. This repository's history was squashed to a single commit on 2026-10-08,
so that code is no longer in it and would be written again rather than recovered.

| M1 | Profile and soul notes read into the prompt, capped and shown in the panel |
| M1b | Editing those notes in the page, with token counts against the cap |
| M2a | Learning facts from conversation, guarded and stored in pgvector, recalled across sessions, listed and deletable |
| P1b | A decision model judges the evals: DeBERTa-v3 entailment on CPU, agreeing with 12 of 12 hand checks once the premise names who is speaking |
| P1 | Prompt engineering: labelled system message, thinking off, `evals/` scoring 10 of 10 against 7; the fact extractor stops reading the assistant's reply |
| M0 | Accounts on PostgreSQL: signup, signin, signout, delete, tokens on every route, sessions owned by a user, sign-in screen |

## Next
| Phase | Builds | Done when |
|---|---|---|
| N | Multi node: agents served over HTTP, placement declared in config, shared folder for files, health checks and drift-based rotation (designed in ARCHITECTURE.md, agreed 2026-10-07) | an agent runs on another machine with only a config change |
| 3 | Parallel sessions: one worker per session, resident small models, GPU lock, wait time in records | two sessions chat at once; a heavy job in one does not block chat in the other |
| 3b | Memory across sessions: `memory/main.py` with `read()` and `add(fact)`, facts in `memory/index.md`, read into the thinker's prompt. Session history is **done**; the context compressor to summarise dropped turns is not | a fact saved in one session shows up in the next |
| 5 | Text → PDF (`fpdf2`), PDF → markdown (`pypdfium2`) | both round-trip; injection inside a PDF is blocked |
| 6 | Speech → text (whisper-small), text → speech (bark-small) | wav in, text out; text in, wav plays in the chat |
| 7 | Text → image (dreamshaper-8-lcm) | png shown inline |
| 8b | Text → 3D (shap-e text pipeline) | .glb download from a prompt alone |
| 9 | Web search container (`ddgs`) and workflow | results guarded, then summarised |
| 10 | Image → video (Wan 2.2 TI2V 5B) | `.mp4` plays; biggest download and riskiest, so last |

## Calibration
Each agent's `gpu_gb` is measured, never guessed, with `workspace/calibrate.py`. Measured on the
new card, 2026-10-07:

| Agent | Weights | Peak | Declared |
|---|---|---|---|
| `context_guard` | 0.56 GB | 0.74 GB | 1.0 GB |
| `thinker` | 3.45 GB | 3.62 GB | 4.5 GB |

The thinker's peak grows with context: its KV cache costs 112 KB per token, so 8,192 tokens adds
0.94 GB and 32,768 would add 3.76 GB. `input/config.json` therefore caps input at **8,192 tokens**,
which keeps the worst case inside the 4.5 GB reservation. Raising that cap means raising `gpu_gb`
to match, or working the reservation out per task.

Re-run the calibration after any hardware change:
`python workspace/calibrate.py context_guard thinker`

## Models
| Capability | Model | Licence | Download |
|---|---|---|---|
| Guard | prompt_injection_guard_small | Apache | have |
| Chat | qwen3_1.7b | Apache | have |
| Eval judge | MoritzLaurer/DeBERTa-v3-base-mnli-fever-anli | MIT | have |
| Text → image | Lykon/dreamshaper-8-lcm (fp16 only) | OpenRAIL-M | ~2.5 GB |
| 3D | openai/shap-e | MIT | ~4.5 GB |
| Image → video | Wan-AI/Wan2.2-TI2V-5B-Diffusers | Apache | ~32 GB |
| Text → speech | suno/bark-small | MIT | ~1.6 GB |
| Speech → text | openai/whisper-small (safetensors) | Apache | ~1 GB |

## Known limits
- Video needs about 30 GB RAM to load; Docker has 33 GB. It may not fit.
- Shap-E is reliable but coarse; TripoSR is better but needs vendored code.
- Qwen3 1.7B is weak at long history and at judging search results.
- **The prompt evaluation is fixture-dependent, so phase P1's conclusion is not supported.**
  Renaming the invented person from Rahul/Chennai/Mabel to Alex/Lisbon/Luna on 2026-10-08
  reversed the ranking: the labelled prompt scored 10 against the old prompt's 9 on the first
  fixture, then 7 against 8 on the second. Ten cases and one person cannot separate two prompts
  a point or two apart. What does hold across both is that the thinker adopts the person's
  identity when asked who it is, more readily for a common given name. Deciding between prompts
  needs the eval run over several fixtures and averaged.
- **The fact extractor is unreliable, and the test fixtures hide it.** Given the same sentence
  `My dog is called X.`, qwen3_0.6b named the dog correctly for only 2 of 7 names on 2026-10-08:
  Mabel and Luna worked, while Pepper, Rex, Buddy, Coco and Max all became *the user's* name.
  `tests/` therefore uses Luna deliberately, so `check_learning` measures the learn, store, recall
  and use pipeline rather than the extractor. Dropping the assistant's reply from the extractor's
  input (phase P1) removed one cause and not the rest. Fixing it belongs to the memory stage.
- The guard scores highly repetitive text as injection (`"word " * 6000` → 0.63).
- Sessions run in parallel, models mostly do not: one 12 GB card.
- **The graphics card was replaced on 2026-10-07, and the fault is gone so far.** The old RTX 4070 SUPER corrupted data in its own VRAM, every error landing on the same byte lane; `workspace/gpu_fault_report.md` has the evidence. The replacement (new VBIOS, driver 617.42) shows 0 faults across roughly 300 rounds of `workspace/gpu_watch.py`, and `drift` is 0 on every chain step. Treat this as provisional: the old card was also clean for its first hour, so the real proof is days of uptime with drift at 0.
