# Compares a loaded model's weight fingerprint with the one taken at load.
from common.fingerprint import fingerprint


def check_weights(agent):
    expected = agent.state.get("fingerprint")
    actual = fingerprint(agent.state["model"])
    return {"ok": actual == expected, "drift": actual - expected, "fingerprint": actual}
