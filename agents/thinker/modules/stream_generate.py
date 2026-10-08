# Generates in a thread and streams the answer into a file as it is produced.
from threading import Thread

import torch
from transformers import TextIteratorStreamer


def stream_generate(tokenizer, model, prompt, max_new_tokens, path, end_of_thinking, timeout):
    streamer = TextIteratorStreamer(tokenizer, skip_prompt=True, skip_special_tokens=True, timeout=timeout)
    failure = []

    def produce():
        try:
            with torch.no_grad():
                model.generate(**prompt, streamer=streamer, max_new_tokens=max_new_tokens)
        except Exception as error:
            failure.append(error)
            streamer.end()

    worker = Thread(target=produce)
    worker.start()
    raw = ""
    written = 0
    path.parent.mkdir(parents=True, exist_ok=True)
    with path.open("w", encoding="utf-8") as stream:
        for piece in streamer:
            raw += piece
            thinking = "<think>" in raw and end_of_thinking not in raw
            answer = "" if thinking else raw.split(end_of_thinking)[-1].lstrip()
            stream.write(answer[written:])
            stream.flush()
            written = len(answer)
    worker.join()
    if failure:
        raise failure[0]
    return raw
