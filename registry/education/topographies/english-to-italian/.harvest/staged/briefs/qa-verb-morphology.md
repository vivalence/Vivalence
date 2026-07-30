# QA panel — lens 2: VERB-MORPHOLOGY

Reviewer: adversarial audit of `dataset/literals/words/verb.js` (287 lemmas / 2709 entities)
and `dataset/literals/conjugation.js` (351 bundles). Read-only. No fixes applied.

## Method actually run

1. Parsed all 287 verb lemmas (12 deep-irregular + 4 deep-regular pattern verbs + 271
   present-only lemmas) into a lemma→entities index.
2. **-isc- classification (ALL 38 `-ire` lemmas, exhaustive, not sampled)**: cross-checked
   each lemma's real-Italian subclass (pure vs -isc--infix vs suppletive-irregular) against
   its actual present-indicative surface forms for all 6 cells. 100% correct — every
   -isc- verb (capire, colpire, costruire, dimagrire, diminuire, finire, guarire, inserire,
   obbedire, preferire, proibire, pulire, punire, reagire, restituire, riunire, suggerire,
   unire) shows the infix in 1s/2s/3s/3p and its absence in 1p/2p; every pure verb
   (aprire, avvertire, coprire, dormire, fuggire, mentire, offrire, partire, scoprire,
   sentire, servire) shows no infix anywhere; every suppletive irregular (apparire, dire,
   morire, riempire, riuscire, salire, scomparire, uscire, venire) matches its known
   irregular stem.
3. **Participles (ALL 287, exhaustive, not sampled)**: dumped every `verb.participle.past`
   entity and hand-verified the surface form against real Italian (including the irregular
   participle families -so/-sto/-tto/-rso/-lto and the -scere→-sciuto phonetic-spelling
   family). Zero wrong forms found.
4. **Irregular-lemma cell sampling (all 32 lemmas tagged `word.regularity.irregular`)**:
   full paradigm dump (34-cell tables: present/imperfect/future/conditional indicative +
   present subjunctive + imperative + gerund + participle) for the 12 deep irregulars
   (essere, avere, andare, fare, stare, dare, dire, potere, volere, dovere, sapere, venire)
   plus present-tense dump for the 20 present-only irregulars (apparire, appartenere, bere,
   morire, opporre, ottenere, piacere, possedere, produrre, proporre, ridurre, riempire,
   riuscire, salire, scegliere, scomparire, spegnere, togliere, tradurre, uscire). Zero
   wrong forms.
5. **`word.regularity` tag consistency**: built a mechanical present-tense-shape classifier
   (regular / -isc- / c·g-hardening h-insertion / i-merger for -iare stems) and diffed its
   verdict against the corpus's own regularity tag for all 287 lemmas. Initial pass flagged
   50 "mismatches" — all 50 were false positives in the *checker* (h-insertion `-care/-gare`,
   i-merger `-iare`, and the `bere/produrre/ridurre/tradurre` Latin-contracted-infinitive
   class are genuinely regular/irregular as tagged; corrected the checker and re-ran to zero
   real mismatches). No tagging defects.
6. **Bundle paradigm-ref integrity (ALL 351 bundles, exhaustive)**: for every paradigm cell
   in every bundle — slug resolves in verb.js, slug string's trailing `.person.number`
   matches the cell key, and the resolved entity's `word.person`/`word.number`/`word.lemma`/
   `word.mood`/`word.tense` symbols all agree with the bundle's own symbols. **0 problems
   across all 351 bundles.** Also checked: no duplicate bundle slugs, no duplicate/missing
   cell refs within a bundle (all 6 cells present, all distinct).
7. **Orphan-form check**: every verb.js entity matching
   `{lemma}.verb.{indicative|subjunctive|conditional}.…` (2106 finite literals) is
   referenced by some bundle's paradigm map. **0 orphans.**
8. **Shape/count integrity**: all 271 present-only lemmas carry exactly the 8 expected
   entities (infinitive + participle + 6 present cells, no extra/missing forms); all 16
   deep lemmas carry 34 (or 33 for potere/volere/dovere, which by design omit the
   imperative — documented in the quest ledger). 0 anomalies.
9. Cross-checked for duplicate verb.js slugs (0) and duplicate `EXEMPLIFIED.learning`
   sentences across verb entities (0).
10. Ran `.harvest/audit.py` (full corpus mechanical sweep): 6035 literals · 351 bundles ·
    0 findings · 0 orphan mp3s.

## Findings

None. Zero critical, zero important, zero minor defects found in verb morphology across
the full corpus (every -isc- classification, every participle, every irregular lemma's
cells, every paradigm-bundle cell reference).

This is a fully mechanical/generator-authored slice of the corpus (`build-verbs.py` /
`build-present-verbs.py`) that already went through a dedicated review at ledger c17
("231/231 forms morphologically CORRECT") for the 16 deep verbs; this pass extends that
same scrutiny to the full present-only wave (271 lemmas) and the bundle-integrity layer,
and confirms the same result holds corpus-wide.

VERB-MORPHOLOGY: critical 0 · important 0 · minor 0
