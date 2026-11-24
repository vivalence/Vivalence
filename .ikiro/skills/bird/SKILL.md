---
name: bird
description: Redesign a subsystem's wiring from what it must do, not from its code. No edits.
when_to_use: >-
  "bird" · "birds eye" · "first principles" · "holistically" · "step back" · "zoom out" · "from scratch" ·
  "rewire X" · "is this the right shape?" · "think about shit coherently" · a fix that needs a third special case
---
<!-- limit: 3000 chars -->
# bird — redesign a wiring from what it must do

No edits. The result is one question for him, or a quest.

## when

Two or more workarounds on one mechanism. A need nobody owns. His word. One workaround only: skill `change`.

## steps

1. Draw the edge. Consumers outside the subsystem are fixed. Everything inside is free.
2. Read what is. The chain end to end with `file:line`, run, not recalled. Every state and who writes it. Every consumer. Every workaround: a sync, a guard, a flag, a special case, a list kept in step by hand.
3. Write the needs. Three to nine sentences of what a consumer or his screen needs, without one noun of the implementation.
4. Write the assumptions the current wiring makes. Tag each: he ruled it, a need forces it, or it is history. Only history is free to die. A ruled one is asked.
5. Close the files. Write the wiring fresh from steps 3 and 4. Start at the consumer's call, then the data shape, then the owners, then the dispatch. Write two, structurally different.
6. Compare each with what is: what dies, what moves, what is born, read off the code the new call runs through end to end, never off the sketch. A redesign that removes no workaround is a rename, drop it. If the fresh one equals what is, say so: the defect is local.
7. Report in his nouns. What is, as code. Then one question with two options as code (skill `drill-me`): it asks what he sees or does, in a sentence he could have said, never where the system keeps a thing. Two options that look the same on his screen today are no question: I take the one his own words already name and say so.

## questions that open a wiring

- Who owns this state, and who else writes it?
- What does one mechanism compute that a second derives again?
- Which branch disappears if the data carried a tag?
- Which consumer must know an internal rule to call it right?

## never

- A redesign that keeps the old file names and step count. It was not written fresh.
- A redesign that breaks a ruling without saying so.
- A new primitive where typology already has one.
- A third workaround "for now".
- A pattern name instead of code in our tree.
- My worksheet words in the reply, as a heading over a group too.
