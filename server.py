# ONE SERVER for every model: each model is loaded onto the GPU ONCE, each gets its own route.
#   POST /qwen3  {"messages": [...], "thinking": true}  -> streams Qwen3-0.6B's reply        (qwen3_harness.py)
#   POST /coder  {"messages": [...]}                    -> streams Qwen2.5-Coder-0.5B's reply (coder_harness.py)
#   POST /guard  {"kind": "prompt"|"code", "text": ...} -> JSON verdict from the Guard        (guard_harness.py)
#   GET  /       the visual guide (inspects Qwen3)       GET /inspect?text=...  its live data
import ctypes
import json
import sys
import time
from http.server import BaseHTTPRequestHandler, HTTPServer
from pathlib import Path
from threading import Thread
from urllib.parse import parse_qs, urlparse

if sys.platform == "win32":  # i7-14700F: logical CPUs 0-15 are the 8 fast P-cores; keep Windows off the slow E-cores
    kernel32 = ctypes.windll.kernel32
    kernel32.GetCurrentProcess.restype = ctypes.c_void_p
    kernel32.SetProcessAffinityMask.argtypes = [ctypes.c_void_p, ctypes.c_size_t]
    kernel32.SetProcessAffinityMask(kernel32.GetCurrentProcess(), 0xFFFF)

import ast
from dataclasses import dataclass

import torch
from safetensors import safe_open
from transformers import (AutoModelForCausalLM, AutoModelForSequenceClassification, AutoTokenizer,
                          TextIteratorStreamer, logging)

logging.set_verbosity_error()
logging.disable_progress_bar()
ROOT = Path(__file__).parent
DEVICE = "cuda" if torch.cuda.is_available() else "cpu"
VISUAL = ROOT / "visual" / "index.html"
SYSTEM = "You are a friendly teacher. Answer in 3 short bullet points."   # used by the visual's inspect


def load(folder):
    """tokenizer + model, weights copied into GPU memory once."""
    path = ROOT / "model" / folder
    return AutoTokenizer.from_pretrained(path), AutoModelForCausalLM.from_pretrained(path).to(DEVICE)


@dataclass
class Verdict:
    allowed: bool
    score: float      # 0 = clearly safe, 1 = clearly unsafe
    reason: str


class Guard:
    """Two checks: prompt injection (a classifier model) and code (syntax tree, never executed)."""
    SAFE_IMPORTS = {"math", "random", "statistics", "json", "re", "datetime", "collections", "itertools",
                    "functools", "string", "decimal", "fractions", "textwrap", "typing", "dataclasses"}
    BLOCKED_CALLS = {"eval", "exec", "compile", "open", "__import__", "input", "globals", "locals", "vars",
                     "getattr", "setattr", "delattr", "breakpoint", "exit", "quit", "help", "memoryview"}

    def __init__(self, threshold=0.5, window=2048):
        path = ROOT / "model" / "prompt-injection-guard-small"          # label 1 = INJECTION
        self.tokenizer = AutoTokenizer.from_pretrained(path)
        self.model = AutoModelForSequenceClassification.from_pretrained(path).to(DEVICE).eval()
        self.threshold, self.window = threshold, window

    @torch.no_grad()
    def check_prompt(self, text):
        """Long text is split into overlapping windows; the WORST window counts."""
        enc = self.tokenizer(text, truncation=True, max_length=self.window, stride=self.window // 4, padding=True,
                             return_overflowing_tokens=True, return_tensors="pt")
        enc.pop("overflow_to_sample_mapping", None)
        enc.pop("token_type_ids", None)
        score = self.model(**enc.to(DEVICE)).logits.softmax(-1)[:, 1].max().item()
        return Verdict(score <= self.threshold, score, "possible prompt injection" if score > self.threshold else "ok")

    def check_code(self, code):
        """ALLOW-list for imports (anything not listed is blocked), BLOCK-list for built-in calls, no dunders."""
        try:
            tree = ast.parse(code)
        except SyntaxError as e:
            return Verdict(False, 1.0, f"not valid Python: {e.msg}")
        for node in ast.walk(tree):
            modules = ([a.name for a in node.names] if isinstance(node, ast.Import)
                       else [node.module or ""] if isinstance(node, ast.ImportFrom) else [])
            for module in modules:
                if module.split(".")[0] not in self.SAFE_IMPORTS:
                    return Verdict(False, 1.0, f"import of '{module}' is not allowed")
            if isinstance(node, ast.Call) and isinstance(node.func, ast.Name) and node.func.id in self.BLOCKED_CALLS:
                return Verdict(False, 1.0, f"call to '{node.func.id}()' is not allowed")
            if isinstance(node, ast.Attribute) and node.attr.startswith("__"):      # e.g. ().__class__.__subclasses__()
                return Verdict(False, 1.0, f"access to '{node.attr}' is not allowed")
            if isinstance(node, ast.Name) and node.id.startswith("__"):             # e.g. __builtins__
                return Verdict(False, 1.0, f"use of '{node.id}' is not allowed")
        return Verdict(True, 0.0, "ok")


CHAT_MODELS = {"qwen3": load("qwen3-0.6b"), "coder": load("qwen2.5-coder-0.5b"),   # route name -> (tokenizer, model)
               "tools": load("xlam-2-1b-fc")}                                     # tool calling (file_harness.py)
guard = Guard()

# Qwen3's architecture, read from its config + safetensors file, for the visual page
tokenizer, model = CHAT_MODELS["qwen3"]
with safe_open(ROOT / "model" / "qwen3-0.6b" / "model.safetensors", "pt") as f:
    TENSORS = {name: list(f.get_slice(name).get_shape()) for name in f.keys()}
cfg = model.config
ARCH = {"name": "qwen3-0.6b", "class": cfg.architectures[0], "vocab": cfg.vocab_size, "hidden": cfg.hidden_size,
        "layers": cfg.num_hidden_layers, "heads": cfg.num_attention_heads, "kv_heads": cfg.num_key_value_heads,
        "mlp": cfg.intermediate_size, "context": cfg.max_position_embeddings, "tensors": len(TENSORS),
        "params": sum(p.numel() for p in model.parameters()),        # tied embeddings counted once
        "layer0": {n.split("layers.0.")[1]: s for n, s in TENSORS.items() if ".layers.0." in n}}


@torch.no_grad()
def inspect(text):
    """Run ONE forward pass of Qwen3 and return the real tensors, for the visual page."""
    start = time.time()
    inputs = tokenizer.apply_chat_template([{"role": "system", "content": SYSTEM}, {"role": "user", "content": text}],
                                           add_generation_prompt=True, return_tensors="pt", return_dict=True).to(DEVICE)
    out = model(**inputs, output_hidden_states=True)       # hidden_states: embeddings + the output of every layer
    ids = inputs["input_ids"][0].tolist()
    focus = len(ids) - 1 - ids[::-1].index(tokenizer.eos_token_id) - 1   # last token of YOUR text (before <|im_end|>)
    while focus > 0 and not tokenizer.decode([ids[focus]]).strip().isalnum():
        focus -= 1                                         # step back over punctuation to the last real word
    probs = out.logits[0, -1].float().softmax(-1)          # scores for the token AFTER the prompt
    top = probs.topk(8)
    return {
        "tokens": [{"id": i, "text": tokenizer.decode([i])} for i in ids],
        "focus": focus,
        "embedding": [round(v, 4) for v in out.hidden_states[0][0, focus][:16].float().tolist()],
        "layer_sizes": [round(h[0, -1].float().norm().item(), 2) for h in out.hidden_states],
        "top": [{"id": i, "text": tokenizer.decode([i]), "prob": round(p, 4)}
                for p, i in zip(top.values.tolist(), top.indices.tolist())],
        "shapes": {"input_ids": list(inputs["input_ids"].shape), "hidden": list(out.hidden_states[-1].shape),
                   "logits": list(out.logits.shape)},
        "ms": round((time.time() - start) * 1000, 1),
        "arch": ARCH,
    }


class Handler(BaseHTTPRequestHandler):
    def send(self, content_type, data):
        self.send_response(200)
        self.send_header("Content-Type", content_type)
        self.end_headers()
        self.wfile.write(data)

    def do_GET(self):                           # the visual page and its live data
        url = urlparse(self.path)
        if url.path == "/":
            self.send("text/html; charset=utf-8", VISUAL.read_bytes())   # re-read each time: edit + refresh
        elif url.path == "/inspect":
            text = parse_qs(url.query).get("text", ["What is currency?"])[0]
            self.send("application/json", json.dumps(inspect(text)).encode())
        else:
            self.send_error(404)

    def do_POST(self):
        route = urlparse(self.path).path.strip("/")
        body = json.loads(self.rfile.read(int(self.headers["Content-Length"])))
        if route == "guard":
            check = guard.check_code if body.get("kind") == "code" else guard.check_prompt
            self.send("application/json", json.dumps(vars(check(body["text"]))).encode())
        elif route in CHAT_MODELS:
            self.stream(*CHAT_MODELS[route], body, route)
        else:
            self.send_error(404, f"unknown route /{route}; use /qwen3, /coder or /guard")

    def stream(self, tokenizer, model, body, route):
        options = {"enable_thinking": body.get("thinking", True)} if route == "qwen3" else {}   # <think>...</think> first
        if body.get("tools"):
            options["tools"] = body["tools"]    # tool descriptions go INTO the prompt; the harness runs the tools
        inputs = tokenizer.apply_chat_template(body["messages"], add_generation_prompt=True, **options,
                                               return_tensors="pt", return_dict=True).to(DEVICE)
        # generate() runs in a background thread and pushes each new piece of text into the streamer.
        # Sampling settings come from each model's own generation_config.json.
        streamer = TextIteratorStreamer(tokenizer, skip_prompt=True, skip_special_tokens=True, timeout=30)  # don't wait forever if generate() crashes
        sampling = {"do_sample": body["do_sample"]} if "do_sample" in body else {}   # harness may ask for greedy
        thread = Thread(target=model.generate, kwargs=dict(**inputs, streamer=streamer, **sampling,
                                                           max_new_tokens=body.get("max_new_tokens", 2048)))
        thread.start()
        self.send_response(200)
        self.send_header("Content-Type", "text/plain; charset=utf-8")
        self.end_headers()
        for text in streamer:                   # send each piece to the client as soon as it exists
            self.wfile.write(text.encode())
            self.wfile.flush()
        thread.join()                           # finish this generation completely before taking the next request


print(f"Models loaded on {DEVICE}: /qwen3 /coder /guard. Listening on http://127.0.0.1:8000  (browser: the visual)")
HTTPServer(("127.0.0.1", 8000), Handler).serve_forever()
