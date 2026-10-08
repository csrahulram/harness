# PRD: harness-master

## Purpose
A personal, offline harness that runs already-defined jobs on small local Hugging Face models, so routine work costs no subscription tokens. It is not a general assistant and not a Claude clone. The goal is to learn the limits of small models and build code that works inside them.

## Principles
- Code orders the steps. Models only do the narrow job they are good at; small models plan badly, so they never decide the workflow.
- Every step is recorded. A session is a linked list of step records that can be replayed or resumed.
- Parts are plug and play. Any agent, workflow or service can be swapped for another with the same interface.
- Offline by default. Only the search service may use the network.
- Every text that reaches a model passes the prompt-injection guard first, including text from PDFs, transcripts and search results.

## Capabilities
| # | Capability | Status |
|---|---|---|
| 1 | Chat with a local model | done (Qwen3 1.7B) |
| 2 | Sessions with a visible step chain | done |
| 3 | Resume a session | done (list, reopen, rename, close) |
| 4 | Text → image | planned |
| 5 | Image → 3D model | planned (was built, set aside while the GPU is replaced) |
| 6 | Image → video | planned |
| 7 | Text → 3D model | planned |
| 8 | Text → speech | planned |
| 9 | Speech → text | planned |
| 10 | Text → PDF | planned |
| 11 | PDF → markdown | planned |
| 12 | Web search | planned |
| 13 | Update memory | planned |

## Users
One person, on one Windows 11 machine, through a browser on the same machine.

## Constraints
- GPU: RTX 4070 SUPER, 12 GB. Small models stay resident; heavy models load one at a time and are freed after two idle minutes.
- RAM 64 GB (Docker sees 33 GB). Python 3.14, torch 2.14 (CUDA 13), transformers 5.17.
- Model licences must allow commercial use.
- Services bind to localhost only.

## Out of scope
Multi-user access, authentication, cloud models, mobile clients.
