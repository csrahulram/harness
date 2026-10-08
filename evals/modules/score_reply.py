# Scores one reply: each wanted group needs one of its words, and no avoided phrase may appear.
def score_reply(reply, wants, avoids):
    lowered = reply.lower()
    missing = [group for group in wants if not any(word.lower() in lowered for word in group)]
    leaked = [phrase for phrase in avoids if phrase.lower() in lowered]
    return {"passed": not missing and not leaked, "missing": missing, "leaked": leaked}
