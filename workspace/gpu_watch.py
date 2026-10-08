import collections
import sys
import time
from pathlib import Path

import torch

MODEL = Path(sys.argv[1]) if len(sys.argv) > 1 else Path("models/prompt_injection_guard_small/model.safetensors")
HOURS = float(sys.argv[2]) if len(sys.argv) > 2 else 3.0
EVERY = float(sys.argv[3]) if len(sys.argv) > 3 else 300.0


def byte_sum(buffer):
    return int(torch.sum(buffer, dtype=torch.int64))


def offsets_of(differs):
    return torch.nonzero(differs).flatten()[:6].cpu().tolist()


raw = torch.frombuffer(bytearray(MODEL.read_bytes()), dtype=torch.uint8)
live = raw.to("cuda")
twin = live.clone()
torch.cuda.synchronize()
resident = byte_sum(live)
print(f"watching {MODEL.name} {raw.numel() / 1e9:.2f} GB for {HOURS} h", flush=True)

lanes = collections.Counter()
rounds = 0
vram_faults = 0
move_faults = 0
deadline = time.perf_counter() + HOURS * 3600
spoke = 0.0

while time.perf_counter() < deadline:
    rounds += 1
    differs = live != twin
    resting = int(differs.sum())
    if resting or byte_sum(live) != resident:
        vram_faults += 1
        spots = offsets_of(differs)
        for position in spots:
            lanes[position % 16] += 1
        print(f"{time.strftime('%H:%M:%S')} VRAM FAULT bad={resting} at={spots}", flush=True)
        twin = live.clone()
        resident = byte_sum(live)
    moved = raw.to("cuda")
    back = moved.cpu()
    changed = int((back != raw).sum())
    if changed:
        move_faults += 1
        spots = offsets_of(back != raw)
        for position in spots:
            lanes[position % 16] += 1
        print(f"{time.strftime('%H:%M:%S')} TRANSFER FAULT bad={changed} at={spots}", flush=True)
    del moved, back, differs
    torch.cuda.empty_cache()
    if time.perf_counter() - spoke > EVERY:
        spoke = time.perf_counter()
        left = int((deadline - time.perf_counter()) / 60)
        used = torch.cuda.memory_allocated() / 1e9
        held = torch.cuda.memory_reserved() / 1e9
        print(
            f"  {time.strftime('%H:%M:%S')} round {rounds} clean, {left} min left,"
            f" allocated={used:.2f} reserved={held:.2f}",
            flush=True,
        )

print(f"\nrounds {rounds}, vram faults {vram_faults}, transfer faults {move_faults}")
print("byte offset mod 16:", dict(sorted(lanes.items())))
