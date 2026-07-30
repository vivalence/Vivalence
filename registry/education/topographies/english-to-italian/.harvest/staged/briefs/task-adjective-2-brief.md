# Task: stage Italian adjective batch 2 — 100 literals (A2/B1 breadth: nationality · weather · quantity · comparison · description)

Same regime as adjective batch 1. STAGED file only — never touch the live dataset.

## Read first
1. Shape exemplar: /Users/finn/vivalence/code/vivalence/registry/education/topographies/english-to-spanish/dataset/literals/words/adjective.js
2. BINDING: /Users/finn/vivalence/code/vivalence/.ikiro/reference/corpus-quality-criteria.md (Entity Shape, TRANSLATED, EXEMPLIFIED, Adjective-specific)
3. Legal symbols: /Users/finn/vivalence/code/vivalence/registry/education/topographies/english-to-italian/dataset/symbols/structural.js
4. Dupe checks — slugs AND examples unique vs live dataset (dataset/literals/words/*.js) AND sibling staged batches (.harvest/staged/*.json) — ESPECIALLY adjective-batch-1.json: read its full slug list first; none of its adjectives may reappear.

## The work
Write /Users/finn/vivalence/code/vivalence/registry/education/topographies/english-to-italian/.harvest/staged/adjective-batch-2.json — JSON array, 100 adjective entities:
- Families: nationalities 20 (italiano/italiana, francese, tedesco/tedesca, spagnolo, inglese, americano, giapponese, cinese…) · weather/temperature 12 (piovoso, nuvoloso, soleggiato, umido, secco/secca…) · quantity/measure 18 (pieno/piena, vuoto/vuota, intero, mezzo/mezza, doppio, leggero/leggera, pesante…) · description/appearance 30 (alto/alta, basso/bassa, lungo/lunga, corto/corta, giovane, anziano, magro/magra, forte, debole, pulito/pulita, sporco/sporca…) · abstract/evaluation 20 (vero/vera, falso, giusto/giusta, sbagliato, possibile, sicuro/sicura, pericoloso, tranquillo/tranquilla…)
- Masculine base + feminine sibling for the marked pairs (as in the lists above); invariable -e adjectives one entity, no gender symbol
- Symbols/conventions identical to batch 1; nationality adjectives lowercase (italiano NOT Italiano)
- Every example unique, natural, contains exact form, agreement correct
- Validate JSON parses.

## Hard laws
NEVER any git/jj command. Write ONLY your staged file + report file. No comments. No PII.

## Report
Full report → /Users/finn/vivalence/code/vivalence/registry/education/topographies/english-to-italian/.harvest/staged/briefs/task-adjective-2-report.md
Final message ONLY: STATUS + count + concerns.
