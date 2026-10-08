# Builds the system message: standing instructions, then labelled sections for the notes and facts.
from agents.thinker.modules.cap_text import cap_text


def build_system(tokenizer, settings, recalled, caps):
    sections = settings["sections"]
    parts = [settings["system_prompt"]]
    used = {}
    notes = recalled.get("memory") or {}
    for name in ("soul", "profile"):
        text = notes.get(name)
        if not text:
            continue
        capped, tokens = cap_text(tokenizer, text, caps[name])
        parts.append(sections[name] + "\n" + capped)
        used[name] = tokens
    facts = recalled.get("facts") or []
    if facts:
        listed = "\n".join("- " + fact["text"] for fact in facts)
        capped, tokens = cap_text(tokenizer, listed, caps["facts"])
        parts.append(sections["facts"] + "\n" + capped)
        used["facts"] = tokens
        used["fact_count"] = len(facts)
    if len(parts) > 1:
        parts.append(sections["guidance"] + "\n" + settings["guidance"])
    return "\n\n".join(parts), used
