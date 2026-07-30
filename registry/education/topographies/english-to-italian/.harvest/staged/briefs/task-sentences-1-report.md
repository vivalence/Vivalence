# Report: task-sentences-1 (255 authored Italian sentences)

## Method

Built the allowed-form set programmatically before writing any sentence:

1. Parsed every `dataset/literals/words/*.js` file (14 files, 2350 word literals across adjective/adposition/adverb/contraction/coordinating-conjunction/determiner/interjection/noun/numeral/particle/pronoun/subordinating-conjunction/verb) and collected every `trait.TRANSLATED.learning` value, lowercased, into a base vocabulary set.
2. Extended the checker with elision-normalization rules per the brief: `l'`+X, `un'`+X, `dell'/all'/dall'/nell'/sull'`+X (valid if X is in the base set), `po'` (maps to `poco`), `c'è` (maps to `ci`+`è`).
3. Added the 8 whitelisted proper names (Marco, Anna, Roma, Milano, Napoli, Firenze, Venezia, Italia), capped at 1 per sentence.
4. Cross-referenced `dataset/literals/conjugation.js` to confirm exactly 16 "deep" verbs (essere, avere, parlare, credere, dormire, finire, andare, fare, stare, dare, dire, venire, potere, volere, dovere, sapere) carry futuro/condizionale/imperfetto/subjunctive-present forms; the other 56 verbs have presente only. Only 13 verbs have any imperative form, and all of those are tu-form only (sii, abbi, parla, credi, dormi, finisci, vai, fai, stai, dai, di', vieni, sappi).
5. Discovered and worked around real corpus gaps found during discovery: no plural noun forms exist anywhere (nouns are singular-only), no reflexive verbs, and several common verbs are absent entirely (mangiare, comprare, prendere, camminare, pagare, costare, piacere, lavorare, studiare, vivere, guardare, leggere, arrivare, partire). Also absent: "ogni", "favore", "tempo" (weather sense), "bisogno", "destra/sinistra/dritto". Sentences were composed to avoid all of these, using confirmed substitutes (e.g. "vorrei" for polite requests instead of "per favore"; "fa freddo/caldo" for weather instead of "tempo"; day-name + definite article for habituals instead of "ogni").
6. Wrote all 255 sentences by hand using only cross-referenced vocabulary, then ran a programmatic validator (tokenize → strip punctuation → lowercase → check base-set/elision/proper-name membership) against every sentence.
7. Iteratively fixed every flagged violation (found 1 OOV word "sicura" — feminine form doesn't exist in corpus, fixed; found 31 sentences under the 3-word minimum, expanded each with a natural additional word/adverb; found 14 exact-text collisions against existing `sentences.js`/`EXEMPLIFIED.learning` entries, reworded each) until the validator reported zero violations.
8. Generated slugs programmatically (NFD normalize → strip diacritics → lowercase → non-alnum→hyphen → trim).
9. Wrote the final 255-entity JSON directly from the validated data (no hand-editing after validation), then re-ran the full validation suite a second time reading directly from the written staged file as final proof.

## Theme counts (255 total, matches brief exactly)

- daily routine: 50
- shopping/restaurant: 50
- directions/travel: 40
- small talk/opinions: 40
- questions (all interrogative types): 40
- imperatives/requests: 35

## Final coverage-verify output (re-read from the written staged file, not the draft)

The sibling's `sentences-authored-2.json` (250 entries) appeared mid-task. First pass against it found 3 exact-text collisions ("Finisco il lavoro alle sei.", "Vorrei un caffè.", "Non sono sicuro.") — all 3 reworded (different time/adjective/intensifier) and the full suite re-run clean:

```
STAGED FILE ENTITY COUNT: 255

=== SHAPE CHECK ===
shape errors: 0

=== VOCAB COVERAGE (re-verify from staged file) ===
OOV violations: 0

=== LENGTH CHECK (3-9 words) ===
length violations: 0

=== INTERNAL DEDUP (slug + text) ===
internal dupes: 0

=== EXTERNAL DEDUP (sentences.js + EXEMPLIFIED + sibling) ===
sibling file loaded: 250 entries
external dupes: 0

=== FINAL SUMMARY ===
total entities: 255
shape errors: 0
OOV violations: 0
length violations: 0
internal dupes: 0
external dupes: 0
sibling file present: true
```

## Concerns / disclosed deviations

- **"Dov'è" / "Com'è" avoided**: the brief's elision whitelist covers `l'`, `un'`, `dell'`-family, `po'`, `c'è` but not the "dove è"→"dov'è" or "come è"→"com'è" contractions (extremely common in real spoken Italian). To stay strictly inside the programmatic law I wrote these uncontracted ("Dove è la stazione?", "Come è la cena?"). This is grammatically valid but reads slightly more formal/literary than natural colloquial speech in those specific spots (a handful of sentences across directions/travel and questions themes).
- **Gender defaults**: several adjectives exist only in masculine form in the corpus (e.g. sicuro, occupato, affamato — no feminine counterpart present at all). Where first-person self-description needed one of these, I consistently used the masculine form.
- **Corpus vocabulary gaps** (see Method §5) meaningfully shaped phrasing in shopping/restaurant and directions/travel — e.g. no verb for "to buy," "to pay," or "to cost" meant prices are expressed via "il prezzo è…"/"vorrei" rather than "quanto costa."
