import argparse
import json
import sys
import urllib.request
from pathlib import Path

URL = "http://127.0.0.1:8000/guard"

parser = argparse.ArgumentParser()
parser.add_argument("kind", choices=["prompt", "code"])
parser.add_argument("text", nargs="?")
parser.add_argument("--file")
args = parser.parse_args()


def read_input():
    if args.file:
        path = Path(args.file)
        return path.read_text(encoding="utf-8")
    return args.text


def check(kind, text):
    body = {"kind": kind, "text": text}
    data = json.dumps(body).encode()
    headers = {"Content-Type": "application/json"}
    request = urllib.request.Request(URL, data, headers)
    response = urllib.request.urlopen(request)
    return json.loads(response.read())


text = read_input()
if not text:
    parser.error("give the text to check, or --file")

verdict = check(args.kind, text)
label = "ALLOW" if verdict["allowed"] else "BLOCK"
score = f"score={verdict['score']:.3f}"
print(label, score, verdict["reason"])

exit_code = 0 if verdict["allowed"] else 1
sys.exit(exit_code)
