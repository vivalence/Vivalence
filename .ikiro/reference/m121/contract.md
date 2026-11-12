# Wakaru — the full game, the contract every builder codes against

Wakaru is a top-down adventure game for language learning, a viva **mode** at
`~/.viva/registry/education/modes/games/wakaru/`. It is inspired by the mechanics of a commercial game
("Second Language") but copies nothing of it: no names, maps, lines, art, audio. You are building it in a
**staging copy**:

    STAGE = /private/tmp/claude-501/-Users-finn--viva-registry-education/50c3ebbe-99ed-483a-b4ff-1d802680fbc1/scratchpad/education/modes/games/wakaru

Work ONLY inside STAGE, ONLY in the files your brief says you own. Never write to `~/.viva/registry`, never to
`~/vivalence/code/vivalence` (the runtime), never run git/jj write commands. The lead integrates and lands.

## The one idea

**Game state lives in the buffer; language state lives in the domain.** The game never counts what the
learner knows. Every graded answer is a review on a literal (`/review/literal`), and the world READS the
learner's memory back:

- a stone (a word) is dark while its word is UNTOUCHED, lit once touched, gold once remembered;
- spirits are the learner's **due** words — the review queue walks the map; a spirit laid to rest is a word
  reviewed; tomorrow the spirits return where words fall due again;
- a district blooms (colour) by the share of its words the learner holds;
- a district's warden wakes only once 60% of its words are held; beating the warden restores the district,
  which opens the next one;
- the duel's format climbs with the word's retention status (recognise → produce), so the difficulty ladder IS
  the memory model, not a game counter;
- the keeper of each district speaks through the cortex using only words the learner holds plus one new one
  (comprehensible input, i+1), and plays real corpus sentences the learner can almost read.

## Laws (code quality is paramount)

1. Read `~/vivalence/code/vivalence/.ikiro/codestyle.md` before writing. Plain names, comments say WHY, no
   defensive `?.`/`?? {}` noise on values the contract guarantees, no helpers minted for one caller, small pure
   functions, match the style of the files already in STAGE.
2. **No import leaves the mode directory.** Allowed packages: `@vivalence/typology` (daemon side),
   `@vivalence/drapes` and `svelte` (screen side), `@std/assert` (tests). `engine/` imports NOTHING but
   `engine/` files — it is pure, deterministic, replayable.
3. The engine never calls `Date.now()` or `Math.random()`: `ctx.now` and `ctx.random` are handed in.
4. Every graded answer in any loop emits a `review` effect. No loop teaches without writing memory.
5. Mobile is first-class: every control ≥ 44px, `touch-action: manipulation`, inputs ≥ 16px font,
   nothing hover-only, works at 360px wide.
6. Tests: `cd ~/vivalence/code/vivalence && deno test -A --no-check $STAGE/tests/<file>` — every pure
   module gets tests; mounted daemon tests use `mountMode` (see existing `tests/mode.test.js`).
7. A Svelte part compiles standalone: from `~/vivalence/code/vivalence`:
   `cp /private/tmp/claude-501/-Users-finn--viva-registry-education/50c3ebbe-99ed-483a-b4ff-1d802680fbc1/scratchpad/compile.js subsystems/typology/.wakaru-compile.<you>.js && (cd subsystems/typology && deno run -A --no-check .wakaru-compile.<you>.js <part.svelte> /private/tmp/claude-501/-Users-finn--viva-registry-education/50c3ebbe-99ed-483a-b4ff-1d802680fbc1/scratchpad/<you>.mjs); rm subsystems/typology/.wakaru-compile.<you>.js`
   — prints `warnings N` and `bytes N`. That temporary copy is the only file you may touch in that repo, and you
   remove it in the same command.
8. Theme: use the CSS variables the sibling modes use (`--text-strong --text-light --boundary --divider
   --surface --surface-lift --surface-sunk --signal-primary-ink --signal-primary-tint --signal-positive-ink
   --signal-positive-tint --signal-negative-ink --signal-negative-tint --signal-caution-ink --font-family-code
   --font-family-sans-text --font-family-serif-heading --font-size-xs/sm/base/md/lg/xl`). Canvas colours live in
   ONE palette block in `buffer/paint.js`.

## Files and owners

| file | owner |
|---|---|
| `engine/atlas.js` · `engine/run.js` · `engine/beat.js` · `engine/random.js` | LEAD (read, never edit; ask in your report if you need a change) |
| `engine/world.js` · `engine/path.js` · `engine/beats/walk.js` · `buffer/paint.js` · `tests/world.test.js` · `tests/walk.test.js` · `tests/path.test.js` | WORLD |
| `engine/duel.js` · `engine/beats/duel.js` · `buffer/parts/Duel.svelte` · `tests/duel.test.js` | DUEL |
| `engine/quest.js` · `engine/beats/talk.js` · `buffer/parts/Dialogue.svelte` · `buffer/parts/Journal.svelte` · `tests/quest.test.js` · `tests/talk.test.js` | STORY |
| `types.js` · `deal.js` · `emitter.js` · `aperture.js` · `tools.js` · `harness.js` · `hal/*.js` · `wakaru.viva.js` · `tests/mode.test.js` · `tests/viewable.js` | DAEMON |
| `buffer/Wakaru.svelte` · `buffer/parts/Hud.svelte` · `buffer/parts/Map.svelte` · `buffer/parts/Scroll.svelte` · `buffer/parts/Pad.svelte` · `buffer/live.js` | SCREEN |

The files already in STAGE are the first slice of the game (one linear ruin). They are yours to rewrite where you
own them. `tests/engine.test.js` belongs to the old slice: WORLD deletes it once `world`/`walk` tests cover the
same ground.

## Shapes

### Word — one entry of the atlas (built by DAEMON from literals)

```js
{
  id: "01a1b1c0-dda9-711f-b01b-ef73acc951e7",       // literal id — every review targets it
  slug: "gracias.interjection",
  ontology: "word",                                  // "word" | "sentence" | "conjugation"
  known: "thank you",                                 // TRANSLATED.known ("" for a conjugation)
  learning: "gracias",                                // TRANSLATED.learning ("" for a conjugation)
  rank: 41,                                           // RANKED — syllabus order, lower = more frequent
  example: { known: "Thank you very much", learning: "Muchas gracias" } | null,   // EXEMPLIFIED
  audio: "words/gracias.interjection.mp3" | null,     // VOCALIZED.asset.path
  tokens: [{ form: "Abre", gloss: "open", literal: "<literal id>" | null, index: 0 }] | null, // ANNOTATED (sentences)
  paradigm: { firstSingular: "<form literal id>", secondSingular, thirdSingular, firstPlural, secondPlural, thirdPlural } | null, // CONJUGATED
  infinitive: "<infinitive literal id>" | null,       // CONJUGATED.infinitive
  tense: "conditional" | null,                         // conjugation slug tail: "abrir.conditional" → "conditional"
}
```

Every literal a token, a paradigm cell or an infinitive references is ALSO an entry of `atlas.words`.

### Atlas — `POST /mode/game/wakaru/atlas { buffer }` (DAEMON) → what the world is charted from

```js
{
  places: {
    market: { words: ["<id>", …], sentences: ["<id>", …] },  // words: ontology word in any of the place's sets;
    …                                                          // sentences: sentences that USE any of those words
    stacks: { words: [ …30 ids: literal.feed() — due first, then novel by rank, outside every district… ], sentences: [] },
    forms: { words: [...functional words], sentences: [...] },
    forge: { words: ["<conjugation literal id>", …up to 24, by rank], sentences: [] },
  },
  words: { "<id>": Word, … },
}
```

A place with no words is absent; the world drops it.

### Memory — what the learner holds, `{ "<literal id>": "UNTOUCHED"|"UNKNOWN"|"LEARNING"|"KNOWN"|"GRADUATED" }`

From `POST /mode/game/wakaru/memory { literals: [ids] }`; an absent id is UNTOUCHED. The screen updates it from
every `/review/literal` answer (`note.trait.RETAINED.status`). Helpers in `engine/atlas.js`: `STATUS`, `rank`,
`remembered` (≥ LEARNING), `share(memory, ids)`, `WAKING = 0.6`.

### Run — `buffer.data.run`, the only thing a buffer keeps (helpers in `engine/run.js`)

```js
{
  seed: 2933376779,                    // charts the world
  flags: ["met:<id>", "restored:market", "rewarded:market.stones", …],   // grow-only story facts
  counters: { steps: 212, right: 14, wrong: 3, falls: 0,                 // grow-only tallies, open record
              "coins+": 120, "coins-": 40, "gained:lantern": 1, "used:lantern": 0,
              "gained:word:<id>": 1, "used:word:<id>": 0, "rested:market": 4 },
  pose: { room: "market.0", x: 1, y: 4 },   // room id, tile
  hearts: 5,                                 // of HEARTS = 5
}
```

Flags (who raises): `met:<word>` (WORLD, a stone read) · `reached:<room>` (WORLD) · `heard:<district>` (STORY, the
keeper spoke once) · `errand:<district>` (STORY) · `asked:<district>` (STORY) · `restored:<district>` (DUEL, its
warden beaten) · `rewarded:<quest id>` (STORY, idempotent reward) · `crowned` (DUEL, the summit warden).
Counters (who tallies): `steps` (WORLD) · `right` `wrong` `falls` `rested:<district>` (DUEL) · `coins+`
(DUEL/STORY) · `coins-` `gained:*` `used:*` (STORY).

### World — `chart(seed, atlas)` (WORLD), never stored, the same seed and atlas always chart the same world

```js
{
  order: ["market", "hearth", …, "stacks", "forms", "forge"],     // places present, PLACES order
  places: { market: { id, name, biome, words: [ids], sentences: [ids], rooms: ["market.0", …], entry: "market.0", lair: "market.3" } },
  rooms: {
    hub: { id: "hub", place: null, exits: {}, tiles: [...9 strings of 13 chars], stones: [], items: [],
           keeper: null, warden: null, vendor: { x, y }, shrine: { x, y }, sign: { x, y }, summit: { x, y }, spawns: [], entry: { x: 6, y: 6 } },
    "market.0": { id, place: "market", exits: { north: null, south: null, west: null, east: "market.1" },
                  tiles: [...], stones: [{ word, x, y }], items: [{ word, x, y }], keeper: { x, y } | null,
                  warden: { x, y } | null, vendor: null, shrine: null, sign: { x, y } | null, summit: null,
                  spawns: [{ x, y }], entry: { x, y } },
  },
  words: atlas.words,
  home: { "<word id>": "market.2" },     // the room a word's stone stands in
}
```

Rooms are 13×9 tiles. Tile chars: `#` wall · `.` floor · `~` water · `T` tree · `o` rock · `=` exit (an opening in
the edge to the neighbouring room). A district is 2–6 rooms laid out as a connected grid walk; its first room
holds the keeper and a sign back to the hub; its `lair` (last room) holds the warden. Items are the district's
nouns placed for the keeper's errand (2–3, one asked for, the others decoys).

### Scene — the part of a room that moves, rebuilt on every room entry, never stored

```js
{ room: "market.1", spirits: [{ word, x, y }], duel: Duel | null, dialogue: Dialogue | null }
```

`enter(world, run, ctx)` (WORLD) spawns a spirit for each word whose home is this room and which is in `ctx.due`
or met-but-UNTOUCHED in `ctx.memory` — at the room's spawn points, deterministic by seed.

### ctx — handed to every beat by the screen

```js
{ world, memory, due: ["<id>", …], now: 1794957601377, random: () => 0.42 }
```

### State — `{ run, scene }`. Beats: `(state, action, ctx) → out(state, effects, events)` (see `engine/run.js`).

## Actions — `engine/beat.js` composes `walk`, `duel`, `talk` (each module exports an object of beats)

| action | owner | payload |
|---|---|---|
| `step` | WORLD | `{ direction: "north"|"south"|"west"|"east" }` |
| `travel` | WORLD | `{ place: "market" | "hub" }` — only to `unlocked` places or the hub; lands on its entry |
| `answer` | DUEL | `{ value }` — a word id (PICK/LISTEN/CLOZE pick), a string (TYPE/CONJUGATE), an array of token indices (BUILD), `null` = timed out |
| `tick` | DUEL (in a duel) / WORLD (else: spirits roam) | `{}` — DUEL's `tick` delegates to WORLD's `roam(state, ctx)` when no duel |
| `resume` | DUEL | `{ away }` — ms the app was hidden; shifts the duel clock |
| `choose` | STORY | `{ option }` — a dialogue option id |
| `heard` | STORY | `{ line, gloss }` — the keeper's cortex line arrived |
| `listened` | STORY | `{ sentence, options }` — an i+1 corpus sentence arrived (+ the meaning options) |
| `asked` | STORY | `{ question, gloss, target }` — the keeper's cortex question arrived |
| `judged` | STORY | `{ grade, feedback, correction }` — the cortex graded the learner's reply |
| `deliver` | STORY | `{ item }` — hand a word-item to the keeper |
| `buy` | STORY | `{ item }` — at the vendor |
| `use` | STORY | `{ item }` |
| `close` | STORY | `{}` — leave the dialogue |

Cross-module calls (exported functions, not actions): WORLD's walk calls `engage(state, foe, ctx)` from
`beats/duel.js` when the learner walks into a spirit / the warden / the summit, and `talk(state, who, ctx)` from
`beats/talk.js` on the keeper / vendor / shrine. `foe` = `{ kind: "spirit", word }` · `{ kind: "warden", place }` ·
`{ kind: "summit" }` · `{ kind: "pilgrim", words: [ids] }` (the shrine's daily round over `ctx.due`). `who` =
`{ kind: "keeper", place }` · `{ kind: "vendor" }` · `{ kind: "shrine" }`. WORLD exports `roam(state, ctx)` and
`enter(world, run, ctx)`; DUEL calls `enter` after a fall. `engine/quest.js` exports `settle(state, ctx)` — the
composer calls it after every beat: it grants each newly completed quest's reward once.

## Effects — what the screen must do (`{ type, ...payload }`)

| type | from | payload | the screen |
|---|---|---|---|
| `step` | WORLD | — | nothing (the glide shows it) |
| `bump` | WORLD | — | shake |
| `card` | WORLD | `{ word, fresh }` | show the word card (learning, known, example, audio) |
| `item` | WORLD | `{ word }` | "picked up <learning>" |
| `entered` | WORLD | `{ room, place }` | fade; on a new place fetch `/spirits { place }` into `ctx.due` |
| `sealed` | WORLD | `{ share }` | the lair's warden still sleeps: "7 of 12 words held" |
| `map` | WORLD | — | open the valley map (the sign) |
| `duel` | DUEL | `{ foe }` | open the duel panel |
| `review` | DUEL/STORY | `{ literal, signal }` | `POST /review/literal { signal, scope: { literal } }`, then update memory from the answer |
| `audio` | DUEL/WORLD/STORY | `{ word }` | play the word's VOCALIZED file |
| `strike` `hurt` | DUEL | — | flash, sparks, haptics |
| `rested` | DUEL | `{ word }` | "<learning> — laid to rest"; drop the word from `ctx.due` |
| `restored` | DUEL | `{ place }` | the district's restoration moment |
| `crowned` | DUEL | — | the ending |
| `fallen` | DUEL | — | fade, wake at the place's entry |
| `speak` | STORY | `{ place }` | `POST /speak` → dispatch `heard` |
| `listen` | STORY | `{ place }` | `POST /listen` → dispatch `listened` |
| `ask` | STORY | `{ place }` | `POST /ask` → dispatch `asked` |
| `judge` | STORY | `{ place, question, reply, target }` | `POST /judge` (the daemon reviews server-side) → dispatch `judged` |
| `coins` | DUEL/STORY | `{ amount }` | "+N" |
| `quest` | STORY | `{ quest, done }` | toast in the journal's voice |
| `heal` | STORY | `{ hearts }` | sparks |

Events: `{ type: "flag", flag }` — every newly raised flag, drained by `settle`.

## Duel formats — the ladder is the word's retention status (DUEL)

| status of the asked word | formats it may take |
|---|---|
| UNTOUCHED · UNKNOWN | PICK learning → known (recognise); LISTEN if it has audio |
| LEARNING | PICK known → learning; CLOZE-pick (a sentence that uses it, its token blanked); LISTEN |
| KNOWN · GRADUATED | TYPE known → learning; CLOZE-type; BUILD (order a sentence's tokens) |
| a conjugation (the Forge) | CONJUGATE: infinitive + person + tense → type the form; the review lands on the form literal |

Signals: MASTERY (right, within the swift third of the clock, exact) · SUCCESS (right) · NEUTRAL (TYPE: right but for
accents or one letter) · MISTAKE (wrong; a wrong pick also reviews the picked word MISTAKE) · FAILURE (timed out or
blank). Spirit: 2 strikes, first question on the spirit's own word, then another word of the same place. Warden:
5 strikes (fewer if the place has fewer words), production formats, weakest-first by memory rank. Summit: 8 strikes
over every restored place. Pilgrim (shrine): one question per due word, no hearts lost — the daily review round.
A miss costs a heart (not for the pilgrim); 0 hearts → `fallen`, wake at the place's entry with full hearts.
Rewards: a rested spirit +5 coins, a warden +50, the summit +200, a pilgrim answer +2.

## Story (STORY)

Each district has five quests, all derived from flags/counters (`quests(world, place)`), the step = the first
unmet trigger:

1. **First light** — read every stone of the entry room (`met:*`).
2. **Rest the spirits** — `rested:<place>` ≥ min(3, words).
3. **The keeper's errand** — the keeper asks (in the learning language) for one of the place's items; fetch it;
   `deliver` it; the right item reviews its word SUCCESS, a wrong one MISTAKE on both → `errand:<place>`.
4. **The keeper's question** — the keeper asks a question (cortex); the learner types a reply; `/judge` grades it
   server-side and reviews → `asked:<place>`.
5. **The warden** — `restored:<place>`.

Rewards (granted once by `settle`, flag `rewarded:<quest id>`): coins 20 · 20 · 30 · 30 · 0, a heart refill on the
errand. The keeper's dialogue menu: **Listen** (an i+1 corpus sentence with audio → pick its meaning → review the
sentence literal; the sentence's tokens also show their glosses), **Talk** (the cortex line, i+1), **Errand**,
**Question**, **Leave**. The vendor (hub) sells: `lantern` (30: reveals the first letter in a typed duel) · `charm`
(30: +4 s on the next duel's clocks) · `tea` (20: one heart). The shrine (hub) starts the daily pilgrim round over
`ctx.due` and shows the streak (from `/daily`).

## Daemon routes (DAEMON) — `POST /mode/game/wakaru/<route>`

| route | input | output | domain |
|---|---|---|---|
| `/begin` | `{ buffer }` | `{ begun: true, run }` | a blank seat gets `fresh(seed)` |
| `/keep` | `{ buffer, run }` | `{ kept: true }` | quiet raw update (as now), `run` validated |
| `/atlas` | `{ buffer }` | Atlas | `PLACES` × `literal.find({ symbols: { $in: sets }, ontology })`, `literal.feed()` for stacks, conjugations by rank for the forge; sentences through `uses`/ANNOTATED tokens; every referenced literal resolved into `words` |
| `/memory` | `{ literals: [ids] }` | `{ id: status }` | the learner's `RETAINED` notes over those literals |
| `/spirits` | `{ place \| null }` | `[ids]` | `literal.due({ symbols: { $in: sets } }, { limit: 12 })`; `null` = due anywhere (the shrine), limit 10 |
| `/speak` | `{ buffer, place }` | `{ line, gloss, target }` | cortex: one line in the learning language using ONLY words the learner holds (≥ LEARNING) + one new place word (`target`) |
| `/listen` | `{ place }` | `{ sentence: Word, options: [3 decoy `known` strings + the right one, shuffled] }` | the place's sentence with the fewest UNTOUCHED tokens, ties by rank |
| `/ask` | `{ buffer, place }` | `{ question, gloss, target }` | cortex: a short question answerable with place words |
| `/judge` | `{ buffer, place, question, reply, target }` | `{ grade, feedback, correction }` | cortex grades (`MASTERY … FAILURE`), then `literal.review(grade)` on `target` (and on each place word the reply uses correctly, SUCCESS) — server-side |
| `/daily` | `{}` | `{ due, streak, today }` | due count; streak = consecutive days (local) with ≥ 1 TRACED note |

The cortex call shape (copy it): `const activity = await ctx.entities.activity.control({ user: ctx.user?.id ?? null, mode: ctx.mode.id, thread: ctx.thread?.id ?? null }); const render = await ctx.cortex.hallucinate.object.render({ controller: activity.controller, system: { …named prompt sections… }, turns: [], output: { schema } }); render.product.object`. NEVER pass `policy` (tier/effort/rounds are the user's, never the mode's). Tests stub `scenario.daemon.cortex` (see `tests/mode.test.js`).

Language pair: `ctx.statics.language` = `{ known: { slug, name }, learning: { slug, name } }`.
