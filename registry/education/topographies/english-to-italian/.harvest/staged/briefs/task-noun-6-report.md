# Report: Italian noun batch 6 — food-2 · furniture/house-2 · city-2 · abstract-2 · misc survival-2

Staged file: `/Users/finn/vivalence/code/vivalence/registry/education/topographies/english-to-italian/.harvest/staged/noun-batch-6.json`

150 entities, JSON array, validated with `python3 -c "import json; print(len(json.load(open('noun-batch-6.json'))))"` → `150`.

## Split counts

| category | count |
|---|---|
| food-2 | 35 |
| furniture/house-2 | 30 |
| city-2 | 30 |
| abstract-2 | 30 |
| misc survival-2 | 25 |

## Entity shape

Matches batches 1–5: `traits: ["TRANSLATED", "EXEMPLIFIED"]` only, no RANKED. Symbols = `word` / `word.lemma.<form>` / `word.part-of-speech.noun` / `word.gender.{masculine|feminine}` / `word.number.singular` / one `proficiency.cefr.*` / optional `proficiency.survival` / one `domain.*`.

A dead prior-attempt script (`build_batch6.py`, found already in the scratchpad — no output had been written to the staged path) had drifted onto the *integrated* `noun.js` shape (added `RANKED` via `wordfreq` lookups). That convention is correct for post-integration files but wrong for the staged regime — batches 1–5's own staged JSON all omit RANKED. Discarded that script's shape and rebuilt independently against the verified staged-batch convention.

## Domain mapping

- **food-2 (35)** → `domain.food`, all 35 (fruits/vegetables/pantry specifics).
- **furniture/house-2 (30)** → `domain.home`, all 30.
- **city-2 (30)** → `domain.city`, all 30.
- **abstract-2 (30)** → split `domain.mind` (14: cognitive/emotional content — consiglio, colpa, segreto, bugia, ragione, pazienza, invidia, rispetto, soluzione, spiegazione, esperienza, sbaglio, menzogna, impegno) / `domain.state` (16: conditions/qualities — aiuto, fortuna, onestà, bisogno, occasione, abitudine, dovere, permesso, scusa, discussione, accordo, rischio, pericolo, sicurezza, destino, successo). Judgment call, no dedicated `domain.abstract` exists.
- **misc survival-2 (25)** → split across the closest-fit domains since no dedicated "everyday objects" domain exists: `domain.home` (11: busta, pacco, sacchetto, fazzoletto, etichetta, torcia, sacco, elastico, adesivo, portachiavi, asciugacapelli) / `domain.health` (5: dentifricio, spazzolino, rasoio, pastiglia, bastone) / `domain.money` (4: scontrino, francobollo, gettone, portamonete) / `domain.social` (2: lettera, cartolina) / `domain.work` (2: modulo, agenda) / `domain.food` (1: tovagliolo).

## CEFR / gender / survival

CEFR: a1 6 · a2 87 · b1 57. Gender: masculine 85 · feminine 65 (no epicene nouns this batch). `proficiency.survival`: 31 total — the 6 a1 food staples (pera, uva, limone, patata, cipolla, carota) plus all 25 misc survival-2 items (category is explicitly named "survival"; matches the live precedent of `portafoglio`/`chiave`, which both carry `proficiency.survival`).

## Heavy overlap pressure (as warned)

Five prior noun batches (750 lemmas across live `noun.js` + staged batches 1–5) took nearly all of the brief's suggested words. Of the brief's ~69 suggested items, 38 were already taken. Substituted freely with real, natural Italian vocabulary in the same registers:

- food: kept pera, uva, limone, patata, cipolla, carota, aceto, farina; substituted pesca, ciliegia, fragola, banana, melone, mandarino, fico, lattuga, zucchina, melanzana, peperone, aglio, sedano, fungo, fagiolo, pisello, cavolo, miele, prosciutto, salame, yogurt, panna, biscotto, cioccolato, succo, torta, marmellata for taken items (mela, arancia, pomodoro, insalata, riso, burro, olio, sale, pepe, zucchero, uovo).
- furniture: kept poltrona, cassetto, tappeto, lampadina, soffitto, parete; substituted scaffale, mensola, comodino, materasso, federa, persiana, soglia, gradino, ringhiera, cantina, soffitta, guardaroba, libreria, credenza, dispensa, lavandino, rubinetto, vasca, stufa, caminetto, cornice, vaso, maniglia, cancello for taken items (armadio, cuscino, coperta, lenzuolo, tenda, presa, scala, pavimento).
- city: kept incrocio, periferia, panchina, statua, torre, campanile; substituted rotonda, viale, vicolo, cattedrale, duomo, castello, supermercato, grattacielo, molo, lampione, cassonetto, tunnel, galleria, sottopassaggio, cavalcavia, isolato, sobborgo, edicola, chiosco, comune, angolo, banchina, vialetto, tram for taken items (marciapiede, semaforo, quartiere, fontana, ponte).
- abstract: kept consiglio, aiuto, colpa, fortuna, segreto, bugia, ragione; substituted onestà, pazienza, invidia, rispetto, bisogno, soluzione, spiegazione, esperienza, occasione, abitudine, dovere, permesso, scusa, discussione, accordo, rischio, pericolo, sicurezza, destino, sbaglio, menzogna, impegno, successo for taken items (scelta, decisione, promessa, errore, sorpresa, verità, dubbio, fine — `fine` deliberately avoided per brief's WATCH note).
- misc survival: kept scontrino, francobollo, busta, pacco; substituted sacchetto, fazzoletto, etichetta, lettera, cartolina, modulo, agenda, torcia, tovagliolo, sacco, dentifricio, spazzolino, rasoio, pastiglia, gettone, elastico, adesivo, portachiavi, bastone, asciugacapelli, portamonete for taken items (portafoglio, moneta, banconota, giornale, rivista, chiave).

## Notable lexical choices

- **Near-synonym pairs kept distinct via known-field disambiguation**: `cattedrale` known="cathedral" vs `duomo` known="main cathedral" (both legitimately gloss to "cathedral" in English but are different Italian words — duomo is the popular name for a city's principal cathedral); `tunnel` known="tunnel" vs `galleria` known="gallery" (galleria's example uses the shopping-arcade sense, not the mountain-tunnel sense, to keep the two nouns semantically distinct); `scaffale` known="shelf" vs `mensola` known="wall shelf"; `bugia` known="lie" vs `menzogna` known="falsehood" (more formal register).
- **Homonym-adjacent nouns disambiguated by example context**: `pesca` (peach) vs the unrelated verb-derived "pesca" (fishing) — example is unambiguously food-context; `credenza` (cupboard) vs the abstract "belief" sense — example is unambiguously furniture-context; `libreria` (bookcase, furniture sense) vs its more common "bookshop" sense — example specifies books already at home.
- **Legitimate same-word loanwords** (`known == learning`, per corpus-quality-criteria.md): `banana`, `yogurt`, `tunnel`, `tram`.
- **Invariable nouns tagged `word.number.singular`** per existing convention for invariables (`bar`, `computer`, etc.): `yogurt`, `tunnel`, `tram`, `guardaroba`, `cavalcavia`, `portachiavi`, `asciugacapelli`, `portamonete`.
- **WATCH items from the brief honored**: `fine` avoided entirely (taken/ambiguous); no plural-only nouns used (`occhiali`, `forbici`, `spinaci` all excluded); `uovo`/`uova` not touched (already taken); `verità`/`onestà` (città-class invariable feminines) correctly tagged feminine singular with no plural symbol confusion.

## Validation run

- JSON parses; 150 entities.
- Internal duplicate slugs: 0. Internal duplicate example sentences (learning and known): 0. Internal duplicate `known` translation values: 0 (except the 4 documented legitimate loanword identities, which are a different check).
- Every `learning` word appears verbatim (case-insensitive) inside its own Italian example — programmatically checked, 0 failures.
- Every entity has exactly one gender symbol, one CEFR symbol, one domain symbol, the `word`/`word.lemma.*`/`word.part-of-speech.noun` triad, and only symbols legal per `dataset/symbols/structural.js`.
- All `learning` values lowercase.
- Fresh final re-verify (script run after file was written) against all 14 live `english-to-italian/dataset/literals/words/*.js` files (750 noun lemmas, 2350 total slugs across all parts of speech) **plus** all sibling `.harvest/staged/*.json` files present at completion time: **0 slug collisions, 0 noun-lemma collisions, 0 example-sentence collisions.**

## Concerns

- A dead prior attempt's script sat in the scratchpad using the wrong (post-integration) shape with `RANKED`/wordfreq; it produced no output file, so there was nothing to clean up in the staged dir itself, but flagging in case that scratchpad script resurfaces as a template for a future batch — it should not be reused as-is.
- `domain.mind` vs `domain.state` split for abstract-2 is a judgment call (no dedicated abstract-noun domain exists) — same category of stretch documented in prior batch reports.
- Misc survival-2 spans six different domains by necessity (no dedicated "everyday objects" domain) — each mapping is defensible per-item but the category itself isn't domain-coherent the way food/furniture/city are.
