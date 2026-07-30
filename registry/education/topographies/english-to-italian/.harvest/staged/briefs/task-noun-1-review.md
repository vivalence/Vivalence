# Review: Italian noun batch 1 — staged

Reviewed `noun-batch-1.json` (150 entities) against `task-noun-1-brief.md`, `corpus-quality-criteria.md`, `structural.js`, and the full live `english-to-italian` literal dataset (718 entities across all word-type files: adjective/adposition/adverb/contraction/coordinating-conjunction/determiner/interjection/numeral/particle/pronoun/subordinating-conjunction/verb — noun.js and adjective.js are currently empty).

## Mechanical checks — all pass

- JSON parses, 150 entities exactly.
- Domain split: food 40 / home 35 / city 25 / transport 25 / money 25 — exact match to brief.
- CEFR: a1 77 / a2 73. Survival: 33. Gender: masculine 94 / feminine 55 / epicene 1 — all match the report's table exactly.
- Slug format `<form>.noun` on all 150; zero dupes within file; zero dupes against the 718 live slugs.
- `word.lemma.<form>` matches `learning` on all 150.
- `word.number.singular` present on all 150. Gender symbol present on 149/150 — `conducente.noun` is the sole documented epicene exception.
- All `proficiency.*` and `domain.*` symbols used exist in `structural.js`; exactly one `domain.*` per entity.
- Form-in-example law (`TRANSLATED.learning` ⊆ `EXEMPLIFIED.learning`, accent-insensitive): zero violations across 150.
- Example uniqueness: zero dupes within file; zero dupes against all 718 live `EXEMPLIFIED.learning` sentences.
- `known == learning` only for `pasta`, `pizza`, `menu`, `taxi`, `euro` — genuine loanwords, matches the documented exception.
- No curly/smart quotes; no double-spaces; all `learning` values lowercase, single-word, no PII.

## Linguistic checks — native-level Italian

Walked all 150 entries for real/correctly-spelled/singular/lowercase nouns, gender correctness, article/adjective agreement, and example naturalness. Result: genuinely high quality. Notably the batch correctly navigates several classic gender traps rather than falling into them:
- `colazione`, `stazione`, `commissione` — all `-ione` nouns correctly tagged **feminine** (the trap would be assuming `-one` → masculine).
- `patente`, `nave` — `-e`-ending nouns correctly tagged **feminine** against the more common masculine `-e` pattern (cameriere, bicchiere, ponte, quartiere).
- `zucchero`/`sconto`/`spicciolo`/`stipendio` correctly paired with `lo`/`uno` (s+consonant rule) rather than `il`/`un` in their examples.
- Elisions (`l'acqua`, `un'insalata`, `dell'olio` region, `nell'armadio`, `allo specchio`, `quell'edificio`, `dov'è`) all correctly applied.
- No masculine `-a` traps (problema-class) or feminine `-o` traps (mano/moto/foto/auto-class) present — the batch sidesteps these by choosing `macchina`/`motorino` over `auto`/`moto`.

No incorrect gender assignments found in the full 150. No incorrect agreement found in the full 150.

## Findings

### Critical
None.

### Important

1. **`risparmio.noun`** — example "Uso il risparmio per il viaggio" ("I use my savings for the trip") reads unnatural. Singular `il risparmio` denotes the abstract concept/act of saving (e.g., `risparmio energetico`) or an aggregate economic figure, not "my saved-up money" in a personal context — a native speaker uses plural `i risparmi` for that ("Uso i risparmi per il viaggio" / "Uso i miei risparmi per il viaggio"). Fix: either change the example to a construction where singular `risparmio` is natural (e.g., "Il mio risparmio mensile è aumentato" — "My monthly savings has increased"), or reconsider whether this headword should be the plural form instead.

2. **Report's live-dataset verification counts don't match the actual live dataset.** The report states "unique against all 483 example sentences currently in the live dataset" and "no slug collisions... against the 528 slugs currently live." The actual live dataset (all word-type files under `dataset/literals/words/`, excluding the barrel `index.js`) contains **718** entities and **718** `EXEMPLIFIED.learning` sentences (dominated by `verb.js` at 541 entries) — not 528/483. I independently re-ran the full dedup check against the true 718-entity live set and found **zero** slug or example collisions, so the batch itself is clean. But the report's stated verification scope was materially smaller than the real live dataset, which means the dedup check as described may not have covered all live files (most likely `verb.js` was undercounted or a stale snapshot was used). Flagging so the process gap is visible even though the outcome checks out.

### Minor

3. **`conducente.noun`** ("driver") is correct Italian and correctly epicene, but it's the more formal/bureaucratic register (traffic-code language, e.g. signage "vietato parlare al conducente"). `autista` is the more common, higher-frequency everyday word for "driver" and would arguably serve survival/A1 vocabulary better. Not an error — a curation judgment call worth reconsidering.

4. **`muro.noun`** — example "Il quadro è appeso al muro" ("The painting is hung on the wall") uses `muro` (structural/exterior wall) where `parete` (interior wall) is the more precise word for hanging a picture indoors. `muro` in this sense is common colloquially and not wrong, just slightly imprecise register.

5. **`bar.noun`** — `known` field is `"café / bar"`, containing the accented character `é`. This is standard English orthography (café is a legitimate English dictionary word), not Italian bleeding through, but it technically brushes against the criteria doc's "no diacritics in known field" rule (written with Portuguese ã/ç/é in mind). No action needed unless the rule is meant to be read literally character-by-character.

## Judgment calls validated

Cross-checked the report's own judgment-call list (conducente epicene precedent, tavolo/stazione/conto domain placements, loanword known==learning exceptions, multi-meaning `/` fields, survival-tagging boundary) — all consistent with the brief and the criteria doc. No disagreement beyond findings above.
