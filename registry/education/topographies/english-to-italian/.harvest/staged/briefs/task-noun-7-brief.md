# Task: stage Italian noun batch 7 — 150 literals (feminine -o/-à fills · sports · music/art · kitchen · body-2)

Same regime as batches 1-6. STAGED file only.

## Read first
1. Shape exemplar: any 5 entries of /Users/finn/vivalence/code/vivalence/registry/education/topographies/english-to-italian/dataset/literals/words/noun.js (900 live)
2. BINDING: /Users/finn/vivalence/code/vivalence/.ikiro/reference/corpus-quality-criteria.md
3. Legal symbols: dataset/symbols/structural.js
4. BLOCKING SETS programmatically FIRST + re-verify LAST: dataset/literals/ (words/*.js + sentences.js) + .harvest/staged/*.json — slugs AND examples. Expect very heavy overlap; substitute + document.

## The work
Write .harvest/staged/noun-batch-7.json — 150 entities:
- MUST include the mano-class feminine fills flagged by QA: mano, foto, moto, radio (feminine, word.gender.feminine) + auto if free
- sports 30 (calcio, pallone, squadra, palestra, corsa, gara, allenamento, arbitro, campo, rete-check…) · music/art 30 (pianoforte, chitarra, violino, quadro, pittura, mostra, museo-check, palcoscenico, spettacolo…) · kitchen 35 (pentola, padella, coltello, forchetta, cucchiaio, piatto-check, bicchiere-check, tazza, bottiglia-check, forno-check, frigorifero, tovaglia…) · body-2 remainder + misc fills to reach 150 (dito, unghia, gola, schiena, spalla, ginocchio, caviglia, gomito, fronte, guancia…)
- Same shape; gender correct; every example unique + natural + form-in-example.
- Validate + final programmatic re-verify.

## Hard laws
NEVER any git/jj command. Write ONLY your staged file + report file. No comments. No PII.

## Report
→ .harvest/staged/briefs/task-noun-7-report.md
Final message ONLY: STATUS + count + concerns.
