# Report: Italian adverb batch 2 — 80 literals

Output: `/Users/finn/vivalence/code/vivalence/registry/education/topographies/english-to-italian/.harvest/staged/adverb-batch-2.json`

## Counts by family

| family | count | words |
|---|---|---|
| -mente manner | 27 | velocemente, lentamente, facilmente, veramente, sicuramente, finalmente, esattamente, direttamente, semplicemente, probabilmente, chiaramente, rapidamente, attentamente, tranquillamente, perfettamente, completamente, assolutamente, particolarmente, principalmente, naturalmente, praticamente, improvvisamente, gradualmente, silenziosamente, duramente, dolcemente, leggermente |
| frequency | 15 | spesso, raramente, talvolta, solitamente, generalmente, frequentemente, occasionalmente, abitualmente, regolarmente, costantemente, continuamente, quotidianamente, normalmente, sporadicamente, periodicamente |
| sequence/time | 15 | subito, allora, poi, intanto, ormai, appena, stasera, stamattina, stanotte, infine, successivamente, frattanto, innanzitutto, ultimamente, recentemente |
| attitude/discourse | 15 | purtroppo, certamente, ovviamente, comunque, almeno, addirittura, magari, insomma, ecco, davvero, proprio, assai, beh, cioè, dunque |
| place/quantity | 8 | ovunque, dappertutto, altrove, parecchio, appunto, intorno, sopra, sotto |

Total: 80. (Family sizes rebalanced slightly from the brief's ~30/~15/~15/~12/~8 split to 27/15/15/15/8 — the attitude/discourse bucket absorbed extra high-value words (insomma, ecco, davvero, proprio, assai, beh, cioè, dunque) that `dataset/symbols/structural.js`'s own `functional.discourse` / `functional.intensifier` / `functional.filler` descriptions name verbatim as target examples (`"allora, insomma, ecco"`, `"davvero, proprio, assai"`, `"beh, cioè, dunque"`) yet none of those words existed in the live 42-entry adverb.js — a strong signal this batch was meant to fill exactly those slots. Manner family trimmed 30→27 to compensate.

## Shape

Traits: `["TRANSLATED", "EXEMPLIFIED"]` only — no RANKED, matching the sibling `adjective-batch-2.json` / `noun-batch-*.json` convention (brief's binding-doc pointer explicitly scoped to Entity Shape/TRANSLATED/EXEMPLIFIED, not RANKED).

## Symbol assignment method

No `functional.manner` or `domain.manner` symbol exists in `structural.js`, so pure manner-of-action `-mente` words (velocemente, lentamente, facilmente, chiaramente, attentamente, silenziosamente, duramente, dolcemente, gradualmente, principalmente, naturalmente, direttamente, semplicemente, veramente, sicuramente, probabilmente, esattamente) carry no functional/domain symbol beyond proficiency — this mirrors the sibling `english-to-brazilian/dataset/literals/words/adverb.js` precedent, where the direct cognates (`cuidadosamente`, `geralmente`, `simplesmente`, `certamente`, `talvez`, `gradualmente`, `imediatamente`, `pessoalmente`) also carry empty functional/domain arrays.

Where a fit exists, I followed the live Italian file's own precedent directly:
- `functional.aspect` for all frequency-family words (mirrors live `sempre`→aspect, `già`/`ancora`→aspect — this dataset treats frequency/habituality as aspect, there being no dedicated frequency slot) and for `finalmente`/`improvvisamente`/`appena` (completion/onset/recency aspect).
- `functional.intensifier` for `perfettamente`, `completamente`, `assolutamente`, `particolarmente`, `davvero`, `proprio`, `assai` — confirmed against the explicit `structural.js` description (`"davvero, proprio, assai"`) and the Brazilian sibling's `absolutamente`/`totalmente`/`completamente`/`extremamente`→intensifier precedent.
- `functional.discourse` for `allora`, `insomma`, `ecco` (verbatim structural.js examples), plus `comunque`, `addirittura`, `infine`, `innanzitutto`, `appunto` (discourse-organizer/reformulation class, matching the Brazilian sibling's `então`/`aliás`/`afinal`/`enfim`/`inclusive` cluster).
- `functional.filler` for `beh`, `cioè`, `dunque` — verbatim structural.js examples.
- `functional.degree` for `praticamente`, `leggermente`, `almeno`, `parecchio` (quasi/molto/poco/tanto-style degree modifiers, matching live `quasi`→degree).
- `functional.time` / `domain.time` split follows the live convention exactly: relative-time adverbs (`subito`, `poi`, `intanto`, `ormai`, `successivamente`, `frattanto`, `ultimamente`, `recentemente`) → `functional.time` (mirrors live `adesso`/`prima`/`dopo`/`presto`/`tardi`); calendar-deictic day-part words (`stasera`, `stamattina`, `stanotte`) → `domain.time` (mirrors live `oggi`/`ieri`/`domani`).
- `domain.space` for `ovunque`, `dappertutto`, `altrove`, `intorno`, `sopra`, `sotto` (mirrors live `qui`/`lì`/`vicino`/`lontano`/`davanti`/`dietro`/`dentro`/`fuori`).
- Epistemic-stance words with no clean bucket (`purtroppo`, `certamente`, `ovviamente`, `magari`) left with no functional/domain symbol — direct match to the Brazilian sibling's `certamente`/`talvez` empty-array precedent.

## Proficiency

Per brief: only `spesso`, `subito`, `poi`, `stasera` at `a1` (+ `proficiency.survival`); everything else `a2`/`b1` by relative frequency/register judgment (44 a2, 32 b1). `proficiency.high-frequency` added sparingly (10/80) to the most conversationally ubiquitous items (veramente, sicuramente, probabilmente, spesso, subito, poi, allora, comunque, ecco, davvero) — kept modest since the sibling adjective/noun staged batches use the flag rarely too.

## Dedup verification (programmatic, run first-pass design and final pass)

Checked `new_entries` (80) against:
- internal duplicates: slugs, known examples, learning examples — none.
- live `dataset/literals/words/*.js` (all 14 files, parsed via the JS→JSON regex pattern from corpus-quality-criteria.md): slug collisions none, example collisions (known + learning) none, and specifically the live 42-entry `adverb.js` lemma set (`non, no, sì, qui, lì, oggi, ieri, domani, adesso, molto, bene, male, anche, come, dove, quando, sempre, mai, più, meno, già, ancora, poco, troppo, tanto, vicino, lontano, prima, dopo, presto, tardi, abbastanza, piano, quasi, insieme, solo, forse, davanti, dietro, dentro, fuori, neanche`) — no overlap.
- sibling staged (`adjective-batch-1.json`, `adjective-batch-2.json`, `noun-batch-1/2/3.json`): slug and example collisions — none.
- learning-word-appears-in-learning-example: all 80 pass.
- known ≠ learning: all 80 pass.
- learning lowercase: all 80 pass.
- symbol legality (every functional/domain slug traced to `structural.js`, every `word`/`word.lemma.*`/`word.part-of-speech.*` structural convention): all pass.

JSON parses cleanly (`json.load` succeeded, 80-element array, UTF-8, no ASCII-escaping of accented characters).

## Concerns

- Family sizes deviate from the brief's exact ~30/~15/~15/~12/~8 (used 27/15/15/15/8) — a deliberate rebalance to capture the words `structural.js`'s own symbol descriptions pointed at (see above), not an oversight.
- A few semantic near-neighbors coexist (`veramente`/`davvero`/`proprio` all touch "really"; `certamente`/`ovviamente` both touch "obviously/certainly"; `intanto`/`frattanto` both mean "meanwhile") — these are genuinely distinct, commonly-used Italian words with different register/collocation, not accidental duplicates, and each has its own non-overlapping example sentence.
- No `RANKED` trait (rank/zipf/fpm) included, matching sibling batch convention and the brief's narrower binding-doc scope — flagging in case a later curation pass expects it added.
