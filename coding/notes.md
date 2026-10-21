# coding

What the harness has tried to change about itself, and what it measured. Kept the way
[models/models.md](../models/models.md) is kept: prose first, numbers where there are numbers.

`runs/` and `ledger.jsonl` are written by the harness. This file is written by a person.

---

## How it reads itself

Every chain that finishes appends one line to `runs/<yyyy_mm>.jsonl` - shapes and numbers only,
never the words. No prompt, no reply, no looked-up text goes in. That keeps the file small, keeps
private talk out of git, and is still enough to count what went wrong.

The counting is exact string matching against a table in
[src/workflows/coding/config.json](../src/workflows/coding/config.json). A person wrote that
table: it maps "this went wrong" to "change this one key". **So the loop can only fix what someone
taught it to recognise.** Growing the table is a human job, and a fault with no entry is reported
by name and left alone - the same discipline as the guard refusing a job kind nobody thought about.

## What it cannot do, and must not pretend to

**Nothing here measures whether an answer is any good.** `models.md` already says so about the
ladder, and it is just as true of the code. Every fault this loop chases is mechanical: a refusal,
a cap, a climb, a timing. It has no quality signal and no way to get one.

That matters because the two can disagree. `models.md` records raising rung 1's budget from 512 to
1024: every mechanical signal improved - it stopped climbing - and the answer got _worse_. A loop
tuning on mechanical signals alone would have called that a win. So:

> **Gates passing means "did not obviously break". It does not mean "got better".**

## Faults that need a person, not a knob

- **A chain that hit the cap** is a mis-route, and `next` is the whole routing. No small model
  should guess at it; read the chain.
- **A file over the 100-line cap** is reported, never handed to the coder. The fix is to extract
  into a _second_ file, and the coder is given one. Asked to shorten a file it will delete a
  feature instead, and the type check, the formatter, the rules check and the boot test will all
  pass. As of 2026-10-21 that is `src/chat/main.ts`, at 119 lines.

---

## Attempts

Nothing tried yet. Phase 1 only measures and reports; nothing is written.

---

## Two instances

The live harness and the coder are separate programs in separate folders, talking over http on
`127.0.0.1:8099`. Live measures itself and hands over a note; the coder fixes code in its own
copy, where a restart costs the person nothing.

```
D:\Projects\harness-master    live. npm run dev, npm run chat
D:\Projects\harness-coder     the coder. npm run coder
```

The coder is a clone of the live repo with `node_modules` and each `models/<name>` folder
junctioned across, so nothing is downloaded twice and Ollama is one shared server either way.
Set up once, by hand:

```
git clone harness-master harness-coder
New-Item -ItemType Junction -Path harness-coder\node_modules -Target harness-master\node_modules
# and one per models/<name>
```

**Why two folders and not two processes in one.** `npm run dev` watches `src/`, so a harness that
edits its own source restarts itself mid-task. Separating the folders removes the race rather than
working around it, and it means the live instance never runs code that has not passed its checks.

## A note says what good looks like

A check is a question, where its answer should come from, and what the answer must and must not
contain. All of it written by a person, in [checks.json](checks.json), so it can be re-run forever
and never needs a model's opinion.

Finding a failure needs neither a model nor the archive: ask `pickJob` which tool the words would
actually reach, and compare that to where the check says they belong.

**The first three came out of the code, not out of a guess.** The clock's phrase list is
`"what time"`, `"what is time"`, `"time in "`. So:

| asked               | reaches                                                  | should reach |
| ------------------- | -------------------------------------------------------- | ------------ |
| "what is the time?" | `web` - it falls through to the web chore's `"what is "` | `clock`      |
| "tell me the time"  | nothing, so a model invents one                          | `clock`      |
| "whats the time"    | nothing                                                  | `clock`      |

The fix is a phrase in `chores.1.when` - one key in one config file, which is the size of job a
1.5B model can do.
