import argparse
import codecs
import json
import urllib.request

URL = "http://127.0.0.1:8000/qwen3"
SYSTEM = "You are a friendly teacher."
SYSTEM += " Answer in 3 short bullet points."

parser = argparse.ArgumentParser()
parser.add_argument("question", nargs="?")
parser.add_argument("--system", default=SYSTEM)
parser.add_argument("--no-think", action="store_true")
args = parser.parse_args()


def ask(messages):
    body = {
        "messages": messages,
        "thinking": not args.no_think,
    }
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


def final_answer(reply):
    answer = reply.split("</think>")[-1]
    return answer.strip()


messages = [{"role": "system", "content": args.system}]

if args.question:
    question = {"role": "user", "content": args.question}
    ask(messages + [question])
else:
    print("Chat started. Empty line to quit.")
    while question := input("\nYou: ").strip():
        messages.append({"role": "user", "content": question})
        print("Model: ", end="")
        reply = ask(messages)
        answer = final_answer(reply)
        messages.append({"role": "assistant", "content": answer})
