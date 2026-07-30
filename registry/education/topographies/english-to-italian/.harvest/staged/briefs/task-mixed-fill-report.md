# Report: mixed closed-class fill

## Output
`.harvest/staged/mixed-fill.json` — 90 entities.

| family | count | slug suffix |
|---|---|---|
| months | 12 | `.noun` |
| seasons | 4 | `.noun` |
| interjections-2 | 15 | `.interjection` |
| adverb-3 | 35 | `.adverb` |
| determiners-2/quantifiers | 24 | `.determiner` |

## Blocking-set process
Grepped all 90 candidate lemmas against `dataset/literals/words/*.js`, `dataset/literals/sentences.js`, and every `.harvest/staged/*.json` before writing, then re-verified exact-slug uniqueness against the same set after writing.

Substitutions forced by the blocking set:
- **davvero** — already live as `davvero.adverb`. Per brief's own check, excluded from interjections-2 and replaced with **peccato** (what a pity) to hold the count at 15.
- **lentamente** — already live as `lentamente.adverb`. Excluded from adverb-3; list filled from the B1 `-mente`/`-amente` family instead (personalmente, evidentemente, letteralmente, correttamente, gentilmente, seriamente, inizialmente, immediatamente, precedentemente, attualmente, momentaneamente, difficilmente, pazientemente, nervosamente, allegramente, tristemente, timidamente, coraggiosamente, elegantemente, lievemente, fermamente, decisamente, apertamente, segretamente, volontariamente, deliberatamente, accuratamente, precisamente, esclusivamente, sostanzialmente, effettivamente, realmente, sinceramente, onestamente, francamente).
- 21 of the 26 brief-named adverb-3 words (attentamente, perfettamente, completamente, particolarmente, praticamente, naturalmente, normalmente, assolutamente, chiaramente, rapidamente, frequentemente, recentemente, ultimamente, successivamente) turned out already live — all excluded.
- `aiuto` (interjection) and `dai` (interjection) share a lemma with an existing `aiuto.noun` and `dai.contraction` respectively — not a collision (different POS suffix, same precedent as live `ecco.interjection`/`ecco.adverb` and `lo.determiner`/`lo.pronoun` coexisting).

## Conventions followed
- Noun shape (months/seasons) mirrors `mese.noun`/`lunedì.noun`/`pioggia.noun`: gender + number.singular + cefr + domain. `domain.month` and `domain.weather` are both pre-declared in `structural.js` (weather's own description names "seasons" explicitly).
- Interjection shape mirrors `ciao`/`grazie`/`ecco`: every entry closes with `domain.social` per the 100%-consistent live pattern.
- Adverb shape mirrors the B1 `-mente` cohort (`attentamente`, `gradualmente`, etc.): `cefr.b1`, functional tag only where an existing sibling adverb carries one (time/degree/intensifier/discourse), otherwise none.
- Determiner shape mirrors `il`/`un`/`una`: gender (where marked) + number + cefr + `functional.number` (a2 for the core quantifiers, b1 for parecchi/ciascuno/entrambi/diversi and their pairs).
- Staged-file convention matched exactly against sibling files in this directory: `traits: ["TRANSLATED","EXEMPLIFIED"]` only, **no RANKED trait** — every existing `.harvest/staged/*.json` in this kernel omits RANKED at staging time (added at merge), unlike the live `words/*.js` shape shown in the corpus-quality-criteria doc.

## Verification
Scripted pass confirmed for all 90 entities: no duplicate slugs (in-file and against the full live+staged blocking set), no duplicate example pairs, `learning` always lowercase, `known` ≠ `learning`, the `learning` form appears in its own Italian example (case-insensitive), and every `proficiency.*`/`functional.*`/`domain.*` symbol used exists in `dataset/symbols/structural.js`.

## Concerns
- **Count mismatch**: the brief's title states "110 literals" but the itemized breakdown in "The work" (12 + 4 + 15 + 35 + 24) sums to 90, and no "misc" bucket is itemized anywhere in the body despite being named in the title. Built exactly the itemized 90; did not invent an undefined misc category to pad to 110.
- Gender/number symbols on `ogni`/`qualche` are `word.number.singular` only, no `word.gender.*` — both are grammatically invariant quantifiers (govern a singular noun regardless of its gender), matching how `tutto.pronoun` and similar invariants carry no gender symbol live.
