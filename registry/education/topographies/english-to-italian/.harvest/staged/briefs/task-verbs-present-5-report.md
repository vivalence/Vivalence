# Report: verbs-present-5.json

Staged 55 distinct present-tense Italian verb lemmas at `.harvest/staged/verbs-present-5.json`, band `b1`, schema identical to sets 1-4.

## -check substitutions

6 of the 55 brief lemmas were flagged `-check` and confirmed taken (present in `dataset/literals/words/verb.js` and/or an earlier staged `verbs-present-*.json`). Each was substituted with a fresh regular B1 verb of matching suffix class, documented here:

| brief lemma (flagged) | status | substitute | suffix |
|---|---|---|---|
| ordinare-check | taken | affittare (to rent) | are |
| peggiorare-check | taken | rallentare (to slow down) | are |
| permettere-check | taken | rendere (to render/make) | ere |
| prestare-check | taken | rinunciare (to give up) | are |
| restituire-check | taken | punire (to punish) | ire |
| ricevere-check | taken | cedere (to give in/yield) | ere |

All 49 non-flagged brief lemmas were verified fresh (not present in live or staged corpus) and used as-is.

## Irregular pattern application

- `produrre`/`ridurre` (-urre): suffix `ere`, regularity `irregular`; produco/prodotto, riduco/ridotto.
- `opporre`/`proporre` (-orre): suffix `ere`, regularity `irregular`; oppongo/opposto, propongo/proposto. Conjugated as non-reflexive transitive (`opporre resistenza/un rifiuto/un'obiezione a qualcosa`), consistent across all 6 present cells.
- `ottenere`: tenere-pattern, suffix `ere` irregular; ottengo...ottengono, participle ottenuto.
- `possedere`: sedere-pattern, suffix `ere` irregular; possiedo...possiedono, participle posseduto.
- `scomparire`: comparire-pattern, suffix `ire` irregular; scompaio...scompaiono, participle scomparso.
- `obbedire`, `riunire`: -isc- infix confirmed (obbedisco, riunisco), suffix `ire` regularity `regular`.
- `riempire`: confirmed NOT -isc- (riempio, not riempisco); present deviates from the mechanical dorm-o/dorm-ono pattern (inserted stem vowel: riempio/riempiono), so classified suffix `ire` regularity `irregular`.
- `piovere`: impersonal verb, 3rd-singular cell uses natural impersonal English ("it rains"); all 6 present cells authored using the figurative "piovere addosso" (to rain down on someone) sense so every person/number has a natural, non-degenerate sentence.

## Verification performed

- Blocking sets built programmatically before authoring: union of lemmas in `dataset/literals/words/verb.js` (177) and all `.harvest/staged/verbs-present-*.json` (1-3 at start of task); confirmed all 6 `-check` lemmas were indeed collisions, all 49 plain lemmas were clear.
- Mid-task, a sibling's `verbs-present-4.json` appeared in `.harvest/staged/`. Final re-verification re-ran the blocking-set query including it (blocked-lemma total rose to 232) — zero lemma collisions between my 55 and verbs-present-4's set.
- All 440 examples (55 lemmas x 8 cells: infinitive + participle + 6 present) checked programmatically: each Italian (`learning`) example is unique within this file, unique against the entire existing corpus (`dataset/literals/words/*.js`, `dataset/literals/sentences.js`) and against every other staged batch including verbs-present-4.json (5,314-sentence pool checked against, zero collisions).
- Every entity's conjugated/infinitive/participle form confirmed present verbatim in its Italian example sentence.
- English `known` field conventions checked against `corpus-quality-criteria.md` (to X / I X / you X / he-she X(s) / we X / you all X / they X, impersonal "it rains" exception for piovere.3sg), and cross-checked that the known verb phrase's root appears in the English example.
- No comments, no PII, no git/jj commands used; only the staged JSON file and this report were written.

## Status

STATUS: complete
Count: 55 distinct fresh lemmas staged (440 unique examples)
Concerns: none — all verification passes clean, including the late-arriving verbs-present-4.json collision check.
