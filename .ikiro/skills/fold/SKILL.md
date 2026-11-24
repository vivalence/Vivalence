---
name: fold
description: The session improves ikiro, then hands the work over.
when_to_use: >-
  "fold" · "compact" · the end of a session · "retard" · "i dont understand" · "ikiro mark" · "prune"
---
<!-- limit: 2600 chars -->
# fold — the session improves ikiro, then hands the work over

## 1 · read the session

Read this session's transcript from the start. Never from memory.

```sh
python3 .ikiro/methods/walk.py <id>.jsonl
```

Make two lists.

- His: what he said, what he approved, what landed, what is still open.
- Mine: every correction, every guard that fired, every claim that turned out false.

## 2 · fix each failure

1. Find the rule that should have stopped it. Search ikiro for it.
2. The rule exists: rewrite that sentence so it catches this. Never add a second rule. Never add the case.
3. No rule exists: write one. It goes in the skill that is loaded when the act happens, else in codestyle.
4. The same failure a second time: propose a guard. The rule did not hold.
5. Redo the failed act under the new sentence. If it still fails, the sentence is wrong.

## how a rule is written

- One plain sentence he can read cold.
- No dates, no case history, no quotes, no shorthand, no pointers to other files.
- A rule about my own tooling that he never sees goes in no document. A guard enforces it, or it dies.
- Code where code says it better.
- A file never grows by a fold. A new sentence replaces a weaker one.

## 3 · name the missing test

For each defect: which test should have gone red first? Add it to the sibling suite, or list it as owed.

## 4 · hand over

- Quest: approved code goes into `* as code`. Each milestone gets its state. Then what is next, and what was ruled out.
- Frontier: one line per live quest. Name, state, next.
- A defect that outlives the quest goes to `known-issues.org`.

## 5 · report

One row per failure: what went wrong, the sentence now, its file and line.

## another session is live

Read a file again before writing it. Never trim another session's line.
