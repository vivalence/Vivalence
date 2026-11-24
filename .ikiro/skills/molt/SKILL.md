---
name: molt
description: Ikiro learns from its own records. The readings say what is owed, each owed thing gets one act.
when_to_use: >-
  "molt" · "self-improve" · "selfimprove" · "learn from yourself" · "do a pass over ikiro" · "what did we learn" ·
  "is ikiro getting better?" · a new model generation
---
<!-- limit: 2600 chars -->
# molt — ikiro learns from its own records

```sh
python3 .ikiro/methods/molt.py            # the readings. exit 1: something is owed
python3 .ikiro/methods/molt.py --stamp    # last: saves the readings as the mark
```

Every number comes from a log or a transcript. None is kept by hand.

## what each reading asks for

- A guard fires often: the rule under it fails. Make the warn a deny. If it fires wrongly, fix the guard.
- A guard is written but not wired: hand him the settings entry, or delete the script.
- Many corrections in a week: read those turns. Each one rewrites one sentence in the skill that missed.
- A skill never fires: its trigger words are wrong, or it is dead. Use his spelling. A dead skill merges into its neighbour.
- A document grew: rewrite it shorter. Never raise a limit to make room.
- A new model: for each rule ask "would the bare model do this anyway?". The candidates go to him as a list.
- Research older than 60 days: one sweep of how others build harnesses, saved to `.ikiro/reference/harnesses/<date>.md`.
- A memory file newer than the mark: each fact moves to its ikiro file. What is private stays.

## deleting

- A record of one moment can go: a compact, old research, a stamp.
- A document that loads into a session is rewritten, never deleted.
- Before a delete, copy it to `~/.viva/bak/ikiro/<name>-<date>/`.
- A fan-out of agents needs his word.
- A change is proven when the next readings move. Looking like a better harness proves nothing.
