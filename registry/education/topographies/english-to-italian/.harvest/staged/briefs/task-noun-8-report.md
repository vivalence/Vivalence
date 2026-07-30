# Report: Italian noun batch 8 — emotions-2 · law/admin · science/nature-2 · commerce · containers/quantities

Staged file: `/Users/finn/vivalence/code/vivalence/registry/education/topographies/english-to-italian/.harvest/staged/noun-batch-8.json`

150 entities, JSON array, validated with `python3 -c "import json; print(len(json.load(open('noun-batch-8.json'))))"` → `150`.

## Split counts

| category | count |
|---|---|
| emotions-2 | 25 |
| law/admin | 30 |
| science/nature-2 | 30 |
| commerce | 35 |
| containers/quantities | 30 |

## Entity shape

Matches batches 1–7: `traits: ["TRANSLATED", "EXEMPLIFIED"]` only, no RANKED. Symbols = `word` / `word.lemma.<form>` / `word.part-of-speech.noun` / `word.gender.{masculine|feminine}` (omitted for the 2 epicene profession nouns) / `word.number.singular` / one `proficiency.cefr.*` / one `domain.*`. No `proficiency.survival` this batch (see Concerns).

## Domain mapping

`structural.js` has no dedicated "law," "commerce," or "quantity" domain, so the closest legal domain was chosen per item:

- **emotions-2 (25)** → `domain.mind`, all 25.
- **law/admin (30)** → `domain.work` (27: documents, procedures, professions, sanctions — multa, timbro, certificato, cittadinanza, giudice, sentenza, processo, testimone, reato, arresto, denuncia, notaio, codice, regolamento, pena, clausola, verbale, avviso, richiesta, rinnovo, iscrizione, imposta, residenza, anagrafe, udienza, cauzione, protocollo) + `domain.city` (3: civic buildings/institutions — ambasciata, questura, carcere).
- **science/nature-2 (30)** → `domain.nature` (18: physical/natural phenomena — energia, luce, ombra, fuoco, onda, pianeta, aria, universo, vulcano, terremoto, nube, vapore, minerale, atmosfera, elettricità, magnete, polvere, gravità) + `domain.education` (10: research/academic-science concepts — esperimento, ricerca, laboratorio, molecola, atomo, cellula, chimica, biologia, fisica, sostanza) + `domain.health` (2: pathogens — batterio, virus).
- **commerce (35)** → `domain.money`, all 35.
- **containers/quantities (30)** → `domain.home` (19: physical containers — tubetto, lattina, cartone, vaschetta, pacchetto, confezione, recipiente, boccetta, bidone, cesto, flacone, bustina, rotolo, cassetta, tanica, damigiana, fusto, scatolone, scorta) + `domain.shape` (9: quantity/measure words, matching batch 5's precedent of using `domain.shape` for units/quantities — cucchiaiata, mucchio, fila, elenco, lista, fascio, mazzo, strato, cumulo) + `domain.health` (1: dose) + `domain.food` (1: pizzico).

## Gender / CEFR

Gender: masculine 74 · feminine 74 · epicene (no gender symbol) 2 (`giudice.noun`, `testimone.noun` — same form for male/female referent, consistent with the live convention already used for `presidente`/`cliente`/`insegnante`/`collega`/`genitore`).

CEFR: a1 5 · a2 49 · b1 80 · b2 16.

`pianeta.noun` deliberately included as a live illustration of the brief's "il problema-class watch" note — masculine despite the `-a` ending (Greek-derived neuter class: problema, programma, pianeta, ecc.).

## Heavy overlap pressure (as warned — now 7 prior batches)

Ran the blocking check against `noun.js` (900 live) + staged batches 1–7 (noun-batch-7.json had just landed mid-task — included) + all other `words/*.js` + `sentences.js` + verb paradigm bundles (learning/known strings extracted from the `[form, known, known-example, learning-example]` tuples too, not just entity-shaped files). Of the brief's ~34 explicitly suggested items per category, the large majority were already taken. Substituted freely with natural, common-register Italian vocabulary:

- **emotions-2**: kept `stress` (the only brief-suggested item still free). Everything else brief-suggested (rabbia, tristezza, felicità, vergogna, invidia, orgoglio, ansia, calma, coraggio) was taken. Filled with noia, sollievo, tenerezza, rimorso, disperazione, angoscia, serenità, odio, affetto, simpatia, antipatia, terrore, sgomento, stupore, meraviglia, soddisfazione, pietà, indifferenza, irritazione, fastidio, sospetto, sfiducia, ammirazione, disgusto.
- **law/admin**: kept multa, timbro, certificato, cittadinanza, ambasciata, questura, giudice; substituted sentenza, processo, testimone, reato, arresto, denuncia, notaio, codice, regolamento, pena, carcere, clausola, verbale, avviso, richiesta, rinnovo, iscrizione, imposta, residenza, anagrafe, udienza, cauzione, protocollo for taken brief items (documento, modulo, firma, contratto, permesso, tassa, ufficio, avvocato, tribunale).
- **science/nature-2**: kept energia, luce, ombra, fuoco, onda, pianeta, aria, esperimento, ricerca; substituted universo, vulcano, terremoto, nube, vapore, minerale, atmosfera, elettricità, magnete, polvere, gravità, laboratorio, molecola, atomo, cellula, chimica, biologia, fisica, sostanza, batterio, virus for taken brief items (terra, pietra, sabbia, stella, luna, cielo, temperatura).
- **commerce**: kept offerta, prodotto, marca, qualità, magazzino, consegna, ordine, fattura, garanzia, reso, saldo; substituted vendita, acquisto, affare, concorrenza, fornitore, distributore, catalogo, campione, imballaggio, spedizione, reclamo, rimborso, fidelizzazione, promozione, contante, venditore, commercio, impresa, profitto, perdita, spesa, abbonamento, inventario, merce for taken brief items (sconto, cassa, cliente, quantità, etichetta, ricevuta, bancomat, commesso).
- **containers/quantities**: kept tubetto, lattina, cartone, vaschetta, cucchiaiata, mucchio, fila, elenco, lista; substituted pacchetto, confezione, recipiente, boccetta, bidone, cesto, flacone, bustina, rotolo, cassetta, tanica, damigiana, fusto, scatolone, scorta, fascio, mazzo, strato, cumulo, dose, pizzico for taken brief items (sacchetto, barattolo, fetta, goccia, manciata, serie). Note: `vasetto`, `brocca`, and `caraffa` were drafted first, then `noun-batch-7.json` landed mid-task and claimed all three (its kitchen category) — re-verified and swapped to `boccetta`, `tanica`, `damigiana`.

## Notable lexical choices

- **Near-synonym pairs kept distinct via known-field/context disambiguation**: `elenco` (list of names) vs `lista` (shopping list); `bidone` (household trash bin) vs `fusto` (industrial oil drum) vs `tanica` (jerrycan/canister); `cartone` (cardboard box) vs `scatolone` (generic big box).
- **Homonym-adjacent nouns disambiguated by example context**: `campione` (product sample, not "champion") — example anchored on "farmacista... campione gratuito"; `imposta` (tax, not "window shutter") — example anchored on "governo... carburante".
- **Legitimate same-word loanwords/cognates** (`known == learning`, per corpus-quality-criteria.md): `stress`, `virus`, `dose`.
- **Epicene profession nouns** (no gender symbol, matching live precedent): `giudice`, `testimone`.
- **Gender-agreement care on `essere`-copula sentences**: `Questo acquisto è stato una buona idea` (participle agrees with masculine subject `acquisto`, not the feminine predicate noun `idea`); `Quella macchina è stata un vero affare` (agrees with feminine subject `macchina`). Caught and corrected during self-review before finalizing.
- **`pianeta`** included specifically as a live, correctly-tagged illustration of the brief's masculine `-a` gender-watch note.

## Validation run

- JSON parses; 150 entities; internal duplicate slugs: 0; internal duplicate example sentences (learning and known, case-insensitive): 0.
- Every `learning` word appears verbatim (case-insensitive) inside its own Italian example — 0 failures.
- All `learning` values lowercase; no non-ASCII characters leaked into any `known` field.
- Every entity has the `word`/`word.lemma.*`/`word.part-of-speech.noun` triad, `word.number.singular`, exactly one CEFR symbol, exactly one domain symbol, at most one gender symbol (0 for the 2 documented epicene nouns) — all symbols checked legal against `dataset/symbols/structural.js`.
- Fresh final re-verify against all live `english-to-italian/dataset/literals/words/*.js` files + `sentences.js` + all sibling `.harvest/staged/*.json` (including `noun-batch-7.json`, which landed mid-task, and the three `verbs-present-*.json` paradigm-bundle files — their nested `[form, known, known-example, learning-example]` cells were also extracted and checked, not just entity-shaped files): **0 slug collisions, 0 noun-lemma collisions, 0 example-sentence collisions (both known and learning directions).**

## Concerns

- No `proficiency.survival` tags applied this batch — none of the five categories (emotions, law/admin, science, commerce, containers/quantities) fit the "bare minimum to operate in Italy on day one" bar as cleanly as prior survival-tagged batches; judgment call, flagging in case a reviewer disagrees (e.g. `multa`, `certificato`, `residenza` are arguably practical-enough for an expat to warrant the tag).
- `domain.work` vs `domain.city` split for law/admin, and `domain.nature`/`domain.education`/`domain.health` split for science/nature-2, are judgment calls (no dedicated law/science domain exists) — same category of stretch documented in prior batch reports (batch 5, batch 6).
- Mid-task connection drop: `noun-batch-7.json` landed on disk after the initial blocking-set snapshot was taken but before this file was written. Blocking set was rebuilt and the full candidate word list re-verified against it before finalizing; 3 words (`vasetto`, `brocca`, `caraffa`) had to be swapped as a result (documented above). Final re-verify ran against the batch-7-inclusive corpus.
