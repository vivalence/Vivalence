# Review: Italian adjective batch 2

Reviewed: `adjective-batch-2.json` (100 entities) against brief, corpus-quality-criteria.md, structural.js, live `adjective.js` (batch-1, 120 entities, already integrated), sibling staged batches (adjective-batch-1, noun-batch-1/2/3), and native-Italian adversarial read of every form + example.

## Critical

### 1. Six weather adjectives are gendered forms staged as invariable — missing `word.gender.masculine`, wrong slug shape

`piovoso` (rainy), `soleggiato` (sunny), `umido` (humid), `ventoso` (windy), `gelido` (freezing/icy), `afoso` (muggy) all end in `-o` and are fully regular `-o/-a` adjectives (piovosa, soleggiata, umida, ventosa, gelida, afosa are all valid Italian words). They are staged with the bare invariable slug shape (`piovoso.adjective`) and **no `word.gender.*` symbol at all** — as if they were `-e` invariable adjectives like the two genuine invariables sitting right next to them in the same family (`mite.adjective`, `variabile.adjective`, correctly untagged).

This directly violates the review brief's own mechanical law ("gendered forms carry word.gender.*; invariable -e forms no gender symbol") and is inconsistent with how every other masculine-only gendered adjective in this same file was handled (e.g. `svizzero.adjective.masculine.singular` + `word.gender.masculine`, `intero.adjective.masculine.singular` + `word.gender.masculine`).

Confirms as a real bug, not a judgment call: the implementer's own report describes the weather family as "2 pairs + **6 masculine-only** + 2 invariable" (i.e., the intent was to treat these six as masculine-only gendered forms, matching every other family) — but the actual JSON shipped them as invariable with zero gender symbol and the wrong slug suffix.

Impact: breaks the `word.gender` pivot the ConjugationEntity SQL view relies on (per corpus-quality-criteria.md, "missing symbols = missing cells in the table"); these six words will not surface in gender-filtered exercises, and a later attempt to add the feminine siblings (`piovosa`, `soleggiata`, etc.) will collide awkwardly with an already-shipped ungendered `word.lemma.piovoso`.

Fix: rename slugs to `<form>.adjective.masculine.singular` and add `{ "slug": "word.gender.masculine" }` to the symbols array for all six entities.

Affected slugs: `piovoso.adjective`, `soleggiato.adjective`, `umido.adjective`, `ventoso.adjective`, `gelido.adjective`, `afoso.adjective`.

## Important

### 2. `scuro`/`scura` tagged `domain.body` but exemplified with non-body sentences

`scuro.adjective.masculine.singular` / `scura.adjective.feminine.singular` ("dark") sit in the domain.body group alongside `biondo`, `riccio`, `calvo` (hair/body-appearance words) — but their EXEMPLIFIED sentences are "Il colore è scuro" (the color is dark) and "La stanza è scura" (the room is dark), neither of which is about the body at all. `domain.body` per structural.js is scoped to "Parts of the body." As shipped, this entity will surface under body-domain-filtered practice with an example about room/color darkness, which is a real thematic mismatch, not just a loose categorization. Either retag to no domain (like the other "no natural domain fit" abstract-family entries) or rewrite the examples to be body/appearance-specific (e.g. "hair is dark" / "skin is dark").

### 3. Report's self-reported gender-split arithmetic does not match the shipped data

Report claims "Gender split: masculine 34, feminine 26, invariable 40 (34+26+40=100)." Actual counts in the shipped JSON: **masculine 41, feminine 30, invariable 29** (verified by script, cross-checked against every per-family breakdown the report itself gives, which do sum correctly per-family). The top-line total in the report appears to be fabricated/miscalculated rather than computed from the file. This doesn't corrupt the shipped data, but it means the report's self-verification claims can't be taken at face value without independent recount — which is exactly how Critical #1 above was caught (the report's own per-family prose said "6 masculine-only" for weather while the data shows 6 with zero gender tagging).

## Minor

### 4. `known` field doesn't appear in its own EXEMPLIFIED `known` example (2 entities)

- `numerosa.adjective.feminine.singular`: top-level `known` = "numerous (fem.)", but EXEMPLIFIED known = "The family is large" (no "numerous"). Both are valid glosses for `numerosa` but the criteria's audit checklist ("known word appears in English example") is violated without a documented function-word exception.
- `minimo.adjective.masculine.singular`: `known` = "minimum" (noun form) vs EXEMPLIFIED known = "The risk is minimal" (adjective form) — internally inconsistent register; "minimum" itself never appears in the English example.

Not blocking — semantically faithful either way — but worth a one-line fix (`known: "large / numerous"` or swap the example known to use "numerous").

### 5. `Il tempo è ___` reused 3× within the 12-entry weather family

`umido`, `ventoso`, `variabile` all use the subject "Il tempo" ("Il tempo è umido" / "Il tempo è ventoso" / "Il tempo è variabile"). Each sentence is unique text and demonstrates a distinct word (not a literal copy-paste violation), but it's the least varied corner of the batch — three of twelve weather examples share the exact same subject noun.

### 6. CEFR pitch is uneven within the nationality family

`svizzero`, `portoghese`, `olandese` are pitched at `b1` while structurally identical nationality adjectives (`americano`, `greco`, `brasiliano`, `messicano`, `indiano`, `francese`, `inglese`, `giapponese`, `cinese`, `canadese`) sit at `a2`. Not wrong (defensible if these nationalities are judged less frequent for a learner), but no stated rationale, and it reads arbitrary next to the otherwise-uniform a2 treatment of the rest of the family.

## Checks that passed clean

- JSON parses; exactly 100 entities.
- Family split exact match to spec: nationalities 20 / weather 12 / quantity 18 / description 30 / abstract 20.
- No duplicate slugs within file; zero slug overlap vs live `adjective.js` (120 entities, batch-1), vs staged `adjective-batch-1.json`, vs staged noun batches.
- No duplicate EXEMPLIFIED sentences within file; zero overlap vs live adjective/noun/verb literals or any sibling staged file.
- No lemma reuse vs batch-1 (confirmed independently — every brief-suggested word that collided with batch-1, e.g. `pesante`, `vero`, `falso`, `giusto/giusta`, `sbagliato/sbagliata`, `possibile`, `sicuro`, `pericoloso`, `caldo/calda`, `freddo/fredda`, `alto`, `lungo/lunga`, `corto`, `forte`, `chiaro`, `raro`, `utile`/`inutile`, was correctly and completely avoided).
- Slug format `<form>.adjective[.gender.singular]` respected on every entry.
- All domain/proficiency symbols exist in `structural.js`; no invented symbols.
- Every entity carries `word`, `word.lemma.*`, `word.part-of-speech.adjective`, `word.number.singular`, `proficiency.cefr.*`.
- Form-in-example law holds for all 100 entities (the `learning` form appears verbatim in its own EXEMPLIFIED sentence).
- Nationalities lowercase throughout (`italiano` not `Italiano`).
- No Italian diacritics leaking into `known` fields; `known != learning` except documented cognates (`agile`, `fragile`).
- All feminine forms are correctly derived from their masculine lemma (o→a, preserving hard-consonant spelling where needed: secco/secca, sporco/sporca, autentico/autentica, logico/logica).
- Gender agreement between adjective and example subject noun verified correct across all 60 gendered entries (masculine subjects with masculine nouns, feminine subjects with feminine nouns, including irregular-gender nouns got right: `il problema`, `il clima` masculine despite `-a` ending).
- Article/elision usage (`il`/`lo`/`la`/`l'`) correct throughout, including `s+consonant` triggering `lo` (`lo scrittore`, `lo zaino`, `lo spazio`).
- No PII; all example subjects are generic role nouns.
