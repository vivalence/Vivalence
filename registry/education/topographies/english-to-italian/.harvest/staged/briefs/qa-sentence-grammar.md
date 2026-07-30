# QA panel — SENTENCE-GRAMMAR lens

Scope: all 509 authored sentences in `dataset/literals/sentences.js` without VOCALIZED (1015 total, 506 VOCALIZED excluded per brief). Every one of the 509 was hand-read for grammar/naturalness; slug↔text match and vocabulary coverage were scripted across all 509.

## Method notes

- Slug-derivation check (mechanical, all 509): lowercase, strip terminal punctuation, strip accents to base letter, apostrophe/space→hyphen, collapse hyphens. **0 mismatches** — every slug correctly derives from its `learning` text.
- Vocabulary-coverage spot-check (mechanical, all 509 tokenized against the union of `learning` forms across all 13 populated PoS files, 4,835 forms): only 9 unique "missing" tokens, all either elision fragments (`l'`, `c'`, `all'`, `dell'`, `po'`) or proper nouns (Roma, Italia, Tom, Marco) that aren't expected to be dictionary literals. **No real coverage gaps found.**
- Hand-audit (all 509): checked verb conjugation/agreement, article use (incl. the family-noun-drops-article rule — verified clean across all `mio/mia + padre/madre/fratello/...` instances), imperative morphology (`vai/fai/stai/dai/sii/abbi/sappi/di'` all correct), comparative/superlative constructions, elision/apocope conventions, weather idioms, punctuation/capitalization consistency (scripted pass, clean).
- Cross-checked suspected defects against the rest of the corpus (VOCALIZED sentences + word-literal EXEMPLIFIED fields) to confirm inconsistency rather than legitimate stylistic variance.

## Critical (0)

None found.

## Important (4)

1. **`dove-e-la-stazione`** — `"Dove è la stazione?"`. Missing the standard elision; modern Italian writes this as `"Dov'è la stazione?"`. The corpus itself uses the contracted form correctly 10+ times elsewhere in `sentences.js` (e.g. `Dov'è il problema?`, `Dov'è la mia pizza?`, `Dov'è il bancomat?`) and in word-literal EXEMPLIFIED fields (`Dov'è il bagno?`), so this is an inconsistency, not house style. Fix: `"Dov'è la stazione?"`.
2. **`sai-dove-e-la-farmacia`** — `"Sai dove è la farmacia?"`. Same defect. Fix: `"Sai dov'è la farmacia?"`.
3. **`come-e-la-cena`** — `"Come è la cena?"`. Same defect (com'è vs come è); corpus correctly has `Com'è alto!` and `Com'è possibile questo?` elsewhere. Fix: `"Com'è la cena?"`.
4. **`prenotiamo-il-ristorante-per-stasera`** — `"Prenotiamo il ristorante per stasera."` known: "We book the restaurant for tonight." `Prenotare il ristorante` (book the restaurant itself) reads as booking out the whole venue, not making a dinner reservation. This directly contradicts two sibling entities in the same file that correctly model the collocation: `prenoto-un-tavolo-per-stasera` ("Prenoto un tavolo per stasera") and `vorrei-prenotare-un-tavolo-per-due` ("Vorrei prenotare un tavolo per due"). Fix: `"Prenotiamo un tavolo al ristorante per stasera."`

## Minor (3)

5. **`che-prezzo-ha-la-camicia`** — `"Che prezzo ha la camicia?"` is grammatical but a stilted, calque-like way to ask about price. Natural Italian: `"Quanto costa la camicia?"`.
6. **`hai-un-idea-buona`** — `"Hai un'idea buona?"` Postnominal placement is grammatical but the idiomatic collocation for an evaluative "good idea" is prenominal. Natural Italian: `"Hai una buona idea?"`.
7. **`ho-la-carta-nel-portafoglio`** — `"Ho la carta nel portafoglio."` known: "I have the card in my wallet." `carta` alone defaults to "paper" in a native reading; the corpus's own `carta.noun` EXEMPLIFIED field disambiguates with `"Pago con la carta di credito"`, i.e. the corpus itself knows bare `carta` needs the qualifier. Suggest: `"Ho la carta di credito nel portafoglio."`
