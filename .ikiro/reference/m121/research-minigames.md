# Second Language: every activity the world pulls you into

Slice report for the wakaru rebuild. Source: the read-only teardown `~/code/teardowns/second-language` (build `index-56145b67…`). `[n:l]` means `src/module-n.js`, line l. Mechanics are paraphrased; only identifiers and numbers are quoted.

## 0. How it fits together

- **Host:** one host runs 9 registered mini-games: `falling_vocab`, `vocab_match`, `word_blocks` (arcade), `mini_story_challenge`, `pedagogy_lesson`, `comprehension_passage`, `language_note`, `dialogue_scene` and `character_writing` [3751:13-64]. Arcade games add a setup screen and play-again [3750:89-98]. The battle, the overlay challenge, voice gates and fishing run outside the host.
- **Triggers:**
  - stepping on a content tile (a "found" flourish, then the game) [3556:54-90, 2833:1017-1027]
  - an NPC dialog choice: `open_mini_game`, `launch_mini_story_challenge`, `start_spar`, `start_fishing`, `navigate` [2368:434-461, 2367:472]
  - monster contact [2365:189, 2833:1492]
  - using water [2359:108-170]
  - the menu
- **Two question engines that share no code:**
  - The battle round is clocked, gives one attempt, and never writes term progress (no record call in [3575] [3579] [3600] [3612]).
  - The overlay challenge has no clock and allows retry or defer. It writes progress via `recordChallengeAttempt` [3244:160-166] and `record_challenge_round` [3560:91-99].
- **Tile XP pays once:** the award is 0 if the tile's id is already completed [2833:1028-1035].

## 1. Monster battle (v3): the core activity

**Trigger.** Monsters roam with aggro radius 7 [2404:32]; contact starts a battle [2833:1492]. Monster level depends on the region:
- hallway: 0 [2405:9]
- cave (10 goblins): 1–3 [2404:11]
- river path: 3–6 [2407:11]
- hidden cave: 4–5 [2406:11]

Player level runs 0–6. It counts collected words + 2 × mastered words against thresholds 0/10/60/150/300/520/750 [2244:52-65]. **Difficulty = monster level − player level, clamped to −5..+5** [3577:75-78].

**Layers.** The phases run intro → pick → practice → fight → pick … → ended [3579:212-379].
1. **Intro.** Fight now with 60 opening attack power (AP), study first, or flee [3579:215-274, 3578:35].
2. **Pick.** A 2-column grid of round cards: Word Match (both directions), sentence builder, comprehension, listening, speaking. Each card shows its power multiplier. Blocked cards give the reason: audio setting off, no mic, or grading down [3628:140-152, 2077:24-36, 3599:26-43]. Base power is 40, 60 or 80 (word match / builder and reading / listening and speaking), times 1, 1.2 or 1.4 for difficulty [3578:36-49].
3. **Practice round.**
   - 5 questions, one attempt each, 3 options [3578:23, 3579:57,140, 3591:16-50, 2077:30].
   - Clock: 3 s for word match (+0.8 s deal), 8 s for the builder, 5 s for the rest. A timeout is a miss. The clock pauses during first audio play, recording and grading [3578:25-33, 3583:86, 3579:357-368, 3653:8-21,47-50].
   - Word match board: 4 slots (6 at hard), 5 prompts, no repeats until the pool is spent, and a 50% reshuffle when the answer would sit in the same slot twice [3583:9-48,83-99].
   - Payout: the round converts to AP, ×2 if perfect, capped at 200.
   - **Misses cost no HP but arm the monster.** The guard window becomes ×max(0.4, 1 − 0.15·misses). Aggression becomes min(1, misses/4), which shortens waits and wind-ups and adds flurries [3592:32-58,65-86].
4. **Fight.**
   - Two buttons: attack and defend [3586:133-160].
   - The monster waits 0.5–2.4 s, winds up 0.6–1.7 s, then leaps [3585:26-37, 3586:11-51].
   - Guard before impact to block; the window is 450 ms × defense × time scale. A block within 130 ms is perfect and adds 0.7 s of opening [3592:51, 3585:15,25, 3586:168-184].
   - A block stuns the monster for 1.5, 2.1 or 2.7 s; attacks only land then. Swinging at a guarded monster gets you knocked back, countered and locked out for 1 s [3585:20-24,5, 3586:59-62,249-268].
   - A hit costs base HP ÷ leapsToDefeat and 420 ms of stun [3586:185-216].
   - Each landed hit drains the monster's stamina gauge by 5, paid from your AP. The gauge refills at 2/s while you back off [3590:7-34, 3577:309-310].
   - Flurries chain leaps [3586:40,69-71].
   - Out of AP, you go back to pick to recharge [3588:12-16, 3580:89-95].
5. **Rock shower.** Instead of leaping, the monster sometimes throws: 10–30% by gap, with a 5% chance to throw again [3586:17-19, 3577:307].
   - 5–12 s of rocks; you steer left and right.
   - Easy: 1.6–2.6 rocks/s, fall time 1.8→1.35 s. Hard: 4–6.5 rocks/s, 1.2→0.8 s. Aimed at you: 30/40/60%.
   - Flaming rocks leave fire for 6–8 s. Pure dodging, no words [3587:143-210, 3589:3-58].
6. **Combo.** Starts when the gauge breaks [3586:105,115-116].
   - (a) **Chain:** 5 words, each a prompt plus 4 cards. Time per word runs from 6 s at gap −5 to 2.5 s at +5. One miss ends it [3581:117-181,358-419, 3577:97-295].
   - (b) **Extension:** match 5 pairs in 25→8 s. 0, 1 or 2 mistakes earn 5, 3 or 2 hits at a full, half or third share; 3 mistakes fail it [3581:69-82,182-267].
   - (c) **Finisher:** tap numbered targets in order within 5 s; each in-order tap is a hit [3581:268-334, 3577:313].
   - Damage = 270–360 × share × hit ratio, about one even-level monster (300 HP) [3577:325-331, 3581:485].
   - A failed chain or extension falls back to a 3 s free-hit window, scaled by remaining AP [3581:18-26,531-555, 3577:318-338].

**Level knobs.** These change across gaps −5 to +5 [3577:44-49,85-297]:

| knob | gap −5 → +5 |
|---|---|
| monster HP | 56 → 823 |
| leaps to defeat you | 20 → 2 |
| rocks to defeat you | 20 → 5 |
| stamina gauge | 10 → 100 |
| pressure (faster wind-ups, shorter openings, more flurries) | 0 → 0.6 |
| throw chance | 0.1 → 0.3 |
| shower level | easy → hard |
| flaming rocks | 0 → 25% |
| word-match board | easy → hard |
| chain time per word | 6 → 2.5 s |
| extension time | 25 → 8 s |
| flee chance | 0.9 → 0.1 |

**Stakes and rewards.**
- Battle HP scales with hearts (+25% per heart beyond 5), starts at your world HP ratio, and damage carries back to the world [3578:3-6, 3575:205-215,315-335].
- **Win:** 30 XP + 25–50 coins, doubled if every question was right [3575:474-481, 2348:5-7].
- **Loss:** game over [3575:372].
- **Flee:** once, from intro or pick. Odds drop 0.1 per recent escape, with a floor of 0.05. One escape is forgiven per 3 minutes and per word collected [3596:3-46, 7227:137]. A failed flee enrages the monster (+10% HP, maximum aggression), and it ambushes you [3579:238-274].

**Variants.** The tutorial goblin is fought once, with a coach, tutorial words and no rocks. The coach freezes time to teach defend → strike → drain, and the combo is forgiving with no clock [2402:10-21, 3575:256, 3576:2-80]. Spar is covered in §10.

*Why it works:* answers are ammunition and misses speed up the enemy, so knowing words feels like power. Blocking and dodging set a rhythm, and the combo turns fast recall into the finishing move.

## 2. Word pickup: the flashcard trial (most frequent)

Vocab tiles are scattered on every map [2357:7-19]. Touching one runs three steps:
1. A card shows the word with audio.
2. **Listen:** hear a sentence with the word and pick its meaning from 3 [2117:23-47, 3702:397-407].
3. **Build** a different sentence [3702:408-423]. Listening can be deferred until after the build [3702:506-516].

A miss costs 2 HP, except on the tutorial map [3702:475-481, 2347:116]. Collection pays 5 XP and records two successes [2833:438-446]. *Why it works:* every pickup is a short exercise that uses the word.

## 3. Mastery trials

- **Placement:** tiles start at 5 collected words. A map holds up to 3 (2 on full-screen maps), rising to 6 once the vocab tiles are cleared, fed from the mastery queue [7222:77-105, 2132:20, 2379:1-6].
- **Rounds:** 5 [2134:195]. Each type is drawn by tier weights × the frequency setting (off/less/normal/more = 0/0.5/1/2). A type used in the last 3 rounds is weighted ×0.2 [2122:71-87,169-188, 2129:29-39].
- **Misses:** −2 HP, XP burn, and the round is deferred 2..n slots [3571:133-138, 3106:373-404].
- **XP:** (Σ round XP + 50) × 2 if clean. The word becomes mastered [3571:98-107].

## 4. Gates: riddles, passwords, tests, exams

- **Voice riddle gates** open at 10, 15 and 25 collected words [2189:21-50].
  - The guard poses a riddle in the target language; you answer by voice.
  - The answer is checked against an accept list (dice similarity ≥ 0.66), then a per-language LLM rubric [2246:15-58, 2148:148-157, 2190:66-128].
  - Retries are unlimited. Passing gives +100 XP and the guard vanishes [2190:84-93,245].
- **Bosses:**
  - River boss: needs 100 mastered words, voice riddle, +2000 XP [2189:150-160, 2188:31-35].
  - Cave boss: asks for the secret word printed on your `caveTreasureMap` item (one of 12 per language, chosen by hashing the player id), +3000 XP [2188:88-93, 2719:7-36, 3062:81].
- **Guardian tests** use the exam engine: 10–50 questions, +250 XP, 75–150 coins (bosses 150–300). The forest boss test is 25 questions from the words ranked 1–50, +1500 XP [2189:12-19,51-148, 3569:132-151].
- **Exams** come from the `teacher` NPC [2241:985]. There are 4 tiers [2141:77-150]:

  | tier | requirement | question pool | XP |
  |---|---|---|---|
  | 1 | all words collected, ≥80% mastered | all collected | +1000 |
  | 2 | 150 collected | ranks 51–150 | +1000 |
  | 3 | 200 collected | ranks 101–200 | +1500 |
  | 4 | all collected | ranks 151–250 | +2000 |

  Each exam is 50 sentence builds. A miss costs a heart and defers the word, so HP is the clock and game over is a fail. Retakes carry over 5–10 missed words. Results are recorded [3560:8-120, 2141:68-74].

*Why it works:* vocabulary size becomes map access, and riddles force the player to produce language rather than recognise it.

## 5. Comprehension passages

- **Placement:** up to 2 tiles per map [7223:23-25, 2357:52-64].
- **Play:** a voiced passage with several speakers; tap a line to see its translation; text can be hidden. Then 2–5 questions with 4 options. A miss costs 2 HP and you retry [3757:14-114, 2833:1169-1175, 3396:81-87].
- **XP:** max(10, 40 − 15·misses) per question, +50 for completion, +50 if perfect [2758:92-118].
- **Read-aloud layer:** reopen a finished passage from the menu and read it all in one take. The server transcribes it and needs ≥80% of tokens to match. XP = 250 + 8 per Spanish token, rounded to 50 [3301:27-31, 2760:121, 2758:96-106].

## 6. Dialogue scenes (overheard conversations)

- **Placement:** after 25 collected words and a quest unlock; one tile per map [7216:14,32,41-48].
- **Play:** voiced multi-speaker parts, each followed by a question with 2–4 options. A miss means retry. There is a 12 s or 8 s reply clock and a repeat-last-line button [2262:46-62, 3772:120-176,207-238, 2432:34-37].
- **XP:** 250 × a share by misses (1/0.5/0.25/0.1); 500 if clean [2758:29-38,129-135].

## 7. Grammar lessons and language notes

- **Lessons:** one unlocks per 3 collected words, in curated order, one per map [2357:34-51, 7225:1-14, 7224:11-16]. Read-only blocks (text, example, compare), +50 XP [3789:192-193, 3780:40-48, 2348:2]. 15 Spanish lessons: gender, plurals, agreement, ser vs estar, gustar, possessives and more [2201:1768-1874].
- **Language notes:** a usage card, then up to 4 four-option questions, with no damage. XP = 50 + 20 per question − 10 per miss [3779:43-78,297, 2101:61, 2758:119-125].

## 8. Mini-stories

- **Access:** the `librarian` NPC's book menu or the menu screen [2217:124-125, 2218:3-20, 3292:24-40].
- **Content:** 3 stories, each illustrated, with narrated steps you can't skip, interleaved with 4-option questions (e.g. 7 narrated steps and 4 questions). A miss means retry, no damage [2227:10-14, 2229:2-54, 2221:278-608, 3781:89-205,123-147].
- **Reward:** 1000 XP + 250 coins, once per story [2348:3-4, 2344:190-200].

## 9. Arcade trio (game-shop NPC)

`game_boss` in the `shop` map offers three games through a dialog menu [2213:33-116].
- Free: the coin-cost field is stripped for playable games [2836:45-54].
- Each game needs a minimum pool of collected words [2836:99-142].
- 2 XP per correct answer, capped at 100. Repeatable; no coins and no term records [2758:14-17,75-76, 2344:182-188].

The games:
- **Falling words.** The L1 meaning sits on top; 4–6 L2 tiles drift down 4 lanes; tap the right one before it lands. 10 rounds (5–50). Fall time is 2.6–3.8 s × 1.9, 1.4 or 1.05 for slow, normal or fast [2837:14-21,90-124, 3776:4-16, 3773:300-347].
- **Pair match.** Tap an L2 word, then its L1 meaning; cleared slots refill. Defaults: 6 pairs on screen (4–8), refill after 4, 24 terms or endless, 3 mistakes allowed (0–10), optional 90 s timer [2759:1-27, 3791:4-25, 3582:23-196].
- **Word blocks.** A 5×12 well. An L2 card falls; tap its meaning in a 3-column bank to turn it into a floor block. Unmatched cards stack. Win at 20 or 25 blocks; lose when no lane fits. Fall time 5.2, 3.4 or 2.6 s for easy, medium or hard; each miss adds 1.5–2.5% speed [3797:2-10,89-130,250-306,352-374, 3798:125,141].

## 10. Spar

The `traveler` NPC, after an unlock flag, offers practice fights:
- You pick the foe's level, from 2 below yours to 3 above.
- Same battle, with no rocks or flurries.
- No world consequences, and an offer to spar again [2242:390-462, 2402:22-34, 3577:2-25, 3575:196-199,434-442].

## 11. Breathers without language

- **Fishing** (needs the rod; use a water tile):
  - A bite comes after 3–10 s, 85% of the time.
  - Hook it within 2–4 s.
  - Then tap 4–8 times per second over a 4–12 s window.

  The catch is an L2-labelled fish worth 25 coins [2369:4-218, 2359:108-170, 2194:13-50].
- **Vendors:**
  - Buy: food, which heals (a dumpling restores a heart, soup heals fully [2267:683-815]); heart container (1250 coins); lantern (800); golden-heart revive (2500); streak token (1000).
  - Sell: wood (10), fish (25) [2294:43-190].
- **Chores:** nap to heal, carry water, chop wood, smash boulders [2368:462-491, 2833:1070-1094].
- **Puzzles:** push blocks onto switches, darkness, water [2365:43-114].
- **Foraging:** fruit, +2 HP each [2357:104-120, 2267:67-71].

## 12. Menu practice

- **Daily practice**, the top menu entry [3717:361]:
  - 5→25 words as your collection grows; can be stretched ×2, up to 50.
  - A miss costs 1 heart, or 2 when you hold more than 5.
  - XP = Σ question XP × (1 + 0.05·√words) × (1 + 0.25·accuracy²) × streak (1→3 over 60 days, starting on day 2) × 2 if perfect.
  - A lapsed streak can be revived within 3 days with a 1000-coin token [2131:179-231, 2146:8-73, 2347:13-15].
- **Curated practice**, from the menu or the `language_tutor` NPC [2215:152-162]: choose types, difficulty, scope and 10–50 questions. No HP loss; multipliers are double the daily ones [2435:20-25, 2146:51-60, 3106:396-398].
- **Passive listening** (`passive-study`): hands-free sentences from your own words; 1–2 voices; 0.6–1× speed; translation shown on a chosen schedule; no XP [2201:514-542].
- **Character writing** (Chinese only): watch → trace → write from memory [3104:6-8, 3752:397-424].

## Question and challenge types

**Overlay challenges:** no clock; 3 rounds unless noted [2118:2-3]. XP is 5/10/15 by tier, plus 0/8/15 for sentence difficulty, burned to 0 after 3, 4 or 3 misses [2758:42-49,77-91]. Spanish gets 11 of the 13 types [2124:49-73]. Labels come from [2893:7-115]; shapes from [2117:48-370].

| type (tier) | prompt → input | options / grading |
|---|---|---|
| `vocab_match_to_l1` (1) | L2 term → tap meaning; 1 round | 4 |
| `vocab_match_to_l2` (1, zh) | meaning → tap L2 term; 1 round | 4 |
| `reading_comprehension` (1) | read sentence → tap meaning | 4 (battle: 3, 5 s) |
| `listening_comprehension` (2) | hear sentence → tap meaning | 4 (battle and pickup: 3) |
| `speech_recognition` (2) | hear → tap the L2 sentence | 4 |
| `character_order` (2) | sentence with up to its last 4 tiles blank → tap tiles in order [2075:8-62,164] | (battle: 8 s) |
| `text_input_easy` (2, zh) | see sentence → type it back | – |
| `read_aloud` (2) | see sentence → say it | exact match; fuzzy ≥0.88 from try 3, ≥0.78 from try 5 [2148:109-147] |
| `shadowing` (2) | hear and see → repeat | speech |
| `speech_to_text` (3) | hear → type what you heard | – |
| `pure_shadowing` (3) | hear only → repeat | speech |
| `translation` (3) | L2 → type L1 | exact, else server LLM: correct / correct with feedback / incorrect [3235:4-59] |
| `text_input_hard` (3) | L1 → type L2 | server translation grader [3234:108] |

**Other shapes:**
- **Battle word match:** both directions, 4 or 6 slots, 3 s, 5 prompts [3583:83-103].
- **Combo:**
  - chain: 4 cards, 6→2.5 s per word
  - extension: 5-pair match, 25→8 s
  - finisher: ordered taps, 5 s
- **Arcade:** 4–6 falling tiles; 4–8 pairs; a bank of 6–9.
- **Content multiple choice** (passage, note, story): 4 options, no clock, retry. Dialogue scenes use 2–4 options under a reply clock.
- **Voice answers:**
  - riddle: accept list → dice ≥ 0.66 → LLM
  - secret code: exact normalised match [2719:24-26]
  - passage read-aloud: ≥80% of tokens

## Practice versus world events

- **World events:** word pickup, battles, mastery tiles, passages, scenes, lessons, notes, fruit, riddles, tests, exams, the arcade, story and spar NPCs, the tutor, fishing, vendors and chores.
- **Pure practice:** daily, curated, passive listening, passage read-aloud, and replays from the collection grids [3289:7-41].

## What wakaru lacks, ranked by value for a Spanish learner who walks the world

1. **A fight layer between answer rounds.** Answers buy power; misses shrink the guard window and speed up the warden. *Phone:* after 5 duel answers, 20 s of play: the left thumb blocks on the wind-up flash, the right thumb strikes in the opening, and empty power starts the next round.
2. **An active word pickup.** *Phone:* step on a glinting word → card with audio → one listening pick from 3 → one 4-tile build. A miss costs half a heart.
3. **Overheard conversations.** *Phone:* walk past two NPCs at a stall; a voiced exchange plays; a 3-option gist question follows each part, with a replay button and an 8–12 s clock.
4. **Voice riddle gates and passwords** (reusing our hal judge). *Phone:* the warden asks a riddle in Spanish; hold the mic and answer; the accept list is checked first, then the LLM rubric. A secret word found on an item opens a vault.
5. **A combo finisher in Spanish.** *Phone:* when the gauge breaks: 5 rapid recognitions (4 cards, about 4 s each), then a 5-pair match, then tap one verb's conjugations in order (yo → tú → él…).
6. **Pick-your-round risk and reward.** *Phone:* a 2×3 grid of round cards before each round, showing PICK ×1, BUILD ×1.5, LISTEN/SPEAK ×2.
7. **Encounter levels.** *Phone:* the warden's level minus the district's held level sets HP, clocks, board size and flee odds, all from one table.
8. **Readable world texts.** *Phone:* tap a notice board, read it, tap lines for translation, answer 2–5 questions; later, read it aloud and pass at 80% match.
9. **An arcade hall** (a coin and XP sink). *Phone:* falling words (tap the "la" nouns), a 6-pair match, and a word-block well.
10. **Grammar shrines on a cadence.** *Phone:* one 60-second card per 3 held words (ser/estar, gender, gustar), plus up to 4 check questions.
11. **Milestone exams.** *Phone:* 50 sentence builds, a heart lost per miss, and missed words carried into the retake.
12. **A spar post.** *Phone:* pick the foe's level from −2 to +3, with no stakes and an offer to go again.
13. **Mini-stories.** *Phone:* a bookshelf opens an illustrated, narrated story with 4 questions and a large one-time reward.
14. **Breathers.** *Phone:* a rock-shower dodge between rounds; fishing (tap to hook, mash to reel) for a catch labelled in Spanish.
15. **A daily session with stacked multipliers and a revival token.** We already count reviews and the streak. *Phone:* a 5–25 word run where length, accuracy and streak multiply the XP.
