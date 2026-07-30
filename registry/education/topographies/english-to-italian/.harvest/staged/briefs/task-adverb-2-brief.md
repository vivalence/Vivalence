# Task: stage Italian adverb batch 2 — 80 literals (-mente manner · frequency · sequence · attitude)

STAGED file only — never touch the live dataset.

## Read first
1. Live adverb exemplars (42 already integrated — study shape AND avoid all their slugs): /Users/finn/vivalence/code/vivalence/registry/education/topographies/english-to-italian/dataset/literals/words/adverb.js
2. BINDING: /Users/finn/vivalence/code/vivalence/.ikiro/reference/corpus-quality-criteria.md (Entity Shape, TRANSLATED, EXEMPLIFIED)
3. Legal symbols: /Users/finn/vivalence/code/vivalence/registry/education/topographies/english-to-italian/dataset/symbols/structural.js
4. Dupe checks vs live dataset (all dataset/literals/words/*.js) AND sibling staged (.harvest/staged/*.json) — slugs AND examples, programmatic, first and last step.

## The work
Write /Users/finn/vivalence/code/vivalence/registry/education/topographies/english-to-italian/.harvest/staged/adverb-batch-2.json — JSON array, 80 adverb entities:
- Families: -mente manner ~30 (velocemente, lentamente, facilmente, veramente, sicuramente, finalmente, esattamente, direttamente, semplicemente, probabilmente, purtroppo is not -mente but include it in attitude…) · frequency ~15 (spesso, raramente, ogni tanto — single words only, so: spesso, raramente, talvolta, solitamente, generalmente, mai-family already live…) · sequence/time ~15 (subito, allora, poi, intanto, ormai, appena, stasera, stamattina, stanotte, oggi-family already live) · attitude/discourse ~12 (purtroppo, certamente, ovviamente, comunque, almeno, addirittura, magari) · place/quantity fill ~8 (ovunque, dappertutto, altrove, parecchio, appunto…)
- SINGLE WORDS ONLY (no "ogni tanto"). Symbols: word / word.lemma.<form> / word.part-of-speech.adverb / proficiency band (a1 for spesso/subito/poi/stasera core, a2/b1 rest) / functional.* or domain.* per family (manner→functional.degree? NO — use your judgment mirroring live adverb.js family mapping: -mente manner has no dedicated functional slug, use functional.degree only for degree words; time family → functional.time or domain.time per live exemplars; discourse → functional.discourse)
- Every example unique, natural, form-in-example
- Validate JSON + final programmatic dedup re-verify.

## Hard laws
NEVER any git/jj command. Write ONLY your staged file + report file. No comments. No PII.

## Report
Full report → /Users/finn/vivalence/code/vivalence/registry/education/topographies/english-to-italian/.harvest/staged/briefs/task-adverb-2-report.md
Final message ONLY: STATUS + count + concerns.
