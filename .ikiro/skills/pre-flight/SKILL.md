---
name: pre-flight
description: >-
  The nine checks that run before authoring a noun, an import, a path, a test or a dataset entry in vivalence
  — grep the surface, open the memory body, verify imports, ontology before verbs, grep a name before typing it, read three entries, staged
  commands are notes, name the path's frame owner, the artifact's owner decides placement. Use before any
  authoring turn.
when_to_use: >-
  "add X to <subsystem>" · "wire up <thing>" · "write a new <primitive>" · "add a test for" · deriving a path
  from a runtime value · before any cross-component dispatch · before acting on a command staged in a compact
  or quest.
---

# pre-flight — "add X to <subsystem>" / "wire up <thing>": nine checks before authoring

These are standing checks — they apply to every authoring turn for the rest of the task, not only the turn that loaded this skill.

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
- [ ] **pre-staged commands are NOTES** — anything written in a compact/quest needs a fresh per-op `go`. VCS commands additionally: beef runs them, never me.
- [ ] **name the path's frame owner** — operator-typed → shell cwd · module declaration → the declaring repo · record entry → its registry's root. PRINT a runtime value before deriving a path from it. A path-semantics correction closes only after `grep -rn` over templates · deno tasks · docs · fixtures, hits listed. `family: pin-ontology-before-naming`
- [ ] **grep a NAME before typing it** — a proposed identifier, register word or door is grepped in the repo, `subsystems/typology` and `~/.viva/registry` first; a word beef refused once is refused everywhere; a gate or walk step names a door only after the grep finds the `open(` that serves it. `family: pin-ontology-before-naming` (NAMING ×4) · `no-fabricated-conventions` (`/scan`, 09-22)
- [ ] **the artifact's OWNER decides placement** — a mode's tests live in the mode, a domain's literals/fold/twitch in the domain (`daemon.domain.*`), a per-mode default in the mode's harness vector; `find <owner> -name "*.test.js"` before authoring a test; check where education puts the same organ. `family: fit-existing-trees`

## When pre-flight is DONE

These checks run per noun, when the noun is touched — never all at once over a whole package. An authoring turn writes its first artifact after the comp or ask + the schematic it changes (`feedback_read_budget`); "read up on X" = kernel + the path-matched shard. 09-23: all nine fired at once, ~600k tokens read, zero lines written — beef: */"ok you;ve overdone it on the inputs"/*. `family: scope-inflation` (read axis)

## The reflex this exists to break

Imperative-JS (hand loops, `Deno.readDir`, nested lookups) is the #1 recurring failure family. Before writing ANY iteration, lookup, or walk: grep for the primitive first — it almost always exists.
