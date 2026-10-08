import sys
sys.path.insert(0, "/harness")
from agents.thinker import main as thinker
from agents.thinker.modules.build_messages import build_messages
from agents.thinker.modules.build_system import build_system

S = thinker.SETTINGS
thinker.load()
recalled = {
    "memory": {
        "profile": "My name is Alex. I run a design studio in Lisbon.",
        "soul": "You are a skilful assistant who helps with business needs.",
    },
    "facts": [
        {"text": "The user is Alex."},
        {"text": "The user is an AI assistant."},
        {"text": "The user said: haha."},
    ],
}
caps = {"soul": S["soul_tokens"], "profile": S["profile_tokens"], "facts": S["fact_tokens"]}
system, used = build_system(thinker.state["tokenizer"], S, recalled, caps)
print("-" * 68)
print(system)
print("-" * 68)
print("tokens used:", used)
history = [{"role": "user", "text": "Hello"}, {"role": "assistant", "text": "Hi there."}]
messages = build_messages(system, history, "What do I do?")
print("roles in order:", [m["role"] for m in messages])
