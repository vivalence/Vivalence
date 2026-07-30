# Report: Italian noun batch 4 — mind/emotion · relationship · entertainment · travel · state/abstract

Staged file: `/Users/finn/vivalence/code/vivalence/registry/education/topographies/english-to-italian/.harvest/staged/noun-batch-4.json`

150 entities, JSON array, validated with `python3 -c "import json; print(len(json.load(open('noun-batch-4.json'))))"` → `150`.

## Domain counts

| domain | count |
|---|---|
| domain.mind | 30 |
| domain.relationship | 25 |
| domain.entertainment | 30 |
| domain.travel | 35 |
| domain.state | 30 |

Matches the brief's requested 30/25/30/35/30 split exactly.

## Gender / CEFR / survival

- Gender: masculine 74 · feminine 72 · epicene 4.
- CEFR: a1 64 · a2 68 · b1 18.
- `proficiency.survival` applied to 7 travel entries (transactional/day-one border-and-airport cluster): `passaporto`, `dogana`, `visto`, `cambio`, `bagaglio`, `noleggio`, `imbarco`.

## Entity shape

Identical to batches 1 and 3: `traits: ["TRANSLATED", "EXEMPLIFIED"]` only, symbols = `word` / `word.lemma.<form>` / `word.part-of-speech.noun` / `word.gender.*` (omitted for epicene) / `word.number.singular` / one `proficiency.cefr.*` (+ `proficiency.survival` where applicable) / one `domain.*`. No RANKED, no VOCALIZED — injected later per regime. All symbol slugs cross-checked against `dataset/symbols/structural.js`; nothing invented.

## Epicene nouns (documented per brief instruction)

No `word.gender` symbol on these 4 — same-spelling for masculine/feminine, matching the `conducente`/`estudiante`/`insegnante` precedent from batches 1–2:

- `ospite.noun` — guest
- `conoscente.noun` — acquaintance
- `cantante.noun` — singer
- `turista.noun` — tourist

## Gender-trap words honored

- **Greek `-ma` masculine exception**: `programma`, `tema`, `dilemma` all tagged masculine despite the `-a` ending (standard Italian rule for Greek-origin `-ma` nouns) — the same trap the brief explicitly called out via `problema`, which turned out to already be staged (see collisions below); `dilemma` was chosen partly *because* it reinforces the same trap family.
- **`cinema`** — also a Greek-derived `-ma` word (truncation of `cinematografo`), masculine despite `-a` ending; `known` deliberately set to "movie theater" (not "cinema") to keep `known ≠ learning` clean even though English also uses "cinema."
- **`-one` feminine exceptions**: `opinione` and `conclusione` are feminine despite the usually-masculine `-one` ending (`la opinione` → `l'opinione`, `la conclusione`).
- **`-tà`/`-anza`/`-enza` invariable feminine**: `verità`, `realtà`, `possibilità`, `necessità`, `felicità`, `curiosità`, `importanza`, `differenza` all correctly feminine and unchanged in form.
- **`parte`** feminine despite `-e` ending (no default rule for `-e` nouns; case-by-case).
- **Augmentative gender flip**: `borsone` (from feminine `borsa`) is masculine — the standard Italian `-one` augmentative suffix flips gender to masculine regardless of the base noun's gender.
- **`fine`**: the classic `il fine` (purpose, masc.) / `la fine` (end, fem.) trap could not be used at all in either sense — `fine.noun` (feminine, "end") is already staged in `noun-batch-3.json`/live `noun.js` under `domain.time`, so the slug is unavailable regardless of which meaning would be used. Replaced with `conclusione` for the "end/conclusion" concept.

## Multi-meaning `known` fields (`/` convention)

`desiderio` → "desire / wish", `fidanzato/fidanzata` → "boyfriend / fiancé" · "girlfriend / fiancée", `sposo/sposa` → "groom / husband" · "bride / wife", `litigio` → "argument / quarrel", `appuntamento` → "date / appointment", `guida` → "guide / guidebook", `cambio` → "exchange / change", `scalo` → "stopover / layover", `modo` → "way / manner", `obiettivo` → "goal / objective", `tema` → "theme / topic", `quesito` → "question / query", `responso` → "response / verdict".

## Legitimate `known == learning` cognates (documented, not defects)

`nostalgia`, `orchestra`, `idea`, `dilemma` are true Italian/English cognates (identical spelling, identical meaning) — same category as the criteria doc's `hospital`/`animal` exception. `hobby`, `souvenir`, `resort` are English loanwords used unchanged in Italian, also legitimately same-spelling.

## Collisions found and resolved (blocking sets caught these before writing)

Programmatic cross-check against all live `dataset/literals/words/*.js` (13 files, 1142 entities) + all sibling staged `.harvest/staged/*.json` (5 files, 670 entities — `noun-batch-1/2/3.json`, `adjective-batch-1/2.json`) surfaced 14 slug collisions against the brief's suggested word lists, all swapped before finalizing:

| brief suggestion | already staged/live as | domain there | replacement used |
|---|---|---|---|
| `matrimonio` | `matrimonio.noun` | domain.family | `fidanzamento` (engagement) |
| `marito` | `marito.noun` | domain.family | `sposo` (groom/husband) |
| (n/a — new pair) | — | — | `sposa` (bride/wife, paired with sposo) |
| `moglie`-adjacent slot | `moglie.noun` | domain.family | covered by `sposa` above |
| neighbor pair (`vicino`/`vicina`) | `vicino.noun` | domain.home | `coinquilino`/`coinquilina` (roommate pair) |
| `valigia` | `valigia.noun` | domain.transport | `borsone` (duffel bag) |
| `aeroporto` | `aeroporto.noun` | domain.transport | `scalo` (stopover/layover) |
| `volo` | `volo.noun` | domain.transport | `imbarco` (boarding) |
| `zaino` | `zaino.noun` | domain.education | `bussola` (compass) |
| `valuta` | `valuta.noun` | domain.money | `assicurazione` (travel insurance) |
| `traghetto` | `traghetto.noun` | domain.transport | `funivia` (cable car) |
| `spiaggia` | `spiaggia.noun` | domain.nature | `sentiero` (trail/path) |
| `problema` | `problema.noun` | domain.work | `dilemma` |
| `domanda` | `domanda.noun` | domain.education | `quesito` (question/query) |
| `risposta` | `risposta.noun` | domain.education | `responso` (response/verdict) |
| `fine` | `fine.noun` | domain.time | `conclusione` |

A second-pass replacement candidate, `gemello`/`gemella` (twins), was also checked and found already staged (domain.family, batch 2) — rejected before use in favor of `coinquilino`/`coinquilina`.

Zero collisions remain (script-verified, final pass below).

## Validation run (final, programmatic, last step before this report)

- Re-parsed `noun-batch-4.json` from disk: 150 entries.
- Internal duplicate slugs: 0. Internal duplicate `EXEMPLIFIED.learning` sentences: 0. Internal duplicate `EXEMPLIFIED.known` sentences: 0.
- Cross-checked all 150 slugs + both example fields against the combined forbidden set (1472 slugs from 13 live word files + 5 sibling staged JSON batches): 0 collisions.
- Every `learning` noun appears verbatim (case-insensitive) inside its own `EXEMPLIFIED.learning` sentence: all 150 pass.
- Every entity has exactly one `word.lemma.*`, one `word.part-of-speech.noun`, one `word.number.singular`, one `proficiency.cefr.*`, one `domain.*`; gender symbol present on 146/150 (4 documented epicene exceptions); all symbol slugs verified against `dataset/symbols/structural.js` — none invented.
- `known` word (or one `/`-branch of it, ignoring `(fem.)`/`(transport)`-style parenthetical annotations) visible in its own `EXEMPLIFIED.known` sentence: all pass (a naive automated substring check flagged `amica`, `coinquilina`, `coincidenza` as false positives due to parenthetical annotations — manually confirmed the core word is present in each case).

No PII. No git/jj commands run. Only the staged JSON file and this report were written.
