# Prompt evaluation: asks the thinker the same questions under each candidate system message and scores them.
import json
import sys
from pathlib import Path

ROOT = Path(__file__).parents[1]
sys.path.insert(0, str(ROOT))
sys.stdout.reconfigure(encoding="utf-8", errors="replace")

from agents.thinker import main as thinker
from common.load_config import load_config
from common.read_json import read_json
from evals.modules.ask_thinker import ask_thinker
from evals.modules.judge_reply import judge_reply
from evals.modules.load_judge import load_judge
from evals.modules.make_systems import make_systems
from evals.modules.score_reply import score_reply

FOLDER = Path(__file__).parent
SETTINGS = read_json(FOLDER / "config.json")
PLAN = json.loads((FOLDER / "cases.json").read_text(encoding="utf-8"))
WANTED = sys.argv[1:] or None
MODELS = load_config(ROOT)["paths"]["models"]

judge = load_judge(MODELS / SETTINGS["judge_model"], SETTINGS["device"])
thinker.load()
systems = make_systems(PLAN)
totals = {}

for name, system in systems.items():
    if WANTED and name not in WANTED:
        continue
    for thinking in SETTINGS["thinking"]:
        settings = {**thinker.SETTINGS, "max_new_tokens": SETTINGS["max_new_tokens"],
                    "enable_thinking": thinking}
        label = f"{name} thinking={'on' if thinking else 'off'}"
        passed = 0
        print(f"\n=== {label}")
        for case in PLAN["cases"]:
            reply = ask_thinker(thinker.state, system, case["ask"], settings)
            words = score_reply(reply, case["wants"], case["avoids"] + PLAN["always_avoid"])
            meaning = judge_reply(judge, reply, case, SETTINGS)
            good = words["passed"] and meaning["passed"]
            passed += good
            mark = "OK " if good else "BAD"
            print(f"  {mark} {case['name']:23} {reply.replace(chr(10), ' ')[:62]}")
            if not words["passed"]:
                print(f"        words: leaked={words['leaked']} missing={words['missing']}")
            for note in meaning["wrong"]:
                print(f"        sense: {note}")
        totals[label] = passed
        print(f"  --> {passed} of {len(PLAN['cases'])}")

print("\nscores:", totals)
