# The few settings the browser needs, so the rest of the configuration stays private.
def public_config(config):
    limits = config["limits"]
    return {
        "urls": config["urls"],
        "limits": {"poll_ms": limits["poll_ms"], "timeout_ms": limits["timeout_ms"]},
    }
