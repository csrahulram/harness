# context.md

What the model actually reads, and who decided it would. Measured on this harness, not borrowed
from anywhere.

Open the chat page, send anything, and click **context** under the reply. Every bar is one block
that went to the model; the width is its share; hovering shows the text verbatim.

---

## The whole idea

A model has no memory and no senses. It reads one flat list of text and predicts what comes next.
Everything it appears to know about you, the conversation, the web page or the photograph is
something **code put into that list**. There is no other channel.

So the quality of an answer is mostly decided before the model runs, by whoever assembled the
list. That assembly is the engineering.

Three things can go wrong, and only one of them is about length:

1. **What it needs is missing.** No amount of model fixes this.
2. **What it needs is there, buried in what it does not need.** This is the common one.
3. **There is more text than the model can take.** The rarest, and the only one a budget catches.

---

## The first real measurement here

Somebody asked this harness **"What is the time?"** It answered:

> I looked up the information, but the provided notes don't include specific time data.

Here is the context it was given.

```
job reply_looked  ·  rung 2  ·  qwen3:1.7b  ·  budget 16000 chars

  275  11.4%  ######                                System Prompt
 2143  88.6%  ###################################   User Prompt + Notes
 ----
 2418 100.0%  used 15.1% of the budget            ->  194 chars came back

inside that 2143:
     17  what the person typed ........ "What is the time?"
   2029  what the web tool returned ... Wikipedia, on the philosophy of time
     97  the labels that join them
```

**0.7% of the context was the question. 84% was an encyclopaedia entry explaining that time is
"the continuous progression of existence… in an apparently irreversible succession from the
past."** The model read all of it and correctly reported that it had been handed nothing useful.

Note what was _not_ wrong. It used 15% of its budget, so nothing was too long. It ran on the
largest rung, so nothing was too small. The failure was **fault 2: relevance**. More room and a
bigger model would both have failed in exactly the same way, a little slower.

The real fault was two steps earlier: `"what is the time?"` matched the web chore instead of the
clock. Context engineering usually ends up being a routing bug wearing a disguise.

---

## The blocks, and where each is decided

| block                | decided in                                                | budget                  |
| -------------------- | --------------------------------------------------------- | ----------------------- |
| System Prompt        | `agents/thinker/config.json` → `prompts[job]`             | **210 chars, measured** |
| earlier turns        | `chat/modules/build_history.ts`, newest kept first        | `history_chars`, 2000   |
| recap of older turns | `workflows/optimise` condenses, drops `carry.json`        | `most_chars`, 2000      |
| User Prompt          | `workflows/answer/modules/build_ask.ts`, placed **first** | none                    |
| Notes (tool output)  | the same file, appended under labels                      | **none**                |
| Reasoning Trace      | `answer_only.ts` strips it                                | never goes back in      |

Two of those are worth stopping on.

**The person's words go first.** `build_ask` puts the question at the top and everything found
afterwards below it, under plain labels. A model that reads 2000 characters of notes before it
ever meets the question will answer the notes.

**The reasoning trace is thrown away.** Qwen3 emits a `<think>` block; the harness keeps the
answer and discards the thinking. It is tempting to keep it - it looks valuable - but feeding a
model its own reasoning back compounds whatever it got wrong, and it is usually the largest block
in the window. It is not stored and it is never re-sent.

**Tool output is the only block with no cap at all.** That is the gap this file exists to point
at, and the arrows in every diagram of a long context point at exactly those rows.

---

## A short prompt is not a style preference

`models.md` measured it: _"At 679 characters Qwen3-0.6B spent its whole thinking budget on the
instructions and never reached the question; at 193 characters the same model answered correctly.
The reply prompts are kept under 210 characters for this reason."_

Three of the five are over it today:

| chars |          | job             |
| ----- | -------- | --------------- |
| 214   | over     | `note`          |
| 193   | ok       | `reply`         |
| 259   | over     | `reply_picture` |
| 171   | ok       | `condense`      |
| 275   | **over** | `reply_looked`  |

The one that failed on the time question is the longest prompt in the file, 31% past the limit
this project measured for itself.

---

## What to do about it, in order

1. **Fix the routing first.** The cheapest context is the tool output you never fetch.
2. **Cap the uncapped block.** A tool output needs a budget the way history has one.
3. **Rank before you truncate.** `workflows/lookup` already does this - `agents/sifter` embeds
   what was found and keeps the nearest `keeps: 3`. That is relevance filtering, and it is the
   right shape; it is simply not applied to everything.
4. **Shorten the system prompt before adding to it.** Measured, above.
5. **Only then raise the budget.** And note `models.md`'s warning that raising rung 1's token
   budget from 512 to 1024 made an answer _worse_.

---

## What this harness still cannot see

Everything above is counted in **characters**, not tokens. The model counts tokens, and the ratio
is neither constant nor the same across the three rungs. The budgets in `rungs[]` are measured in
characters because that is what the code can count without a tokenizer. Good enough to see an
88.6% block for what it is; not good enough to sit near a real limit.

And nothing here measures whether an answer was **right**. The bars show what went in and how much
of it there was. Whether the model should have believed any of it is a different question, and
this harness cannot answer it. See [notes.md](notes.md).
