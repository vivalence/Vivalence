# Task: author Italian didactic sentences, set 1 — 255 sentence literals (STAGED)

You author STAGED sentence entities. Never touch the live dataset.

## Context
The corpus has 495 audio-backed sentences (dataset/literals/sentences.js) and ~2500 word literals. We need 505 more AUTHORED sentences (no audio). Yours: 255. Sibling task authors 250 (different theme split — you may run in parallel; final integration dedups).

## Read first (all under /Users/finn/vivalence/code/vivalence/registry/education/topographies/english-to-italian/)
1. Live sentence shape: dataset/literals/sentences.js (first 3 entries)
2. VOCABULARY COVERAGE LAW — every content word of every sentence you write MUST be a form present in the dataset. Build the allowed-form set programmatically FIRST: every trait.TRANSLATED.learning value (lowercased) across dataset/literals/words/*.js + elision expansions (l'→la/lo, un'→una, dell'/all'/dall'/nell'/sull'+forms, po'→poco, c'è→ci+è counts as ci è) + proper names (Marco, Anna, Roma, Milano, Napoli, Firenze, Venezia, Italia — max 1 per sentence). If a word you want isn't in the set, REWRITE the sentence — never use out-of-vocabulary words.
3. Dupe targets: every EXEMPLIFIED.learning + every sentences.js TRANSLATED.learning + sibling staged files (.harvest/staged/*.json)

## The work
Write .harvest/staged/sentences-authored-1.json — JSON array of 255 entities:
```json
{
  "slug": "<ascii-kebab-of-sentence>",
  "traits": ["TRANSLATED"],
  "trait": { "TRANSLATED": { "known": "<English>", "learning": "<Italian sentence>" } },
  "symbols": [{ "slug": "sentence" }]
}
```
slug = NFD→ascii, lowercase, non-alnum→hyphen (e.g. "Dov'è la stazione?" → "dov-e-la-stazione").
- Themes: daily routine 50 · shopping/restaurant 50 · directions/travel 40 · small talk/opinions 40 · questions (all interrogative types) 40 · imperatives/requests 35
- Length 3–9 words. Natural spoken Italian. Grammar impeccable (agreement, article choice, preposition contractions).
- Use the corpus's tense range: presente dominant, some futuro/condizionale/imperfetto where the conjugated forms EXIST in the dataset (they exist only for the 16 deep verbs — check before use; all other verbs present-tense only).
- Every sentence unique (slug + text) vs everything.
- Validate JSON + final programmatic coverage re-verify (0 out-of-vocabulary content words) + dedup re-verify. Report the verification output.

## Hard laws
NEVER any git/jj command. Write ONLY your staged file + report file. No comments. No PII.

## Report
→ .harvest/staged/briefs/task-sentences-1-report.md (theme counts, coverage-verify output)
Final message ONLY: STATUS + count + concerns.
