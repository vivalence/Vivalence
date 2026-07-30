# Task: stage Italian noun batch 4 — 150 literals (mind · relationship · entertainment · travel · state/abstract)

Same regime as batches 1-3. STAGED file only — never touch the live dataset.

## Read first
1. Shape exemplar: /Users/finn/vivalence/code/vivalence/registry/education/topographies/english-to-spanish/dataset/literals/words/noun.js (≥10 entries)
2. BINDING: /Users/finn/vivalence/code/vivalence/.ikiro/reference/corpus-quality-criteria.md (Entity Shape, TRANSLATED, EXEMPLIFIED)
3. Legal symbols: /Users/finn/vivalence/code/vivalence/registry/education/topographies/english-to-italian/dataset/symbols/structural.js
4. Dupe checks — slugs AND example sentences unique vs BOTH live dataset (dataset/literals/words/*.js — noun.js now holds 300 integrated nouns) AND ALL sibling staged batches (.harvest/staged/*.json). Build your blocking sets programmatically FIRST, and re-verify programmatically as your LAST step before writing the report.

## The work
Write /Users/finn/vivalence/code/vivalence/registry/education/topographies-to…  — CORRECT PATH: /Users/finn/vivalence/code/vivalence/registry/education/topographies/english-to-italian/.harvest/staged/noun-batch-4.json — JSON array, 150 noun entities:
- Split: mind/emotion 30 (pensiero, paura, gioia, speranza, sogno…) · relationship 25 (amico/amica pair, amore, matrimonio, ospite…) · entertainment 30 (musica, film, canzone, partita, gioco, concerto, spiaggia…) · travel 35 (viaggio, valigia, passaporto, albergo, prenotazione, turista…) · state/abstract 30 (problema, domanda, risposta, idea, motivo, esempio, modo, parte, caso, fine…)
- WATCH: il problema/il programma/il tema masculine; many batch-1..3 nouns already exist (casa, biglietto, treno, stazione…) — your blocking sets protect you
- Same entity shape as prior batches (traits TRANSLATED+EXEMPLIFIED; full symbols with correct gender; epicene documented in report)
- Every example unique, natural, form-in-example, agreement correct
- Validate JSON parses + final programmatic dedup re-verify.

## Hard laws
NEVER any git/jj command. Write ONLY your staged file + report file. No comments. No PII.

## Report
Full report → /Users/finn/vivalence/code/vivalence/registry/education/topographies/english-to-italian/.harvest/staged/briefs/task-noun-4-report.md
Final message ONLY: STATUS + count + concerns.
