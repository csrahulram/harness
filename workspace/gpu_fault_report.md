# GPU memory fault report

**Card:** NVIDIA GeForce RTX 4070 SUPER
**UUID:** GPU-29e8cfee-624b-64f1-d19b-2ba4962d44a1
**VBIOS:** 95.04.69.00.e7
**Driver:** 591.86
**Host:** Windows 11, MSI B760M GAMING PLUS WIFI
**Dates observed:** 2026-10-06 and 2026-10-07

## Summary
The card silently corrupts data held in its own memory. Every corrupted byte lands on
the same byte lane, which points to one faulty data line in the GPU's memory subsystem.
The fault occurs at idle temperature and below rated memory clock, so it is neither
thermal nor an overclock.

## Evidence

### 1. Data corrupts inside VRAM with no transfer involved
A model's weights are uploaded to the GPU once, then duplicated **device to device**
(`tensor.clone()`), so both copies live in VRAM and the host is never touched again.
The two copies are then compared on the GPU. They diverge:

```
rounds 35, vram faults 35, transfer faults 35
byte offset mod 16: {1: 420}
```

35 of 35 rounds showed VRAM-resident copies differing from each other. This cannot be
caused by system RAM, the PCIe link, or the host, because none of them take part.

### 2. Every single error is on byte lane 1
Across 1,443 corrupted bytes recorded over several runs, **100% sit at an offset that is
1 modulo 16**. Random bit rot would spread evenly across all 16 lanes. A single lane
failing is a physical defect in one memory chip or its data line.

### 3. Not temperature
Faults occur at **36-39 °C** GPU temperature, essentially idle.

### 4. Not overclocking
Faults occur at memory clocks of **810-5001 MHz**, far below the card's 10501 MHz
rating. No overclock is applied; MSI Center is at stock and `nvidia-smi` reports stock
maximums.

### 5. Reproduced outside any application
A plain 1 GB array copied to the GPU and back returns with 300-650 wrong bytes. This was
reproduced in native Windows and inside Docker, with no machine-learning framework
behaviour involved beyond a memory copy.

### 6. Intermittent onset, persistent once started
On 2026-10-07 the card passed 470 GB of transfers cleanly shortly after a reboot, then
began failing 100% of rounds roughly one hour later, and continued failing.

### 7. A second application fails independently on the same card
Blender texture baking on this machine produces black output. **The same .blend file bakes
correctly on a different PC**, which rules out the file, the materials, the UVs and the
bake settings, and leaves the hardware as the only difference.

Confirmed further on this machine by changing only the compute device:

| Machine | Device | Result |
|---|---|---|
| This machine | GPU (Cycles) | **black output** |
| This machine | CPU (Cycles) | correct |
| Different PC | GPU | correct |

Same file, same Blender installation, same operating system. The only variable that
changes the outcome is whether the work runs on this GPU. Baking writes its result into a
VRAM buffer and reads it back, so it fails in the same silent way as the tests above: no
error is raised, the output is simply wrong.

## System memory was ruled out
A threaded system RAM stress test moved about 5 TB with zero errors, and the VRAM-only
test above does not involve system RAM at all.

## How to reproduce
`workspace/gpu_watch.py` in this repository. It holds one model's weights in VRAM, clones
them on the device, and each round compares the two resident copies and separately checks
a host round trip, reporting which path failed and the byte offsets.
