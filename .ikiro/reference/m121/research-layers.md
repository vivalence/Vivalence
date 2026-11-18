# Second Language: the layers around the world (progression, quests, economy, meta)

Static read of the teardown only. `[n:line]` = `src/module-n.js` line. All quest content is paraphrased. No text is copied.

## 1. Quests

**Engine.** A quest is `{id, category, maps, courseLanguage?, activationCondition?, rewards{xp,coins,flags}, steps[]}`, and each step has one trigger [2283:1-49].
- Trigger types: `flag_set`, `map_entered` (`visited:`, wildcards allowed), `chest_opened` (`opened:`), `challenge_completed` (`challenge_done:<vocab>`), `item_collected` (`quest_item:` or the `collected:` alias), `dialog_completed` (`dialog_done:<npc>:<dialog>`), and `inventory_threshold` (a counter ≥ n) [2275:140-183, 252-278].
- No quest state is stored. The current step is the first step whose flag is unset, and a quest is done when every step holds [2275:244-251].
- Activation is a condition over flags, held items and counters: `allOf · noneOf · heldAtLeast · heldAnyAtLeast · heldLessThan · counterAtLeast · counterLessThan` [2275:241-243]. It is also filtered by course language [2275:56-61].
- A step can carry a guard, its own effects (for example an NPC bubble) and its own rewards [2275:37-42, 291-330; 2285:88-93].
- Rewards are idempotent per key `quest_reward:<course>:<quest>` [2275:331-364]. On load, missing done flags are reconciled [2278:27-49].
- Authoring: `QUEST_BEATS` binds every step flag to the one dialog that produces it (npc, map, dialog). Each beat is tagged spine, chain, cinematic, greeting or recovery [2291:1-500].
- A graph lint rejects early turn-ins, unpinned dialog steps, shadowed producers and final steps that cannot be reconciled [2276:163-267].

| quest | cat | active when | steps → trigger | reward |
|---|---|---|---|---|
| `entrance_hall_tutorial` | tutorial | always | talk to the sage → open the chest (gives the notebook) → hear the notebook explained → enter the hallway | 250 XP [2283:1-49] |
| `hallway_onboarding_<l2>` | tutorial | `visited:hallway_1` | collect 3 tutorial words → next room → pass one challenge → sage farewell → room 3 → enter village | 250 [2285:20-120] |
| `return_teacher_scroll` | main | `visited:village` | find the lost scroll tile → hand it back | 250 [2287:1-41; 2366:37-45] |
| `learning_quest` | learning | village | collect half of the intro words → collect all → master half → master 80% (live counters) | 250 [2286:1-77] |
| `search_for_missing_children` | main | after the scroll | briefing at the house → three witnesses on three maps → group meeting | 1000 coins + 250 [2288:1-71] |
| `cave_rescue` | main | after the search | get the lantern (bought) → rescue the kids in the cave | 250 [2280:1-43] |
| `wood_delivery` | main | after the rescue | borrow the axe → hold 25 wood → deliver it | 250 coins + 250, `build_school` [2290:1-53] |
| `cross_the_river` | main | rescue + wood + school | meet the bridge keeper → pass the teacher exam → get a letter → open the bridge | 250 [2282:1-61] |
| `bamboo_grove` | main | river crossed | enter the grove → sage epilogue | 250 [2279:1-43] |
| `village_feast` | main | expansion | five deliveries: fish, well water, seed pack, vegetables, table wood | 500 [2289:1-75] |
| `full_course_studies` | learning | expansion | exam 2 (150 collected) → exam 3 (200) → exam 4 (all) → final (all mastered) | 1000 [2284:1-77] |
| `learning_quest_expansion` | learning | expansion | collect all → master all expansion words | 250 [2286:78-130] |
| `comprehension_challenges` | learning | village | finish every passage → read every passage aloud | 250 [2281:1-53] |

The grove epilogue sets `unlocked:intro_expansion` [2291:330-343].

**Story chain, end to end.** The game follows a dev checkpoint order [2341:639-655].
1. Tutorial. A sage, a chest that gives the notebook, and three words in a hallway.
2. You return the teacher's scroll.
3. Children go missing. You question witnesses at the river, in the forest and in the cave.
4. You buy a lantern and rescue them from the dark cave.
5. You chop wood to build a school.
6. You pass the teacher's exam to earn a letter that opens the bridge.
7. You reach the bamboo grove, and its epilogue unlocks the expansion.
8. Expansion: the village feast, then exams 2, 3, 4 and the final.

Completing quests changes the world: the bridge opens [2411], the school and the feast table get built [2412], and a farm plot appears [2410].

**Main vs side.** The schema allows a `side` category [2277:1-4], but no quest definition uses it. Side content lives in dialog chains with no quest-log entry:
- The cartographer gives a world map, then turns 5 lodestones into a compass [2191:4, 187-290].
- After the rescue, a rescued child trades a treasure map for a rock hammer [2251:290-370]. The map leads to a cave boss whose answer is a secret code. Past him is a hidden room [2389:1-17; 2188:88-119].
- Other side activities: a sparring battle [2242:409-412], 3 mini stories [2227:10-14] and 3 arcade games [2265:1-5].

**How quests are shown.**
- The quest log lives in the notebook and on the quests screen (hotkey Q, open after onboarding) [3421:664; 2425:134].
- Tutorial quests are hidden from it [2843:3-5].
- Each quest has one of four states: `hidden`, `revealed_locked`, `available` or `complete` [2384:2-20]. No definition sets `revealedWhen`, so every upcoming quest shows as a "???" card with a locked hint [3737:173-176].
- Sort order: complete, then available, then locked. Learning quests are pinned to the end [2844:1-20].
- The screen shows a completed/total bar, step checklists (done, current, pending) with count/target counters, and "step i/n" [3737:41-205].
- Hard mode (hides translations) and Nightmare mode (also puts the quest log in the L2) are toggles on this screen [3737:96-170].
- A generic "Quest Updated" medallion fires when a quest is revealed, activates or advances a step [3565:130-163; 2815:8-41].
- There is **no HUD tracker**. The HUD shows location, items, level, XP/coins and the notebook [5494:22-83].
- World hints are coded by hand per story beat: NPC "!" marks for the witnesses, the builder and the kids [2466:93-176], plus a chest alert and a door arrow in the tutorial [2466:204-222, 292-307] and marks on unread signposts [2466:309-322].

## 2. Levels and XP

**Level comes from words, not XP.**
- Points = collected×1 + mastered×2 [2244:52-55, 74-76].
- Thresholds are 0/10/60/150/300/520/750, so the max level is 6 [2244:56-65]. Having 5 words collected sets a floor of level 1 [2244:66-73].
- Levels ratchet up through `level_reached:n` flags [2244:26-51, 86-113]. A level-up shows a celebration and grants nothing else [3471:12-32].
- The full intro (100 words collected, 100 mastered) is 300 points, which is level 4. Level 6 means all 250 words are mastered.
- Level only feeds battles. The gap (monster level minus player level, clamped to ±5) sets monster HP, damage and pressure [3577:26-77], and monsters on the map are tinted by that gap [3470:150-161].

**XP sources.**
- Collect a word: 5 [2348:8]. Win a battle: 30 [2348:5].
- Mastery run (5 rounds): (sum of round XP + 50) ×2 if perfect [3571:100; 2134:195].
- Challenge question: 5/10/15 by type tier, plus 0/8/15 by sentence band, decaying to 0 after 3/4/3 wrong answers [2758:42-49, 77-91, 143-145].
- Practice and daily rounds: × length (1 + 0.05·√words for daily, 0.1·√words for practice) × accuracy (1 + 0.25·acc² for daily, 0.5·acc² for practice) × streak × perfect (2) [2146:8-73].
- Streak multiplier: starts at a 2-day streak, rises toward ×3 with τ=30, and caps at day 60 [2131:179-218].
- Passages: 50 + 40 per question (−15 per miss, floor 10) + 50 if perfect [2758:92-118]. Reading aloud: 250 + 8 per Spanish token [2758:96-106].
- Dialogue scene: up to 250, ×2 if perfect [2758:29-38, 129]. Language note: 50 + 20 per question [2758:119-125]. Lesson: 50 [2348:2].
- Mini story: 1000 XP + 250 coins [2348:3-4]. Arcade: 2 per correct answer [2758:14-17, 75].
- Quests: 250 to 1000 (table above).
- Exams: 1000 / 1000 / 1500 / 2000 / 5000 [2141:77-167].
- Gates: tests +250, forest boss +1500 [2189:66-145]. Spoken gates +100 [2190:245], river boss +2000, cave boss +3000 [2188:34, 91].
- Milestones: half of the intro collected 500, all collected 1000, half mastered 1000, 80% mastered 2000, all mastered 2500; all expansion words collected 10 000, all mastered 25 000; the final exam pays 5000 **coins** [2271:24-95]. They are paid in one bulk action [2344:163-180].
- The how-to-earn-XP screen lists all of these as ranges [3396:62-227].

**What XP buys.** Only leaderboard score, which adds XP/10 [2102:61-66], and the daily history log [2131:156-160].

**Achievements.**
- 5 and 25 words collected, 5 and 25 mastered, and two story quests [2079:1-34].
- Each carries a server rarity line: "only N% have this" when N ≤ 25, otherwise "ahead of N%" [2623:7-71].

## 3. Items

The items screen has three sections: equipment, general and food [3710:33-42]. Equipment shows six fixed slots, and slots you don't own yet appear as locked "???" [3710:90-104; 2267:42-49].

| item | source | effect |
|---|---|---|
| lantern | shop, 800, after the search quest [2294:48-59] | turns off the cave darkness [2299:1831-1838]; required by the rescue quest [2280:27-32] |
| axe | lent by the forest dweller [2291:195-204] | dead tree → log → +1 wood [2359:398-415; 2365:407-424] |
| fishing_rod | chest in the forest alcove [2302:241-248] | fishing on water tiles [2359:108; 2369] |
| rock_hammer | a rescued child, for the treasure map [2251:290-325] | smashes boulders [2359:374] |
| world_map / compass | cartographer, the compass for 5 lodestones [2191:204-290] | world-map screen / quick travel [2173:1-12] |
| monster_outfit | hidden cave chest [2306:246-253] | outfit slot, goblin disguise [2267:399-420] |
| quest items | scroll, notebook, letter, treasure map, golden ticket | flag-held; returned items hide [2267:209-470] |
| counted goods | wood, lodestone, seed pack, vegetables, water, fish, fruit | held = gained − Σ consumed [2267:946-958] |
| food | bun or tea 2 HP, dumpling or coffee 4, rice ball 12, soup full heal [2267:654-818]; fruit ×6 at 2 HP [2267:57-176, 819-833] | "eat one" or "eat to full" prompt [3710:43-58, 152-170] |
| golden_heart | shop 2500; 9 chests hold 25 in total, 10 of them in the grove [2297:360-367] | revives at full health on game over [2267:580-600; 2832:94-95] |
| streak_revival_token | shop 1000; 9 in chests [2299:1759-1801; 2306:223-230; 2309:1235-1241] | bridges a lapsed streak [2131:137-154] |

**HP.**
- 4 HP per heart, and you **start with 1 heart** [2347:114-115].
- A miss in the world costs half a heart [2347:116]. A daily miss costs 1 heart, or 2 when current HP is above 5 hearts [2347:13-15; 3106:399-402]. Exams and gate tests cost 1 heart per miss [2141:81; 2189:62].
- Max HP grows in three ways:
  - 8 heart chests, +1 heart each [2359:263-273; 2347:50-66].
  - A one-time shop heart for 1250 [2294:72-101].
  - Heart pieces, 4 per heart [2347:67-98]. The effect exists [2368:399], but no bundled content grants one.
- Healing: food, or a free nap in one bed [2359:67-100].
- On death you respawn in the village with 1 heart [2832:98, 129-149] and lose no coins.

## 4. Economy

**In.**
- You start with 25 coins [2341:74].
- Battle drops: 25–50 [2348:6-7; 2833:985-1004]. Gate guardians leave 75–150 when they vanish, bosses 150–300 [2189:12-19; 2833:1443-1466].
- 24 wooden chests hold 9,975 coins in total (my sum over the chest lists in [2297-2317]). The biggest are 5000 in the hidden room [2306:216-220] and several 1000s [2302:233-239].
- Quests pay 1000 (search) and 250 (wood) [2288:23; 2290:19]. Mini stories pay 250 each [2348:4], and the final exam milestone pays 5000 [2271:76-82].
- Jars, vases and boxes hold 1–5 coins with a 60% chance [2377:15-33; 2352:15-19].
- Selling: wood 10 [2294:127-132], fish 25 [2194:24-50], fruit 3–8 [2294:35-42].

**Out.**
- Shopkeeper stock is gated by `requiresFlag` and `hideIfFlag` [2294:5-10]:
  - story tools: lantern 800, water container 100, seed pack 1000;
  - a one-time heart for 1250;
  - repeatable: revival token 1000 and golden heart 2500 [2294:44-133].
- Food stall: tea 25, coffee 30, bun 25, dumpling 40, rice ball 50, soup 100 [2294:134-173]. It also buys fish and fruit [2294:174-192].
- The daily screen sells a revival in place for 1000 [2344:244-256].

**The economy is choreographed.** The search quest pays 1000 just before the 800 lantern becomes necessary. The repeatable sinks are all survival (hearts, golden hearts, food) or streak insurance. The real job of coins is to buy **mistake budget for tests**.

## 5. Gates and unlocks

- **Portal guards.** Exits from the village to the river, cave and forest need `guard_passed:*` [2394:1-41].
  - The guards open once you have collected 10 / 15 / 25 words [2189:20-50].
  - Then you answer a spoken riddle whose answer is a vocabulary word, judged by an LLM [2246:10-80; 2190:65-130].
- **Test gates.** Village-center guardian: 30 collected and a 15-question test [2189:51-70]. Cave guardians: tests of 10, 25 and 50 questions, the last needing 150 collected [2189:71-120].
- **Bosses guarding treasure rooms** [2329:1-14; 2331; 2333]:
  - forest boss: 50 collected, 25 questions drawn from your first 50 words;
  - river boss: 100 mastered and a riddle;
  - cave boss: a secret code [2189:121-160; 2188:31-119].
- **Eligibility is live.** Eligibility flags are added and removed whenever counts change [7211:70-130].
- **Exams** [2141:68-174]:
  - teacher test: all intro words collected and ≥80% mastered, 50 questions;
  - exam 2: 150 collected, words ranked 51–150;
  - exam 3: 200 collected, 101–200;
  - exam 4: all collected, 151–250;
  - final: all mastered, 100 questions.
  - Missed questions are deferred and come back, and you pass by surviving them all [3560:42-134].
  - Retakes alternate: every other attempt carries over 5–10 missed words and fills the rest with words not yet used in the cycle [2145:8-60].
- **`unlocked:*` flags.**
  - `intro_expansion`: adds 150 words to the same 21 maps [2137:121-215; 2296:105-127] and three quests, and gates notebook completion [2840:52].
  - `door_<id>`: locked doors that need a key item [2359:325-370]. None are used in the bundled maps.
- **Content gates.** Passages and dialogue scenes can require a finished quest [2873:10; 7216:48]. Five notebook grids stay hidden until you reach the village [3285:1008-1029].
- **Totals.**
  - 250 words per language, with 10 example sentences each (4 easy, 4 medium, 2 hard) [2137:95-120].
  - 21 maps, 15 quest definitions (13 per language), 5 exams, 9 gates.
  - One monster type with 10 cave spawns [2402:1-36; 2404].
- **Full-content route.** It is a roadmap page, not an unlock. It counts the words and sentences above, claims 20+ hours of play, and states a long-term goal of 3,000+ words [2201:1460-1465]. It also runs a "would you pay?" poll [3380:75-92]. The paywall offers lifetime access as a pre-sale [2201:1406-1411].

## 6. Meta screens

- **Menu** [3717]:
  - a daily-practice CTA whose hint depends on the streak (lapsed, active or not yet started) [3717:140-200, 315-375];
  - Progress: an activity graph of learning days since joining [3717:394-436], the leaderboard (online only) and the collection [3717:450-500];
  - Practice: settings, how to play, tips, passive listening, character writing (zh), roadmap [3717:522-762];
  - experimental features, support, account and reset [3717:786-1250].
- **Collection = notebook** [3285:846-1088]:
  - a dictionary grid with an uncollected/collected/mastered legend [3285:669-816];
  - quick actions (pick up words, mastery challenge) [3285:367, 487];
  - grids for lessons, notes, passages, writing, dialogues, mini stories, quests and exams [3285:1002-1038].
  - Completion = (collected + mastered + lessons + notes + 2×passages + stories + quests + exams) ÷ (2×words + …) [2840:45-47].
  - At 100% the final treasure grants the **golden ticket, which is the lifetime pass** [3295:113-121; 2344:144-162; 2267:54].
- **Collection-detail.** Term detail with example sentences, and a mastery CTA once 5 words are collected [3282:87-118; 2132:20].
- **Vocab-list.** The full grid; uncollected words are locked tiles [3740:114-187].
- **Daily practice** [3320; 2131]:
  - size min(25, 5·(1+⌊collected/5⌋)), adjustable up to 2× that and at most 50 [2131:219-231];
  - the streak can be revived within 3 days, and bridged days are marked "revived" [2131:63-171];
  - the words are drawn by **uniform shuffle over collected words, with no due dates** [2131:41-62; 3321:78-82].
- **Foundations.** A list of lessons you can revisit, plus a link to the primer [3379; 3303:22-40].
- **Language primer.** Spanish has four slides: alphabet, gender, verbs, accents [3749:135-646].
- **Intro cinematic.** Narrated, captioned slides [3424:231].
- **Onboarding.** Welcome → native language → target language → skill level → character → world intro → challenge preview → depth → primer → ready [2135:265-280; 5464:3-44]. A word-goal card frames about 3,000 words at 5 a day [2201:298].
- **Customize character.** Free cosmetics only: 2 body types, 11 outfits, 10 hair colors, 6 skin tones [2434:2-50]. The display name unlocks after the first main quest [3318:7-20].
- **Leaderboard.** Daily and lifetime boards [3715:37-38]. Score = XP/10 + collected + 5×mastered + 25×quests + 25×passages [2102:61-92]. Percentile view [7249], rank-up overlays [2621].

## 7. The layered model

| layer | the player does | the payoff | the chase |
|---|---|---|---|
| seconds | step, touch a word, answer, fight, open a jar, chop, fish | +5 XP pop, coin pop, combo; half a heart lost on a miss | the next tile, a clean answer |
| minutes | clear a map's word roll [2664:31-62], a 5-round mastery run, a quest step, a daily session of 5–50 words, a gate test or exam | quest pings, milestone bursts, level-up, a gate guard vanishing | the next threshold: 10/15/25/30/50/150 collected, 80% or all mastered |
| days | streak, notebook %, exam tiers, expansion, boards, achievements | multiplier up to ×3, rarity lines, the lifetime pass | the streak number, notebook 100%, rank, the roadmap's 3,000 words |

**What feeds what.**
- Collected words feed level, gates, exams, daily size, score and the notebook.
- Mastery counts double for level and gates the teacher exam, the river boss and the final.
- Quests feed coins, tools, world changes and the expansion.
- Coins buy story tools and test stamina: hearts, golden hearts, food.
- Hearts are spent by exams, gates and daily.
- XP feeds only the leaderboard.

**Structural facts.**
- Nothing decays: term status only climbs, so every gate is a monotone count.
- The only scheduled review is the retake carryover [2145:8-60]. Daily practice is random.
- Hearts are the shared mistake budget. Exploration (heart chests) and the economy both turn into the ability to pass tests.

## What wakaru lacks (ranked by value)

Our ladder is `UNTOUCHED → UNKNOWN → LEARNING → KNOWN → GRADUATED`, with a `nextAt` due date (domain/schematics.js:7). Their counters only climb. Ours can fall, and that is the lever.

1. **A main questline with a quest log.** About 7 chained quests where each hands over the tool to the next area, with "???" silhouettes, step checklists with live counters, "quest updated" pings and NPC "!" marks. Ground it: steps trigger on status transitions, such as "bring 8 market words to LEARNING" or "zero overdue spirits in the docks today", and the counters read live status counts.
2. **A trials ladder.** Teacher exam, then rank-slice exams, then a final, with hearts as the mistake budget, deferred misses and retake carryover. Ground it: the pool is a rank slice of words at LEARNING or above; a pass promotes them; failed words come due tomorrow and carry into the retake.
3. **Threshold gates and bosses that guard optional treasure rooms.** Spoken riddles judged by an LLM, plus a secret-code boss reached through a side chain. Ground it: a gate opens at "N district words ≥ LEARNING and none overdue", the riddle's answer is one of the learner's KNOWN words (a production check), and eligibility re-closes when words lapse.
4. **Max-HP growth and a survival loop.** Start at 1 heart; heart chests in side rooms, heart pieces, a shop heart, golden-heart revives, food, a nap bed. Ground it: one heart piece per GRADUATED word, 4 pieces per heart, so durability *is* long-term memory.
5. **An economy with story-paced sinks.** Vendor stock unlocked by quests, a quest reward that funds the next tool, sell-back for gathered goods, repeatable sinks. Ground it: an on-time review of a due word pays most, a LEARNING→KNOWN promotion pays a bonus, overdue reviews pay less, and first contact pays least.
6. **Daily practice with a streak.** Multiplier up to ×3, a 3-day revival window, revival tokens, an activity graph. Ground it: the daily session *is* today's due list. The streak counts days the due list reached zero, which beats their random daily.
7. **Tools and gathering loops.** Axe→wood, rod→fish, hammer→boulders, lantern→dark places, compass→quick travel, plus delivery errands (25 wood, a five-part feast). Ground it: each node yields a due word (landing a fish = one review), and keepers grant tools at district retention thresholds.
8. **Notebook completion with a final treasure.** Ground it: completion = Σ status weight over all words, so the percentage *drops* as words go overdue. A gold notebook is kept, not just reached.
9. **A player level that drives battle difficulty and monster tint, with milestone XP bursts and achievements.** Ground it: points by status (LEARNING 1, KNOWN 2, GRADUATED 3). The level never drops, but a backlog of overdue words shows as "rust".
10. **The world changes as quests complete.** Bridge, school, farm, feast table. Ground it: districts visibly rebuild as their words reach KNOWN and wilt as words go overdue.
11. **An expansion wave (New Game+).** +150 words merged into the same maps, with new quests and exam tiers. Ground it: release the next wave into existing districts once 80% of the current wave is KNOWN.
12. **Side games.** Mini stories (1000 XP + 250 coins), 3 arcade games, a sparring battle, passages read aloud, passive listening, foundation lessons. Ground it: each draws due words first and promotes on success.
13. **Leaderboards, achievement rarity, a display name unlocked by a quest.** Ground it: score from status counts; worth building only once there are several users.
14. **Difficulty and immersion modes.** Hard mode (no translations), Nightmare (quest log in the L2), less or no damage. Ground it: offer Hard mode once a district is mostly KNOWN.
