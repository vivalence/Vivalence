# compact markers — beef's mid-session "on ikiro compact!" orders

<!-- writer: agent. Read this at the START of every compact walk, before the extractor.
     Each marker is an order beef gave mid-session and deferred to the fold.
     Settle it in the compact's body, then strike it from here with a one-line verdict. -->

## OPEN

### an empty cortex must warn at boot, in the runtime AND in kajuit

Beef, verbatim: *"ahh ohh this is imortant as a knowon issue. i watn to be warned differntly
about this. kajuit adn runtime."*

The known issue: a daemon whose instance declares no `hallucinators` (or whose keys all stay
blank) boots with an EMPTY cortex and stays silent until the first hallucination, which dies
deep in the belt — `shard/hallucinate.js:42` *"no 'dialogue' faculty resolves a 'stream'
avenue"* — surfacing as a 500 on `/harness/dialogue/stream`. `acid()`
(`systems/runtime/daemon/lifecycle/population.js:106`) warns only when a provider REFUSES;
zero providers is not a refusal. Seen on the fresh droneaid instance (`instance/create` copied
a kernel that had no hallucinators block).

Owed, designed at the fold: (1) runtime — `acid()` warns at boot when a HARNESSED /
CONVERSATIONAL daemon ends with an empty cortex, and the belt error names the cause
(no faculties registered vs no match for the tune); (2) kajuit — the daemon display /
boot display shows the empty cortex as a state, not a crash on the first message.
Fixed today at the config layer only: droneaid registry + instance kernels carry the block.

### cortex snapshot coverage vs the live strip

Beef, verbatim: *"do a comparison between the keys i provided you in hallucinator cortex
etc, all specific copy paste by me, and compare it to the snapshot. are we snapshotting
completely and correctly?"*

The three copy-pastes to compare against:

1. the `acid()` boot dump — `{ mask, service, faculties }` for `@commons/hallucinator/anthropic`
2. the `Cortex { faculties: Map(1) { "dialogue" => [3] } }` dump from the same boot
3. `GET /daemon/hello/metadata/cortex` → the live 3-faculty strip, pulled under beef's token

Against `systems/runtime/tests/snapshots/cortex-contract-strip.snapshot.json` (one faculty)
and `cortex-contract-render.snapshot.json`, pinned by `systems/runtime/tests/cortex-contract.snapshot.test.js`.

**First reading, taken live. The specific holes and the specific drift:**

Emitter is `subsystems/typology/gestalten/shape/cortex.js:1-10`. Seven keys, two of them
behind conditional spreads. What each surface actually carries:

|            | strip emits | contract snapshot | stripwire fixture | LIVE (anthropic) |
|------------+-------------+-------------------+-------------------+------------------|
| type       | always      | dialogue ×1       | dialogue ×3, verbatim, speech | dialogue ×3 |
| tune       | always      | [0.9,1,0.3,0.5]   | 3-length, padded  | 4-length native  |
| context    | always      | 200000            | 200000 ×3         | 1000000 ×2, 200000 |
| channels   | always      | flat strings      | flat + OBJECT form | flat strings    |
| provider   | CONDITIONAL | *** ABSENT ***    | *** ABSENT ***    | "anthropic" ×3   |
| config     | CONDITIONAL | *** ABSENT ***    | *** ABSENT ***    | {model: …} ×3    |
| via        | always      | ["render"]        | render+stream ×2, render ×1 | render+stream ×3 |

*** HOLE 1 — `provider` is never exercised anywhere.*** Stamped in
`systems/runtime/daemon/lifecycle/population.js:113` (`{...faculty, provider: service.manifest.slug}`),
emitted by the strip, rendered by the client. No fixture on either test path declares it:
`contractFaculty()` (`cortex-contract.snapshot.test.js:19`) and the shared
`commons/fixtures/data/faculties.js:65-117` both omit it. The conditional spread therefore
never fires in any test, and the key is absent from both pinned JSONs.

*** HOLE 2 — `config` is never exercised anywhere.*** Same two fixtures, same omission.
Real providers set `config: { model: "claude-opus-5" }`
(`commons/hallucinators/anthropic/provider/index.js:68`ff). It is the only field that names
WHICH model a faculty is.

*** Both unpinned fields are the two the client reads.*** hello-world `App.svelte` renders
`faculty.provider` and `faculty.config?.model` in the attached list; `Intelligent.svelte:31`
reads the faculty list for the tune picker. The wire could stop emitting either and the
whole suite stays green.

*** HOLE 3 — the contract snapshot pins a ONE-faculty cortex.*** `cortex-contract-strip.snapshot.json`
is a single-element array, single avenue `["render"]`. Multi-faculty ORDER across
`[...cortex.faculties.values()].flat()` is asserted in `cortex.stripwire.test.js` but never
frozen in a snapshot, so a reordering is caught only by that test's own expectations.

*** HOLE 4 — object-form `channels` never reaches a snapshot.*** `commons/fixtures/data/faculties.js:126,148`
declare `channels: { in: [{ type: "audio", codec: "pcm_16000" }] }` for verbatim/speech.
Only flat-string dialogue channels are pinned. The strip copies `channels` by reference, so
the two shapes are untested against each other.

*** DRIFT — `tune` arity, benign but unrecorded.*** Fixtures declare 3-length tune;
`Cortex.register` (`prototypes/cortex.js:48`) pads to 4 with 0.5. Live providers declare 4
natively. The snapshot froze the PADDED value, so it pins the pad, not the declaration —
correct today, silent if the pad ever changes.

Settle at the fold: is a second contract fixture owed — one provider-stamped,
config-bearing, both-avenues faculty — or does `cortex-contract` deliberately pin the
MINIMUM, with provenance coverage belonging in `cortex.stripwire.test.js`? Beef rules.

**MEASURED LIVE at the doctor-rewrite fold — the table above is no longer inference.**
A probe fed `Cortex.register` two real-shaped faculties and read `shape.cortex.strip` back:

- keys emitted: `['type','tune','context','channels','provider','config','via']` — both
  conditional spreads DO fire, with `provider: "anthropic"` and `config: {model: "claude-opus-5"}`.
- a 3-length `tune` came back 4-length with `0.5` appended — the pad fires exactly as HOLE/DRIFT
  described, so the snapshot pins the pad and not the declaration.

So HOLE 1 and HOLE 2 are confirmed TEST gaps, not code gaps — and they remain precisely the two
fields the new hello-world daemon display renders. Still OPEN: the ruling only.

## SETTLED

- **the guaranteed shape vs the machinery that gets there** — SETTLED in #176 `* the marker — Question A and Question B, settled`: six values across the prod cutover, Question A answered first each time (JWT minLength, `<slug>.viva.db` ×2, declared mountpoint, typed `remote`), Question B where every surprise lived (defaults not reaching consume statics, Coolify's env/volume/domain/prune roads, the pragma-glued migration). Verdict: write A's one line per value before walking B.


<!-- settled #176 -->
## SETTLED (#176) — the guaranteed shape vs the machinery that gets there (beef, at the prod-deploy fold)

Beef, verbatim: *"maybe thats a nice way to frame it in your ontology of this space. how to think
when this type of problem is tackled. ikiro mark this for the . whats the ledger schematics at the
output of paladin and whats the instances at the end of processing - guaranteed. vs whats the
different ways to get there? defualts fal through, env vars can be deduced, etc etc. there is a lot
fo machinery. this is the internal semantic for you. ikiro mark."*

The ask is not a fix. It is a FRAME, owed to ikiro itself: when a problem is about state that a
container carries, separate the two questions and never mix them.

**Question A — what is GUARANTEED at the end of processing.** The post-`settle` shape: what
`paladin.instance` is, what the ledger holds, what every mountpoint seat is named, which statics are
decoded prototypes and which are carried raw. This is a SCHEMATIC question with one answer, and it
is checkable — `subsystems/typology/schematics/primitives/instance.js` plus the settle suite are the
whole of it.

**Question B — the many roads in.** Defaults falling through, `${…}` interpolation in an environment
schema, env strata (flag › cwd › instance › .env › os › session › ledger), thunks fired by
`paladin.hydrate`, `Statics`' `additionalProperties: true` carrying an undeclared key WITHOUT
decoding it, mountpoint declared-wins-else-seat, image-baked ENV, compose ENV, Coolify ENV. This is
the MACHINERY, it is plural, and every road is a place a value can arrive wrong.

The failure mode this frame prevents is the one measured this session: the reach-url crash
(`populate.js:11`, `TypeError: …remote?.clone is not a function`) was diagnosed as a *wiring* bug
for three proposals running, because nobody asked Question A — what is `runtime.statics.remote`
GUARANTEED to be? Undeclared in the schematic, so: carried, never decoded, a raw string. Beef's own
steer — *"or better, the mask of runtime in paladin processing"* — was Question A, and it was right
at the first asking.

Scope when this is worked: the two questions want a written answer each, side by side, for the
ledger and for the instance. Not a new subsystem — a page. Where it lands (codemap shard, a method,
`ikiro.md`) is beef's call.

<!-- settled at the 09-21 selfimprove -->
## SETTLED (09-21 selfimprove) — the compact tag index is retired

Beef, verbatim: *"mark this as depracated in ikiro. i no longer want to sustain this. too much time in
updates, not enough payback. when we do our next ikiro selfimprove i want you to inline this into the
quests/compact/whatever. too much headwind and bloat. mark. no do."*

**Verdict: the `## by tag` fold is GONE; ids stay.** `compacts/index.md` went 507 lines → 185, one line
per compact (`#+index:` id + slug) and nothing to curate. `methods/compact-index.py` no longer reads or
requires `#+filetags:` — existing tags are left alone, unread; the id stamper now anchors on `#+title:`
when a compact has no tags line. The INDEX step in `methods/compact.md` says the same. Nothing else
consumed the fold: `hooks/compact-gate.sh` counts the numbered roster, which survives. Checked after:
`179 compacts · 0 ids stamped · next id 180`, gate reports `compacts on disk 179 · indexed 179`.
