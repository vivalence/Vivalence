# Task: stage Italian noun batch 2 — 150 literals (body · family · clothing · work · health)

Same regime as batch 1. You author a STAGED file only — never touch the live dataset.

## Read first
1. Shape + quality exemplar: /Users/finn/vivalence/code/vivalence/registry/education/topographies/english-to-spanish/dataset/literals/words/noun.js (≥10 entries)
2. BINDING conventions: /Users/finn/vivalence/code/vivalence/.ikiro/reference/corpus-quality-criteria.md (Entity Shape, TRANSLATED, EXEMPLIFIED)
3. Legal symbol slugs: /Users/finn/vivalence/code/vivalence/registry/education/topographies/english-to-italian/dataset/symbols/structural.js — never invent slugs
4. Dupe checks — your slugs AND example sentences must be unique vs BOTH:
   - live dataset: /Users/finn/vivalence/code/vivalence/registry/education/topographies/english-to-italian/dataset/literals/words/*.js
   - sibling staged batches: /Users/finn/vivalence/code/vivalence/registry/education/topographies/english-to-italian/.harvest/staged/*.json

## The work
Write /Users/finn/vivalence/code/vivalence/registry/education/topographies/english-to-italian/.harvest/staged/noun-batch-2.json — JSON array, 150 noun entities:
- Split: body 30 (testa, mano, occhio, braccio…) · family 30 (madre, padre, figlio, sorella, nonno…) · clothing 25 (vestito, scarpa, camicia…) · work 35 (lavoro, ufficio, medico, insegnante, collega…) · health 30 (medicina, febbre, dolore, farmacia, ospedale…)
- Entity shape identical to batch 1: traits TRANSLATED+EXEMPLIFIED only; symbols word / word.lemma.<form> / word.part-of-speech.noun / word.gender.* / word.number.singular / proficiency band / domain.*
- learning lowercase singular; gender symbol MUST be correct (watch traps: la mano feminine, il problema masculine, profession nouns — use masculine citation form, add feminine sibling only for high-value pairs like insegnante epicene / dottore-dottoressa)
- Every example unique, natural Italian, contains the exact noun, agreement correct
- Validate: python3 -c "import json; print(len(json.load(open('<path>'))))"

## Hard laws
NEVER any git/jj command. Write ONLY your staged file + report file. No comments. No PII.

## Report
Full report → /Users/finn/vivalence/code/vivalence/registry/education/topographies/english-to-italian/.harvest/staged/briefs/task-noun-2-report.md
Final message ONLY: STATUS (DONE|DONE_WITH_CONCERNS|NEEDS_CONTEXT|BLOCKED) + count + concerns.
