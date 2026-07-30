# Task: stage Italian adjective batch 4 — 130 literals (ordinals · materials · frequency/time · character-2 · feminine gap-fills)

Same regime as batches 1-3. STAGED file only.

## Read first
1. Live conventions + slug shapes: /Users/finn/vivalence/code/vivalence/registry/education/topographies/english-to-italian/dataset/literals/words/adjective.js (350 live — study the gendered-slug convention and MATCH it)
2. BINDING: /Users/finn/vivalence/code/vivalence/.ikiro/reference/corpus-quality-criteria.md (Adjective-specific)
3. Legal symbols: dataset/symbols/structural.js
4. BLOCKING SETS programmatically FIRST + re-verify LAST: dataset/literals/ (words/*.js + sentences.js) + .harvest/staged/*.json

## The work
Write .harvest/staged/adjective-batch-4.json — 130 entities:
- ordinals 20 (primo/prima, secondo/seconda, terzo/terza, quarto, quinto, sesto, settimo, ottavo, nono, decimo, ultimo/ultima — functional.number symbol)
- material adjectives 20 (rosa/viola/blu invariables if free; di legno-style NO (phrases) — single words only: metallico, plastico? prefer natural ones: prezioso/preziosa, solido/solida, fragile, trasparente, lucido, opaco…)
- frequency/time adjectives 25 (quotidiano/quotidiana, settimanale, mensile, annuale, moderno/moderna, antico/antica, recente, futuro-check, passato-check, prossimo/prossima, scorso/scorsa, breve, immediato…)
- character-2 35 (onesto/onesta, educato/educata, maleducato, paziente, impaziente, curioso/curiosa, generoso/generosa, egoista, testardo/testarda, saggio/saggia, prudente, distratto/distratta, attento/attenta-check…)
- feminine gap-fills 30: scan live adjective.js for masculine -o entries lacking a feminine sibling; add the 30 highest-value missing feminine forms (word.lemma = the feminine form per live convention — inspect how existing feminine variants set their lemma and MATCH)
- Every example unique, natural, form-in-example, agreement correct. Validate + re-verify.

## Hard laws
NEVER any git/jj command. Write ONLY your staged file + report file. No comments. No PII.

## Report
→ .harvest/staged/briefs/task-adjective-4-report.md
Final message ONLY: STATUS + count + concerns.
