# Knowledge base

An Obsidian vault. Open this folder in Obsidian and edit it however you like — the harness reads
what is here, it never writes to it. Nothing in this folder is about any one person; that lives in
`memory/users/<name>/`.

## What the harness understands
- **Headings** split a note into sections. A search returns the section that matched, not the whole
  file, so long notes stay useful.
- **`[[Wiki links]]`** are followed. When a section is recalled, the notes it links to become
  candidates too, which is how a chain of related notes reaches the model.
- **`#tags`** and YAML frontmatter are read and kept, so notes can be filtered as well as searched.

## Two things worth knowing
- Notes pass the prompt-injection guard when indexed. A note is text from outside, and it ends up
  in the model's prompt, so it gets the same check as anything you type. A note that fails is
  skipped and named in the log rather than silently dropped.
- Editing a note re-indexes it; the harness compares the file's modification time with what it
  last read.
