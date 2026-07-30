# Review: Italian noun batch 4 — mind · relationship · entertainment · travel · state/abstract

Adversarial review of `.harvest/staged/noun-batch-4.json` against the brief, the corpus quality criteria, `dataset/symbols/structural.js`, and cross-dupe targets (`dataset/literals/words/*.js` + all sibling `.harvest/staged/*.json`).

## Mechanical checks (all scripted, all pass)

- JSON parses: 150 entities, confirmed.
- Domain split exact match to brief: `domain.mind` 30 · `domain.relationship` 25 · `domain.entertainment` 30 · `domain.travel` 35 · `domain.state` 30.
- Gender: masculine 74 / feminine 72, 4 documented epicene (`ospite`, `conoscente`, `cantante`, `turista`) with zero gender symbol — matches report, no undocumented omissions, no entity with >1 gender symbol.
- CEFR: a1 64 / a2 68 / b1 18, exactly one `proficiency.cefr.*` per entity.
- Every symbol slug legal against `dataset/symbols/structural.js` (static + `word`/`word.lemma.*`/`word.part-of-speech.*`/`word.gender.*`/`word.number.*` dynamic families) — 0 invented slugs.
- Every entity has exactly one `word.lemma.*` and its suffix equals `TRANSLATED.learning` exactly — 0 mismatches.
- 0 internal duplicate slugs, 0 internal duplicate `EXEMPLIFIED.learning`, 0 internal duplicate `EXEMPLIFIED.known`.
- Cross-checked all 150 slugs + both example fields against combined live (`dataset/literals/words/*.js`, 13 parseable files, 1392 slugs) and sibling-staged (5 other `.harvest/staged/*.json`, 750 slugs) sets — 0 slug collisions, 0 example collisions (learning or known) in either direction.
- `learning` appears verbatim (case-insensitive) in its own `EXEMPLIFIED.learning` sentence — 150/150 pass.
- `traits` array is exactly `["TRANSLATED","EXEMPLIFIED"]` and `trait` keys match, for all 150 — no stray RANKED/VOCALIZED/ANNOTATED.
- No uppercase-leaking `learning` values.
- `known == learning` only for documented cognates/loanwords: `nostalgia`, `orchestra`, `idea`, `dilemma` (true cognates) and `hobby`, `souvenir`, `resort` (unassimilated loanwords) — matches the report's own list exactly, 0 undocumented matches.
- No stray Italian diacritics in `known` fields (the `é` in `fiancé`/`fiancée` is a legitimate English loanword spelling, not Italian leakage — not a defect).

## Linguistic adversarial review (native-Italian pass)

Gender-trap coverage is strong and correct:
- Greek-origin `-ma` masculine class: `programma`, `tema`, `dilemma`, `cinema` all correctly masculine (the requested `il cinema` trap and the `il problema`-class family, via substitutes since `problema` itself collided with an existing live entity).
- `-tà` invariable feminine: `verità`, `realtà`, `possibilità`, `necessità`, `felicità`, `curiosità` — all correct (the requested `la città`/`la difficoltà` class, via different exemplars).
- Augmentative gender flip: `borsone` (from feminine `borsa`) correctly masculine.
- `-e`-ending case-by-case: `parte` correctly feminine.
- `s`-impura article agreement spot-checked across every masculine s+consonant word present (`sposo`→"Lo sposo", `spettacolo`→"Lo spettacolo", `stadio`→"Lo stadio", `scalo`→"uno scalo") — all correct; vowel-elision (`l'`/`un'`) spot-checked across every vowel-initial noun present — all correct.
- **Not represented at all**: the `mano`-class (feminine nouns ending in `-o`: `mano`, `foto`, `moto`, `radio`) named in this review's own checklist. Not a violation — the brief didn't mandate it and no batch-4 word needed it — but a coverage gap worth flagging for a future batch (Minor, noted below).

## Critical

None found.

## Important

1. **`paura.noun` — unfaithful EXEMPLIFIED translation.** `known`: "My fear of the dark is irrational" / `learning`: "Ho paura del buio". The Italian sentence means "I am afraid of the dark" (idiomatic `avere paura di` = "to be afraid of") — it contains no content corresponding to "is irrational." The English gloss fabricates a clause that isn't in the Italian, misrepresenting what the example sentence actually says. This is the one entity in the batch that fails the "faithful English" adversarial check. Fix: either translate literally ("I am afraid of the dark" / "My fear of the dark") or rewrite the Italian to match the embellished English (e.g., "La mia paura del buio è irrazionale").

## Minor

1. **`gioco.noun` example reads narrowly as a gambling/slot-machine-restriction sentence** ("Il gioco è vietato ai minori di diciotto anni" / "The game is forbidden to minors under eighteen") without disambiguating language (no `d'azzardo`). This is realistic Italian (age-restriction signage in bars), but for an A1 entry teaching the generic word "game," it risks implying that meaning is age-gated. Consider a more general first-exposure sentence for the base word.
2. **`quesito.noun`** — `known` "tricky query" vs. `learning`'s "complicato" ("complicated"); close synonyms, minor lexical drift rather than a fidelity break.
3. **Report's `-one` gender commentary is imprecise.** It frames `opinione`/`conclusione` as "exceptions to the usually-masculine `-one` ending," but the operative Italian rule is that the `-zione`/`-sione`/`-gione` suffix family is reliably feminine (a narrower, different rule than bare `-one`, which is masculine mainly for simple non-suffixed nouns like `pallone`/`bastone` and augmentatives). The data itself is correct — `decisione`, `situazione`, `condizione` in this same batch are all correctly feminine but weren't folded into the documented pattern — this is a report-wording nitpick, not a JSON defect.
4. **Report's "`-tà`/`-anza`/`-enza` invariable feminine" grouping conflates two rules.** Only `-tà` nouns are truly invariable (identical singular/plural form, e.g. `la città`/`le città`); `-anza`/`-enza` nouns (`importanza`, `differenza`) are regular feminine nouns that pluralize normally (`importanze`, `differenze`). All genders in the JSON are correct; wording only.
5. A few B1/A2 example sentences reach for literary passato remoto (`si diffuse` in `panico`, `lo avvolse` in `malinconia`, `fu commovente` in `riconciliazione`) rather than the compound passato prossimo a learner at that level would produce. Grammatically correct, just stylistically advanced relative to the assigned proficiency tags.
6. `mano`-class feminine `-o` nouns (see adversarial coverage note above) — no example present in this batch; flagged for future-batch awareness only.

## Verdict inputs

- Spec compliance: 100% (count, split, symbols, dedup, shape all mechanically verified).
- Quality: 1 Important (isolated, single-entity, easily patched), 6 Minor (mostly documentation-wording nitpicks plus two stylistic/naturalness notes); 0 Critical.
