<!-- limit: 2200 chars · source: github.com/cursor/plugins pstack/skills/architect/references/design-red-flags.md (MIT, Lauren Tan) -->
# red flags — screen every option (drill-me) and every stop (show-me)

The reader is an agent that sees only the files it opened, copies the nearest example, takes the shortest path that compiles. A shape where a change that looks right from one file is right for the whole tree wins.

| flag | tell | our law |
|---|---|---|
| shallow module | a caller coordinates several calls for one act; options expose internal stages | the mechanism already computes it (17) |
| information leakage | one representation · policy · wire type decided in two places | contract both sides (18) |
| temporal decomposition | modules cut by run order (load · validate · save), one invariant repeated across them | cluster by what co-varies |
| pass-through | forwards the same arguments to the same shape, hides nothing | no intermediary |
| split ownership | two writers or two copies of one state | write at the owner (15) |
| two ways to one task | the agent copies whichever it finds first | THERE IS ONE WAY |
| importable internals | a deep import compiles, so it becomes the interface | root barrel, no subpath |
| hand-synced list | adding an item edits N lists | derive, or the build fails on drift |
| off-sibling home | an option's home or signature no sibling uses; a sibling copied unmeasured | measure EVERY sibling first, an outlier named (11-16 /"its not a fuking subject"/ · /"is a maybe a mistake"/) |
| piggyback | one family reads another's events | the shared grammar is the question (11-16 /"a faculty to piggybank another"/) |
| foreign duty | a device or prototype sends a protocol packet; a new key with no named reader | it reports its own state; its READER named first (11-16 /"why do we need this?"/) |
| abstract option | no scenario; a nested first sentence; an ownerless hunk | HIS picture first (`modeA {primerA toolA}`), one fact a sentence; a USER concept = the world's form (11-17) (11-16 /"bad display"/ · /"smaller"/) |

Depth: prefer the smaller public surface hiding more — a deep MODULE, never a deep call chain (≤3 files to trace a flow).
