# My Learning Path: Model Harness

## Step 1 — A model is files
- A model = **architecture** (the maths recipe, code in `transformers`) + **config** (its size) + **weights** (learned numbers).
- SmolLM2-135M = 134,515,008 parameters × 2 bytes = 257 MB (`model.safetensors`).
- Only 4 files are needed to chat: `model.safetensors`, `config.json`, `tokenizer.json`, `tokenizer_config.json`.
- `config.json` is the blueprint: without it the weights have no shape to fit into and loading fails.
- `.safetensors` holds only numbers (safe); old `.bin`/`.pt` pickle files could run hidden code.

## Step 2 — Tokens
- The tokenizer turns text into token IDs and back. The model never sees text, only IDs.
- 49,152 tokens in the vocabulary. `Ġ` / `·` = a space that is part of the token (`world` ≠ ` world`).
- English words are 1 token; Tamil and emoji fall back to bytes and cost many more tokens.
- Special tokens: only `<|im_start|>` (1), `<|im_end|>` (2), `<|endoftext|>`. Role words (`system`, `user`) are ordinary tokens the model learned to treat as roles.

## Step 3 — Inside the model (tensors)
- A tensor = a block of numbers in 1+ dimensions. SmolLM2 = 272 tensors.
- Embedding table (49152 × 576): token ID = row number → 576 numbers = its meaning.
- 30 layers, each: RMSNorm → Attention (tokens look at earlier tokens) → + → RMSNorm → MLP (each token alone, stores knowledge) → +.
- Output: final norm → lm_head (the same embedding table, tied) → 49,152 scores → softmax → probabilities.
- The model outputs **scores, never words**. Same input tokens + greedy decoding = same output every time.

## Step 4 — The generation loop
- 1 lap = 1 token (~18 ms on my GPU). The sequence grows by one token each lap.
- Greedy = pick the top token. Every choice changes all later ones (e.g. "highly" 12.1% vs "metal" 10.7%).
- `repetition_penalty` lowers scores of used tokens; `max_new_tokens` limits laps; `<|im_end|>` stops early.
- KV cache: `generate()` reuses earlier work, so each lap only computes the new token.

## Step 5 — Harness vs server
- **Server** (`smol_server.py`) = runs the maths: chat template → tokenizer → model → pick → stream.
- **Harness** (`smol_harness.py`) = decides what goes in and what to do with the output.
- Test: if it decides which tokens go in or acts on what comes out, it's harness.
- The server is **stateless**. Memory = the harness re-sending the whole `messages[]` list each time.
- One-shot mode has no memory (the "Rahul" test); chat mode sends the history.

## Step 6 — Prompts
- The system prompt goes first because the model only looks backwards (causal), training put it first, and a fixed start can be cached.
- The harness fully controls the system prompt (fixed, per task, built fresh, with retrieved data).
- Chat templates differ per model (ChatML `im_` = message markers, Llama 3, Gemma).

## Step 7 — Speed and efficiency
- Server keeps the model loaded: import + load once, not per question.
- GPU for generation; `127.0.0.1` not `localhost` (Windows IPv6 delay).
- Small models are CPU-bound: Windows put the server on slow E-cores → pinned to P-cores (1.7 s instead of 5 s).
- Streaming: first words in 0.07 s instead of waiting ~1.5 s; total time is the same.

## Step 8 — Tool calling (Needle)
- Needle 3: 121M parameters, ~2-bit weights, 34 MB, own runtime (`libneedle.dll`), runs on CPU.
- `.cact` = model files packed into one file; `.dll` = engine; no server needed.
- The model only **chooses** a tool; the harness **runs** it. `run()` = the agent loop.
- Harness safety: `safe_path()` blocks paths outside the folder, approval before writing, `max_steps` limit.
- No model can search the internet or act by itself; every action goes through tools the harness provides.

## Step 9 — The bigger picture
- Bigger models predict better, if trained well. Size sets the ceiling; training decides how close; the harness decides how much you use.
- Kimi K3: 2.8 trillion parameters (104B active per token, Mixture of Experts), ~1M context vs SmolLM2's 8,192.
- Jev: a decision model that returns typed choices + confidence instead of text.
- Harness engineering got its name when the same model performed differently in different harnesses.
- Harnesses are strong at digital, checkable work, with a person steering and checking — not "any task".

## My project
```
model/smollm2-135m/   model/needle3/
smol_server.py        ← SmolLM2 server + visual at http://127.0.0.1:8000
smol_harness.py       ← SmolLM2 harness: prompt, memory, streaming
needle_harness.py     ← Needle harness: tools, safety, approval
visual/index.html     ← 6-scene canvas guide with live tensors
```
