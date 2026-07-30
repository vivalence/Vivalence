# Task: stage Italian mixed closed-class fill — 110 literals (months · interjections-2 · adverb-3 · determiners-2 · misc)

STAGED file only. Never touch the live dataset.

## Read first
1. Live conventions per PoS: dataset/literals/words/{noun,interjection,adverb,determiner,pronoun}.js (match each family's shape exactly)
2. BINDING: /Users/finn/vivalence/code/vivalence/.ikiro/reference/corpus-quality-criteria.md
3. Legal symbols: dataset/symbols/structural.js
4. BLOCKING SETS programmatically FIRST + re-verify LAST: dataset/literals/ (words/*.js + sentences.js) + .harvest/staged/*.json

## The work
Write .harvest/staged/mixed-fill.json — 110 entities (each entity's symbols follow ITS part-of-speech's live conventions):
- months 12: gennaio…dicembre — <month>.noun, masculine, domain.month, a1
- seasons 4: primavera, estate, autunno, inverno — nouns, domain.time/weather judgment, correct genders (la primavera, l'estate fem, l'autunno masc, l'inverno masc)
- interjections-2 15: buongiorno, buonasera, buonanotte, salve, benvenuto, auguri, complimenti, bravo, attenzione, aiuto, davvero-check(adverb?NO use as interjection only if not adverb-taken — check), boh, mah, dai, forza — <form>.interjection per live shape
- adverb-3 35: B1 single-word adverbs NOT yet live (attentamente, perfettamente, completamente, particolarmente, personalmente, praticamente, evidentemente, naturalmente, normalmente, assolutamente, letteralmente, chiaramente, correttamente, gentilmente, seriamente, lentamente-check, rapidamente, frequentemente, recentemente, ultimamente, inizialmente, immediatamente, successivamente, precedentemente, attualmente, momentaneamente…)
- determiners-2/quantifiers 24: ogni, qualche, alcuni, alcune, molti, molte, pochi, poche, troppi, troppe, tanti, tante, tutti-check, tutte, parecchi, parecchie, nessun, nessuna, ciascuno, ciascuna, entrambi, entrambe, diversi, diverse — <form>.determiner, plural forms get word.number.plural + gender where marked
- Every example unique, natural, form-in-example. Validate + re-verify.

## Hard laws
NEVER any git/jj command. Write ONLY your staged file + report file. No comments. No PII.

## Report
→ .harvest/staged/briefs/task-mixed-fill-report.md
Final message ONLY: STATUS + count + concerns.
