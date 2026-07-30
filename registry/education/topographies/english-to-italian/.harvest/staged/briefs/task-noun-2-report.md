# Report: Italian noun batch 2 — staged

Output: `registry/education/topographies/english-to-italian/.harvest/staged/noun-batch-2.json`

150 entities, valid JSON (`python3 -c "import json; print(len(json.load(open('<path>'))))"` → `150`).

## Domain counts

| domain | count | masculine | feminine | epicene | a1 | a2 | survival |
|---|---|---|---|---|---|---|---|
| body | 30 | 20 | 10 | 0 | 19 | 11 | 0 |
| family | 30 | 14 | 13 | 3 (nipote, genitore, parente) | 15 | 15 | 0 |
| clothing | 25 | 12 | 13 | 0 | 11 | 14 | 1 (taglia) |
| work | 35 | 22 | 10 | 3 (insegnante, collega, cliente) | 14 | 21 | 1 (medico) |
| health | 30 | 7 | 21 | 2 (paziente, farmacista) | 9 | 21 | 5 |
| **total** | **150** | **75** | **67** | **8** | **68** | **82** | **7** |

Split matches the brief's requested 30/30/25/35/30. Every entry carries exactly one CEFR band (a1 or a2, columns partition each domain fully); `survival` is an additional tag layered on top (e.g. `taglia` is a1+survival), not a separate band.

## Verification performed (programmatic)

- Parsed every live `dataset/literals/words/*.js` file (13 files; `index.js` skipped as a barrel, not entity data) plus both sibling staged batches (`noun-batch-1.json`, `adjective-batch-1.json`) into a combined forbidden-set of 988 slugs and 987 example sentences.
- Checked all 150 new slugs against that set: zero collisions.
- Checked all 150 new example sentences against that set: zero collisions.
- Checked internal uniqueness: 150/150 unique lemmas, slugs, learning sentences, known sentences.
- Checked every `learning` noun (accent/case-insensitive) is a substring of its own `EXEMPLIFIED.learning` sentence: all pass.
- Checked every `TRANSLATED.known` (or one slash-branch of it) appears in its own `EXEMPLIFIED.known` sentence: all pass.
- All symbols (`domain.*`, `proficiency.*`) cross-checked against `dataset/symbols/structural.js` — nothing invented.

## Collision avoidance vs. the brief's example words

The brief's illustrative word lists for health (`farmacia, ospedale`) and work (`ufficio`) collide with lemmas already staged in `noun-batch-1.json` (`ospedale.noun`, `farmacia.noun`, `ufficio.noun` all exist there, tagged domain.city/domain.work respectively). Per the hard dupe-check law, these exact lemmas were not reused:
- health: substituted `farmacista` (pharmacist, distinct lemma) for the pharmacy-building concept; substituted `infermeria` (infirmary) and `ambulanza` for the hospital-building concept.
- work: substituted `sede` (headquarters/office) for the generic-office concept; substituted `salario` for `stipendio` (also taken) and `turno` for the desk/`scrivania` concept (also taken).

## Judgment calls

- **Gender traps honored**: `mano` (feminine, -o ending), `problema` (masculine, -a ending, Greek-derived) both tagged correctly per the brief's explicit callout.
- **Epicene nouns** (no `word.gender` symbol, matching the `conducente`/`estudiante` precedent from batch 1): `insegnante`, `collega`, `cliente`, `nipote`, `genitore`, `parente`, `paziente`, `farmacista`.
- **High-value gendered pairs added sparingly** (per brief guidance, not exhaustively): `infermiere/infermiera` (regular -e/-a), `direttore/direttrice` (irregular -tore/-trice, high pedagogical value), `dottore/dottoressa` (the exact pair named in the brief). Other professions (`medico`, `avvocato`, `ingegnere`, `cuoco`, `operaio`, `commesso`, `segretario`) kept masculine-citation-only.
- **Italian kinship-noun article-drop rule applied**: singular unmodified family nouns drop the definite article after a possessive (`Mio cugino`, `Mia suocera`, not `Il mio cugino`/`La mia suocera`) — audited and corrected across all 30 family entries. `famiglia` keeps its article (not on the exception list); `bambino/bambina` keep articles (not true kinship terms).
- **Multiple-meaning `known` fields** (via `/`, matching documented convention): `polso` → "wrist / pulse", `costume` → "swimsuit / costume", `ricetta` → "prescription / recipe", `visita` → "checkup / visit", `cura` → "cure / treatment", `sede` → "headquarters / office", `curriculum` → "resume / CV", `nipote` → "nephew / grandson", `matrimonio` → "wedding / marriage", `borsa` → "bag / purse", `impiegato` → "clerk / employee", `direttrice` → "principal / director (fem.)".
- **Idiom vs. lemma translation caught and fixed during drafting**: `testa`'s `TRANSLATED.known` was initially drafted as "headache" (translating the idiom `mal di testa` used in the example) instead of "head" (the actual word). Fixed before writing — `known` now correctly reads "head"; the example sentence (`Ho mal di testa` / "I have a headache") is kept since "head" is legitimately contained in "headache."
- **Survival tagging** (7/150): reserved for genuinely transactional/emergency health-and-work items — `medico`, `febbre`, `dolore`, `raffreddore`, `farmacista`, `ambulanza` (need-a-doctor/emergency cluster) and `taglia` (asking for clothing size while shopping). Body, family, and the rest of clothing/work/health are informational A1/A2 vocabulary, not day-one transactional, per the survival-vs-A1 boundary in the criteria doc.
- **RANKED and VOCALIZED omitted** per brief (same as batch 1 — injected later; audio not yet recorded).

No PII. No git/jj commands run. Only the staged JSON file and this report were written.
