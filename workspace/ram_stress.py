import collections
import sys
import threading
import time

import numpy as np

GB = 1024 * 1024 * 1024
PER_WORKER = int(float(sys.argv[1]) * GB) if len(sys.argv) > 1 else 2 * GB
WORKERS = int(sys.argv[2]) if len(sys.argv) > 2 else 6
MINUTES = float(sys.argv[3]) if len(sys.argv) > 3 else 4.0

faults = collections.Counter()
lanes = collections.Counter()
lock = threading.Lock()
rounds = collections.Counter()


def worker(index, deadline):
    source = np.random.randint(0, 256, size=PER_WORKER, dtype=np.uint8)
    reference = source.copy()
    while time.perf_counter() < deadline:
        rounds[index] += 1
        copy = source.copy()
        bad = np.flatnonzero(copy != reference)
        if bad.size:
            with lock:
                faults[index] += bad.size
                for position in bad.tolist()[:200]:
                    lanes[position % 16] += 1
                print(f"worker {index} round {rounds[index]} bad={bad.size} at {bad[:4].tolist()}", flush=True)
            reference = source.copy()
        del copy


print(f"{WORKERS} workers x {PER_WORKER / GB:.1f} GB = {WORKERS * PER_WORKER / GB:.0f} GB, {MINUTES} min", flush=True)
deadline = time.perf_counter() + MINUTES * 60
threads = [threading.Thread(target=worker, args=(index, deadline)) for index in range(WORKERS)]
for thread in threads:
    thread.start()
for thread in threads:
    thread.join()

print(f"\ntotal rounds {sum(rounds.values())}, total bad bytes {sum(faults.values())}")
print("byte offset mod 16:", dict(sorted(lanes.items())))
