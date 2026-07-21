---
name: pre-flight
description: Use before any non-trivial edit, proposal, or cross-component dispatch in the vivalence repo — before writing a new noun, importing from @vivalence/*, authoring into a dataset (entities/manifests/faculties), or acting on a pre-staged command. The six checks that stop the dominant recidivism families (imperative-JS reflex, fabricated APIs, unread memory) before a line is written. Triggers like "add X to <subsystem>", "wire up <thing>", "write a new <primitive>".
---

# pre-flight

Invocable runner for the six checks that precede load-bearing work. Canon: `.ikiro/self/rituals.md ## pre-flight`. Run this the moment you're about to author a noun, an import, or a dataset entry — the failures it catches are the top recurring callout families.

## The six checks (make a todo per check that applies)

1. **grep the surface** — `grep -rn "export " <subsystem>/<dir>/` for the noun you're about to write. **A primitive that already does it WINS**: `paladin.find.viva` · `paladin.read.viva` · `paladin.vip.accio*` · `cast.lookup` · `steer.rollup` · `steer.fold` · `shape.object`. NEVER `Deno.readDir`, hand-rolled walkers, or nested-loop lookups. *Imperative-JS reflex is the dominant recidivism family — this check is the guard.*
2. **open the memory BODY** — a MEMORY.md one-line description is a pointer, NOT the rule. Read the memory file's body before applying it; descriptions mislead.
3. **verify imports exist** — never write `import { x } from "@vivalence/…"` unconfirmed (grep the barrel). Never fabricate an API: `v` is typebox-wrapped — NO `.passthrough` / `.strict` / `.transform` / `.refine` / `.partial` / `.nullable`.
4. **ontology before verbs** — contested term? STOP coding, survey repo-wide usage, lock the concept's identity first. beef: *"stop fucking coding. start designing."*
5. **read ≥3 existing entries** before authoring into any dataset (entities, manifests, faculties) — match the established shape, don't invent one.
6. **pre-staged commands are NOTES** — anything written in a compact/quest/orb needs a FRESH per-op `go` before running. VCS commands additionally: beef runs them, never me.

## The reflex this exists to break

The imperative-JS reflex (hand loops, `Deno.readDir`, nested lookups) is the #1 recurring failure. Before writing ANY iteration/lookup/walk, check for the typology primitive first — it almost always exists. If you catch yourself writing a `for` loop over repo files, stop and grep for `steer.rollup` / `paladin.find.viva`.

---
_Wiring: `.ikiro/skills/` is auto-discovered only once symlinked — `ln -s ../.ikiro/skills .claude/skills`._
