# Exact byte sum of every weight and buffer, used to detect corrupted model memory.
import torch

from common.model_parts import model_parts


def fingerprint(model):
    total = 0
    for part in model_parts(model):
        for tensor in list(part.parameters()) + list(part.buffers()):
            flat = tensor.detach().reshape(-1)
            if not flat.is_contiguous():
                flat = flat.contiguous()
            total += int(torch.sum(flat.view(torch.uint8), dtype=torch.int64))
    return total
