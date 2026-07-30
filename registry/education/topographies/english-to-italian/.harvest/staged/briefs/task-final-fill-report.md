# Report: final-fill.json — 280 mixed-PoS entities

Staged file: `.harvest/staged/final-fill.json` (280 entities, valid JSON array).

## Method

1. Read live conventions from `dataset/literals/words/{noun,adjective,adverb,pronoun,interjection}.js`, `dataset/symbols/structural.js`, and the BINDING corpus-quality-criteria doc.
2. Built a programmatic blocking set from every `learning` string across ALL of `dataset/literals/words/*.js` + `dataset/literals/sentences.js` + every `.harvest/staged/*.json` (4725 forms at first pass). Re-ran the blocking rebuild at the end (final re-verify) — `verbs-present-4.json` and `verbs-present-5.json` landed from siblings mid-task and were picked up automatically; `noun-batch-8.json` was already present throughout. No new sibling files appeared between the final rebuild and writing this file.
3. Discovered that **staged batches omit the RANKED trait** (only TRANSLATED + EXEMPLIFIED), unlike the live files. Followed the sibling-staged convention (all 8 noun batches, 4 adjective batches, adverb-batch-2, mixed-fill agree on this shape) rather than the live-file shape, since RANKED is evidently added at a later merge/wordfreq pass.
4. Generated every entity mechanically (schema, symbols, JSON) but hand-composed every translation, gender, domain, CEFR judgment, and example sentence myself — no content codegen.
5. Ran an automated validator: no duplicate slugs, no duplicate `learning` forms within the file, no duplicate example sentences, every `learning` string is a lowercase substring of its own `learning` example, schema shape (exactly one lemma/pos/cefr symbol each), no non-English diacritics in `known`. Zero errors on final pass.

## Extreme overlap, as expected

Brief's own suggested word lists were 40-70% already live/staged (confirmed programmatically, not by inspection):
- nouns: e.g. giardino, seme, pianta, spazzolino, dentifricio, shampoo, rasoio, pettine, asciugacapelli, cartella, graffetta, evidenziatore, calendario, agenda, pazienza, libertà, giustizia were all taken; substituted with attrezzo/pala/rastrello/semino, bagnoschiuma/balsamo/accappatoio/mascara, raccoglitore/pinzatrice/cartellina/archivio, gentilezza/bellezza/ricchezza/povertà/coscienza etc.
- adjectives: economico, ovvio, strano, comune, raro, normale, inutile, evidente all taken; substituted with gratuito, costoso, tipico, unico, conveniente, disponibile, urgente, speciale, generale, principale, particolare (which were free) plus ~50 more B1/B2 words (pratico, silenzioso, spazioso, competente, efficiente, vulnerabile, notevole, etc.)
- adverbs: leggermente, effettivamente, realmente already live (79 -mente adverbs already existed); substituted with estremamente, incredibilmente, fortemente, altamente, totalmente + a large batch of domain-manner -mente adverbs (economicamente, politicamente, scientificamente, etc.) and degree words (alquanto, piuttosto, talmente, così).
- pronouns: brief's own "-check" flags confirmed correct (strano, raro, ciascuno-as-determiner already existed). Used a cross-POS strategy explicitly invited by the brief for parecchio/troppo: **12 of the 40 pronoun entries are new `.pronoun` senses of words that already exist as `.determiner` or `.adverb`** (ciascuno/ciascuna, molti/molte, pochi/poche, tutti/tutte, entrambi/entrambe, parecchio, troppo) — legitimate distinct grammatical-function entities, not duplicates, flagged in the validator as expected warnings.

## Breakdown (280 total)

- **nouns (120)**: tools/garden/hobbies 35, bathroom/hygiene 30, office 20, emotions/abstract 35. Domains: home/nature/entertainment (tools), health (hygiene), work (office), mind/shape/money (abstract, matching live precedent — e.g. `bellezza`→domain.shape like `bello`, `ricchezza`/`povertà`→domain.money).
- **adjectives (80)**: 21 o/a lemmas × 2 gender entries (42) + 38 invariable -e lemmas (38).
- **adverbs (40)**: 33 -mente + 7 degree/discourse (alquanto, piuttosto, oltremodo, eccessivamente, sommamente, talmente, così).
- **pronouns/misc (40)**: relative (cui), indefinite (ognuno/ognuna, chiunque, qualunque, qualsiasi, altro/altra/altri/altre, alcuno/alcuna, ambedue, altrui), identity (stesso/stessa, medesimo/medesima, tale/tali), literary 3rd-person (ciò, esso, essa), plural demonstratives (questi/queste, quelli/quelle), negation (nulla), and the 12 cross-POS quantifier-pronouns noted above.

## Concerns / judgment calls (for review)

- Two known-cognate adjectives, `docile` and `mediocre`, have identical known/learning spelling — verified as genuine English-Italian cognates, not an error.
- `fisica.adjective.feminine.singular` shares its surface form with an existing `fisica.noun` (physics) — different POS, different meaning, kept.
- Skipped adding plural possessive pronouns (miei/mie/tuoi/tue/suoi/sue/nostri/nostre/vostri/vostre) — the live `word.number` symbol on possessives encodes possessor number (io=singular vs noi=plural), and plural-agreement forms of a singular possessor would collide symbol-wise with the singular form; flagging rather than inventing a new symbol convention.
- No RANKED trait included (see method note 3) — matches every sibling staged batch; will need a wordfreq pass at merge time like the others.

## Status

STATUS: DONE
COUNT: 280 entities staged to `.harvest/staged/final-fill.json` (120 nouns, 80 adjectives, 40 adverbs, 40 pronouns)
CONCERNS: none blocking — see judgment calls above for reviewer attention (cognate pairs, cross-POS pronoun reuse, possessive-plural pronouns intentionally omitted, RANKED trait intentionally omitted to match sibling convention)
