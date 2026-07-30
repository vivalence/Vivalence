# Task report: Italian deep-verb spine (dare, dire, venire, potere, volere, dovere, sapere)

## What was added

Appended 7 entries (priorities 10-16) to the `VERBS` list in
`registry/education/topographies/english-to-italian/.harvest/build-verbs.py`,
in the required order: dare, dire, venire, potere, volere, dovere, sapere.

Suffix classification (per brief's explicit final instruction, overriding the
initial self-correction in the brief text):

| lemma | suffix | regularity |
|---|---|---|
| dare | are | irregular |
| dire | ere | irregular |
| venire | ire | irregular |
| potere | ere | irregular |
| volere | ere | irregular |
| dovere | ere | irregular |
| sapere | ere | irregular |

Each entry has 3 nonfinites (infinitive/gerund/participle), 5 tense tables of
6 cells each (present.indicative, imperfect.indicative, future.indicative,
conditional, present.subjunctive), and a tu-imperative for dare (`dai`), dire
(`di'`), venire (`vieni`), sapere (`sappi`).

Per the brief, potere/volere/dovere have **no natural tu-imperative** (modals
don't take commands pedagogically) — their entries omit the `"imperative"`
key entirely. The generator's imperative-emission block unconditionally did
`verb["imperative"]`, which would KeyError on a missing key, so I added
tolerance:

```python
if "imperative" in verb:
    learning, known, known_example, learning_example = verb["imperative"]
    word_entities.append(entity(...))
```

This is the only change to the generator's logic outside the appended data.

All 235 new example sentences (30 conjugated cells + 3 nonfinites + 1
imperative, ×7 verbs, minus 3 missing imperatives) were verified
programmatically before running the generator:
- unique among themselves (no internal duplicates)
- zero overlap against the existing corpus's 483 EXEMPLIFIED example strings
  (extracted from all 16 literal files under `dataset/literals/`)
- every conjugated/nonfinite form appears (case-insensitively, since
  sentence-initial capitalization is expected) inside its own Italian example

## Command outputs (verbatim)

### 1. build-verbs.py
```
verb literals +235 (total 541), bundles +35 (total 80)
```

### 2. rank.py
```
  ZERO-FREQ (RANKED dropped): dormire.verb.conditional.first.plural (dormiremmo)
  ZERO-FREQ (RANKED dropped): dormire.verb.conditional.second.plural (dormireste)
  ZERO-FREQ (RANKED dropped): dormire.verb.conditional.third.plural (dormirebbero)
  ZERO-FREQ (RANKED dropped): dormire.verb.subjunctive.present.second.plural (dormiate)
  ZERO-FREQ (RANKED dropped): finire.verb.indicative.imperfect.second.plural (finivate)
verb.js: 536 ranked
```
The 5 zero-freq drops are all pre-existing `dormire`/`finire` forms (priorities
5-6, not touched by this task) — wordfreq has no frequency data for those
surface forms. None of the 7 new lemmas triggered a zero-freq drop.

### 3. deno eval integrity check
```
literals: 798 slug-dupes: 0 example-dupes: 0 bundles: 80 unresolved: 0
```
All three metrics clean: 0 dupes, 0 unresolved.

## Forms I was less certain about (judgment calls, all verified against standard Italian grammar)

- **dire suffix = "ere"**: dire's infinitive literally ends in `-ire`, but the
  brief's explicit final instruction assigns it to the `-ere` group (likely
  because its paradigm behaves like an -ere verb from Latin *dicere*). Followed
  the brief literally.
- **tu-imperative form choice**: for dare/dire I used the convention already
  established by existing entries (`andare`→`vai`, `fare`→`fai`, i.e. the
  full `-ai` form rather than the apocopated `va'`/`fa'`), so dare uses `dai`.
  dire has no viable non-apocopated form (`dici` is not used as an imperative),
  so I used the mandatory apocopated `di'`, matching the brief's own example.
- **English glosses for imperfect/conditional of modals**: the criteria doc's
  convention table doesn't cover modal-specific imperfect wording. I used
  "I was able to" (potere imperfect) vs "I could" (potere conditional, per
  brief), "I wanted" (volere imperfect) vs "I would like" (volere conditional
  — `vorrei` idiomatically means "I would like", the standard A1 phrase, not
  the literal "I would want"), and "I had to" (dovere imperfect) vs "I should"
  (dovere conditional, per brief).

## Concerns

None outstanding. No git/jj commands were run. Only `build-verbs.py` was
edited directly; `dataset/literals/words/verb.js` and
`dataset/literals/conjugation.js` were touched only via the two mandated
script runs. No code comments were added. No PII anywhere.
