# Puts a model on the device: loads it from disk the first time, moves it back from RAM after that.
def place_model(state, device, load_from_disk):
    if "model" not in state:
        state.update(load_from_disk())
    state["model"].to(device)
    state["on_gpu"] = True
    return state
