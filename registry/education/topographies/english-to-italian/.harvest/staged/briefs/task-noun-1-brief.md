# Task: stage Italian noun batch 1 — 150 literals (food · home · city · transport · money)

## Where this fits
The `english-to-italian` topography (language-learning dataset) has its closed-class + verb layers done. Open-class breadth begins. You author the first noun batch as a STAGED file — you do NOT touch the live dataset.

## Requirements — read these files FIRST
1. `/Users/finn/vivalence/code/vivalence/registry/education/topographies/english-to-spanish/dataset/literals/words/noun.js` — the shape + quality exemplar (read at least 10 entries; note symbols, known conventions, example style).
2. `/Users/finn/vivalence/code/vivalence/.ikiro/reference/corpus-quality-criteria.md` — "Entity Shape", "TRANSLATED", "EXEMPLIFIED" sections. BINDING.
3. `/Users/finn/vivalence/code/vivalence/registry/education/topographies/english-to-italian/dataset/symbols/structural.js` — the ONLY proficiency/functional/domain symbol slugs that exist. Never invent others.
4. Existing Italian literals (grep for dupes): `/Users/finn/vivalence/code/vivalence/registry/education/topographies/english-to-italian/dataset/literals/`

## The work
Write `/Users/finn/vivalence/code/vivalence/registry/education/topographies/english-to-italian/.harvest/staged/noun-batch-1.json` — a JSON array of 150 noun entities:
- Domains and rough split: food 40 · home 35 · city 25 · transport 25 · money 25. Choose the most frequent, most useful survival/A1/A2 nouns per domain (pane, acqua, caffè, tavolo, cucina, strada, piazza, treno, biglietto, prezzo, …).
- Entity shape (staged = same as live minus RANKED, which is injected later):
```json
{
  "slug": "pane.noun",
  "traits": ["TRANSLATED", "EXEMPLIFIED"],
  "trait": {
    "TRANSLATED": { "known": "bread", "learning": "pane" },
    "EXEMPLIFIED": { "known": "Fresh bread smells good", "learning": "Il pane fresco profuma" }
  },
  "symbols": [
    { "slug": "word" },
    { "slug": "word.lemma.pane" },
    { "slug": "word.part-of-speech.noun" },
    { "slug": "word.gender.masculine" },
    { "slug": "word.number.singular" },
    { "slug": "proficiency.cefr.a1" },
    { "slug": "proficiency.survival" },
    { "slug": "domain.food" }
  ]
}
```
- learning = lowercase bare noun, singular. Gender symbol MUST match reality (word.gender.masculine|feminine). CEFR band by judgment (a1 core, a2 for less central); survival only for day-one transactional nouns.
- Every example: unique sentence (also vs the sentences already in the live dataset — grep before use), natural Italian, contains the exact noun, article+adjective agreement correct.
- known: plain English; multiple meanings via `/`.
- NO duplicate slugs within your file or vs live dataset.
- Validate your JSON parses: `python3 -c "import json; print(len(json.load(open('<staged path>'))))"`.

## Hard laws
- NEVER run any git or jj command. No commits. Ever.
- Write ONLY the staged file + your report file. NOTHING else.
- No code comments. No PII.

## Report
Full report → `/Users/finn/vivalence/code/vivalence/registry/education/topographies/english-to-italian/.harvest/staged/briefs/task-noun-1-report.md`: domain counts, gender split, any judgment calls.
Final message: STATUS (DONE | DONE_WITH_CONCERNS | NEEDS_CONTEXT | BLOCKED) + count + concerns.
