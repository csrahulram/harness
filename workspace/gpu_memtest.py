import sys
import time

import torch

MB = 1024 * 1024
PATTERN = sys.argv[1] if len(sys.argv) > 1 else "random"
SIZE = int(sys.argv[2]) * MB if len(sys.argv) > 2 else 256 * MB
ROUNDS = int(sys.argv[3]) if len(sys.argv) > 3 else 5


def make_pattern(name, size):
    if name == "zeros":
        return torch.zeros(size, dtype=torch.uint8)
    if name == "ones":
        return torch.full((size,), 255, dtype=torch.uint8)
    if name == "aa":
        return torch.full((size,), 0xAA, dtype=torch.uint8)
    if name == "55":
        return torch.full((size,), 0x55, dtype=torch.uint8)
    if name == "counter":
        return (torch.arange(size, dtype=torch.int64) % 256).to(torch.uint8)
    return torch.randint(0, 256, (size,), dtype=torch.uint8)


def one_round(source, attempt):
    first = source.to("cuda")
    second = source.to("cuda")
    torch.cuda.synchronize()
    gpu_diff = first != second
    gpu_bad = int(gpu_diff.sum())
    gpu_spots = torch.nonzero(gpu_diff).flatten()[:5].tolist()
    back = first.cpu()
    cpu_diff = back != source
    cpu_bad = int(cpu_diff.sum())
    cpu_spots = torch.nonzero(cpu_diff).flatten()[:5].tolist()
    print(
        f"{PATTERN:8} run {attempt}  gpu_bad={gpu_bad:<5} cpu_bad={cpu_bad:<5}"
        f" gpu_at={gpu_spots} cpu_at={cpu_spots}",
        flush=True,
    )
    del first, second, back
    torch.cuda.empty_cache()


source = make_pattern(PATTERN, SIZE)
print(f"{PATTERN} {SIZE // MB} MB x{ROUNDS}", flush=True)
for attempt in range(1, ROUNDS + 1):
    try:
        one_round(source, attempt)
    except Exception as error:
        print(f"{PATTERN:8} run {attempt}  CRASH {type(error).__name__}: {str(error)[:90]}", flush=True)
        sys.exit(2)
    time.sleep(0.3)
