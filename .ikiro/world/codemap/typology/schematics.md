---
paths: ["subsystems/typology/schematics/**"]
---
<!-- writer: agent · kind: persistent · limit: 4000 chars · traps only · the `v` surface traps (spread · cast/fill · keyword/setter · no zod) live in ../typology.md, which fires here too -->
# codemap: typology/schematics — `v` over typebox@1.3: same engine, same output, nicer surface (HOLY)
- **relations are THUNKS, and the cycle comes back FLAT** — `entityFactory` calls each `relations[k]()` under a module-level `resolving` Set (`v.js:74` · `:90`); a re-entrant call (Literal↔Symbol) returns base + own props only, no relations (`:78`). A relation authored as a value, not a thunk, throws at `thunk()`.
- **`v.environment` re-plains every property** — `plain` copies descriptors so keyword/setter Proxies never reach the env object (`primitives/environment.js:5`); keys outside `VIVA_ · PUBLIC_VIVA_ · SECRET_VIVA_` THROW (`:3` · `:8`).
- **trait schemas live ON the descriptor** — `factory.trait(row, NAME)` (`v.js:123`) THROWS on an undeclared name, returns `{}` when the row lacks the trait or it fails its schema, else the CAST value; never read `row.trait.X` raw.
- **`primitives/conversation.js` is an ORPHAN** — not exported by `primitives/index.js` (rg `primitives/conversation` → 0); its `Channel` collides with `primitives/hallucination.js:3` `Channel`. Do not revive it by import.
