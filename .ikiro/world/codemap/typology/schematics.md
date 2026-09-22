---
paths: ["subsystems/typology/schematics/**"]
---
<!-- writer: agent · kind: persistent · limit: 55 lines · traps only -->
# codemap: typology/schematics — `v` over typebox@1.3: same engine, same output, nicer surface (HOLY)
- `v.js:derive` copies property descriptors, NEVER spread — typebox's non-enumerable `~kind` dies in `{...schema}` and `Value.Convert` silently no-ops; `default/$id/group` are the KEYWORD when set, the SETTER when unset (`v.environment` unwraps to plain schemas for this); relations are THUNKS (`resolving` Set breaks Literal↔Symbol).
- `cast` = Default+Convert for request INPUT only, `fill` = Default only for entity data, both in place; `v.rel` = ID ∪ opaque object so Convert never descends a relation; no zod-isms (`.min/.max/.strict/.passthrough/.transform/.refine/.parse/.partial/.nullable` do not exist — constraints in the options object, nullable = `union([s, null])`); trait schemas live ON the descriptor, read via `v.<entity>.trait(row, NAME)`; `conversation.js` is an ORPHAN whose `Channel` collides with hallucination's.
