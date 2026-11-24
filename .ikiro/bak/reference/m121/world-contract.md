# Wakaru v0.3 — the valley you walk. The contract every builder codes against.

Wakaru is a top-down adventure game for language learning (Spanish first), a viva **mode** at
`~/.viva/registry/education/modes/games/wakaru/`. v0.2 shipped a duel game in a "world" of single-screen rooms reached
from a sign. The player's verdict: *"That's not it at all. We don't have the game yet. The whole outer world that I
navigate is missing. I do like the idea of being able to walk from place to place and then be pulled into mini
games."* v0.3 builds that world.

It steals mechanics and design intent from a commercial game ("Second Language") and copies NOTHING of it: no names,
maps, dialogue lines, art, audio. Three research reports describe what that game does — read the one(s) your brief
names, they are your reference; do NOT open the teardown under `~/code/teardowns` yourself:

    RESEARCH = this directory, research-<name>.md (copied here 11-19 from the build's scratchpad)
      world.md      — authored maps, camera, movement, exits, terrain, who stands where, world map, the first hour
      minigames.md  — every activity the world pulls the player into, and what wakaru lacks
      layers.md     — quests, levels, items, economy, gates, meta screens

You build in a **staging copy**:

    STAGE = /private/tmp/claude-501/-Users-finn--viva-registry-education/50c3ebbe-99ed-483a-b4ff-1d802680fbc1/scratchpad/education/modes/games/wakaru

Work ONLY inside STAGE, ONLY in the files your brief says you own (you may create new files under the paths you own).
Never write to `~/.viva/registry`, never to `~/vivalence/code/vivalence` (except the temporary compile copy in law 7),
never run git/jj write commands. Read anything. The lead integrates and lands. Six builders work at once: a file you
do not own may change under you — re-read before relying on it, never edit it; if you need a change there, say so in
your report.

## The one idea (unchanged)

**Game state lives in the buffer; language state lives in the domain.** The game never counts what the learner knows.
Every graded answer is a review on a literal, and the world READS the learner's memory back: stones show a word's
status, spirits are the learner's **due** words, a district blooms by the share of its words held, a warden wakes at
60% held and its fall restores the district and opens the next, the duel's format climbs the word's retention status.

## What v0.3 adds — the steal, made ours

| theirs (research) | wakaru v0.3 |
|---|---|
| 21 hand-authored maps, one tile grid each, sidecar lists | the square + 8 district maps + interiors (houses, shop, 3 wings, the summit cave), authored in `engine/maps/` |
| camera follows, clamps at edges; phone ≈ 9×18 tiles | `Stage.svelte` camera, tile size from the pane, interiors centred |
| exits are places: hedge gaps, doors, stairs, cave mouths, each lands on a named spawn | `portals` → `to` map + `spawn` name; a sealed exit refuses with a reason |
| arrival card: the area's name in L2 + gloss | arrival card: the map's name + the place's signature word (a real literal, voiced) |
| word tiles on every floor open a mini-game | stones on every district floor; bumping an unread stone opens the **trial** |
| monsters: sight cone, alert, chase, leash, respawn on entry | spirits (due words): sight cone, "!" alert, chase, leash, home again; rebuilt on entry |
| item-gated terrain: lantern/dark, rod/water | lantern lights the dark summit cave, rod fishes any water, compass quick-travels |
| fishing, pair match, flashcard trial | **fishing** (a word on the hook), **swarm** (pair match that lays several spirits to rest), **trial** |
| chests, coin pots, heart-as-mistake-budget economy | chests (coins · items), pots (a few coins), shop (candle · charm · tea · lantern), sell fish |
| quest log, "!" markers, step counters | journal + a HUD tracker of the next step + markers over keepers and awake wardens |
| level from words collected/mastered | level from the learner's memory (status points) |
| fogged world map, quick travel earned | atlas: visited maps drawn, the rest fogged; compass (crossroads' reward) travels |

## Laws (code quality is paramount)

1. Read `~/vivalence/code/vivalence/.ikiro/codestyle.md` before writing. Plain names, comments say WHY, no defensive
   `?.`/`?? {}` on values this contract guarantees, no helper minted for one caller, small pure functions, match the
   style of the files already in STAGE (read `engine/beats/duel.js` and `engine/tiles.js` as the house style).
2. **No import leaves the mode directory.** Allowed packages: `@vivalence/typology` (daemon side), `@vivalence/drapes`
   and `svelte` (screen side), `@std/assert` (tests). `engine/` imports NOTHING but `engine/` files — pure,
   deterministic, replayable.
3. The engine never calls `Date.now()` or `Math.random()`: `ctx.now` and `ctx.random` are handed in. Seeded choices
   that must be stable across reloads (stone slots, pot coins) use `engine/random.js` over the run's seed.
4. Every graded answer in any loop emits `{ type: "review", literal, signal }` (signal ∈ MASTERY · SUCCESS · NEUTRAL ·
   MISTAKE · FAILURE). No loop teaches without writing memory; nothing that is not an answer writes memory.
5. Mobile is first-class (the player: *"mobile must be GREAT"*): every control ≥ 44px, `touch-action: manipulation`,
   inputs ≥ 16px font, nothing hover-only, works at 360px wide, safe areas respected, one thumb can play.
6. Tests: `cd ~/vivalence/code/vivalence && deno test -A --no-check --no-lock $STAGE/tests/<file>` — every pure module
   gets tests in the test files you own. A test asserts the invariant, never only the absence of the last bad value.
7. A Svelte part compiles standalone: from `~/vivalence/code/vivalence`:
   `cp /private/tmp/claude-501/-Users-finn--viva-registry-education/50c3ebbe-99ed-483a-b4ff-1d802680fbc1/scratchpad/compile.js subsystems/typology/.wakaru-compile.<you>.js && (cd subsystems/typology && deno run -A --no-check --no-lock .wakaru-compile.<you>.js <abs part.svelte> /private/tmp/claude-501/-Users-finn--viva-registry-education/50c3ebbe-99ed-483a-b4ff-1d802680fbc1/scratchpad/<you>.mjs); rm subsystems/typology/.wakaru-compile.<you>.js`
   — prints `warnings N` and `bytes N`; 0 warnings is the bar. That temporary copy is the only file you may touch in that
   repo, and you remove it in the same command.
8. Theme: the visual pass's rules are LAW — `visual.md` (this directory) section (a), 14 rules. In short: the view
   sits in zone 1 and never names a zone; nest by depth step: page `--surface`, card `--surface-lift` (+ ring, card
   radius), well `--surface-sunk`; text `--text-ink`/`--text-strong`/`--text-light`, never `--boundary`/`--divider`/a
   canvas colour as text; touchables on `--control-contrast`/`--control-on`; primary on `--signal-primary`/
   `--signal-primary-on`; inputs on `--control-field`; verdicts = tone tint + ink + ring + a mark + the word at
   `--size-type-md`; nothing under 12px; no drapes global class names (`.mark .tools .tool .keys .journal .head
   .empty .frame`). Canvas colours (the world art) live in ONE palette block in `buffer/paint.js` and never leave the
   canvas as text. The fixed v0.2 parts are in `scratchpad/visual/buffer/parts/` — copy their patterns.
9. No word, line or name of the commercial game. Our places, keepers and maps are our own.

## Files and owners

| file | owner |
|---|---|
| `engine/tiles.js` · `engine/run.js` · `engine/beat.js` · `engine/random.js` · `engine/atlas.js` · `engine/beats/clock.js` · `engine/duel.js` · `engine/beats/duel.js` · `types.js` · `deal.js` · `aperture.js` · `tools.js` · `harness.js` · `emitter.js` · `hal/*` · `wakaru.viva.js` · `tests/duel.test.js` · `tests/atlas.test.js` · `tests/mode.test.js` · `tests/clock.test.js` · `tests/viewable.js` | LEAD — read, never edit; ask in your report |
| `engine/maps/*.js` (every authored map, the square included, and `index.js`: `MAPS` + `LAYOUT`; `MAPS.square.spawns.start` must exist — `engine/run.js` reads it) · `tests/maps.test.js` | MAPS |
| `engine/world.js` · `engine/spirits.js` · `engine/path.js` · `engine/beats/walk.js` · `tests/world.test.js` · `tests/spirits.test.js` · `tests/walk.test.js` · `tests/path.test.js` | WORLD |
| `engine/games/*.js` · `buffer/parts/Trial.svelte` · `buffer/parts/Fishing.svelte` · `buffer/parts/Swarm.svelte` · `tests/games.test.js` | GAMES |
| `engine/quest.js` · `engine/loot.js` · `engine/level.js` · `engine/beats/talk.js` · `buffer/parts/Dialogue.svelte` · `buffer/parts/Journal.svelte` · `buffer/parts/Codex.svelte` · `buffer/parts/Atlas.svelte` · `tests/quest.test.js` · `tests/talk.test.js` · `tests/loot.test.js` · `tests/level.test.js` | STORY |
| `buffer/paint.js` · `buffer/camera.js` · `buffer/parts/Stage.svelte` · `tests/camera.test.js` | PAINT |
| `buffer/Wakaru.svelte` · `buffer/live.js` · `buffer/sfx.js` · `buffer/parts/Hud.svelte` · `buffer/parts/Pad.svelte` · `buffer/parts/Arrival.svelte` · `buffer/parts/Scroll.svelte` · `buffer/parts/Duel.svelte` | SCREEN |

`buffer/parts/Map.svelte` dies (STORY's `Atlas.svelte` replaces it; SCREEN stops importing it; LEAD deletes it).
`engine/world.js` is rewritten by WORLD: the room model (rooms, exits, `HUB`, `chart` of rooms, `stand`) dies.

## Shapes

### Tile — `engine/tiles.js` (LEAD, written)

One character per tile in an authored row → `{ kind, walk, wild?, fish? }`. Read the file: 42 kinds — ground
(`.` grass · `,` flowers · `v` tall grass (wild: spirits rise there) · `:` path · `;` dirt · `+` plaza · `s` sand ·
`=` bridge · `_` floor · `u` rug · `c` cave floor), portals-as-floor (`D` door · `O` cave mouth · `<` `>` stairs),
water (`~`, fish), and blockers (`T` tree · `P` pine · `h` hedge · `M` cliff · `o` rock · `f` fence · `R` roof · `H` wall ·
`W` window · `S` stall · `w` well · `F` fountain · `l` lamp · `n` bench · `x` crate · `#` inner wall · `B` shelf ·
`C` counter · `t` table · `A` anvil · `I` column · `k` hearth fire · `Z` bed · `%` rock wall · `*` crystal).
Helpers: `DIRECTIONS · OPPOSITE · neighbour · same · apart · key · within(map, cell) · tile(map, cell)`.
A building is roof rows (`R`) over one front-wall row (`H` with `W` windows and one `D` door), seen from the south.

### Map — authored, `engine/maps/<id>.js` (MAPS), registered in `engine/maps/index.js`

```js
export const market = {
  id: "market",               // a district's outdoor map shares its place's id
  name: "Market Row",         // ours, English; the arrival card adds the place's signature word in the L2
  kind: "outdoor",            // outdoor · indoor · cave
  place: "market",            // the atlas place whose words, spirits, keeper, warden live here; null = none
  dark: false,                // a dark map: without the lantern held, the learner sees and walks only near the entry
  rows: ["hhhh::hhhh", …],    // the grid, every row the same length, every char a key of TILES
  spawns: {                   // named arrivals: a portal lands the learner on <to>'s spawn named in it
    entry: { x, y, facing },  //   entry: where a fallen learner wakes and where `travel` lands (outdoor maps)
    square: { x, y, facing }, //   by convention a spawn is named for the map you arrive FROM
  },
  portals: [{ x, y, to: "square", spawn: "market" }],   // stepping onto (x,y) takes you to <to> at spawns[spawn]
  fixtures: [{ kind: "keeper", x, y, facing: "south" }],  // who stands here (kinds below); never on a portal
  chests: [{ x, y, loot: { coins: 30 } }],               // loot: { coins } or { item }; id = "<map>.chest.<index>"
  pots: [{ x, y }],                                       // id = "<map>.pot.<index>"
};
```

Fixture kinds: `keeper` (the place's keeper, one per district map) · `warden` (one per district map, one per wing
interior) · `summit` (the summit cave's peak) · `vendor` (shop, behind its counter) · `shrine` (square) · `sign`
(square: opens the atlas; a district's sign at its entry: its name) · `haunt` (one per district map in its tall
grass: a ring of old stones where spirits gather; the swarm game) · `bed` (one per house, beside a `Z` tile).
`see` (MAPS may add): any other kind must be agreed by LEAD first.

`engine/maps/index.js` exports `MAPS` (id → map) and `LAYOUT` (outdoor map id → `[column, row]` on the valley plane).

### The valley (MAPS authors it, WORLD charts it)

```
                 summit (cave, dark, reached by a cave mouth in clockhill's north)
   wildwood   ·   clockhill   ·   schoolyard
   hearth     ·   square      ·   market
   bathhouse  ·   crossroads  ·   drillyard
```
LAYOUT: wildwood [0,0] · clockhill [1,0] · schoolyard [2,0] · hearth [0,1] · square [1,1] · market [2,1] · bathhouse [0,2]
· crossroads [1,2] · drillyard [2,2] · summit [1,-1]. Every two neighbours share a 2-tile gap in their hedge border on
the shared edge (square's gaps exist). Districts open in `DISTRICTS` order (`engine/atlas.js`): market → hearth →
crossroads → clockhill → wildwood → bathhouse → schoolyard → drillyard; every one is reachable from an earlier one.
Wings are interiors whose doors stand on the square: stacks (library) · forms (hall) · forge (smithy).

### World — `chart(seed, atlas)` (WORLD), never stored; the same seed and atlas chart the same world

```js
{
  seed,
  maps: {                          // every MAPS entry, plus what the learner's words lay over it
    [id]: { ...map, stones: [{ x, y, word }], items: [{ x, y, word }], spawnPoints: [{ x, y }] },
  },
  places: {                        // only places whose atlas entry has words
    [place]: { id, name, biome, words: [ids], sentences: [ids], maps: [map ids], home: map id, signature: word id },
  },
  words: { [id]: Word },           // as /atlas deals them (unchanged Word shape, see deal.js `word`)
  order: [place ids],              // places with words, in the order they open (DISTRICTS then WINGS)
}
```
A place's `home` = its outdoor map (district) or its interior (wing). `signature` = its most frequent word (lowest
rank) — the arrival card's word. Stones: every word of a place gets a stone on its home map (district outdoor or wing
interior), on a slot WORLD derives from the seed (walkable, not wild, not a portal, ≥ 2 from portals/spawns/fixtures/
chests/pots, and laying it never cuts any walkable tile off from the entry); the most frequent words lie nearest the
entry. Items (the keeper's errand, as v0.2: 2–3 of a district's nouns, the first one wanted) lie on its outdoor map.
A place with no words is absent from `places`; its map still exists and stays sealed ("fallow").

### Run — `buffer.data.run` (LEAD; `engine/run.js`, `types.js`)

`{ seed, flags, counters, pose: { map, x, y, facing }, hearts }`. A fresh run stands on `square` at `spawns.start`.
Flags (grow-only): `met:<word>` (its trial passed) · `visited:<map>` · `opened:<chest id>` · `broke:<pot id>` ·
`heard:<place>` · `errand:<place>` · `asked:<place>` · `restored:<place>` · `rewarded:<quest>` · `crowned`.
Counters (grow-only tallies): `steps · right · wrong · falls · rested:<place> · coins+ · coins- · gained:<item> ·
used:<item>`. Items held = gained − used (`held`), coins = coins+ − coins− (`coins`). A save of an older shape is an
outgrown seat: `/begin` deals a fresh run on it (LEAD).

### Scene — the part of a map that moves, rebuilt on every map entry (`enter`, WORLD), never stored

`{ spirits: [Spirit], duel: Duel | null, dialogue: Dialogue | null, game: Game | null }`.
Spirit: `{ word, x, y, facing, home: { x, y }, mode: "roam" | "alert" | "chase" | "return", next }` — `next` = the
`ctx.now` at which it moves again (each spirit keeps its own time; the clock ticks every 100 ms).

### ctx — handed to every beat by the screen

`{ world, memory, due, now, random }`: memory = `{ [literal id]: status }` folded (`fold`, atlas.js); due = the due
literal ids the daemon dealt (/spirits); now = ms; random = a `() => [0,1)`.

### State — `{ run, scene }`. Beats: `(state, action, ctx) → out(state, effects, events)` (`engine/run.js`)

## Actions — `engine/beat.js` composes walk · duel · talk · games · clock

| action | owner | what |
|---|---|---|
| `{ type: "step", direction }` | WORLD | turn to `direction`; then the tile ahead answers (order below). Ignored while a duel, dialogue or game is up |
| `{ type: "act" }` | WORLD | meet the tile ahead without moving: as a bump, plus water+rod → fishing |
| `{ type: "travel", map }` | WORLD | compass held, `visited:<map>`, an outdoor map, not sealed → arrive at its `entry` |
| `{ type: "tick" }` | LEAD (clock) | game → its tick; duel → its clock; dialogue → nothing; else spirits move (`roam`), a spirit on the learner engages |
| `{ type: "resume", away }` | LEAD (clock) | shifts the open game's or duel's clock by `away` ms |
| `answer · light · charm` | LEAD (duel) | the duel, unchanged (`light` now burns a **candle**) |
| `{ type: "play", move }` · `{ type: "quit" }` | GAMES | the open game's move; leave it |
| `choose · heard · listened · asked · judged · deliver · buy · use · close` (+ STORY's new: `sell`, `nap`) | STORY | dialogue, shop, items |

The tile ahead answers, first match wins (WORLD, `engine/beats/walk.js`):
1. a portal → its destination open (`passable`)? arrive (fade, `entered`) : `sealed`, stay.
2. a spirit → `engage` (duel).
3. a fixture → its bump: keeper/vendor/shrine/bed → `converse` (STORY); warden/summit → wake check then `engage`;
   sign → `atlas` (square) or `sign` (district); haunt → `GAMES.swarm.start` (needs ≥ 2 spirits on the map, else `quiet`).
4. a chest → `open` (STORY, loot.js). 5. a pot → `smash` (STORY, loot.js). 6. a stone → `GAMES.trial.start(state, { word }, ctx)`.
7. a counter with the vendor beyond it → `converse` vendor (speak across the counter).
8. water: `act`/bump with a rod held → `GAMES.fishing.start(state, { spot }, ctx)`; else `bump`.
9. any other blocked tile → `bump`. 10. dark and the lantern not held, the tile beyond the light → `dark`, stay.
11. an item → picked up (move onto it). 12. else move (`step`).

## Effects — what the screen must do (`{ type, ...payload }`)

Kept from v0.2: `step · bump · item {word} · sealed {place, share?, reason} · duel {foe} · review {literal, signal} ·
audio {word} · strike · hurt · rested {word} · restored {place} · crowned · fallen · speak · listen · ask · judge ·
coins {amount} · quest {quest, done} · heal`.
New: `entered { map, from }` (arrival card when `map` differs in kind or place from `from`; a fade always) ·
`spotted { word }` (a spirit saw you: "!" + sound) · `dark` (refused: too dark) · `quiet` (the haunt sleeps) ·
`atlas` (open the world map) · `sign { place }` · `chest { id, loot }` · `pot { id, coins }` · `met { word }` (a stone
lit by its trial) · `catch { word }` (a fish landed) · `game { kind }` (a game opened: close scrolls/cards) ·
`travelled { map }`.

## Mini-games — GAMES (`engine/games/<kind>.js`, registered in `engine/games/index.js`)

Read `engine/games/index.js` (the seam: `start · play · tick · shift`, `scene.game = { kind, … }`) and RESEARCH
`minigames.md` §2 (word pickup), §9 (pair match), §11 (fishing). Reuse `engine/duel.js` helpers (`fold`, `options`
logic, `placement`, `expected`, the grading) — import them, never copy them; ask LEAD if one must be exported.

- **trial** `{ word }` — a stone. Read (`met:<word>` set): the card again (word, meaning, example, audio), any key
  leaves, no review. Unread: card (audio plays) → check 1: its meaning among 3 (the place's words, none alike once
  folded), no clock, first pick graded (SUCCESS · MISTAKE), a miss shows the right one → check 2, only when the place
  has an annotated sentence using the word of ≥ 3 tokens: BUILD it from shuffled tiles, graded like the duel's BUILD →
  `met:<word>` raised, `met` effect, 1 coin. Hearts never move in a trial.
- **fishing** `{ spot }` — water while a rod is held. Cast → a bite at `now + 2–6 s` (seeded by `ctx.random` at
  start) → hook within 1.2 s (`{ hook: true }`; early: the fish spooks; late: it slips; both end, no review) → the
  catch is a word — this map's place: a due word first, else a word whose stone is read, else its signature — asked as
  LISTEN when the word has audio, else PICK, 6 s clock: right → `gained:fish`, `catch` effect, review (MASTERY when
  inside the first third of the clock, else SUCCESS); wrong or late → it gets away, review MISTAKE (wrong) /
  FAILURE (late). Then it ends.
- **swarm** `{ haunt }` — up to 5 spirits of the scene as pairs: the words in the learning language on one side, their
  meanings on the other, both shuffled, 30 s (a charm, if held and spent, +10 s). A pair is a pick on each side
  (`{ left: id }`, `{ right: id }`): right → that word's review (SUCCESS, or MISTAKE if it was mis-paired before), its
  spirit rests (removed from the scene, `rested:<place>` +1, 3 coins, `rested` effect); wrong → the left word is
  marked mis-paired. Time out → every unmatched word reviewed FAILURE. Hearts never move in a swarm.

Each game's view `buffer/parts/<Kind>.svelte` takes `{ game, world, memory, now, onplay, onquit }` (onplay(move)
→ `{ type: "play", move }`), renders as a sheet over the stage: a bottom sheet ≤ 70% height on a phone, a centred
card on a wide pane. Keys: number keys pick options, Enter/Space confirm or continue, Esc quits.

## Layers — STORY

Read RESEARCH `layers.md` (quests §1, items §3, economy §4, meta §6).

- **Items** (`engine/loot.js` `ITEMS`): `candle` (duel: a typed question's first letter; shop 12) · `charm` (duel +4 s
  every question; swarm +10 s; shop 25) · `tea` (heals 1 heart; shop 10) · `lantern` (a tool, never spent: lights a
  dark map; shop 60) · `rod` (a tool: fishing; in the chest of `hearth.house`) · `compass` (a tool: quick travel; the
  reward for restoring crossroads) · `fish` (caught; the vendor buys each for 6). Prices are a ruling, keep them.
- **Chests / pots** (`open`, `smash` in `engine/loot.js`, called by WORLD's walk): a chest gives its loot once (coins
  → `coins+`; item → `gained:<item>`), raises `opened:<id>`, effects `chest` + `coins`/`item`. A pot breaks once,
  `broke:<id>`, gives 1–4 coins drawn from the run's seed and the pot's id (stable), effect `pot`.
- **Shop & bed** (`engine/beats/talk.js`): vendor sells candle · charm · tea · lantern; buys fish (`sell`). A bed
  (`nap`): hearts back to full, `heal`.
- **Quests** (`engine/quest.js`): keep v0.2's per-place quests (stones read · spirits rested · errand · question ·
  warden), now over maps (a place's stones = its home map's stones). Add `tracker(world, run, ctx)` → the next step
  of the first place in `order` not restored: `{ place, title, hint, progress: { done, of } | null, target: { map, x,
  y } | null }` (target: the keeper, the warden, a stone… whatever the step points at). Add `markers(world, run, ctx,
  map)` → `[{ x, y, kind }]`: `quest` over a keeper with an open errand or question, `awake` over a warden whose
  place is ≥ 60% held and not restored. Restoring crossroads also grants the compass.
- **Level** (`engine/level.js`): points = Σ over the atlas's words of LEARNING 1 · KNOWN 2 · GRADUATED 3;
  thresholds `[0, 10, 30, 70, 130, 220, 350, 520, 750]` → `{ level, points, floor, next }` (next = null at the top).
  Derived, never stored.
- **Views**: `Atlas.svelte` (the world map: the LAYOUT grid, each visited outdoor map drawn small from its rows, the
  rest a fog card "?", sealed/open/restored, the place's held share, a pulse where the learner is; with the compass,
  tapping a visited map travels: `ontravel(map)`; props `{ world, run, memory, ontravel, onclose }`) ·
  `Journal.svelte` (quests per open place, steps with live counters, the tracked step first; `{ world, run, memory,
  ctx, onclose }`) · `Codex.svelte` (every atlas word by place: status mark + learning + meaning, counts, the level bar;
  tap a word → its audio + example; `{ world, memory, level, onplay(word), onclose }`) · `Dialogue.svelte` (keeper,
  shop with buy/sell, shrine, bed).

## Canvas — PAINT

`buffer/parts/Stage.svelte`: a `<canvas>` filling its container (ResizeObserver, `devicePixelRatio`-crisp), props
`{ world, state, memory, markers, fx, now, onpoint }` (onpoint({ x, y }) = a tapped tile, map coordinates).
`buffer/camera.js` (pure, tested): tile size from the pane — a phone (390×≈600 pane) shows ≈ 9–10 tiles across, a
wide pane ≈ 20 across, tile clamped to [28, 56] px; the camera centres the learner's GLIDED position and clamps to the
map edges; a map smaller than the view is centred and still. `buffer/paint.js`: everything drawn — every TILES kind
(water animated with shores, paths edged, trees and roofs drawn so a canopy or roof covers what stands north of its
trunk/wall — y-sorted), buildings that read as buildings, interiors that read as rooms, the dark (a soft circle of
light, radius 5 with the lantern, 2.5 around the entry without), fixtures, stones by status (dark · lit · gold + the
word's initial), chests (shut · open), pots (whole · broken), items, spirits (hue per word, facing, "!" bubble while
alert/chase), the learner (facing, a two-step walk), markers ("!" quest, "?" awake), a district's ruin (grey laid over
its ground by the share NOT held — it blooms as the learner learns), fx (flash, shake, sparks), the fade between maps.
Ground of a map is drawn once into an offscreen canvas per (map, tile size) and blitted — only the moving layer is
redrawn per frame. Steps glide 110 ms. Canvas colours: ONE palette block.

## Screen — SCREEN

`Wakaru.svelte` orchestrates: load (`/begin` → run; `/atlas` → chart; `/memory`; `/spirits` per place on arrival;
`/daily`), the beat loop (`act(action)` → `beat` → play effects → keep `/keep` quietly), the clock (`tick` every
100 ms while the stage is visible and no panel/scroll is open; `resume { away }` on return), input (keys: arrows/WASD
hold-to-walk at the 110 ms stride, Space/Enter `act`, M atlas, J journal, C codex, Esc closes; touch: `Pad.svelte`
d-pad hold-to-walk + an act button, tapping a tile walks the `route` (WORLD `engine/path.js`), swipes walk),
overlays (Duel, Dialogue, the open game by kind → its part, Scroll cards), panels (Atlas, Journal, Codex), `Hud.svelte`
(location — map name, tap → atlas; the tracker's step + progress, tap → journal; hearts; coins; level; buttons for
atlas/journal/codex ≥ 44px), `Arrival.svelte` (the arrival card: map name, the place's signature word in the
learning language big + its gloss, its audio played; ≈ 1.8 s, never blocks input after 300 ms), `sfx.js` (tiny
WebAudio blips: door, chest, coin, spotted, strike, hurt, heal — muted by the device's silent switch is fine).
Layout: the stage is full-bleed; the HUD overlays its top in the safe area; on touch devices the pad overlays its
bottom; sheets rise from the bottom on a phone. Every effect in the table above has a handler.

## Daemon (LEAD)

No new route. `/atlas`, `/memory`, `/spirits {place}`, `/speak`, `/ask`, `/listen`, `/judge`, `/daily`, `/keep`,
`/begin` as in v0.2 (read `aperture.js`, `buffer/live.js`). LEAD updates `types.js` (pose), `harness.js`, the manifest.

## Your report (when done)

≤ 300 words: what you built (files), the tests you added and their result line, compile results for your parts,
anything you needed from another owner, anything in this contract you think is wrong. Then stop.
