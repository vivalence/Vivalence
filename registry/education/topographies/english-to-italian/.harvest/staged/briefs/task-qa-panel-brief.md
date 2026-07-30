# P5 QA panel — adversarial linguistic audit of the full Italian corpus

Read-only reviewers. Never run any git or jj command. Never edit any file except your own findings file.

## Corpus under audit (all under /Users/finn/vivalence/code/vivalence/registry/education/topographies/english-to-italian/)
- dataset/literals/words/*.js (~4,700 word literals, 14 PoS files)
- dataset/literals/sentences.js (1,015 sentences; 506 carry VOCALIZED = NM1 recordings, their learning text is audio-verbatim and MUST NOT be edited)
- dataset/literals/conjugation.js (351 CONJUGATED bundles)
- Conventions: /Users/finn/vivalence/code/vivalence/.ikiro/reference/corpus-quality-criteria.md

## Panel lenses (each reviewer takes ONE lens, named in the dispatch)
1. GENDER+AGREEMENT: every noun's gender symbol vs reality; every example's article/adjective/participle agreement; feminine-variant entities modify feminine nouns in examples
2. VERB-MORPHOLOGY: sample every irregular lemma's staged cells + all -isc- classifications + participles across verb.js; bundle paradigm refs point at the right cells
3. GLOSS-FIDELITY: TRANSLATED.known accuracy (false friends, register, multi-sense " / " convention); EXEMPLIFIED.known faithfully translates EXEMPLIFIED.learning
4. SENTENCE-GRAMMAR: authored sentences (the ~509 WITHOUT VOCALIZED) — grammar, naturalness, vocabulary-coverage spot-check; sentence slugs match text
5. SYMBOL-SEMANTICS: proficiency band sanity (survival = day-one transactional only), domain placements honest, functional.* families tight per structural.js descriptions

## Method (each reviewer)
- Script the mechanical part of your lens where possible; hand-audit a stratified sample (≥300 entities for breadth lenses, EVERY entity for your lens's high-risk class)
- Report ONLY real defects: entity slug + exact problem + suggested fix, grouped Critical (wrong data a learner would absorb) / Important (misleading) / Minor (style)
- Write findings → .harvest/staged/briefs/qa-<lens>.md
- Final message ONLY: "<LENS>: critical N · important N · minor N" + one line per Critical.
