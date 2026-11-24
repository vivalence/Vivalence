---
name: drill-me
description: A design interview. One question per turn, two options as code, he locks one. The locked snippets are the product.
when_to_use: >-
  "/drill-me" · "drill me" · "help me think" · "defuddle me" · "research the design space" · "A or B?" ·
  a new entity or relation is born
---
<!-- limit: 3600 chars -->
# drill-me — the locked snippets are the product

## 1 · research, before the first question

- Read what exists: the quests, `known-issues.org`, his rulings, his design.
- Measure the chain as it is, with `file:line`. Grep every noun he used.
- Read how the tree's barrels and imports hand over such a thing. Run it, never recall it.
- Write two approaches as code: two shapes, no third.
- If he called a thing weird, one option deletes it.
- Run both options on his real entity and on the class production builds, before showing them.
- Screen each option against `red-flags.md` in this directory.
- List the questions. The first one is the root of his symptom.

## 2 · the interview

````md
**Q3 — the question in one sentence.**

Today: one to three plain sentences, with file:line.

Option A. One sentence.

```js
// repo/path.js:12
three to eight real lines
```

Option B. One sentence.

```js
// repo/path.js:12
three to eight real lines
```

I pick A: the reason.
A or B?
````

A question:

- He can answer it cold: one thing he did today on his real data, what his screen hid, in his nouns, never mine.
- Each option is named by the one thing that differs for him, and shows what he would write and what he would then see.
- Code is whole and real. It names its repo path and who calls it. No `…`, no prose inside the fence.
- A question whose effect he never sees is mine. I decide it and say so in one line.
- What a lock, a ruled name or the tree's style answers in its own scope is looked up, never asked.
- One noun per thing. A word I made up dies when he names the thing.
- His whole turn is answered, every clause.
- If he picks neither, his reframe wins. The next question is on his terms.

A lock:

- A lock is his act: `a`, `b`, `amen`, `lock`. It locks that one snippet.
- `amen` over a list locks nothing in it.
- Praise is not a lock.
- A question of his ("why cant we X?") is design. I answer and ask back. I build nothing.

## 3 · when he is confused

"i dont understand" · "defuddle me":

1. Two nouns got mixed. Show a table: each concept, what it is, who owns it, what it carries.
2. State the laws, numbered, one line each.
3. Redraw the whole thing bigger, as code.

## 4 · finish

He ends the interview. Then the locked snippets, in file order, go into a quest when one exists or he asks.
