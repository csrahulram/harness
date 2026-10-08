# Lists the neural network parts of a model, or of a pipeline made of several models.
import torch


def model_parts(model):
    components = getattr(model, "components", None)
    if isinstance(components, dict):
        return [part for part in components.values() if isinstance(part, torch.nn.Module)]
    return [model]
