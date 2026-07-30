# Task: stage Italian adjective batch 1 — 120 literals (colors · qualities · states · personality · comparatives)

## Where this fits
The `english-to-italian` topography (language-learning dataset). Open-class breadth. You author the first adjective batch as a STAGED file — you do NOT touch the live dataset.

## Requirements — read these files FIRST
1. `/Users/finn/vivalence/code/vivalence/registry/education/topographies/english-to-spanish/dataset/literals/words/adjective.js` — shape + quality exemplar (read ≥10 entries; note how feminine variants are separate entities with `(fem.)` in known).
2. `/Users/finn/vivalence/code/vivalence/.ikiro/reference/corpus-quality-criteria.md` — "Entity Shape", "TRANSLATED", "EXEMPLIFIED", "Adjective-specific". BINDING.
3. `/Users/finn/vivalence/code/vivalence/registry/education/topographies/english-to-italian/dataset/symbols/structural.js` — the ONLY proficiency/functional/domain slugs that exist. Never invent others.
4. Existing Italian literals (dupe check): `/Users/finn/vivalence/code/vivalence/registry/education/topographies/english-to-italian/dataset/literals/`

## The work
Write `/Users/finn/vivalence/code/vivalence/registry/education/topographies/english-to-italian/.harvest/staged/adjective-batch-1.json` — JSON array of 120 adjective entities:
- Coverage: colors (~16 incl. key feminine variants: rosso/rossa, nero/nera, bianco/bianca…), sizes/qualities (grande, piccolo/piccola, nuovo/nuova, vecchio/vecchia, bello/bella, brutto, caldo/calda, freddo/fredda…), states (stanco/stanca, felice, triste, malato/malata, pronto/pronta, libero/libera, occupato…), personality (simpatico/simpatica, gentile, serio/seria, divertente, intelligente…), evaluation (buono/buona, cattivo, caro/cara, facile, difficile, importante…).
- Masculine form = base entity (`rosso.adjective`, known "red"). Feminine variant = SEPARATE entity (`rossa.adjective`, known "red (fem.)") for the high-value pairs — include ~30 feminine variants. Invariable adjectives (-e: felice, gentile, grande…) get ONE entity, no gender symbol.
- Symbols: word, word.lemma.<form>, word.part-of-speech.adjective, word.gender.* (gendered forms only), word.number.singular, proficiency band, domain.* where natural (domain.color for colors, domain.state for states, domain.mind for personality).
- Every example: unique sentence, natural Italian, contains the exact form, gender agreement correct (rossa example must use a feminine noun).
- Validate JSON parses: `python3 -c "import json; print(len(json.load(open('<staged path>'))))"`.

## Hard laws
- NEVER run any git or jj command. No commits. Ever.
- Write ONLY the staged file + your report file. NOTHING else.
- No code comments. No PII.

## Report
Full report → `/Users/finn/vivalence/code/vivalence/registry/education/topographies/english-to-italian/.harvest/staged/briefs/task-adjective-1-report.md`: family counts, feminine-variant list, judgment calls.
Final message: STATUS (DONE | DONE_WITH_CONCERNS | NEEDS_CONTEXT | BLOCKED) + count + concerns.
