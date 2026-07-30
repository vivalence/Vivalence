# Review: Italian deep-verb spine (dare, dire, venire, potere, volere, dovere, sapere)

## Method

Every one of the 7 verbs' 3 nonfinites + 30 conjugated cells (5 tenses × 6
persons) + imperative (where present) was checked by hand against standard
Italian morphology, cross-referenced against the spec's exact expected forms.
In addition, ran independent read-only verification against the actual
generated `dataset/literals/words/verb.js` (541 entries) and
`dataset/literals/conjugation.js` (80 bundles):

- entity counts per lemma: dare/dire/venire/sapere = 34 (3 nonfinite + 30 + 1
  imperative), potere/volere/dovere = 33 (no imperative) — all match spec
- 0 missing-form cells (every `learning` string appears in its own
  `EXEMPLIFIED.learning` example)
- 0 uppercase-learning violations, 0 known==learning violations
- 0 duplicate slugs among the new entries
- 0 duplicate `EXEMPLIFIED.learning` example strings across the **entire**
  798-word corpus
- 0 orphan refs (every `CONJUGATED` bundle cell + infinitive resolves to a
  real word literal)
- all 7×5 tense/mood bundles present
- grepped the 7-verb source block for stray acute accents (á í ó ú) — none
  found; all grave accents (à è ì ò ù) verified correct by hand (dà, darà,
  dirà, verrà, potrà, vorrà, dovrà, saprà, così, è, etc.)

Every single conjugated form for all 7 verbs matches standard Italian
morphology **exactly** — no morphological errors found anywhere in the 231
new word-form cells. The issues below are metadata/taxonomy and pedagogical
selections, not conjugation errors.

## Critical

None.

## Important

### 1. `dire` suffix misclassified as `"ere"` — should be `"ire"`

`build-verbs.py:526` — `"lemma": "dire", "suffix": "ere", ...`

`dire`'s infinitive literally ends in `-ire`. `venire` (priority 12, same
`-ire` ending) is correctly tagged `"suffix": "ire"` two entries later — the
corpus now has two `-ire`-ending verbs classified into different suffix
buckets. This isn't a typo in isolation; it propagates the `word.suffix.ere`
symbol onto all 34 `dire` word literals and all 5 `dire` CONJUGATED bundles
(verified live in `dataset/literals/words/verb.js` —
`dire.verb.infinitive` carries `word.suffix.ere`). Per
`corpus-quality-criteria.md` ("Verb-specific requirements"): "`word.suffix`
... enables filtering exercises by conjugation class." Any exercise that
filters "-ire verbs" will silently miss `dire`; any exercise filtering
"-ere verbs" will wrongly include it.

The brief's text on this point is genuinely self-contradictory ("ire" for
dire, then "NO", then "ere" for dire) — the implementer followed the brief's
explicit final instruction, but that instruction is linguistically wrong.
**Wrong → right**: `dire.suffix` should be `"ire"`, not `"ere"`.

### 2. RANKED-trait corruption on `dire.verb.imperative.second.singular` (`di'`)

Live value in `dataset/literals/words/verb.js`:
```
"RANKED": { "rank": 0, "zipf": 7.59, "fpm": 38900.0 }
```
Independently confirmed via wordfreq:
```
zipf_frequency("di'", 'it') == zipf_frequency('di', 'it') == 7.59
```
`wordfreq` strips/normalizes the trailing apostrophe and looks up `"di'"`
as if it were the preposition `"di"` — one of the ~20 most common words in
Italian (fpm 38900). Meanwhile `rank.py`'s own `top_n_list` lookup
(`top.get(learning.lower(), 0)`) does NOT find `"di'"` as a token, so it
falls back to `rank: 0`. The result is an internally contradictory entity:
`rank` says "not found / effectively unranked" while `zipf`/`fpm` claim
top-frequency status. Every other cell across all 7 verbs has coherent
rank/zipf/fpm (independently spot-checked all 231 new entries — this is the
only anomaly). This is exactly the class of failure the criteria doc's
"Known failure mode" section warns about, just via a different mechanism
(apostrophe-elision collision rather than lemma-copying).

**Wrong → right**: `di'`'s RANKED trait (currently `rank:0, zipf:7.59,
fpm:38900`) needs a real per-form lookup or a documented override — not the
raw wordfreq value, which silently matches the wrong lexical item.

### 3. `dovere.verb.subjunctive.present.first.plural` example uses a non-subjunctive trigger

`build-verbs.py:771`:
```python
("dobbiamo", "(that) we must", "It is clear that we must change strategy", "È chiaro che dobbiamo cambiare strategia"),
```
`è chiaro che` ("it is clear that") is a certainty expression and takes the
**indicative** in standard Italian — the same category as `è vero che`, `è
ovvio che`, `è certo che`. It does not trigger the subjunctive. Contrast with
every other subjunctive-cell trigger across all 7 verbs and all 6 persons
(42 cells total), which are uniformly correct: `vuole che`, `spero che`,
`è importante che`, `è necessario che`, `è meglio che`, `dubito che`,
`sembra che`, `non penso che`, `pensano che` — all genuine subjunctive
triggers. This is the single exception.

The defect is invisible at the surface-form level only because `dovere`'s
1st-plural present indicative and present subjunctive are genuinely
syncretic (`dobbiamo` = `dobbiamo` in both moods) — the conjugated word
itself is still 100% correct. But the example sentence teaches the wrong
grammar rule: a learner reading this card would infer "è chiaro che" pairs
with subjunctive, which is false, and grading this cell can never actually
distinguish "did the learner know this needs subjunctive" since the
indicative answer is identical.

**Wrong → right**: swap the trigger to a genuine subjunctive-demanding
context, e.g. `"È necessario che dobbiamo cambiare strategia"` / "It is
necessary that we must change strategy" (matches the pattern already used
correctly for `sapere`'s 1pl subjunctive cell), or any of the other
already-validated trigger phrases used elsewhere in this same batch.

## Minor

### 1. `potere.verb.infinitive` known gloss mixes infinitive and finite wording

`build-verbs.py:630` — `"to be able to / can"`. The convention table pattern
for infinitives is `to [verb]`. "to be able to" fits; "can" does not — "can"
is a finite modal form, not an infinitive, so "to ... / can" is an internal
category mismatch (unlike `fare`'s precedent "to do / to make", where both
halves are genuine infinitives). Not incorrect as a gloss of meaning, just
inconsistent with the stated convention. Low impact, cosmetic.

## Not flagged (checked, found correct)

- All 5×6 conjugated cells for all 7 verbs match standard Italian exactly,
  including the spec's explicit reference forms (dare: do/dai/dà/diamo/
  date/danno, davo…, darò…, darei…, dia×3/diamo/diate/diano; dire: dico…,
  dicevo…, dirò…, direi…, dica×3/diciamo/diciate/dicano; venire: vengo/
  vieni/viene/veniamo/venite/vengono, venivo…, verrò…, verrei…, venga×3/
  veniamo/veniate/vengano; potere: posso/puoi/può/possiamo/potete/possono,
  potevo…, potrò…, potrei…, possa×3/possiamo/possiate/possano; volere:
  voglio/vuoi/vuole/vogliamo/volete/vogliono, volevo…, vorrò…, vorrei…,
  voglia×3/vogliamo/vogliate/vogliano; dovere: devo/devi/deve/dobbiamo/
  dovete/devono, dovevo…, dovrò…, dovrei…, debba×3/dobbiamo/dobbiate/
  debbano — consistently `debba`, never mixed with `deva`; sapere: so/sai/
  sa/sappiamo/sapete/sanno, sapevo…, saprò…, saprei…, sappia×3/sappiamo/
  sappiate/sappiano).
- Imperative choices (dai, di', vieni, sappi) are all standard; `dai` for
  `dare` matches the corpus's existing precedent for the same class of verb
  (`andare`→`vai`, `fare`→`fai`).
- potere/volere/dovere correctly omit `imperative` entirely; the generator's
  tolerance (`if "imperative" in verb:` at line 905) is clean — no comments,
  no dead code, matches the report's description exactly.
- All auxiliary-verb selections in participle examples are correct (dare/
  dire/potere/dovere → avere; venire → essere).
- All `se` + imperfect-subjunctive + conditional constructions (venire) are
  grammatically correct standard periodo ipotetico.
- Modal English glosses read naturally and match the brief: potere "I can" /
  "I could"; volere "I want" / "I would like"; dovere "I must" / "I should".
- Person/number pronoun conventions ("I", "you", "he/she/it", "we", "you
  all", "they") are applied consistently and match the pre-existing
  corpus's own convention (including the established "it" inclusion/omission
  split between present/future/conditional vs. imperfect, which mirrors
  `avere`'s existing precedent).
- Zero encoding issues: no stray acute accents where grave is required, `di'`
  uses a genuine apostrophe (not a grave-accented `dì`).
