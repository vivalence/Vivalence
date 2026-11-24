---
name: connoisseur
description: Judge a hunk of mine before he reads it. Each finding is pinned to a place in our tree that does it right.
when_to_use: >-
  "connoisseur" (any spelling) · "connoisseur pass" · "something is off" · "i dont like this yet" · "tighten" ·
  before a hunk of mine is shown to him or enters a quest · before "land"
---
<!-- limit: 2600 chars -->
# connoisseur — judge a hunk before he reads it

A hunk that merely works is below the bar. The law is the code section of codestyle.

## steps

1. His lines are out. Run `git diff HEAD` first: a line he wrote or killed is not judged.
2. Read the hunk as it is, with its caller beside it.
3. Walk the checks. Write each finding down before fixing anything.
4. For each finding, find the place in our tree that already does it right. Quote it with its path. No such place: it is taste, drop it.
5. Rewrite the hunk onto that example with the smallest change. No new helper, no new option.
6. Prove it: the same output before and after, run, by the suite of every consumer and not the owner's alone.
7. Report per hunk: code before, code after, the example's `file:line`.

## the checks

- Does a mechanism already compute this?
- Is the write at the owner of the state, or at a reader?
- What must the caller know to call it right?
- Is a branch really a value that could be data?
- Is there a hand loop where `steer.*` exists?
- What happens on unexpected input: loud, or a silent default?
- A `?.` or `?? {}` without proof it is needed.
- A helper for one caller. An options bag on a positional call.
- A line wider than 100 chars.
- A name that is a role, not the thing.

## never

- A taste note without an example from the tree.
- A rewrite proven by reading. It is run.
- A finding answered with a new mechanism.
- The pass after he has read the hunk. It runs before.
- "The whole shape is wrong": that is skill `bird`.
