# Second Language: the overworld

Slice: what the player walks through and how it feels. Read-only static pass over ~/code/teardowns/second-language (web build, app 1.1.0). Nothing from the teardown was run. `[n:line]` = `src/module-n.js`. Coordinates are (x,y) tiles with the origin at top left. "derived" means my own arithmetic over cited values; "grid" means I read it off a map's `data` array. The maps in the bundle are the authoring copy. A live world ships as a per-L2 pack whose `maps` field uses the same schema [2905:77, 2905:102-124].

## 1. Maps

**How a map is authored.** Each map is a single 2-D array of tile-kind strings, and every string is validated against the tile enum [2322:6-9, 2322:186-212]. There is only one layer: no separate ground, decoration, overhead or collision layers. Roofs, tree canopy and hedges are ordinary tile kinds placed in that same grid [2268:20, 2268:33, 2268:64].

Collision is never authored. `buildMapDef` takes the blocked list for the map's `tileSet` (outdoor, indoor or cave) [2296:170, 2268:121-221].

Everything interactive lives in sidecar lists keyed by x,y [2322:186-212, 2296:169-213]:
- named `spawns`
- `portals` {x, y, tile, to, spawn, condition?}
- a `vocab` spawn rule {tileType, exclusions, min, max}
- `mastery`, `fruits`, `forage`, `signposts`, `chests`, `doors`, `floorSwitches`, `gates`, `pushables`, `inspectLoot`, `darkness`, `staticVocab`
- flags: `fullScreen`, `tutorial`, `noLanguageTiles`

Arrival facing comes from a table keyed by (map, spawn name) [2296:30-32, 2296:230-330]. The renderer autotiles each cell from its 8 neighbours plus two cells further out horizontally [2531:1-40].

**All 21 maps** [2296:105-127]. START_MAP is `entrance_hall` [2296:229]. The "walk" column counts cells that are not in the tileset's blocked list; it is my count.

| map | kind | w×h | walk | portals |
|---|---|---|---|---|
| entrance_hall [2300:4] | indoor, tutorial | 17×37 | 156 | door (8,11)→hallway_1 [2300:724] |
| hallway_1/2/3 [2303:4, 2304:4, 2305:4] | indoor tutorial chain | 10×17 | 48/54/41 | exit_back (1,8)→previous; exit_next (8,8)→next; hallway_3's exit leads to the village [2303:225, 2304:225, 2305:225] |
| village [2316:2] | outdoor hub | 24×20 | 245 | entrance (9,8)→house; gaps (20,0)→village_center, (23,8)→river_path, (0,18)→forest; cave_entrance (22,17)→cave [2316:559] |
| house, house_2f [2307:3, 2308:3] | indoor | 11×19, 8×14 | 41, 14 | exit→village; stairs [2307:271, 2308:156] |
| village_center [2317:2] | outdoor plaza | 30×30 | 427 | gap (17,29)→village; doors→shop, vc_house_a, vc_house_b, school (school only with `quest_done:build_school`) [2317:999-1040] |
| shop, school [2311:3, 2310:3] | indoor | 10×17, 11×17 | 32, 47 | exit→village_center |
| vc_house_a(+2f), vc_house_b(+2f) [2312:3, 2313:3, 2314:3, 2315:3] | indoor | 9×16 (+7×12) | 28/15, 52/27 | exit; stairs |
| river_path [2309:2] | outdoor road | 50×22 | 428 | gaps (0,15)→village, (49,15)→bamboo_grove [2309:1167] |
| bamboo_grove [2297:2] | outdoor dead end | 13×21 | 86 | gap (0,10)→river_path [2297:335] |
| forest [2301:2] | outdoor woods | 30×26 | 364 | gaps (29,15)→village, (26,0)→forest_alcove; entrance_cabin (4,5)→cabin [2301:863] |
| forest_alcove [2302:2] | outdoor secret | 12×12 | 85 | gap (6,11)→forest [2302:215] |
| cabin [2298:3] | indoor | 10×17 | 35 | exit→forest [2298:224] |
| cave [2299:2] | cave, dark | 40×40 | 643 | entrance_exit (20,38)→village; cave_stairs (33,9)→hidden_cave_area [2299:1703] |
| hidden_cave_area [2306:2] | cave treasure room | 12×12 | 53 | cave_stairs (9,1)→cave [2306:203] |

**Map graph** (how each link is made):
- entrance_hall →door→ hallway_1 → hallway_2 → hallway_3 → village. Every back door in this chain refuses you with a locked-door message [2391:7-30, 2392:7-30, 2393:4-27].
- village ↔ house (door); house ↔ house_2f (stairs).
- village ↔ village_center (gap). From the plaza, doors lead to shop, school, vc_house_a and vc_house_b; both vc houses have stairs to an upper floor.
- village ↔ river_path ↔ bamboo_grove (gaps).
- village ↔ forest ↔ forest_alcove (gaps); forest ↔ cabin (door).
- village ↔ cave (cave mouth); cave ↔ hidden_cave_area (cave stairs).

An outdoor map's edge is not a whole border. Each map is walled in by blocked hedges (tall grass, canopy, bamboo), and each exit is a single walkable `entrance_exit` gap [2268:121-171; grid]. Stepping off the grid only turns you [2365:31-37].

**Hub and size.** The village is the hub. It has five links, it is where you respawn [2832:98-127], and it is the only world-map node that is always revealed [3744:85]. The village_center plaza acts as a second hub (shops, homes, quest givers).

The whole world, derived:

| | maps | cells | walkable |
|---|---|---|---|
| all | 21 | 7,864 | 2,921 |
| outdoor | 6 | 3,677 | 1,635 |
| cave | 2 | 1,744 | 696 |
| interiors | 13 | 2,443 | 590 |

Between 40 and 69 word tiles exist at any one time across 11 maps: village 5–8, plaza 8–12, cave 10–16, and so on [2316:596, 2317:1041, 2299:1720].

## 2. Tile vocabulary (120 kinds [2268:1-120])

- **Walkable:** grass, path, dirt_path, flower, bush, rock_garden, bridge, farmland, forest_floor; floor, rug, cushion; cave_floor, rock_pile, cave_gem. In general, anything missing from the tileset's blocked list is walkable [2268:121-221].
- **Blocked outdoors:** bamboo, cherry_tree, dead_tree, tree_canopy, tall_grass, fence, stone, lantern, well, bench, stall, food_cart, wood_pile, every building and roof kind, construction kinds, drawbridge pieces, feast furniture, chests, signpost, gate_closed, locked_door, pushable_block [2268:121-171]. Tall grass is a hedge wall here, not grass where encounters happen.
- **Blocked indoors:** wall, window_wall, furniture, box, jar, vase, potted_plant, scroll [2268:172-204].
- **Blocked in caves:** cave_wall, cave_lantern, movable_boulder [2268:205-221].
- **Water:** blocked, but stepping into it drowns you. That check runs before the blocked check [2365:107-120].
- **Portal tiles:** door, exit, exit_back, exit_next, entrance, entrance_exit, entrance_cabin, cave_entrance, cave_stairs, stairs_up, stairs_down.
- **Mechanisms:** floor_switch_up/down, reset_switch, gate_closed/open, exit_locked/exit_next, pushable_block, movable_boulder, locked_door/open_door [2268:111-119, 2364:116-125].
- **Containers:** wooden, heart and golden_heart chests, each with an open variant.
- **Inspectables:** shelf, scroll, vase, well, market_stall, desk, bookcase, goods_shelf, box, jar. Box, vase and jar can hold coins [2352:3-19].
- **Resource:** dead_tree → chopped_log → forest_floor.
- **Content tiles** (spawned at runtime, never authored): one per content kind, each with an outdoor and an indoor-floor variant, plus quest_scroll [2268:15, 2268:37-40, 2268:91-102].
- **Monster sight blockers:** walls, trees, tall grass, boulders, buildings [2352:24-56].
- **Animated:** water, flowers, lanterns, cherry trees, chests, boulders, word tiles [2450:9-34].

## 3. Camera and viewport

**Desktop** (the window is at least 768 px wide and the user agent is not mobile [2598:1-14]):
- Every map is shown in a frame the size of the home village, 24×20 tiles.
- Base tile size = floor(min(0.8·W/24, (H−220)/20)) [3421:139, 3421:157, 7231:2-9].
- Larger maps scroll inside the frame.
- Interiors are cropped to their walkable box plus 2 wall tiles, then zoomed in to fill the frame [3421:164-190, 7231:10].
- Example: a 1440×900 window gives 34 px tiles and 24×20 tiles on screen (derived).
- A sidebar takes min(370 px, 38% of W) [3421:88].

**Phone:**
- Open maps use tile size = ceil(max(W/18, (H−80)/18)), so 18 tiles fit along the long side [2387:1-2, 3421:68, 3421:163].
- A 390×844 phone gets 43 px tiles and sees about 9×18 tiles (derived).
- `fullScreen` maps (every interior and tutorial hall) fit the whole walkable room on screen with a still camera [3421:160-169, 3485:2-7].

**Follow:**
- The camera centres on the player's tile, minus half the viewport, clamped to the map edges. There is no dead zone [3485:8-11].
- Each step eases the camera over 80 ms, linear, in step with the sprite glide [3421:216-232, 3457:291].
- Only visible tiles are drawn, with a 1-tile margin and 3 tiles of hysteresis [3486:2-27].

**Map change:**
- Sound: a door-open sound if either side of the link is not outdoors, otherwise an area-transition sound [7212:119-124].
- A transition card (`TRANSITION_IDLE` shape: active, mapId, name, pinyin, en, scene, intro [2168:6-14]) fades in over 400 ms, and the map is swapped underneath it.
- The card stays at least 2.5 s and until the new map is ready, capped at 5 s [2847:1-3, 7212:136-226].
- The card shows an illustration of the area (15 pictures cover the 21 maps) and the area's name in the L2, its romanization and English [3426:38-84, 3423:175-191]. Story-scene transitions use one generic card with no area name [3423:26-38].
- A dialog triggered by arrival waits until 400 ms after the card is gone [7212:208-222].

**Entry** (`resolveTransition`):
1. Puts you on the named spawn with that spawn's facing and adds the `visited:` flag.
2. Restores the map's authored grid.
3. Re-applies only flag-driven changes: opened chests, unlocked doors, tile mutations, switch states.
4. Rescans boulders, re-projects NPCs and spawns monsters. An NPC spawn trigger can open a dialog right away [2371:161-197, 2371:198-249].

`applyMapEntry` runs the same derivation outside a portal, for boot and respawn [2833:64-80].

## 4. Movement

- **Steps:** whole-tile grid steps. Sprite and camera glide for 80 ms, linear [2839:1, 3457:291].
- **Held direction:** polled every stepMs (default 80 ms); a step fires once 0.8·stepMs has passed [7212:302-314, 7212:728]. That is about 12.5 tiles per second (derived).
- **Speed options:** step intervals of 80, 110 or 140 ms exist only in a developer setting [3353:56-60].
- **No run.** Shift is bound to an audio control [5516:165-175].
- **Animation:** the default `per-tile` walk alternates the stepping foot with tile parity [3353:93-101, 3353:146-155]. An idle frame ticks every 400 ms once there has been no step for 600 ms [7212:362-371, 7212:736-737].
- **Facing:** every attempted step sets your facing, even when you walk into a wall [2365:27-30]. Spawns set facing too [2371:205].
- **Desktop keys:** WASD or arrows (hold to keep walking), Space/Enter to interact, click to move, Esc for the menu, Q quests, T travel, I items, N collection, L leaderboard, B sidebar, Z zen mode, ? key help [2485:53-62, 5516:55-134, 3421:663, 5503:43].
- **Click or tap a tile** (web, phones included): `resolveClickTile` flood-fills the area you can reach, leaving out blocked tiles, NPCs, boulders and darkness. If the target is inside it, you arrive in one 80 ms glide. No path is walked, so nothing on the way triggers [2355:12-35, 2355:333-356, 2355:358-378].
  - Clicking an NPC, sign or monster moves you next to it facing it, then talks, reads or starts the battle [2355:124-211].
  - Clicking a word tile steps onto it. Clicking an adjacent boulder pushes it [2355:259-330].
- **Native-app controls** (hidden on web: `HAS_MOVEMENT_CONTROLS = false` [3729:153]):
  - Modes: touch (tap relative to the avatar, hold to keep going; recommended), D-pad (224 px), joystick, floating joystick [3356:27-32, 3729:25-108, 3452:12].
  - Defaults: the first step fires on touch-down, then a 150 ms hold delay, 120 ms pad repeat, and the direction stays locked while held [3353:93-101].
  - The joystick dead zone releases at 0.6, and the other axis must be 1.43× stronger to switch direction [3454:1-37].

## 5. Terrain mechanics

Each entry: trigger, effect, then what it gates.

- **Darkness.** The cave has {center (20,35), radius 6, disableFlag `quest_item:lantern`, followRadius 5} [2299:1831]. Light is full inside radius−2 and fades to nothing at the radius [2358:1-12].
  - Without the lantern, a step into full dark is refused with a narrator line [2365:43-58, 2362:16-22]. Click-move, pushes and the world map all respect the lit circle [2355:29-33, 2365:312-314, 3744:101-106].
  - With the lantern, a fading 5-tile circle follows you [3457:70-123].
  - Monsters more than 4 tiles beyond the light stay idle [2350:51-95].
  - Gates: the whole cave.
- **Boulders.** Walking into a movable_boulder or pushable_block pushes it one tile, if the far tile is free (not blocked, not a portal, scroll or gate, not dark, no NPC or monster) [2365:64-106, 2365:294-340].
  - There are 219 boulders in the cave and 33 in the hidden room (grid).
  - The rock hammer turns any boulder into floor [2359:374-395].
  - Because entry restores the authored grid, boulders reset when you come back [2371:198-199, 2296:85-104].
- **Switches.** A switch is pressed by you or by a block resting on it. A gate is open while all of its switches are pressed. A reset switch snaps the blocks back [2364:41-142]. Used once, in hallway_3: box (3,10), switch (7,5), exit gate (8,8), reset (7,11) [2305:241-271].
- **Water.** Stepping in starts drowning: you sink for 750 ms, and the game is over at 1,080 ms. A golden heart cannot revive you from drowning, and you respawn in the village [2365:107-119, 2833:1484-1491, 2839:3-4, 2832:91-127].
  - Facing water while holding the rod fishes instead: cast, wait for a random bite, then tap to reel within a window. A fish sells for 25 [2359:108-183, 2369:20-216, 2194:13-50]. The rod is in a chest in the alcove [2302:233].
- **Trees.** Using the axe on a dead_tree leaves a chopped_log; 15 chops sets a flag. Stepping on the log adds wood and clears the tile [2359:398-425, 2365:407-423].
  - The forest has 73 dead trees (grid), and they return on re-entry (derived from the grid reset).
  - Gates: wood_delivery, which needs 25 wood [2290:39-41].
- **Tile mutations** (world changes driven by flags):
  - `opened:bridge` lowers the drawbridge: 3 drawbridge tiles become path and 9 water tiles become bridge [2411:4-5].
  - `quest_done:build_school` turns the construction site into a school with a door [2412:4-5].
  - Feast flags set out tables and stools [2412:124-125, 2412:250-251].
  - A delivered seed pack turns part of the forest into farmland [2410:4-5].
- **Map drops.** Coins from a won battle are dropped on the monster's tile. Guardians drop 75–150 coins and bosses 150–300. You walk over the drop to collect it [3575:341-369, 2189:12-19, 2365:342-399].
- **Doors and keys.** A door with `requiredKeyItemId` opens when you hold the matching `quest_item:` [2322:121-126, 2359:325-370]. The engine supports this, but the bundle places no such doors.
- **Chests.** 39 in total; the river has 10 and the cave 10 [2309:1214, 2299:1757].
  - Wooden: coins and/or an item. Heart: a heart container. Golden heart: N golden hearts.
  - A chest can require flags and trigger a follow-up line. The `opened:` flag keeps it open [2359:209-320, 2371:104-123].
- **Inspect.** Each box, vase and jar has a 60% chance of holding 1–5 coins (seeded per map), plus any authored loot [2352:3-19, 2377:4-40].
- **Scroll.** A `quest_scroll` tile is picked up when you step on it; you stop and a narrator speaks [2366:8-45]. The village's scroll is at (1,9) (grid).
- **Word tiles.**
  - Placement: each map rolls a count between min and max once per session, takes the next uncollected words in course order, and gives each word a slot it keeps. Slots sit on the map's floor kind, at least 2 tiles from spawns and portals, with at least 2 walkable neighbours [2383:4-58, 2664:32-60, 2375:2-76].
  - Stepping on one stops you and opens its mini-game: a flashcard, a mastery challenge, a lesson (every 3rd), a passage, a note, a writing drill or a dialogue scene [2357:6-121, 2365:261-275].
  - Mastery tiles per map: 3 while words remain, 6 after [2379:1-9].
  - The tutorial words are fixed [2303:247]. Some maps have `noLanguageTiles` and stay word-free [2297:7, 2302:7, 2306:7].
- **Fruit and forage.** Maps with fruit get 3–4 of 6 fruit kinds, picked up on touch; an apple heals 2 HP [2376:2-33, 2267:57-71]. The cave holds 10 lodestones to gather [2299:1743].
- **Treasure map.** After the rescue, inspecting a spot upstairs in vc_house_a gives a cave map [2313:157].
  - Its screen [3061] draws the whole cave and a secret code word picked per player [3062:20-81, 2719:7-36].
  - Saying the word to the cave boss opens the hidden room, worth 3,000 XP [2188:87-95]. The room holds 5,000 coins, hearts and an outfit [2306:214].
  - The rock hammer comes next [2251:288-310].

## 6. Who stands on a map

**NPCs:**
- There are 86 placements for 32 NPC ids (my count, [2327]–[2340]).
- A placement gives map, x,y, facing and a condition over flags. The first placement that matches wins, so NPCs move around as the story advances: witnesses gather in a house, and later everyone sits at the feast tables [2361:249-300, 2336:3-260, 2340:29-210].
- Most NPCs stand still. Five placements roam: walks of 4–7 steps, pauses of 2–3 ticks, idles of 10–40 ticks, 2 ticks per step, on a 200 ms world tick [2331:32, 2339:99, 2340:3, 7212:378-401]. `wanderRadius` appears only in data and schema; a grep finds no runtime reader [2322:226].
- NPCs block your step [2365:165-171], turn to face you when you talk [2359:562-572], and can be spoken to across a counter [2359:60-66].
- When an NPC needs to walk through your tile, the game nudges you aside [2361:56-85, 7212:440-468].
- Proximity and spawn triggers exist [2361:172-248]. The bundle uses one spawn trigger [2336:221] and no proximity triggers.
- The prompt to talk is an alert marker over story NPCs, plus the verb on the action button [2466:94-183, 2468:4-70].

**Monsters:**
- Three definitions: `goblin`, a tutorial `hall_goblin` (coached, fought once) and `traveler_spar`, a spar against an NPC [2402:1-36]. There is only one look, the goblin [2433:135].
- 18 placements: cave 10 (level 1–3), river 6 (level 3–6), hidden room 1 (level 4–5), hallway_3 1 (level 0) [2404:3-327, 2407:3-183, 2406:3, 2405:3].
- Each placement has its own gait: roam radius 1–12 and 2–3 ticks per step. All share aggro 7, leash 10 and a minimum spawn distance of 3 [2404:32].
- Behaviour, step by step:
  1. Roam.
  2. Spot you: within 1 tile, or within 7 tiles inside a 120° cone with a clear line of sight.
  3. Alert: face you for 2 ticks.
  4. Chase by BFS at 1.25 ticks per step.
  5. Give up after 10 stalled ticks or once you are beyond the leash, then walk home [2350:677-682, 2350:752-848].
- While idle, a monster turns its facing every 5 ticks, sweeping its cone around [2350:464-470, 2350:684-690].
- Contact from either side starts a battle [2350:101-110, 2365:173-197]. You can outrun them (derived).
- Every entry respawns monsters at their spot, or at a safe tile at least 3 from you [2372:4-80]. A win removes the monster for that visit only; a "once" fight writes `defeated:` [2344:282-291, 3575:136-151].
- Wearing the monster outfit makes them ignore you [2267:418-425, 2365:175-182].

**Portal guards.** These rules turn a portal step into a 4 s shout or a dialog you cannot skip, until the required flags are set [2361:119-157, 2365:454-500]:
- entrance hall: talk, open the chest, hear the notebook explanation [2390:3-110]
- hallway_1: collect the 3 words [2391:31-56]
- hallway_2: finish a mastery challenge and hear the farewell [2392:32-110]
- village to river, cave and forest [2394:4-30]
- cave to the hidden room [2389:5-15]

**Guardian gates** [2189:20-160]:
- The village guards ask for 10, 15 or 25 collected words, then a one-word riddle answered aloud in the L2 and judged by an LLM [2246:16-148].
- Plaza pocket: 30 words, then a 15-question test.
- Forest boss: 50 words, then 25 questions; 1,500 XP.
- Cave guardians: tests of 10, 25 or 50 questions.
- River boss: 100 mastered words.
- Tests cost 4 HP per miss.
- Guards stand in the gap itself: (22,8), (22,18) and (1,18) in the village, (26,1) in the forest, (48,15) on the river, (28,22) in the plaza [2339:3-29, 2331:3, 2333:3, 2340:236].
- Passing sets the flag, gives XP, and the guard fades out over 800 ms, leaving coins [2190:48-95, 2368:255-280, 2168:15].

**Vendors:**
- The shopkeeper sells a lantern (800), a water container, a heart (1,250), a revival token, a golden heart and seeds.
- The chef at the food cart sells 6 foods for 25–100 [2294:43-170, 2335:3, 2340:345].

## 7. Overview screens

**World map** [7248 → 3743]:
- Needs `quest_item:world_map` [2173:1-6], which the roaming cartographer hands over on your first talk [2191:262-290].
- The 8 outdoor and cave maps are placed on one plane at fixed offsets, and every tile is painted as a 6 px coloured square [2401:1-43, 3744:397-436].
- Fog:
  - only maps you have visited are drawn; the village always is
  - a link between two visited maps is a line
  - a link to an unvisited map is a dim 60 px stub ending in a fog disc marked "?" [3744:82-93, 3744:163-217, 3743:202-262]
- The cave appears only as its lit circle [3744:41-63, 2401:62-77].
- Your position is a pulsing gold dot. You can pan with momentum and pinch-zoom from 0.5× to 3×. The map opens centred on you [3744:28-39, 3744:235-368].
- There are no quest markers.

**Quick travel** [7238 → 3348]:
- Needs `quest_item:compass`. The cartographer makes it from 5 lodestones out of the dark cave [2173:7-11, 2191:4, 2191:203-245]. Players who started before 2026-11-01 were granted both items [2173:13-22].
- The list shows 6 areas: no interiors, no tutorial. Areas you have visited can be chosen; the rest show "???" with a lock. Without the compass, visited areas show locked [3348:30-100].
- Travel drops you on the destination's default spawn and still obeys a guard on a direct link [2371:9-43, 7212:238-253].

## 8. World-screen chrome while walking

- **Top bar.** Location badge (map icon plus the map's English name; tapping it opens travel once you have the world map), then items, level, XP and coins, and the stack of collected words [5494:17-80, 2466:422-428, 3421:769].
- **Hearts** badge sits over the map [3421:853].
- **Bottom panel.** Sound, a pan toggle, travel, quests and settings, plus one action button. Its glyph is the verb for the tile you are facing: speak, read, sleep, fish, fill, open, chop, smash or inspect [3448:200-340, 2468:4-70].
- **Desktop extras.** A tabbed side panel (B), a key-help card (?), and zen mode (Z), which hides both [3421:924-940].
- **On the map.** NPC alert markers, alerts on unread signposts and on the tutorial chest, an arrow on the tutorial door, sparkles, chat and shout bubbles [3457:24-36, 3457:278-291, 2466:203-325].
- **Movement tips** appear only on the tutorial maps [2453:9-30].
- **No minimap** (grep).
- **Art styles:** 8 styles, plus a night style from 19:00 to 07:00 [2438:4-15, 3459:5-24].

## 9. The opening hour as a walk

1. **entrance_hall.** You spawn at (8,24) facing up. The sage stands at (8,17) [2300:714, 2330:3].
   - The door is gated three times: the sage shouts until you talk to him, then until you open the chest at (11,17), then until he explains the notebook.
   - Then an arrow appears on the door [2390:3-110, 2466:203-226].
2. **hallway_1.** Three fixed words lie at (4,6), (5,8) and (4,10). All three open the exit [2303:247, 2391:31-56].
3. **hallway_2.** Finish one mastery challenge and hear the sage's farewell [2332:3, 2392:32-110].
4. **hallway_3.** A coached goblin fight, and the box-on-switch puzzle [2405:3, 2305:241-271].
5. **village.** You arrive at (6,2) to an intro card and an arrival briefing, and quests unlock [7212:120, 2453:49-57, 2425:133-134].
   - First errand: carry the scroll at (1,9) to the roaming teacher [2287:2, 2339:99].
6. **The search for the missing children.**
   - Entering vc_house_a fires the briefing [2336:207-221].
   - Three witnesses, each with an alert marker [2333:24, 2331:32, 2329:55, 2466:97-110]:
     - father_li on the river at (40,14)
     - farmer_zhou roaming the forest
     - the traveler at (23,34), inside the cave's lit circle
   - Reward: 1,000 coins [2288:2-71].
   - The three exits need 10, 15 and 25 words. This is what pulls you onto the word tiles of the village and plaza first [2189:21-50].
7. **cave_rescue.** Buy the lantern, which the search unlocks, then reach the kids at (25,3) through the boulder maze and its goblins [2294:49-56, 2280:2-43, 2329:75-93].
8. **wood_delivery.** Get the axe, deliver 25 wood, and the school gets built [2212:192-216, 2290:18-49].
9. **cross_the_river.** A test and a letter, then the bridge lowers [2282:12-57, 2411:4-5].
10. **bamboo_grove.** The river boss stands on the only tile in front of the exit and wants 100 mastered words [2189:150-160, 2333:3]. Meeting the sage there ends the intro [2279:34-38].

Side loops:
- world map → lodestones → compass
- forest boss → alcove, where the fishing rod is
- treasure map → secret code → hidden room → hammer

## 10. Design intent (one line each)

- **Big scrolling maps and a following camera:** places have extent, and there is always something past the edge of the screen.
- **Hedge walls with single gaps:** borders read as nature, and exits read as paths you find.
- **Words on the ground:** collecting is walking, and learning cuts into exploring in small bites.
- **Word-count guardians and spoken riddles:** the map grows as your vocabulary grows, and speaking is the key.
- **Darkness and lantern:** dread, a reason to come back, and something to spend coins on.
- **Boulders and switches:** low-stakes spatial puzzles that break up the quiz rhythm.
- **Water kills:** the world has teeth, and you learn to read terrain.
- **Vision cones and the alert beat:** a threat you can see coming and slip past; a fight feels chosen.
- **Respawning goblins and regrowing trees:** practice you can farm without emptying the map.
- **Mutations (bridge, school, farm):** your progress shows in the landscape.
- **NPCs that move with the story:** the village feels alive.
- **Chests and coin pots:** rewards curiosity in corners.
- **Fogged world map:** a to-do list drawn as geography.
- **Travel earned late:** backtracking teaches the map first.
- **The arrival card:** every door is a vocabulary moment.
- **80 ms steps:** walking never drags.

## What a wakaru overworld needs (ranked)

1. **Persistent authored maps.** A hub plus 4–6 regions of 20–50-tile maps under a following camera that clamps at the edges. Interiors are small rooms with a still camera.
2. **Word tiles on every floor.** The next words in course order, kept in stable spots, min–max per map; stepping on one opens the mini-game.
3. **Exits that are places.** Hedge gaps, doors, stairs and cave mouths, each with its own arrival spawn and facing.
4. **Exit guardians gated on learning.** N words, then one spoken Spanish answer; the guard fades out once you pass.
5. **An arrival card per map.** The Spanish name with a gloss, and a door or area sound.
6. **Monsters with a vision cone.** An alert beat, a chase, a leash, and respawn on entry; touching one starts a duel.
7. **NPCs placed by story flags.** Alert markers, they face you to talk, and one action button carries a verb.
8. **Item-gated terrain verbs.** Lantern/darkness, axe/trees, hammer/boulders, rod/water, so you go back to old maps.
9. **Flag-driven map mutations.** Quests visibly reshape the land.
10. **Treasure.** Chests in optional pockets, coin pots, a secret room behind a code.
11. **A fogged world map built from the real tiles,** with quick travel earned by an errand.
12. **Crisp grid steps.** About 80 ms per step, hold to repeat, bump to turn, and tap a tile to hop there on phones.
13. **Clear hazards and a safe respawn.** Water and darkness, respawn at the hub, healing pickups.
14. **Small push and switch puzzles** between quizzes.
15. **Ambient life.** An idle animation, animated water and flowers, and wanderers on simple gaits.
