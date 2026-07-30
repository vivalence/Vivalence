# Task: stage Italian adjective batch 3 — 130 literals (emotions · taste/texture · dimension · condition/state)

Same regime as batches 1-2. STAGED file only.

## Read first
1. Live adjective conventions (220 integrated — study AND avoid all their slugs): /Users/finn/vivalence/code/vivalence/registry/education/topographies/english-to-italian/dataset/literals/words/adjective.js
2. BINDING: /Users/finn/vivalence/code/vivalence/.ikiro/reference/corpus-quality-criteria.md (Adjective-specific)
3. Legal symbols: /Users/finn/vivalence/code/vivalence/registry/education/topographies/english-to-italian/dataset/symbols/structural.js
4. BLOCKING SETS programmatically FIRST + re-verify LAST: live (dataset/literals/words/*.js) + sibling staged (.harvest/staged/*.json).

## The work
Write /Users/finn/vivalence/code/vivalence/registry/education/topographies/english-to-italian/.harvest/staged/adjective-batch-3.json — 130 adjective entities:
- Families: emotions/character 40 (arrabbiato/arrabbiata, preoccupato/preoccupata, sorpreso, deluso/delusa, orgoglioso, geloso, timido/timida, coraggioso, pigro/pigra, sincero…) · taste/texture 25 (amaro/amara, salato, piccante, acido, morbido/morbida, duro/dura, liscio, ruvido, fresco/fresca…) · dimension 30 (largo/larga, stretto/stretta, profondo/profonda, spesso, sottile, enorme, minuscolo, medio/media…) · condition/state 35 (rotto/rotta, chiuso/chiusa, acceso/accesa, spento/spenta, bagnato/bagnata, asciutto, sveglio is taken — check, addormentato, vestito, nudo, pieno is taken — check, vuoto is taken — check…)
- Gendered -o/-a pairs where marked with a slash above; invariable -e single entity no gender symbol; slug convention MATCHES the live file (gendered = <form>.adjective.masculine.singular / <form>.adjective per whichever convention the live file's majority uses — inspect first and MATCH IT; document what you found)
- Every example unique, natural, form-in-example, agreement correct (feminine example → feminine noun)
- Validate + final programmatic re-verify.

## Hard laws
NEVER any git/jj command. Write ONLY your staged file + report file. No comments. No PII.

## Report
→ /Users/finn/vivalence/code/vivalence/registry/education/topographies/english-to-italian/.harvest/staged/briefs/task-adjective-3-report.md
Final message ONLY: STATUS + count + concerns.
