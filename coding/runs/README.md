# runs

One line per finished chain, appended by `src/common/archive_run.ts`, in `<yyyy_mm>.jsonl`.

Shapes and numbers only: which workflow handed to which, which agent answered and how long it
took, how far the ladder climbed, and what stopped it. **No prompt, no reply, no looked-up text.**
That keeps the file small and keeps private talk out of git.

It lives here and not in `workspace/` because the workspace is wiped, and a measure that is wiped
measures nothing.
