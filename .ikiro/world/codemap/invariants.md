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
- **STRIPWIRE**: a trait's ONE Vector is callable on both sides — daemon `shape.object(vector)` (local) ⟷ client `shape.connection.wire(conn, strip(vector))` (remote, off `/metadata/*`). Same spelling (`mode.emit.x`, `mode.harness.object.render`), different backing. `wire`+`messenger` are the transport-dual of `object` (callable-AND-namespace both sides); the contract is node-centric `{effect?, branches}` (the cata of the Vector's `{effect, trajectories}`; `leaves` dissolved), and the ROOT effect strips+wires (`side()` local≡remote — "no path is a path", `branch("/")≡affect`). Built for EMITTER+HARNESSED; APPLICATION/TOOLED/cortex half-wired. See `docs/40-49_repository/47_integration/47.03_stripwire.org`.
