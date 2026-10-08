# Measures the judge against replies already checked by hand, so its verdicts can be trusted or not.
import json
import sys
from pathlib import Path

ROOT = Path(__file__).parents[1]
sys.path.insert(0, str(ROOT))
sys.stdout.reconfigure(encoding="utf-8", errors="replace")

from common.load_config import load_config
from common.read_json import read_json
from evals.modules.judge_reply import judge_reply
from evals.modules.load_judge import load_judge

FOLDER = Path(__file__).parent
SETTINGS = read_json(FOLDER / "config.json")
PLAN = json.loads((FOLDER / "cases.json").read_text(encoding="utf-8"))
LABELS = json.loads((FOLDER / "labels.json").read_text(encoding="utf-8"))
CASES = {case["name"]: case for case in PLAN["cases"]}
MODELS = load_config(ROOT)["paths"]["models"]

judge = load_judge(MODELS / SETTINGS["judge_model"], SETTINGS["device"])
agreed = 0
for label in LABELS:
    case = CASES[label["case"]]
    found = judge_reply(judge, label["reply"], case, SETTINGS)
    same = found["passed"] == label["should_pass"]
    agreed += same
    mark = "AGREE" if same else "DIFFER"
    print(f"{mark:7} want={str(label['should_pass']):5} got={str(found['passed']):5} "
          f"{label['case']:22} {label['reply'][:52]}")
    for note in found["wrong"]:
        print(f"          {note}")
print(f"\njudge agreed with {agreed} of {len(LABELS)} hand checks")
