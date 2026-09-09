# compact markers — beef's mid-session "on ikiro compact!" orders

<!-- writer: agent. Read this at the START of every compact walk, before the extractor.
     Each marker is an order beef gave mid-session and deferred to the fold.
     Settle it in the compact's body, then strike it from here with a one-line verdict. -->

## OPEN

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

(none yet)
