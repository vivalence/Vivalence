# Task: stage Italian noun batch 8 — 150 literals (emotions-2 · law/admin · science/nature-2 · commerce · containers/quantities)

Same regime as batches 1-7. STAGED file only.

## Read first
1. Shape: any 5 entries of dataset/literals/words/noun.js (900+ live)
2. BINDING: /Users/finn/vivalence/code/vivalence/.ikiro/reference/corpus-quality-criteria.md
3. Legal symbols: dataset/symbols/structural.js
4. BLOCKING SETS programmatically FIRST + re-verify LAST: dataset/literals/ (words/*.js + sentences.js) + .harvest/staged/*.json (noun-batch-7.json may be in flight — include if present; expect VERY heavy overlap after 7 noun batches; substitute freely + document). All under /Users/finn/vivalence/code/vivalence/registry/education/topographies/english-to-italian/.

## The work
Write .harvest/staged/noun-batch-8.json — 150 entities:
- emotions-2 25 (rabbia, tristezza, felicità, vergogna, invidia, orgoglio, ansia, stress, calma, coraggio-check…)
- law/admin 30 (documento, modulo, firma, contratto, permesso, multa, tassa, ufficio-check, timbro, certificato, cittadinanza, ambasciata, questura, avvocato, giudice, tribunale…)
- science/nature-2 30 (energia, luce-check, ombra, fuoco, terra-check, pietra, sabbia, onda, stella, luna, pianeta, cielo-check, aria-check, temperatura, esperimento, ricerca…)
- commerce 35 (offerta, sconto, cassa, cliente, prodotto, marca, qualità, quantità, magazzino, consegna, ordine-check, fattura, garanzia, reso, saldo…)
- containers/quantities 30 (sacchetto, barattolo, tubetto, lattina, cartone, vaschetta, fetta, goccia, cucchiaiata, manciata, mucchio, fila, serie, elenco, lista-check…)
- Genders correct (la felicità/qualità/quantità invariable feminine; il problema-class watch). Every example unique + natural + form-in-example. Validate + re-verify.

## Hard laws
NEVER any git/jj command. Write ONLY your staged file + report file. No comments. No PII.

## Report
→ .harvest/staged/briefs/task-noun-8-report.md
Final message ONLY: STATUS + count + concerns.
