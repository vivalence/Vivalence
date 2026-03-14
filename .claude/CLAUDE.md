# Vivalence

You are reading the root orientation document for the vivalence project. This is your first foothold. Use it well.

## Before You Do Anything

Stop. Read this document fully before writing a single line of code or making a single suggestion. The system you're working in is deeply intentional — names are chosen with care, abstractions earn their place, and every line of code is carrying weight. If you charge in without understanding, you will propose things that were already tried and abandoned, suggest complexity that was deliberately cut, or misname things that have precise vocabulary.

The subsystem docs listed below are your next reads. But this document tells you how to think about the system, how to maintain these docs, and how to be genuinely useful here.

## What Is Vivalence

A language learning operating system. Not an app — an OS. Types compose into routing, routing composes into daemons, daemons compose into a runtime. Game modes are plugins. Memory is Bayesian. The whole thing runs on Deno with MikroORM, Oak, Svelte, and Anthropic's Claude.

The power is emergent. Signature (211 lines) enables an entire routing ontology. Vector (107 lines) enables hierarchical routing with middleware accumulation. traverse (47 lines) walks two trees in parallel. compose (27 lines) enables arbitrary middleware stacking. These are not large systems — they are small, sharp tools that compose into large capability.

If you find yourself thinking "this could use a framework for X" — stop. The framework IS the types. Read them again.

## System Map

| Package | Role | Location | Doc |
|---------|------|----------|-----|
| **Typology** | Library | subsystems/typology/ | [claude.md](../subsystems/typology/.ikiro/claude.md) |
| **Vector** | Engine | subsystems/vector/ | [claude.md](../subsystems/vector/.ikiro/claude.md) |
| **Paladin** | Composition | subsystems/paladin/ | [claude.md](../subsystems/paladin/.ikiro/claude.md) |
| **Runtime** | Process | systems/runtime/ | [claude.md](../systems/runtime/.ikiro/claude.md) |
| **Registry** | Marketplace | registry/ | [claude.md](../registry/.ikiro/claude.md) |
| **Services** | Infrastructure | registry/services/@vivalence/ | [claude.md](../registry/services/@vivalence/.ikiro/claude.md) |
| **Kernels** | Domain + Data | registry/kernels/@vivalence/ | [claude.md](../registry/kernels/@vivalence/.ikiro/claude.md) |
| **Modes** | Feature | registry/modes/@vivalence/ | [claude.md](../registry/modes/@vivalence/.ikiro/claude.md) |
| **HTML Client** | Surface | systems/html/ | [claude.md](../systems/html/.ikiro/claude.md) |

**How they connect:**
1. Typology defines the types (Signature, Pattern, Signal, entities, gestalten)
2. Vector makes types executable (routing trie with middleware)
3. Paladin reads circuitry and resolves the registry into a compiled variant
4. Runtime boots daemons from the variant, applies mode traits, serves HTTP
5. Registry holds everything domain-specific: kernels, modes, services, circuits
6. Client connects to the daemon and renders mode views

## Canonical Vocabulary

Use these terms precisely. Don't substitute generic alternatives.

**Lifecycle**: construct → populate → resolve → integrate (→ disintegrate)

**Typology**: gestalt, prototypes, entities, schematics, specimen

**Gestalten**: is (predicates), cast (coercion), not (negation), fromm (conversion), belt (utilities), shard (network)

**Signature hierarchy**: Signature → Pattern, Signal, Path, Url, Action

**System**: vector, aperture, paladin, daemon, mode, valence, wafer, die

**Traits**: VIEWABLE, DATASET, VALENTIC, BUFFERED, PRODUCER, CHAOSMONKEY, TOPOGRAPHICAL

**Memory signals**: MASTERY, SUCCESS, NEUTRAL, MISTAKE, FAILURE

**Memory states**: UNTOUCHED → UNKNOWN → LEARNING → KNOWN → GRADUATED

## Conventions

- **No comments in code.** Comments are user space. Code is self-documenting through naming and structure.
- **.viva.js manifest pattern.** Every registry entry exports manifest + type-specific content.
- **Die/Wafer lifecycle.** Wafer is the base container. Die extends with implementation. Lifecycle cascades parent → children.
- **Trait system.** Traits are async functions applied to modes during daemon resolution. They compose middleware, endpoints, and behavior.
- **bak/ directories** are archives. Old code kept for reference. Never suggest re-adding patterns from bak/.
- **"ikiro" is deprecated.** The term will only ever disappear. Never use it in new code or docs.

## Testing Philosophy

Structural testing. Specimen is king.

Three patterns:
1. **Specimen** (typology tests) — gestalt-first: construction → gestalt → valences. Uses describe/it from @std/testing/bdd + expect from @std/expect + gestalten.is for type assertions.
2. **Deno native** (vector, paladin tests) — Deno.test + assertEquals. Direct function testing.
3. **Lifecycle** (runtime tests) — validates phase transitions through populate → resolve → integrate → disintegrate.

Future vision: specimen evolves into a lifecycle-driven BDD framework composed via Vector.

## Session Protocol

When starting a session on vivalence:

1. Read this document (you're doing that now)
2. Read the subsystem doc(s) relevant to your task
3. Read the actual code — the docs are scaffolds, not substitutes
4. Check the Work Packages section in the relevant doc for known gaps and active work
5. After completing work, update the relevant doc (see Self-Improvement Protocol below)

## Dead Code Registry

Known dead or dormant code — don't document it, don't suggest using it, don't extend it:

| What | Where | Status |
|------|-------|--------|
| Classifier + Feature prototypes | typology/prototypes/classifier.js | Dead (only in bak + 1 test) |
| Mask prototype | typology/prototypes/mask.js | Likely dead (never imported outside typology) |
| sheets subsystem | subsystems/sheets/ | Completely unused |
| Shell system | systems/shell/ | Dormant |
| NLP service | registry/services/@vivalence/nlp/ | Wired but uncertain activity |
| lighthouse/localhost | registry/services/@vivalence/lighthouse/localhost/ | Not wired in circuitry |
| hallucinator archive | registry/services/@vivalence/hallucinator/hal/archive/ | Legacy providers (Groq, OpenAI, etc.) |
| 11+ archived modes | registry/modes/@vivalence/bak/ | Abandoned pedagogical approaches |
| Archived topologies | registry/kernels/@vivalence/topology/bak/ | Spanish, Latin, etc. |

## Active Work Areas

As of 2026-03-14 — verify these are still current by checking git log:

- Aperture migration (direct Oak routing → Vector → Oak compilation)
- Vector → typology merge planned
- mode.produce.[xyz]() pattern (Vector object/proxy compiler)
- Asset entity type (VERBALIZED trait, mp3 vocalization, file serving)
- Mobile readiness on client
- ~~Serving built client (production)~~ DONE — adapter-static + serve.js + Dockerfile
- Hallucinator harness improvements
- Session-first patterning (client + runtime sync)
- More game modes (conjugation practice, "shittons of games")
- Progression system (eventually)

## Divio Documentation + Testing Matrix

Four styles applied to both documentation AND testing:

```
                LEARNING              WORKING
PRACTICAL       Tutorials             How-to Guides
                (walk-throughs)       (recipes)
THEORETICAL     Explanation           Reference
                (why decisions)       (specs/API)
```

Each subsystem doc has a Work Packages section identifying gaps in both documentation and testing through this lens.

---

## Self-Improvement Protocol

This is the most important section in this document. These docs are not finished artifacts — they are living scaffolds that you must maintain, question, challenge, and improve every time you work in this codebase.

### The Core Question

Every time you finish a task, ask yourself:

**"What would I have needed to read earlier, such that this process would have gone smoother, faster, better, with lower friction, leading to better outcomes faster?"**

Then write that thing into the appropriate doc. Not a note to yourself — a clear, useful addition that the next agent (or you in a fresh session) can actually use.

### When to Update

- **After learning something new** about a subsystem that isn't documented
- **After code changes** that make a doc inaccurate
- **After finding inaccuracies** — fix them immediately, don't leave them as traps
- **After completing a task** — update Work Packages (mark done, add discovered gaps)
- **After being briefed on new work** — add to relevant Work Packages
- **After struggling** — if you had to figure something out the hard way, document the shortcut

### What to Update

- **"Where Used" stubs** — these start empty. As you trace code, fill them in. Every cross-reference you add saves a future agent minutes of grepping.
- **Dead code flags** — verify or remove them. If something was dead and is now used, update the flag.
- **New patterns** — if you discover a pattern not documented (a new trait, a new composition technique, a new test approach), add it.
- **Method signatures** — if they changed, update them. Stale signatures are worse than no documentation.
- **Work Packages** — this is the heartbeat. Completed tasks get marked. New gaps get added. Active work areas get updated.

### How to Improve

- **Add code examples** that demonstrate compositional elegance. Show how 27 lines of compose() enables the entire middleware system. Show how one Signature class yields an entire routing ontology. The ratio of power to lines is extreme — make that visible.
- **Add test patterns** — when you write a test that uses a novel approach, document the pattern.
- **Cross-reference between docs** — the system is deeply interconnected. A change in typology affects vector affects runtime. Make those connections explicit.
- **Improve this root doc** — if you find a better way to organize the system map, a clearer way to explain conventions, a more useful session protocol, change it. This document improves itself.

### Quality Signals

How to tell if the docs are good:
- File paths are accurate (files exist where docs say they do)
- Method signatures match the actual code
- Dead code flags are verified (not stale guesses)
- "Where Used" sections have real cross-references (not just "[populate]" stubs)
- Work Packages reflect actual current state (not a snapshot from weeks ago)
- A new agent reading these docs can start productive work without 30 minutes of exploration

### The Docs Are Your Partner

You don't just read these docs — you co-author them. Every session you run is an opportunity to make the next session better. The compound effect is enormous: a small update today saves 10 minutes next week, which saves an hour next month, which means the system ships faster.

Don't treat documentation as a chore that happens after the work. Treat it as part of the work. The doc update is not overhead — it's the return on investment from everything you just learned.

### Improving This Document

This root document is the entry point for every future session. If it fails to orient an agent quickly and correctly, everything downstream suffers. So:

- If the System Map is missing a package, add it
- If the Canonical Vocabulary has a new term, add it
- If the Active Work Areas are stale, update them from git log
- If the Dead Code Registry has entries that are now alive (or dead entries not listed), fix it
- If you can think of a better Session Protocol, write it
- If this Self-Improvement Protocol doesn't motivate you to actually improve the docs, rewrite it until it does

## Zettelkasten

[zettelkasten.md](zettelkasten.md) — a scratchpad for documentation improvement ideas. When you notice something that could be better but don't want to break your flow, write it there. Periodically review and implement the good ones. Ask Finn for extra turns if you want dedicated time to work on them.

## Work Packages (Master Index)

Each subsystem doc has its own Work Packages section. This is the master view:

**Critical testing gaps across the system:**
- Learning domain: no tests for pick/review endpoints, memory drivers, signal schema
- Runtime: no tests for PRODUCER/DATASET/VALENTIC traits, view bundler, process system
- Modes: no mode-level tests at all
- Paladin: scopes untested, variant compilation untested
- Typology: entity trait system untested, gestalt belt/shard untested
- Vector: shotgun, agentic compiler, subscriber, match strategies untested

**Cross-cutting active work:**
- @vivalence/shared migration (belt re-exports, hash in 7+ files)
- Vector → typology merge
- Aperture → Vector compiler migration
- Asset entity type across domain + runtime + client

**Human documentation priorities (Divio):**
1. Tutorial: "Build a new game mode" (most requested path for new agents)
2. Explanation: "How Signature composition works" (core insight of the system)
3. Reference: Pick/review API contracts (most used endpoints)
4. How-to: "Add a topology" (most common data task)
