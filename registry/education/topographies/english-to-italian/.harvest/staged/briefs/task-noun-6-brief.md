# Task: stage Italian noun batch 6 — 150 literals (food-2 · furniture/house-2 · city-2 · abstract-2 · misc survival-2)

Same regime as batches 1-5. STAGED file only.

## Read first
1. Shape exemplar: /Users/finn/vivalence/code/vivalence/registry/education/topographies/english-to-spanish/dataset/literals/words/noun.js
2. BINDING: /Users/finn/vivalence/code/vivalence/.ikiro/reference/corpus-quality-criteria.md
3. Legal symbols: /Users/finn/vivalence/code/vivalence/registry/education/topographies/english-to-italian/dataset/symbols/structural.js
4. BLOCKING SETS programmatically FIRST + re-verify LAST: live dataset (dataset/literals/words/*.js — noun.js holds 450 integrated) AND all sibling staged (.harvest/staged/*.json). Expect HEAVY overlap pressure — five noun batches precede you; substitute freely and document.

## The work
Write /Users/finn/vivalence/code/vivalence/registry/education/topographies/english-to-italian/.harvest/staged/noun-batch-6.json — 150 noun entities:
- Split: food-2 35 (fruits/vegetables/specifics: mela, pera, uva, arancia, limone, pomodoro, patata, cipolla, carota, insalata, riso, burro, olio, aceto, sale, pepe, zucchero, farina, uovo…) · furniture/house-2 30 (poltrona, armadio, cassetto, cuscino, coperta, lenzuolo, tappeto, tenda, lampadina, presa, scala, soffitto, pavimento, parete…) · city-2 30 (marciapiede, semaforo, incrocio, quartiere, periferia, fontana, panchina, statua, ponte, torre, campanile…) · abstract-2 30 (scelta, decisione, promessa, consiglio, aiuto, errore, colpa, fortuna, sorpresa, segreto, bugia, verità, dubbio, ragione…) · misc survival-2 25 (chiave-class daily objects if free: portafoglio, moneta, banconota, scontrino, francobollo, busta, pacco, giornale-check, rivista…)
- WATCH: l'uovo/le uova — uovo masculine singular; la verità/la città-class invariable feminines; il/la fine sense split (avoid fine — likely taken)
- Same shape; gender correct; every example unique + natural + form-in-example.
- Validate + final programmatic re-verify.

## Hard laws
NEVER any git/jj command. Write ONLY your staged file + report file. No comments. No PII.

## Report
→ /Users/finn/vivalence/code/vivalence/registry/education/topographies/english-to-italian/.harvest/staged/briefs/task-noun-6-report.md
Final message ONLY: STATUS + count + concerns.
