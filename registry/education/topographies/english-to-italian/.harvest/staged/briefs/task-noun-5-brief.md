# Task: stage Italian noun batch 5 — 150 literals (technology · materials · society/news · objects/tools · measures)

Same regime as batches 1-4. STAGED file only.

## Read first
1. Shape exemplar: /Users/finn/vivalence/code/vivalence/registry/education/topographies/english-to-spanish/dataset/literals/words/noun.js
2. BINDING: /Users/finn/vivalence/code/vivalence/.ikiro/reference/corpus-quality-criteria.md (Entity Shape, TRANSLATED, EXEMPLIFIED)
3. Legal symbols: /Users/finn/vivalence/code/vivalence/registry/education/topographies/english-to-italian/dataset/symbols/structural.js
4. BLOCKING SETS (build programmatically FIRST, re-verify LAST): slugs + example sentences from live dataset (dataset/literals/words/*.js — noun.js holds 450) AND all sibling staged (.harvest/staged/*.json). Both under /Users/finn/vivalence/code/vivalence/registry/education/topographies/english-to-italian/.

## The work
Write /Users/finn/vivalence/code/vivalence/registry/education/topographies/english-to-italian/.harvest/staged/noun-batch-5.json — 150 noun entities:
- Split: technology 30 (computer, schermo, tastiera, messaggio, chiamata, rete, sito, stampante… — invariable loanwords like computer get gender symbol per usage: il computer masc) · materials 25 (legno, ferro, vetro, plastica, carta, lana, cotone, oro, argento…) · society/news 30 (governo, legge, notizia, guerra, pace, popolo, diritto, voto, sindaco, cittadino…) · objects/tools 35 (occhiali is plural-only — prefer singular objects: orologio, ombrello, forbici NO (plural) — martello, chiodo, corda, scatola, bottone, specchio, pettine, sapone, asciugamano…) · measures 30 (metro, chilo, litro, grammo, pezzo, paio, gruppo, numero, metà, dozzina…)
- domain mapping judgment: technology→domain.home? NO — check structural.js legal list; use the closest legal domain (e.g. domain.work for office tech, domain.entertainment for media, domain.city for civic) and DOCUMENT choices in report. No new symbols ever.
- CEFR: mostly a2/b1. Same shape as prior batches; gender correct; every example unique + natural + form-in-example.
- Validate + final programmatic dedup re-verify.

## Hard laws
NEVER any git/jj command. Write ONLY your staged file + report file. No comments. No PII.

## Report
→ /Users/finn/vivalence/code/vivalence/registry/education/topographies/english-to-italian/.harvest/staged/briefs/task-noun-5-report.md
Final message ONLY: STATUS + count + concerns.
