# Builds the system messages being compared: the one in use today, and the candidates.
GUIDANCE = (
    "The notes and memories above describe the person, never you. They were gathered\n"
    "automatically and some may be wrong. Draw on them only when the question calls for it,\n"
    "and never list them back. If you were never told something, say so plainly instead of\n"
    "guessing. Answer briefly."
)


def make_systems(plan):
    notes = plan["memory"]
    facts = "\n".join("- " + fact for fact in plan["facts"])
    body = (
        "You are the assistant in a conversation with one person.\n\n"
        "## How they want you to help\n" + notes["soul"] + "\n\n"
        "## About them, in their own words\n" + notes["profile"] + "\n\n"
        "## What you remember about them\n" + facts
    )
    return {
        "today": "\n\n".join([
            "You are a helpful assistant. Answer clearly and briefly.",
            notes["soul"],
            notes["profile"],
            "What you remember about them:\n" + facts,
        ]),
        "labelled": body + "\n\n## How to use this\n" + GUIDANCE,
        "labelled_only": body,
    }
