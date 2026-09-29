import argparse
import codecs
import json
import urllib.request

URL = "http://127.0.0.1:8000/coder"

parser = argparse.ArgumentParser()
parser.add_argument("question", nargs="?")
parser.add_argument("--lang", default="Python")
args = parser.parse_args()


def system_prompt(lang):
    prompt = "You are a careful coding assistant."
    prompt += f" Write {lang} code first,"
    prompt += " then a short explanation."
    prompt += " Keep examples correct."
    return prompt


def ask(messages):
    body = {"messages": messages}
    data = json.dumps(body).encode()
    headers = {"Content-Type": "application/json"}
    request = urllib.request.Request(URL, data, headers)

    decoder = codecs.getincrementaldecoder("utf-8")()
    reply = ""
    with urllib.request.urlopen(request) as response:
        while chunk := response.read1(1024):
            text = decoder.decode(chunk)
            print(text, end="", flush=True)
            reply += text
    print()
    return reply


system = system_prompt(args.lang)
messages = [{"role": "system", "content": system}]

if args.question:
    question = {"role": "user", "content": args.question}
    ask(messages + [question])
else:
    print("Coder chat started. Empty line to quit.")
    while question := input("\nYou: ").strip():
        messages.append({"role": "user", "content": question})
        print("Coder: ", end="")
        reply = ask(messages)
        messages.append({"role": "assistant", "content": reply})
