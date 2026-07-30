# Report: Italian adjective batch 3

Staged file: `/Users/finn/vivalence/code/vivalence/registry/education/topographies/english-to-italian/.harvest/staged/adjective-batch-3.json`

Total entities: 130 (`python3 -c "import json; print(len(json.load(open('<staged path>'))))"` → 130).

## Shape convention

Inspected the live `dataset/literals/words/adjective.js` (220 entities) and both sibling staged files first. Confirmed `adjective-batch-1.json` (120) and `adjective-batch-2.json` (100) are both **fully-integrated subsets of the live file** (0 slugs beyond the 220 already live) — the blocking set therefore reduces to the live file's 220 entries. Also confirmed live's majority slug/shape convention and matched it exactly:

- `traits: ["TRANSLATED", "EXEMPLIFIED"]` only — no `RANKED` (live has it, but both staged siblings omit it; RANKED is added at integration time, not staging time).
- Gendered pair: `<masc>.adjective.masculine.singular` + `<fem>.adjective.feminine.singular`, both carrying `word.lemma.<masc-form>`, `word.gender.{masculine,feminine}`, `word.number.singular`.
- Invariable (-e/-ista ending): `<word>.adjective`, no `word.gender.*` symbol, still carries `word.number.singular`.
- `known` for feminine = `<masc known> (fem.)`, per criteria doc.

## Family counts (130 total, verified programmatically against the brief's 40/25/30/35 split)

- emotions/character → `domain.mind` (character traits) + `domain.state` (emotional states): 40 (17 masc/fem pairs, 1 invariable `entusiasta`, 5 feminine-only gap-fills)
- taste/texture → `domain.food` (+ `domain.shape` for 2 gap-fills matching their masculine sibling's domain): 25 (10 pairs, 3 invariable, 2 feminine-only gap-fills)
- dimension → `domain.shape`: 30 (14 pairs, 2 invariable)
- condition/state → `domain.state`: 35 (17 pairs, 1 feminine-only gap-fill)

## Blocking-set findings (the brief's suggested words were checked one-by-one; several were already taken)

1. **Fully-taken, dropped outright**: `arrabbiato/arrabbiata` (emotions — already complete in live, brief listed it without flagging), `pieno/piena` and `vuoto/vuota` (condition — brief flagged these as "check," confirmed fully complete, dropped), `sottile` and `enorme` (dimension — brief listed them, both already complete invariables in live domain.shape, dropped), `sicuro` (a1 "sure/safe," masc-only in live but not brief-named so not gap-filled), `secco/secca`, `pulito/pulita`, `sporco/sporca` (all fully complete in live — discovered via automated learning-form check, substituted with fresh vocabulary: `speziato/speziata`, `aggiustato/aggiustata` + `carico/carica`).
2. **Masculine-only in live, brief explicitly named the word → added the missing feminine half only** (5 in emotions/character: `timida`, `orgogliosa`, `gelosa`, `coraggiosa`, `pigra`; 1 in condition/state: `sveglia` — matching the brief's own "sveglio is taken — check" flag; 2 in taste/texture: `morbida`, `dura`). Each gap-fill carries `word.lemma.<masculine-form>` pointing at the existing live entry and matches that sibling's exact `domain.*`/`proficiency.cefr.*` symbols. Did **not** opportunistically gap-fill masculine-only live words that weren't named in the brief (e.g. `generoso`, `occupato`, `affamato`, `sano`, `spaventato`, `confuso` are also masc-only in live domain.mind/domain.state — left untouched, out of scope).
3. **`minimo`** (dimension, "minimum") was brief-suggested but already live as masc-only a2/b1; not brief-flagged and not gap-filled — replaced with `grosso/grossa` and kept `massimo/massima` as the only "extremum" pair.
4. **Homograph non-issues (different POS, no slug collision, kept)**: `sorpresa`/`calma` exist as nouns (surprise/calm) — my `sorpreso.adjective.feminine.singular`("sorpresa") and `calmo/calma.adjective.*` are legitimate distinct-POS entities. `vestito` exists as a noun (dress) — my `vestito.adjective.masculine.singular` (dressed) is a distinct, valid adjectival use. `spesso` exists as an adverb (often) — my `spesso.adjective.masculine.singular` (thick) is the standard Italian adjective/adverb homograph, kept.

## Domain/CEFR judgment calls

- `domain.mind` = character traits, `domain.state` = transient emotional/physical states — this split matches live's own precedent exactly (`simpatico`→mind, `stanco`/`felice`→state), so "emotions/character" (one brief family) was split across both symbols rather than forced onto one.
- Taste/texture words tagged `domain.food` (no adjective in live currently uses this domain, but it's legal in `structural.js` and is the closest fit; no `domain.texture` symbol exists).
- CEFR: a2 for common everyday words, b1 for rarer/more nuanced ones, calibrated against live's own a2/b1 split for comparable-frequency character/dimension/condition adjectives (e.g. `robusto`/`agile`/`imponente` are b1 in live; `timido`/`coraggioso` are a2).
- `proficiency.survival` added only to `rotto/rotta`, `chiuso/chiusa`, `aperto/aperta` (practical day-one utility: broken items, open/closed signage) — everything else in this batch is abstract/descriptive vocabulary, not survival-tier, matching live's sparse (~25%) survival-tag density.

## Validation run (all passed)

```
Entity count: 130
Family split: emotions/character 40, taste/texture 25, dimension 30, condition/state 35 (sums to 130)
Slug collisions vs live adjective.js + all .harvest/staged/*.json siblings: none
Duplicate slugs within file: none
Duplicate EXEMPLIFIED learning sentences within file: none
learning form appears verbatim in its own EXEMPLIFIED learning sentence: 130/130
known field contains no Italian diacritics: 130/130
known != learning for every entry: 130/130
learning is lowercase for every entry: 130/130
word.gender.* present iff slug carries .masculine./.feminine.: 130/130 consistent
No masculine article ("Il"/"Lo") on a feminine-slug example, no "La" on a masculine-slug example: 130/130 clean
Every domain.*/proficiency.* symbol used exists in dataset/symbols/structural.js: confirmed (domain.mind, domain.state, domain.food, domain.shape; proficiency.cefr.a2, proficiency.cefr.b1)
```

(`verbs-present-2.json` in the staged sibling directory uses a different, non-literal paradigm-bundle shape — skipped by the entity parser as expected, not an adjective/noun/verb literal file.)

## Concerns

None blocking. Two soft notes for review:
1. `massimo/massima` ("maximum") and `medio/media` ("medium") are used predicatively (`Il punteggio è massimo`, `Il livello è medio`) rather than the more idiomatic attributive noun-phrase form (`il punteggio massimo`) — grammatically valid Italian but slightly less natural than the rest of the batch; flagging in case a stricter register is wanted.
2. Six feminine-only gap-fill entities (`timida`, `orgogliosa`, `gelosa`, `coraggiosa`, `pigra`, `sveglia`, plus `morbida`/`dura` for taste/texture — 8 total) reference `word.lemma.<masculine-form>` where the masculine entity lives in the **already-integrated live file**, not in this staged batch. This is the same cross-file lemma pattern live itself uses for every gendered pair, so it should integrate cleanly, but noting it explicitly since batch-2's report documented deliberately avoiding this pattern for a different reason (keeping batch-2 disjoint from batch-1) — here the brief's own wording ("sveglio is taken — check") invited exactly this completion.
