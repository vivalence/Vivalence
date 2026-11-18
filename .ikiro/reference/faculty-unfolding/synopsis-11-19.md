<!-- writer: agent · limit: 10000 chars · the hand-over for the chain + the conversational trait (his briefing items 1 and 2), 11-19. Read with terrain-11-19.md. Nothing here is built. -->
# faculty unfolding — synopsis for the next agent, 11-19

Owner from here: he, with another agent. Two strands in tandem: THE CHAIN (faculties at every level, traits resolved in paladin) and THE TRAIT (conversational owns the wiring, on top of the harness).

## his words, second pass (verbatim)

The runtime adds nothing of its own:

/"mark as to fix feat. we the whole chain to build on top of each other from root aka ledger / runtime / daemon (via domain) / mode"/

No live daemon declares any:

/"what would that look like in .viva.json?"/

A mode adds nothing and serves no cortex:

/"we'd want to be able to set faculties all the way down. important for binding voices as settting and faculty, adn for setting providers or modesl per mode aka at every level."/

Nothing is inferred, nothing travels:

/"question: is this paladin? i think this is partly paladin. paladin does inference on types and traits. paladin parses .viva.json into mask instance. and we might include the resolution and wiring of traits and faculties here. meaning the runtime owns cortex and implementation and the paladin owns  the configuration at each layer. we just need to be coherent and complete in our implementation. your job."/

/"that means that rules about what infers what are baked into paladin. paladin must protect against the case where a harness or conversational trait is define on runtime but the faculties are missing - this means for conversational that we need either call or [s2t,t2s,t2t] because thats resolved."/

/"so. trait inference happens in paladin. branch has it -> leafs get it. faculty configurations are additive."/

/"altho this puts a nice question onto tiers and tunes. rn tiers are just hot-wirings for tunes. but that is insufficient. i think we need a way to map specific faculty tiers to specific roles. either we hardcode roles for like ear/brain/toung into the instnace map or we expect a tier by name to be present. i'd like to see both inthe eventual /drill-me session (later)."/

The old trait:

/"nice. so, a lot of stuff in the harness moves into conversational. conversational importanly running on top of harness. chekc from the pre 305701e90 eara also the clientside consumption and how the trait conversational facillitated the wiring into the client! steal."/

The runtime level (his ruling on "add CONVERSATIONAL to the runtime harness?"):

/"add it. runtime has harnessed and conversational. make sure the faculties are confiured. we can remove facutlries from other daemons then. but keep them on language learning, since there we have a great case and need to test daemon adn mode (francesca) level faculties. the others like droneaid can live with runtime faculties."/

## what a daemon's faculties look like in a recipe — it parses today, nobody writes it

```js
// subsystems/typology/schematics/primitives/instance.js:121 — the Daemon schema already holds the slot
    hallucinators: v.array(Mask).default([]),
// systems/runtime/subjects/daemon/lifecycle/1-population.js:63 — and the daemon's beat already reads it
  for (const [index, citizen] of die.register.hallucinators.entries()) {
// :72
  die.daemon.cortex = die.runtime.cortex.split(faculties);
```

```json
// an instance.viva.json — SKETCH of a daemon adding one voice to what the runtime holds
{
  "daemons": [
    {
      "manifest": { "slug": "spanish" },
      "hallucinators": [
        {
          "module": "@commons/hallucinator/elevenlabs",
          "faculties": [{ "type": "speech", "id": "francesca", "model": "eleven_flash_v2_5", "tune": [0.5, 0.6, 0.1] }]
        }
      ]
    }
  ]
}
```

Measured 11-19 over `~/.viva/ledger.viva.json` and every `~/.viva/registry/*/instances/*/instance.viva.json`: zero recipes use the daemon slot. The education recipes (`brazilian` · `italian` · `spanish`) and `vcompany` declare `hallucinators` at the INSTANCE level instead.

A trap for "faculty configurations are additive": the instance level is NOT additive today. An instance that declares the slot replaces the ledger's whole list:

```js
// subsystems/typology/schematics/primitives/instance.js:199 — the Ledger's own header
// a ledger's word: what every instance on it inherits, slot by slot, unless it declares the slot
// itself.
```

That is the registry TEMPLATES only (`~/.viva/registry/education/instances/spanish` declares anthropic · elevenlabs · deepgram). CORRECTED 11-19: his live instance `~/.viva/instances/localhost/instance.viva.jsonc` declares no `hallucinators`, so every daemon there, `spanish` too, holds the ledger's full list (seen on screen: `oss-groq` in wakaru's model list). `vcompany`'s slot is deleted 11-19 on his /"yes."/. `chess` · `droneaid` · `media` declare nothing and get the ledger's full list. Only the daemon step (`split`) adds.

A mode has no slot at all: `ModeMask` carries none, `mode/factory.js:7` lifts the parent's cortex by reference.

## is it paladin — evidence

Paladin already does both halves he names, in two files:

```js
// subsystems/paladin/prototypes/integrity.js:6 — a trait → the export it must travel with; null = a marker
export const TRAITS = {
  EXPOSED: "aperture",
  …
  HARNESSED: null,
  CONVERSATIONAL: null,
};
// subsystems/paladin/instance/lifecycle/3-integration.js:29 — hallucinator masks filtered alive · dormant, instance AND daemon
  instance.hallucinators = (instance.hallucinators ?? []).filter(
    (mask, index) => alive(mask) || dormant(instance, `hallucinators[${index}]`, mask),
// :34
    daemon.hallucinators = (daemon.hallucinators ?? []).filter(
```

One seam to design: paladin sees the faculties a recipe DECLARES (`mask.faculties`); the runtime's cortex holds what a provider SUPPLIED (a provider can refuse at boot, `daemon/lifecycle/1-population.js:67`). A paladin rule "CONVERSATIONAL needs `call` or `verbatim + dialogue + speech`" protects the configuration; the predicate in `harnessed.js:287-297` protects the live set. Both, or one feeding the other.

`~/.viva/ledger.viva.json` already carries `"runtime": { "traits": [] }`: an empty slot no schema key reads (`Runtime` is `additionalProperties: true`, `instance.js:59`).

## tiers → roles — both ways, for the drill (unruled)

```json
// A · roles hardcoded into the instance map — SKETCH
"roles": { "ear": { "type": "verbatim", "id": "scribe_v3_live" }, "mind": { "tier": "fast" }, "tongue": { "id": "luiza" } }
// B · a tier expected by name — SKETCH
"tiers": { "fast": [0.4, 1.0, 0.8], "ear": [0.3, 1.0, 0.5], "tongue": [0.3, 0.9, 0.5] }
```

Today's nearest thing is neither: the thread's `Conversational` trait holds a selector per job (`hear · speak · call · polish`, `subsystems/typology/schematics/traits/conversational.js:4`).

## the old trait, 05-04 → 07-11 — what to steal

Read with `git show 305701e90~1:<path>`.

Runtime side, `systems/runtime/daemon/traits/conversational.js`:

- the trait OPENED the surface on the mode and ran ON the harness, exactly his "on top of":

```js
// 305701e90~1:systems/runtime/daemon/traits/conversational.js:21
    const stream = await mode.harness.dialogue.stream({
// :79
  mode.aperture.open(
    "/conversation",
    shard.serve.websocket((ws, ctx) => {
      const connectionVector = new Vector().slurp(conversation);
      const socket = new Socket(ws, connectionVector);
      socket.state.conversation = new Conversation(connectionVector, socket);
```

- one Vector per socket; `Conversation(vector, socket)` gave typed senders (`live.send.dialogue.packet`).
- speech and the ear were sketched and commented out: `soma.tee(stream)` into a text path and a speech path; an ear whose `turn.start` aborts every reply in flight. Today's `belt/cascade.js` is that sketch, finished.

Client side, `systems/kajuit/src/typology/entities/thread/traits/conversational.js`:

```js
// 305701e90~1:…/thread/traits/conversational.js:155 — live = capability ∩ intent ∩ focus
  const capable = () => thread.mode?.implements?.("CONVERSATIONAL") ?? false;
  const live = () =>
    capable() && thread.traits.includes("CONVERSATIONAL") && activeThread() === thread;
```

- `wire(thread)` reconciled on three stores (`$traits` · `$mode` · the active terminal): opens when live, closes when not, retries four times.
- `engage(thread)` · `release(thread)` = the thread trait written through the repository; `send` · `abort`.
- `engageBox` (commented out): claim microphone + speaker, the microphone's tap → ear packets, speech packets → the speaker, an abort → `speaker.flush()`, release on teardown.
- a thread hydration (`dossier.js`) called the trait's functions where each responsibility lived; no run-all resolver.

Steal: the trait as the one opener on BOTH sides · live = capability ∩ intent ∩ focus · the box engagement as the trait's teardown pair. Leave: its own websocket (the multiplex replaced it, m18) · optimistic `tmp-` turns · `?.` chains.

## open, his

1. overlay or references (harness layout, m122) — unruled.
2. the paladin rule against the live predicate: both, or one feeding the other.
3. instance-level `hallucinators` replace the ledger's; "additive" needs that fold changed, or the education recipes move their extra faculties down into the daemon slot.
4. `Thread.ts:94` still patches both traits on every thread; 14 reads of `trait.HARNESSED` · `trait.CONVERSATIONAL` in 8 files hang on it. Its removal waits for the travel design.
