# Gathers everything the routes need: settings, limits, folders and the libraries they call.
from input.modules.load_tokenizer import load_tokenizer
from input.modules.new_task_id import new_task_id


def make_deps(config, settings, telemetry, users):
    limits = config["limits"]
    session = config["session"]
    return {
        **settings,
        "origin": config["services"]["frontend"]["origin"],
        "shape": config["shapes"]["task"],
        "pattern": config["names"]["pattern"],
        "tokenizer": load_tokenizer(config["paths"]["models"] / settings["tokenizer_model"]),
        "max_chars": limits["max_text_chars"],
        "max_bytes": limits["max_bytes"],
        "max_upload_bytes": limits["max_upload_bytes"],
        "media_types": config["media_types"],
        "name_chars": session["name_chars"],
        "max_name_chars": session["max_name_chars"],
        "note_caps": {"profile": 400, "soul": 400},
        "memory_folder": config["paths"]["memory"],
        "folder": config["paths"]["input"],
        "telemetry": telemetry,
        "users": users,
        "new_id": new_task_id,
    }
