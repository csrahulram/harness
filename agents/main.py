from pathlib import Path

import torch
from PIL import Image
from transformers import AutoModelForImageTextToText
from transformers import AutoProcessor

FOLDER = Path(__file__).parent

MODEL = FOLDER /"models/smolvlm-256m"

PROMPT_FILE = FOLDER / "input/prompt.txt"
IMAGE_FILE = FOLDER / "input/image.png"
MAX_TOKENS = 100

processor = AutoProcessor.from_pretrained(MODEL)
model = AutoModelForImageTextToText.from_pretrained(MODEL)
model = model.to("cuda")

prompt = PROMPT_FILE.read_text(encoding="utf-8")
content = [{"type": "text", "text": prompt}]
images = None
if IMAGE_FILE.exists():
    image = Image.open(IMAGE_FILE).convert("RGB")
    content.insert(0, {"type": "image"})
    images = [image]

messages = [{"role": "user", "content": content}]
text = processor.apply_chat_template(
    messages,
    add_generation_prompt=True,
)
inputs = processor(text=text, images=images, return_tensors="pt")
inputs = inputs.to("cuda", model.dtype)
ids = inputs.pop("input_ids")
inputs.pop("attention_mask")
end_id = processor.tokenizer.eos_token_id

print("prompt tokens:", ids.shape[1])

with torch.no_grad():
    for step in range(MAX_TOKENS):
        logits = model(input_ids=ids, **inputs).logits
        scores = logits[0, -1]
        next_id = scores.argmax().item()
        if next_id == end_id:
            break
        piece = processor.tokenizer.decode([next_id])
        print(piece, end="", flush=True)
        next_tensor = torch.tensor([[next_id]], device="cuda")
        ids = torch.cat([ids, next_tensor], dim=1)

print()
print("total tokens:", ids.shape[1])
