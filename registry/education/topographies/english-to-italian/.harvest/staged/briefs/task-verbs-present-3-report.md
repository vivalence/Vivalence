# Report: Italian present-only verbs, set 3

Staged: `/Users/finn/vivalence/code/vivalence/registry/education/topographies/english-to-italian/.harvest/staged/verbs-present-3.json` — 50 lemmas, exactly the brief's list, in brief order. 8 rows each (infinitive + participle + 6 present cells) = 400 rows, 400 unique English examples, 400 unique Italian examples.

## Method

1. Rebuilt the example-uniqueness blocking set once, up front, from `dataset/literals/words/*.js` (EXEMPLIFIED known/learning), `dataset/literals/sentences.js` (495 sentence entries), and every `.harvest/staged/*.json` sibling including `verbs-present-2.json` — 5644 normalized strings total.
2. Hand-composed all 50 lemma objects (three data-only Python files, no procedural text generation) against `build-present-verbs.py`'s schema and the `corpus-quality-criteria.md` verb conventions.
3. One assembly + verification script: schema shape, present-array length 6, row length 4, lowercase `learning`, `known != learning`, whole-word substring check of `learning` inside its Italian example, ASCII-only known/English fields, internal duplicate check (400/400 unique), and re-verification against the full blocking set (0 collisions). Wrote the file only after all checks passed clean.
4. Live-lemma overlap: none of the 50 lemmas exist among the already-merged `verb.js` lemmas.

## Classification notes / traps (per brief)

- `tradurre`: suffix `ere`, `irregular` — traduco/traduci/traduce/traduciamo/traducete/traducono, participle `tradotto`.
- `riuscire`: conjugates like `uscire` — riesco/riesci/riesce/riusciamo/riuscite/riescono, `irregular`.
- `morire`: muoio/muori/muore/moriamo/morite/muoiono, participle `morto`, `irregular`.
- `appartenere`: conjugates like `tenere` — appartengo/appartieni/appartiene/apparteniamo/appartenete/appartengono, `irregular`; participle `appartenuto` (regular pattern).
- `nascere`, `piangere`, `ridere`, `sorridere`, `crescere`, `dividere`, `spendere`, `nascondere`, `scoprire`, `descrivere`, `discutere`, `promettere`, `permettere`, `correggere`: present tense follows the fully regular `-ere`/`-ere` pattern → classified `regular`, even though several have irregular past participles (nato, pianto, riso, sorriso, cresciuto, diviso, speso, nascosto, scoperto, descritto, discusso, promesso, permesso, corretto). Regularity is scored on the present paradigm only, matching set-2's precedent (decidere/rispondere/rompere/vincere etc.).
- `-isc-` verbs (regular): `diminuire`, `unire`, `dimagrire`, `restituire`, `suggerire`, `proibire`.
- `mentire`: non-`isc` `-ire` (mento/menti/mente/mentiamo/mentite/mentono) — still `regular`.

## Judgment calls

- `nascere`/`morire` present tense: real Italian rarely narrates a single specific birth/death in simple present (that's passato prossimo territory). Used consistent narrative/generic framing across all 6 cells instead — autobiographical narration, game-context, aphorism ("Nasciamo tutti uguali"), story-narration — rather than mixing registers cell-to-cell.
- `invecchiare`: English gloss shifts between "get old" (people) and "ages" (cheese, photographs) across cells — same underlying sense, idiomatic English split by animacy, not a meaning-drift.
- Several `-are` infinitives that would otherwise attach a clitic pronoun (sposare, augurare, consigliare, obbligare) were given non-clitic example constructions so the bare infinitive form appears intact in the Italian example (a clitic-suffixed infinitive like `augurarti` does not contain the literal substring `augurare`).
- Past participles of `essere`-auxiliary verbs (migliorare, aumentare, nascere, morire, crescere, invecchiare, dimagrire, ingrassare, riuscire, appartenere) were each given a masculine-singular subject so the participle example matches the entity's invariant `learning` form exactly; where a verb is more natural transitively with `avere` (peggiorare, diminuire, dividere, unire), used that instead.
- `sposare` 1sg/1pl/2pl/3pl present-tense examples use a registrar/officiant framing ("we marry many couples") since plain transitive `sposare` (not reflexive `sposarsi`) is otherwise awkward for a non-third-party subject.

## Verification results

- 50/50 entries, all `present` arrays length 6, all rows length 4.
- 400/400 known examples unique internally; 400/400 Italian examples unique internally.
- 0 collisions against the rebuilt cross-corpus blocking set (live dataset + all sibling staged files).
- 0 non-ASCII leaks into known/English fields; 0 `learning == known`; all `learning` fields lowercase.
- All target trap forms (tradurre, riuscire, morire, appartenere, nascere-participle, piangere/ridere/sorridere-participle, crescere-participle, dimagrire/suggerire/proibire -isc-, mentire non-isc) spot-verified programmatically against the brief's exact forms.

## Concerns

None blocking. Flagging for reviewer attention (consistent with prior review style): the `nascere`/`morire` narrative-present framing and the `invecchiare` get-old/ages split, both explained above as deliberate, consistent choices rather than errors.
