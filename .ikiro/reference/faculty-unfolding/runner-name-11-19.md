<!-- writer: agent · limit: 7000 chars · skill name, the lock pass: who RUNS a faculty's model. Design only, nothing landed. -->
# who runs the model — the ontology pass, 11-19

## the dissatisfaction is the spec

/"i dont like the upstream definition tho. naming and schema. this will become long term core schematic of our hallucination primitive."/ · /"upstream is technically accurate i assume. but not semanticlaly embedded enought in the schematics i think. maybe i just need to see more."/

It must NOT be: a wire-direction word, a broker's parameter name, a list of preferences.

## collisions, from disk

- `upstream` already means the client-to-server direction of a stream: 30 hits, `subsystems/typology/gestalten/shard/transmitter.js` (10), `subsystems/typology/prototypes/socket.js` (6), `subsystems/typology/schematics/primitives/connection.js` (2). A different concept.
- `provider` already means the hallucinator's slug on a selector:

```js
// subsystems/typology/schematics/primitives/hallucination.js:457
  provider: v.string().optional().desc('A provider slug, exact. Example: "openrouter"'),
```

- `host` is banned as a key (`codestyle.md`, names).

## what wants naming — two things

1. the PARTY that executes the weights (Groq, Cerebras) — a noun.
2. the SLOT: whether that party is part of a faculty's identity, or a preference on a request.

## how others say it

OpenRouter, the request body. Probed live 11-19 (`reference/call-faculty/timing-11-18/mind.txt`: every chunk answered `provider: "Groq"`):

```json
{ "model": "openai/gpt-oss-120b", "provider": { "only": ["Groq"], "allow_fallbacks": false } }
```

Vercel AI Gateway, per request (docs search 11-19):

```js
providerOptions: { gateway: { only: ["groq"], order: ["groq", "cerebras"] } }
```

Hugging Face Inference Providers, inside the model id (docs search 11-19):

```json
{ "model": "openai/gpt-oss-120b:groq" }
```

LiteLLM, a prefix on the model id (from memory, unread 11-19):

```json
{ "model": "groq/openai/gpt-oss-120b" }
```

All four call the party a "provider". Two put it in the request (a preference, a list, fallbacks), two put it in the id (identity, singular).

## fifteen, by register — hits are word-bounded, product code

brain (cortex · faculty · soma)

1. `substrate` (mine, 0 hits) — neuroscience's own word for what a faculty physically runs on. **Lean.**
2. `tissue` (mine, 0) — the same idea, reads medical.
3. `lobe` (mine, 0) — a region of OUR cortex; the party is outside it.

fab (die · wafer · mask)

4. `foundry` (mine, 0) — joins Die · Wafer; but a foundry makes a chip, it does not run it.
5. `silicon` (mine, 0) — true for Groq and Cerebras, false for a GPU cloud.
6. `fab` (6 hits) — short foundry, same flaw.

plain

7. `runner` (mine, 0) — who runs it; the English name of the mechanism. **Second.**
8. `vendor` (0) — says who bills; the broker bills.
9. `carrier` (8) — telecom's word for who carries a call; wrong for a text model.
10. `backend` (6) — means anything.
11. `venue` (mine, 0) — where it plays; theatrical.
12. `served` (109, HTTP serving) — collision.
13. `operator` (81, query operators) — collision.

industry

14. `inference` (0) — "inference provider" halved; names the act, not the party.
15. `only` (224) — OpenRouter's key verbatim; names the filter, not the thing.

STRUCK: `upstream` (his; the stream direction) · `provider` (the hallucinator's slug) · `host` (banned).

## precedent in our own ledger

Two faculties on ONE model that differ by a coordinate already exist: the voices.

```json
// ~/.viva/ledger.viva.json — elevenlabs faculties, as they stand
{ "type": "speech", "id": "luiza", "model": "eleven_flash_v2_5", "voice": "21m00Tcm4TlvDq8ikWAM", "tune": [0.3, 0.4, 0.1] }
{ "type": "speech", "id": "leandro", "model": "eleven_flash_v2_5", "voice": "EXAVITQu4vr4xnSDxMaL", "tune": [0.5, 0.5, 0.1] }
```

Here `id` is OUR name; `model` and `voice` say what it resolves to. The core primitive knows neither key:

```js
// subsystems/typology/schematics/primitives/hallucination.js:281
export const Faculty = v.object({
  type: v.string(),
  id: v.string().desc('The faculty, exact — a model id, a voice id. Example: "openai/gpt-image-2"'),
  tune: Tune,
```

## the principle that decides

The tune is measured on the party: `openai/gpt-oss-120b` gave its first text in 202 ms on Groq and 418 ms on Cerebras. Two speeds are two points in tune-space, so they are two faculties. The party is IDENTITY: singular, never a list, never a fallback (a fallback changes the tune without telling the cortex).

## three shapes — STRUCTURALLY different

A · inside the id (Hugging Face's shape). No schema change; a grammar hidden in a string.

```json
{ "type": "dialogue", "id": "openai/gpt-oss-120b:groq", "tune": [0.4, 1.0, 0.4], "context": 131072, "thinking": true }
```

B · a named seat with coordinates (our voices' shape). `id` is ours; `model` and the party say what it is.

```json
{ "type": "dialogue", "id": "oss-groq", "model": "openai/gpt-oss-120b", "substrate": "groq", "tune": [0.4, 1.0, 0.4], "context": 131072, "thinking": true }
```

C · one more key beside the model id. Two entries then share an `id`; a selector by `id` alone no longer names one (`subsystems/typology/prototypes/cortex.js:97-107` filters by provider and id, nothing else).

```json
{ "type": "dialogue", "id": "openai/gpt-oss-120b", "substrate": "groq", "tune": [0.4, 1.0, 0.4], "context": 131072, "thinking": true }
```

Lean: B. It is how the ledger already tells two voices apart, and `model` + `substrate` can then rise into the core `Faculty` so `/metadata/cortex` shows what a seat really is.

## noun → meaning

| noun | meaning | on disk today |
|---|---|---|
| hallucinator | the package that speaks one wire | `commons/hallucinators/openrouter/` |
| provider | a hallucinator's slug on a selector | `hallucination.js:457` |
| faculty | one thing a cortex picks: type · id · tune | `hallucination.js:281` |
| id | the faculty, exact | `hallucination.js:283` |
| model | the weights' name where `id` is ours | `commons/hallucinators/elevenlabs/provider/index.js:117`, not in core |
| author | `openai/` inside an OpenRouter id | no key |
| the party (unnamed) | who executes the weights | no key; the wire names it per chunk, we drop it (`commons/hallucinators/openrouter/provider/translate.js:249` keeps `model` only) |

## the sharpest tension

Is the party part of what a faculty IS (one seat per model-on-party, each with its own measured tune), or a wish on a request (one seat, a list of parties, the tune an average)? The four precedents split two against two; our tune-space only works with the first.
