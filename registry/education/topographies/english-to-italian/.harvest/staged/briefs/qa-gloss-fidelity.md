# QA panel — GLOSS-FIDELITY (lens 3)

## Method

Scripted extraction of every `TRANSLATED`/`EXEMPLIFIED` pair from the corpus into TSV dumps, then:

1. Mechanical pass over all 5,020 word literals + 1,015 sentences: `known == learning`, Italian diacritics leaking into `known`, and a token-overlap heuristic (`known` containing a ≥5-char word identical to a word in `learning`, after ASCII-folding) to catch untranslated-leftover bugs.
2. Cross-referenced a curated list of ~40 classic Italian→English false friends (camera, libreria, fattoria, morbido, educato, simpatico, sensibile, caldo, burro, fame, estate, preservativo, parenti, magazzino, firma, pavimento, etc.) against every `learning`/lemma in the corpus.
3. Hand-audited, in full: every closed-class file (adposition, adverb, contraction, coordinating-conjunction, determiner, interjection, numeral, particle, pronoun, subordinating-conjunction — 415 entries), all 560 adjective entries, all 1,336 noun entries, all 2,709 verb entries (287 distinct lemmas × paradigm cells), and all 1,015 sentence pairs. This is full coverage, not a sample — the 5,020 word literals + 1,015 sentences were each read and judged for translation accuracy, false-friend traps, register, and (for `EXEMPLIFIED`) whether `known` faithfully translates `learning`.
4. `conjugation.js` (351 bundles) carries no direct `TRANSLATED`/`EXEMPLIFIED` data of its own — it only references paradigm cells already audited in `verb.js` — so it is out of this lens's scope (paradigm-shape correctness is lens 2's territory).

The false-friend cross-reference (item 2) found 30 hits, all correctly glossed (`camera`→"bedroom", `caldo`→"hot", `simpatico`→"nice/likeable", etc.) — the corpus authors clearly already guarded against the obvious traps. No defects there.

## Critical

- **`superbia.noun`** — `EXEMPLIFIED.learning` "La sua superbia lo allontana da tutti" / `EXEMPLIFIED.known` "His **superbia** distances him from everyone". The English gloss left the Italian word untranslated instead of using the entity's own `TRANSLATED.known` ("pride / haughtiness"). A learner reading the example sees a mixed-language sentence and may conclude "superbia" is an English word.
  Fix: `"His pride distances him from everyone"` (or "haughtiness").

- **`sei-dalla-mia-parte`** (sentences.js, VOCALIZED — audio-locked, do not touch `learning`) — `TRANSLATED.learning` "Sei dalla mia parte." / `TRANSLATED.known` "You are in my way." This is a near-opposite mistranslation: "essere dalla parte di qualcuno" is the standard idiom for "to be on someone's side" (supportive), not an obstruction idiom. "You are in my way" would be "Sei sulla mia strada" / "Mi stai intralciando".
  Fix `known` only: `"You are on my side."`

## Important

- **`a-mia-madre-piace-la-musica`** (sentences.js, VOCALIZED — audio-locked) — `TRANSLATED.learning` "A mia madre piace la musica." / `TRANSLATED.known` "My mother **loves** music." `piacere` = "to please/to be pleasing to" (i.e., "to like"), not "amare" (to love). Register inflation changes the lexical mapping the learner absorbs for `piace`, and it's inconsistent with the sibling entry `mi-piace-dormire` → "I **like** sleeping." in the same file.
  Fix `known` only: `"My mother likes music."`

- **`preferisco-questa-materia`** (sentences.js) — `TRANSLATED.learning` "Preferisco questa materia." / `TRANSLATED.known` "I **like** this subject." `preferire` = "to prefer" (implies comparison), not "piacere" (to like). This is the only outlier among 16 `preferisco`/`preferisci` sentences in the corpus — every other one correctly renders "prefer".
  Fix: `"I prefer this subject."`

## Minor

- **`comune.noun`** — `TRANSLATED.known` "town hall". `comune` primarily denotes the municipality/local-government body (the administrative entity, "andare al comune" = "to go to the municipal registry office"), not the building itself — `municipio.noun` in the same file is already correctly glossed "town hall" for the building sense. The overlap risks the two entries reading as synonyms when they aren't.
  Suggested fix: `"municipality"` (or `"municipality / town hall"` to keep the colloquial sense visible).

## Notes for other lenses

- The `known == learning` mechanical check flagged 45 entries (agile, fragile, pasta, pizza, taxi, banana, etc.) — all legitimate same-word-in-both-languages cognates per the criteria doc, not defects.
- 6 entries have café/fiancé-style accented characters in `known` (bar.noun, fidanzato.noun, fidanzata.noun, angolo.noun, regalare.verb…third.singular) — these are English loanwords that legitimately carry the accent in English too (café, fiancé/fiancée), not Italian leaking into the English field.
