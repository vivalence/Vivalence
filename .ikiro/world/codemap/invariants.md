---
paths: ["subsystems/**", "systems/**", "registry/**", "testament/**"]
---
<!-- writer: agent · derived-from: cross-container corpus read · verified: session c795a2f7 · limit: 20 lines -->
# codemap: cross-container invariants

- **trait grammar everywhere**: declarative metadata in artifact + functional dispatch in resolver → emergent wiring. Ask "what trait expresses this?" before "what code implements this?".
- trait check: `entity.traits.includes("X")` (array), never `entity.trait?.X` (values may be null = present-with-no-data).
- **transport**: never raw fetch in Connection — the transport chain carries auth.
- **MikroORM**: hooks can't flush; `lazy:true` drops fields from serialization (Memory.strength; the createdAt footgun).
- **emitted buffers** bind thread ONLY if `ctx.input.thread` forwarded (cross-mode emit delegation forwards before inner flush; feed results into `ctx.pool`).
- lifecycle everywhere: `construct → populate → resolve → integrate → disintegrate`, parent cascades to children ([[totems]] wafer).
