# Report: Italian noun batch 1 — staged

Output: `registry/education/topographies/english-to-italian/.harvest/staged/noun-batch-1.json`

150 entities, valid JSON (`python3 -c "import json; print(len(json.load(open(...))))"` → `150`).

## Domain counts

| domain | count | masculine | feminine | epicene | a1 | a2 | survival |
|---|---|---|---|---|---|---|---|
| food | 40 | 26 | 14 | 0 | 30 | 10 | 8 |
| home | 35 | 23 | 12 | 0 | 13 | 22 | 4 |
| city | 25 | 15 | 10 | 0 | 12 | 13 | 7 |
| transport | 25 | 14 | 10 | 1 (conducente) | 12 | 13 | 7 |
| money | 25 | 16 | 9 | 0 | 10 | 15 | 7 |
| **total** | **150** | **94** | **55** | **1** | **77** | **73** | **33** |

Split matches the brief's requested 40/35/25/25/25.

## Verification performed

- All 150 `learning` nouns confirmed present (accent-insensitive substring match) in their own `EXEMPLIFIED.learning` sentence.
- All 150 example sentences are unique within the batch, and unique against all 483 example sentences currently in the live `english-to-italian` dataset (grepped/diffed programmatically). One collision was caught and fixed: `colazione`'s first draft ("Faccio colazione alle sette") collided with an existing sentence in `verb.js:15032`; replaced with "La colazione è inclusa nel prezzo".
- No slug collisions within the batch or against the 528 slugs currently live (noun.js was empty going in, so no `.noun` slugs existed yet).
- Every entry carries the full required symbol set: `word`, `word.lemma.<lemma>`, `word.part-of-speech.noun`, `word.number.singular`, `proficiency.cefr.{a1,a2}`, `domain.{food,home,city,transport,money}` — all domain/proficiency slugs checked against `dataset/symbols/structural.js`; nothing invented.
- Manually walked every example sentence for article/adjective gender-number agreement with its noun (elision rules: `l'`/`un'` before vowels, `lo`/`uno` before `s`+consonant/`z`/`gn`/`ps`, apocope `un buon ristorante`, combined prepositions `nell'`, `allo`, `alla`, `dal`, `nel`).

## Judgment calls

- **conducente** (driver): no `word.gender` symbol. It is an epicene `-e` noun (same spelling for masc/fem), matching the precedent set by `estudiante.noun` in the Spanish exemplar, which also omits gender.
- **Domain reassignments vs. the brief's example words**: `tavolo` and `stazione` were placed under `home`/`transport` per their natural category rather than `food`; `conto` (bill/account) went to `money`, not `food`, since it's more central to the money domain and avoids a duplicate example collision with `cameriere`'s "brings the bill" sentence.
- **known == learning** (5 entries: `pasta`, `pizza`, `menu`, `taxi`, `euro`): all are genuine loanwords, identical in English and Italian — the documented exception in `corpus-quality-criteria.md`.
- **Multiple-meaning `known` fields** (via `/`): `bar` → "café / bar", `dolce` → "dessert / sweet", `conto` → "bill / account", `moneta` → "coin / currency", `resto` → "change / rest", `bancomat` → "ATM / debit card", `commissione` → "fee / commission", `binario` → "platform / track", `centro` → "center / downtown", `spicciolo` → "coin / small change". Two words with real secondary meanings were deliberately narrowed to their single most relevant sense to avoid unrelated slashes: `carta` (kept "card", dropped "paper"), `piano` (kept "floor", dropped "plan/musical instrument").
- **Survival tagging** (33/150): applied only to day-one transactional/emergency nouns per the brief's survival-vs-A1 boundary — ordering (pane, caffè, ristorante, bar, menu, pizza, pasta), lodging/security (casa, bagno, chiave, appartamento), wayfinding/services (città, strada, piazza, ospedale, farmacia, banca, negozio), getting around (treno, autobus, biglietto, stazione, aeroporto, taxi, macchina), and paying (denaro, prezzo, euro, resto, portafoglio, carta, bancomat, cassa). Remaining nouns are CEFR a1/a2 by judgment (a2 for less central/more specific vocabulary).
- **RANKED omitted** per brief (injected later, staged file intentionally lacks it). **VOCALIZED omitted** (audio not yet recorded for this batch).

No PII. No git/jj commands run. Only the staged JSON file and this report were written.
