# Report: noun-batch-7 (150 entities)

## Shape

Matches the staged-batch convention observed in `.harvest/staged/noun-batch-1..6.json` (not the live `noun.js` shape): `traits: ["TRANSLATED", "EXEMPLIFIED"]` only — no `RANKED` in staged files (RANKED is added at integration time). Every entity carries `word` / `word.lemma.{lemma}` / `word.part-of-speech.noun` / one `word.gender.*` / `word.number.singular` / one `proficiency.cefr.*` / one `domain.*`, all drawn from `dataset/symbols/structural.js`.

## Blocking sets (built first, re-verified last)

Parsed every `dataset/literals/words/*.js`, `dataset/literals/sentences.js`, and every `.harvest/staged/*.json` sibling into slug / lemma / learning-example / known-example sets before drafting, then rebuilt the sets from scratch and diffed the finished 150 against them as the final step (the corpus was being modified concurrently by other batch tasks during this run — noun.js grew from 900→916 live entries and a new `mixed-fill.json` staged file appeared between my first and second set-builds, confirming the live/staged tree is a moving target). Final re-verify: **0 slug collisions, 0 lemma collisions, 0 learning-example collisions, 0 known-example collisions** against the corpus state at completion.

## mano-class fill

`mano` itself was **already staged in `noun-batch-2.json`** (and also present in live `noun.js`) before this task started — not a gap. Substituted with the three other flagged items plus `auto`: `foto`, `moto`, `radio`, `auto` — all feminine, all invariable singular, all confirmed free against the blocking set.

## Category counts (150 total)

- mano-class fills: 4 (foto, moto, radio, auto)
- sports: 30 → `domain.entertainment`
- music/art: 30 → `domain.entertainment`
- kitchen: 35 → split `domain.food` (11, tableware: tazza, tovaglia, teiera, caffettiera, zuccheriera, saliera, oliera, ciotola, scodella, brocca, caraffa) / `domain.home` (24, tools/appliances: pentola, padella, forno, teglia, tagliere, grattugia, colino, scolapasta, pentolino, frullatore, tostapane, microonde, lavastoviglie, fornello, vasetto, coperchio, canovaccio, presina, apriscatole, cavatappi, spremiagrumi, stampo, imbuto, spatola) — mirrors the live precedent where dining items (forchetta, piatto, bicchiere…) carry `domain.food` and appliance/tool items (mestolo, vassoio) carry `domain.home`.
- body-2: 31 → `domain.body` (gola, fronte, guancia, sopracciglio, ciglio, tallone, polpaccio, coscia, anca, vita, ombelico, costola, vertebra, tendine, nervo, vena, arteria, pupilla, narice, mascella, cranio, cervello, polmone, fegato, rene, intestino, milza, pancreas, tiroide, peluria, dorso)
- misc fills (19 remaining): `domain.clothing` (6: manica, colletto, gilet, impermeabile, vestaglia, ciabatta) / `domain.health` (4 cosmetics, mirrors batch-6's hygiene-item precedent: profumo, trucco, rossetto, smalto) / `domain.home` (9: spina, interruttore, lampadario, zerbino, portaombrelli, attaccapanni, gruccia, cassapanca, baule) / `domain.education` (1: evidenziatore)

## Heavy overlap (as warned)

Nearly every brief-suggested word was already taken by prior batches: sports (pallone, squadra, arbitro, rete, nuoto, bicicletta, stadio, scarpa, vittoria, sconfitta, porta), music/art (quadro, mostra, museo, spettacolo, concerto, orchestra, musica, canzone, cantante, batteria, microfono, altoparlante, disegno, galleria, teatro, attore, attrice, costume, statua, poesia, romanzo, biglietto), kitchen (coltello, forchetta, cucchiaio, piatto, bicchiere, bottiglia, mestolo, cucina, credenza, dispensa, barattolo, vassoio, tovagliolo), body-2 (dito, unghia, schiena, spalla, ginocchio, caviglia, gomito, mento, polso, muscolo, labbro, stomaco). Substituted with real, natural, distinct Italian vocabulary in the same registers (full substitute lists above under Category counts). Clothing/school-supply misc pools were also heavily saturated (orologio, specchio, sapone, cintura, tasca, giacca, maglione, borsa, penna, quaderno, matita, gomma… all taken) — picked the remaining free items instead.

## Gender / CEFR / trap classes

- Gender: 80 masculine / 70 feminine, mechanically tagged one `word.gender.*` per entity.
- CEFR: a1 10 · a2 58 · b1 82 (no b2/c1/c2 — everything here is proactive-conversational vocabulary, not exam-tier).
- No `proficiency.survival` tags applied this batch — sports/music/kitchen-tools/body-anatomy are proactive A1–B1 (participate in conversation about hobbies, describe pain, name kitchen tools), not reactive day-one survival needs (per the survival-vs-A1 doctrine). Judgment call, flagging for review.
- **Masculine `-a` trap class deliberately reused**: `artista`, `regista`, `violinista` all tagged masculine (matching the live `problema`/`pigiama` precedent) with masculine articles/pronouns in their own examples (`L'artista… nel suo studio`, `Il regista ha scelto…`, `Il violinista accorda il suo strumento`).
- **`s`-impura / `z`-initial article agreement** spot-checked across every applicable masculine noun: `lo sci`, `lo scolapasta`, `lo spremiagrumi`, `nello stampo`, `lo smalto`, `sullo zerbino` — all correct, never `il`.
- **Elision** (`l'`/`un'`/`all'`) spot-checked across every vowel-initial noun: `L'auto`, `L'allenamento`, `L'atleta`, `L'atletica`, `L'allenatore`, `l'oliera`, `l'anca`, `l'infermiera` (unrelated word, correct), `L'ombelico`, `L'intestino`, `L'arteria`, `l'impermeabile`, `l'apriscatole`, `l'imbuto`, `l'evidenziatore`, `all'attaccapanni` — all correct.
- `guancia`/`anca`/`tallone`/`polmone` examples were rewritten mid-draft from an initial plural or gender-ambiguous phrasing to keep the singular learning form literally present and grammatically unambiguous.

## Validation run

- JSON parses; exactly 150 entities.
- Internal duplicate slugs: 0. Internal duplicate lemmas: 0. Internal duplicate learning/known examples: 0 (except the 7 documented legitimate identical-spelling cognates/loanwords: `tennis`, `rugby`, `album`, `radio`, `opera`, `vertebra`, `pancreas` — all pass the "must not equal learning unless legitimately the same word" exception).
- Every `learning` word appears verbatim (case-insensitive) inside its own Italian example — 0 failures.
- All `learning` values lowercase — 0 failures.
- Exactly one gender / one domain / one CEFR symbol per entity; all domain/proficiency symbols verified against `dataset/symbols/structural.js`'s legal set.
- Final fresh re-verify (rebuilt blocking set immediately before this report, re-diffed the finished file): **0 slug / lemma / example collisions** against the corpus state at completion, including the concurrently-landed `mixed-fill.json` and the noun.js/adverb.js/determiner.js growth from parallel tasks.

## Concerns

- The scratchpad working directory for this session is shared across concurrently-running batch tasks with generic script/pickle filenames (`blocking.py`, `generate.py`, `build.py`, `verify.py`, etc. all pre-existed from other agents' runs at the same paths). My first blocking-set build was silently clobbered mid-run by a sibling task's concurrent write, corrupting the pickle's key schema. Recovered by moving all my scratch work under a session-unique subdirectory (`scratchpad/n7/`) and rebuilding from there — the final staged output was validated against a clean, uncorrupted final rebuild, so the deliverable is unaffected, but future batch tasks sharing this scratchpad should namespace their temp files to avoid the same collision.
- `mano` was requested by the brief but is already staged (batch-2) and live — not included again per the no-duplicate-slug law; substituted `auto` in its place as the brief allowed ("+ auto if free").
- `domain.food` vs `domain.home` split for kitchen items and the `domain.health` use for cosmetics (profumo/trucco/rossetto/smalto) are judgment calls following the closest live precedent, documented above — no dedicated "cosmetics" or "kitchenware" domain exists in `structural.js`.
