# Task: stage Italian noun batch 3 — 150 literals (nature · weather · animals · time · education)

Same regime as batch 1. STAGED file only — never touch the live dataset.

## Read first
1. Shape + quality exemplar: /Users/finn/vivalence/code/vivalence/registry/education/topographies/english-to-spanish/dataset/literals/words/noun.js (≥10 entries)
2. BINDING conventions: /Users/finn/vivalence/code/vivalence/.ikiro/reference/corpus-quality-criteria.md (Entity Shape, TRANSLATED, EXEMPLIFIED)
3. Legal symbol slugs: /Users/finn/vivalence/code/vivalence/registry/education/topographies/english-to-italian/dataset/symbols/structural.js — never invent slugs
4. Dupe checks — slugs AND example sentences unique vs BOTH:
   - live: /Users/finn/vivalence/code/vivalence/registry/education/topographies/english-to-italian/dataset/literals/words/*.js
   - sibling staged: /Users/finn/vivalence/code/vivalence/registry/education/topographies/english-to-italian/.harvest/staged/*.json

## The work
Write /Users/finn/vivalence/code/vivalence/registry/education/topographies/english-to-italian/.harvest/staged/noun-batch-3.json — JSON array, 150 noun entities:
- Split: nature 30 (mare, montagna, albero, fiume, fiore…) · weather 20 (pioggia, sole, vento, neve, nuvola…) · animals 25 (cane, gatto, uccello, pesce, cavallo…) · time 40 (giorno, notte, settimana, mese, anno, mattina, sera, minuto + i 7 giorni della settimana lunedì–domenica) · education 35 (scuola, libro, penna, studente, lezione, esame…)
- Weekdays: domain.weekday symbol (not domain.time); lowercase (lunedì…); masculine except la domenica
- Entity shape identical to batch 1: traits TRANSLATED+EXEMPLIFIED only; symbols word / word.lemma.<form> / word.part-of-speech.noun / word.gender.* / word.number.singular / proficiency band / domain.*
- Every example unique, natural Italian, contains the exact noun, agreement correct
- Validate: python3 -c "import json; print(len(json.load(open('<path>'))))"

## Hard laws
NEVER any git/jj command. Write ONLY your staged file + report file. No comments. No PII.

## Report
Full report → /Users/finn/vivalence/code/vivalence/registry/education/topographies/english-to-italian/.harvest/staged/briefs/task-noun-3-report.md
Final message ONLY: STATUS + count + concerns.
