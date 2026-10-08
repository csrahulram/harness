# Scores one reply with the entailment model: claims that must follow, and claims that must not.
from evals.modules.judge_claim import judge_claim


def judge_reply(judge, reply, case, settings):
    wanted = settings["entailment_label"]
    wrong = []
    for claim in case.get("entails") or []:
        found = judge_claim(judge, reply, claim, settings)
        if found["verdict"] != wanted:
            wrong.append(f"not entailed: {claim} ({found['verdict']} {found['confidence']})")
    for claim in case.get("denies") or []:
        found = judge_claim(judge, reply, claim, settings)
        if found["verdict"] == wanted:
            wrong.append(f"wrongly entailed: {claim} ({found['confidence']})")
    return {"passed": not wrong, "wrong": wrong}
