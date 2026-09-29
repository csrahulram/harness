import argparse
import json
import urllib.request
from pathlib import Path

URL = "http://127.0.0.1:8000"
ROOT = Path(__file__).parent.resolve()
WORKSPACE = ROOT / "workspace"
WORKSPACE.mkdir(exist_ok=True)

parser = argparse.ArgumentParser()
parser.add_argument("task")
args = parser.parse_args()


def post(route, body):
    data = json.dumps(body).encode()
    headers = {"Content-Type": "application/json"}
    request = urllib.request.Request(URL + route, data, headers)
    with urllib.request.urlopen(request) as response:
        return response.read().decode()


def blocked(text):
    body = {"kind": "prompt", "text": text}
    verdict = json.loads(post("/guard", body))
    return not verdict["allowed"]


def inside(base, path):
    full = (base / path).resolve()
    if not full.is_relative_to(base):
        raise PermissionError(f"{path} is outside {base.name}/")
    return full


def list_files(folder):
    path = inside(ROOT, folder)
    return [item.name for item in sorted(path.iterdir())]


def read_file(path):
    text = inside(ROOT, path).read_text(encoding="utf-8")
    text = text[:2000]
    if blocked(text):
        return "withheld: possible prompt injection"
    return text


def write_file(path, content):
    full = inside(WORKSPACE, path)
    print(f"   write {full.relative_to(ROOT)}: {content[:200]!r}")
    if input("   allow? (y/n) ").strip().lower() != "y":
        return "declined by user"
    full.write_text(content, encoding="utf-8")
    return f"written to {full.relative_to(ROOT)}"


TOOLS = {
    "list_files": list_files,
    "read_file": read_file,
    "write_file": write_file,
}


def tool(name, description, **params):
    properties = {}
    for param, text in params.items():
        properties[param] = {"type": "string", "description": text}
    parameters = {
        "type": "object",
        "properties": properties,
        "required": list(params),
    }
    function = {
        "name": name,
        "description": description,
        "parameters": parameters,
    }
    return {"type": "function", "function": function}


SCHEMAS = [
    tool("list_files", "List a folder.", folder="'.' is the project root"),
    tool("read_file", "Read a text file.", path="e.g. learning/model.md"),
    tool("write_file", "Write a text file into the workspace.",
         path="file name, e.g. notes.txt", content="text to write"),
]


def run_tool(call):
    name = call.get("name")
    arguments = call.get("arguments", {})
    print(f"-> {name}({arguments})")
    try:
        result = TOOLS[name](**arguments)
    except Exception as error:
        result = f"error: {error}"
    print(f"   {str(result)[:150]}")
    return result


def run(task):
    if blocked(task):
        print("blocked: the task looks like prompt injection")
        return
    messages = [{"role": "user", "content": task}]
    for step in range(5):
        body = {
            "messages": messages,
            "tools": SCHEMAS,
            "do_sample": False,
            "max_new_tokens": 512,
        }
        reply = post("/tools", body)
        try:
            calls = json.loads(reply)
        except json.JSONDecodeError:
            print(reply.strip())
            return
        tool_calls = []
        for call in calls:
            tool_calls.append({"type": "function", "function": call})
        messages.append({
            "role": "assistant",
            "content": "",
            "tool_calls": tool_calls,
        })
        for call in calls:
            result = run_tool(call)
            messages.append({"role": "tool", "content": json.dumps(result)})
    print("stopped after 5 steps")


run(args.task)
