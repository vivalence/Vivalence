# Review: task-noun-2 (Italian noun batch 2)

## Mechanical checks (scripted) — all pass

- JSON parses, 150 entities.
- Domain split exact match to brief: body 30 / family 30 / clothing 25 / work 35 / health 30.
- CEFR bands: exactly one `proficiency.cefr.*` per entity, all a1/a2, matches report table.
- Survival tags: 7 (taglia, medico, febbre, dolore, raffreddore, farmacista, ambulanza) — matches report.
- Slug format: all `<lemma>.noun`, all have exactly one `word.lemma.<lemma>` symbol matching the slug, and `TRANSLATED.learning` matches the lemma exactly. No violations.
- `learning` is lowercase for all 150.
- `word`, `word.part-of-speech.noun`, `word.number.singular` present on all 150.
- `word.gender.*` present and exactly one of masculine/feminine, except 8 deliberately epicene entries (nipote, genitore, parente, insegnante, collega, cliente, paziente, farmacista) — matches report.
- All `domain.*` / `proficiency.*` symbols exist in `dataset/symbols/structural.js` (`word.suffix.*` in `ontological.js` not used here) — zero invented slugs.
- Zero slug collisions and zero example-sentence collisions (learning AND known) against the full live dataset (`dataset/literals/words/*.js`, 1142 entities across 13 files) and all sibling staged batches (adjective-batch-1/2, noun-batch-1, noun-batch-3 — 520 entities).
- Zero internal duplicates: slugs, lemmas, learning examples, known examples all 150/150 unique.
- Form-in-example law: 150/150 `learning` forms appear (accent/apostrophe-normalized) in their own `EXEMPLIFIED.learning`; 150/150 `known` glosses (or one `/`-branch) appear in their own `EXEMPLIFIED.known`.
- No PII; three capitalized in-sentence tokens are place names only (Roma, Australia, Milano).
- No stray JSON structure issues (no extra keys, no comments).

## Linguistic review (adversarial native-Italian read)

### Critical
None found.

### Important

1. **`nipote.noun` — gender symbol omitted but the gloss and example are gender-specific, not gender-neutral.** `TRANSLATED.known` is `"nephew / grandson"` (masculine-only English) and `EXEMPLIFIED.learning` uses the masculine article (`Il nipote visita i nonni ogni estate` / "The nephew visits his grandparents..."). Yet the entity carries no `word.gender` symbol, grouping it with the batch's true epicene set (insegnante, collega, cliente, paziente, farmacista, parente, genitore) whose English glosses are genuinely gender-neutral ("teacher", "colleague", "patient"...). `nipote` is grammatically invariant in Italian (il nipote / la nipote), but this specific entity's known+example pins it to the masculine reading only, so it should either carry `word.gender.masculine` (matching what's actually shown) or the `known` field should be broadened (e.g. "nephew/niece/grandchild") to justify the missing gender tag. As staged, the symbol and the content disagree.

2. **Domain boundary inconsistency across health professions.** `medico` (doctor), `dottore`/`dottoressa` (doctor), `infermiere`/`infermiera` (nurse), `avvocato`, `ingegnere`, `insegnante` are all tagged `domain.work`, but `chirurgo` (surgeon) and `farmacista` (pharmacist) — equally hospital/pharmacy professions — are tagged `domain.health` instead, alongside `paziente` (patient, not even a profession). This split is not documented or justified in the report and has functional impact: `LiteralRepository.constrain` filters by domain symbol, so a health-domain exercise would surface "surgeon" and "pharmacist" but miss "doctor" and "nurse" — the two most central health-profession nouns — while a work-domain exercise gets the reverse gap. Recommend either moving all profession nouns to one domain consistently, or documenting the split's rule (e.g. "hospital-setting professions → health, generic office professions → work" — which would then require moving infermiere/infermiera to health too).

### Minor

3. **`direttore` / `direttrice` presented as a gender pair but with mismatched real-world referents.** `direttore`'s gloss/example is a generic company "director / manager" (approves a project), while `direttrice`'s gloss/example is specifically a school "principal / director (fem.)" (strict school principal). A learner treating these as masc/fem forms of the same job will come away with the wrong idea that `direttore` also means "principal," or that `direttrice` is confined to schools. Not incorrect Italian, just an inconsistent pairing.

4. **`muscolo` example reads slightly unnatural in the singular.** "Allena il muscolo tutti i giorni" ("He trains the muscle every day") — a native speaker training generically would say "allena i muscoli" (plural); the forced singular (required by the `word.number.singular` convention) produces a slightly stilted sentence. No fix available within the batch's constraints; flagging for awareness only.

5. **`emicrania` example has a dangling pronoun antecedent.** "L'emicrania non la lascia dormire" ("The migraine won't let her sleep") — the "her"/"la" has no antecedent inside the isolated sentence. Stylistically this matches other examples in the corpus that assume an implicit unstated subject (naso.noun's "His nose is red" has the same pattern), so it's consistent with established convention rather than a one-off error, but it is the most conspicuous instance of it in this batch.

6. **`problema` placed in `domain.work` feels like a quota-driven fit.** The word is domain-general (a problem can occur anywhere); it was evidently routed to `domain.work` to satisfy both the brief's explicit gender-trap callout and the 35-count work quota. Defensible (the example is workplace-flavored: "a problem with the computer"), but worth flagging as a forced placement rather than an organic one.

### Verified correct (adversarial targets from the brief)

- **la mano** (feminine, -o ending) — correctly tagged feminine; example "Dammi la mano" correct.
- **il problema** (masculine, -a ending, Greek-derived) — correctly tagged masculine.
- **il pigiama** (masculine, -a ending) — also correctly tagged masculine; same trap class as problema, unprompted by the brief, caught correctly.
- **Body-part gender-alternation class** (braccio, dito, labbro, ginocchio, orecchio, osso) — all correctly masculine in their staged singular form; no plural forms staged, so the il/le-alternation trap (le braccia, le dita, etc.) does not surface as a bug here.
- **Kinship article-drop rule** — audited across all applicable family examples (Mio padre, Mia madre, Mio fratello, Mia sorella, Mio nonno, Mia nonna, Mio zio, Mia zia, Mio cugino, Mia cugina, Suo marito, Sua moglie, Mio suocero, Mia suocera, Mio cognato, Mia cognata) — zero violations; famiglia correctly keeps its article as the stated exception.
- **Reflexive body-part participle agreement** (rompersi/storcersi/farsi male constructions) — agrees with the grammatical subject, not the object, per prescriptive rule (e.g. "Si è rotto la gamba" = he broke his leg, "Si è rotta l'unghia" = she broke her nail) — correctly and consistently applied throughout.
- **Elision (l'/un') before vowel-initial nouns** — correctly applied throughout (l'azienda, l'avvocato, l'ingegnere, l'infermiere/a, l'impiegato, l'ambulanza, l'infezione, l'emicrania, l'influenza, un'iniezione, un'allergia, un'ora) including the trickier lo/gli-triggering consonant cluster (`stivale` → "Lo stivale," correctly using `lo` not `il`).
- **Adjective/participle gender agreement in examples** (giacca/appesa, maglietta/gialla, sciarpa/calda-morbida, infezione/diffusa, gonna/corta, etc.) — all agree correctly with their feminine or masculine head noun.
