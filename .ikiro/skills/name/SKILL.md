---
name: name
description: Never invent a noun. Lock a contested name the way he does, then rename it across the whole machine in one pass.
when_to_use: >-
  "what IS an X?" · "i dont like the name" · "propose 15" · "whats most true?" · "what did we call X" ·
  "rename X to Y everywhere" · "globally rename" · "no dual read" · a new file, export or key gets a name
---
<!-- limit: 3000 chars -->
# name — lock a noun, then rename it everywhere

## before I type a new name

- Grep his turns and the tree for the word he used. His word is the name.
- A word he killed is never used again, in code or in a reply.
- Grep the new name. Is it taken? Does it already mean another thing?
- An entity kind (`file`, `thread`, `mode`) names nothing else.
- A new name joins the family its neighbours are in.
- A name says the thing or the mechanism. Never a role, never drama.

## lock

1. His dislike is the spec: what the name must not be.
2. List what the word means today, read from disk. Count the things that want a name.
3. Propose fifteen, one line each, in plain words. Say which I pick. Decide nothing.
4. Show a table: each term and its meaning, dead terms too.
5. He picks, per item.

## rename everywhere

One pass, nothing else in it. No alias, no dual read, no fallback, no "was X" comment.

1. List where the word survives with another meaning. Those are kept.
2. Grep everything: identifiers, manifest types, env vars, routes, file names, fixtures, snapshots, docs, the values his db stores.

```sh
/usr/bin/grep -rI '<old>' . ~/.viva/instances ~/.viva/registry
```

3. The radius is the whole machine: the repo and `~/.viva`. Copy `~/.viva` data before changing it.
4. A word his db stores moves by a migration step in the same pass.
5. Keys that must change together change in one milestone, or the boot is red.
6. Rename by one script, dry run first. Read every changed line.
7. Grep again. A hit outside the kept list is a miss.
