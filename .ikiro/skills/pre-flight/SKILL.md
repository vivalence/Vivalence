---
name: pre-flight
description: The six checks that run before authoring a noun, an import, or a dataset entry in vivalence — they stop the dominant recidivism families (imperative-JS reflex, fabricated APIs, unread memory bodies) before a line is written.
when_to_use: "add X to <subsystem>" · "wire up <thing>" · "write a new <primitive>" · before any cross-component dispatch · before acting on a command staged in a compact, quest, or orb.
---

# pre-flight — "add X to <subsystem>" / "wire up <thing>": six checks before authoring

Canon: `.ikiro/self/rituals.md ## pre-flight`. These are standing checks — they apply to every authoring turn for the rest of the task, not only the turn that loaded this skill.

## The checklist

- [ ] **grep the surface** — for the noun about to be written:
      ```bash
      grep -rn "export " <subsystem>/<dir>/
      ```
      **An existing primitive WINS.** See `primitives-checklist.txt` in this directory for the seven and when each applies. NEVER `Deno.readDir`, hand-rolled walkers, or nested-loop lookups.
- [ ] **open the memory BODY** — a MEMORY.md line is a pointer, not the rule. Read the file before applying it; descriptions mislead.
- [ ] **verify imports exist** — grep the barrel before `import { x } from "@vivalence/…"`. Never fabricate an API: `v` is typebox-wrapped — no `.passthrough` / `.strict` / `.transform` / `.refine` / `.partial` / `.nullable`.
- [ ] **ontology before verbs** — contested term? Stop coding, survey repo-wide usage, lock the concept first. beef: *"stop fucking coding. start designing."*
- [ ] **read ≥3 existing entries** before authoring into any dataset (entities, manifests, faculties) — match the established shape.
- [ ] **pre-staged commands are NOTES** — anything written in a compact/quest/orb needs a fresh per-op `go`. VCS commands additionally: beef runs them, never me.

## The reflex this exists to break

Imperative-JS (hand loops, `Deno.readDir`, nested lookups) is the #1 recurring failure family. Before writing ANY iteration, lookup, or walk: grep for the primitive first — it almost always exists.
