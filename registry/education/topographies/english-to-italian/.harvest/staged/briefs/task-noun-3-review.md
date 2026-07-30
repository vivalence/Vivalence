# Review: task-noun-3 (Italian noun batch 3 — nature/weather/animals/time/education)

Reviewed: `noun-batch-3.json` (150 entities) against brief, corpus-quality-criteria.md, structural.js/ontological.js symbol registries, live `dataset/literals/words/*.js`, and all files currently in `.harvest/staged/*.json`.

Mechanical checks (scripted): JSON parses, 150 entities, domain split nature 30 / weather 20 / animals 25 / weekday 7 + time 33 = 40 / education 35 — all match brief. Internal slug/example uniqueness — clean. Symbol shape (word / word.lemma.\<lemma\> / word.part-of-speech.noun / word.gender.\* exactly 1 / word.number.singular / exactly 1 proficiency.cefr.\* / exactly 1 domain.\*) — clean for all 150. `learning` always lowercase, always equals the slug's lemma stem, always appears verbatim in its own EXEMPLIFIED.learning — clean for all 150. Weekdays: all 7 lowercase, `domain.weekday` (not `domain.time`), masculine except `domenica` feminine — correct. domain.\*/proficiency.\* slugs all legal against `structural.js` — no invented slugs. Zero slug/example collisions against the live dataset (988 existing literals).

Linguistic pass: gender assignments checked entity-by-entity, including the classic traps this batch deliberately courts — `ape`, `volpe`, `tigre` (feminine despite -e ending), `mese`, `esame`, `errore`, `serpente`, `istante`, `presente` (masculine despite -e ending), `fine` (feminine here = "end", correctly distinguished from masculine `il fine` = "purpose"), `mezzanotte`/`mezzogiorno` (feminine vs masculine, correctly split), `clima`/`diploma` (Greek -ma masculine exception, correctly applied). All 150 examples are grammatical, agreement-correct, and the English `known` is faithful to the Italian.

## Critical

- **`insegnante.noun` — slug collision vs `.harvest/staged/noun-batch-2.json`.** Batch-2 defines it as `domain.work`, no gender symbol, example "L'insegnante spiega la lezione". Batch-3 (this file) defines it as `domain.education`, `word.gender.masculine`, example "L'insegnante spiega la lezione chiaramente". Two incompatible entity bodies under one slug — whichever batch lands second will silently duplicate/shadow the other in the live dataset. Fix: rename or merge before either batch is promoted.
- **`lingua.noun` — slug collision vs `noun-batch-2.json`, different word senses.** Batch-2: "tongue" (`domain.body`). Batch-3 (this file): "language" (`domain.education`). This is the worst of the three — both senses are legitimate vocabulary and both deserve an entry, but they cannot share `lingua.noun`. Needs a disambiguated slug scheme (e.g. sense-qualified) or one sense dropped, decided before merge.
- **`scadenza.noun` — slug collision vs `noun-batch-2.json`.** Same meaning ("deadline") in both, but different `domain` (work vs time), different CEFR (a2 vs b1), different example sentence. Straightforward duplicate, needs one canonical version.

*(Timing note: file mtimes show `noun-batch-3.json` was completed before `noun-batch-2.json` existed, so this isn't an execution fault of task-noun-3's implementer — the brief's own dedup check couldn't have seen batch-2 yet. It is a real blocking defect in the current staged state, not a defect in the implementer's process.)*

## Important

- **Cross-batch duplicate example sentence.** `ora.noun` (this batch) and `riunione.noun` (`noun-batch-2.json`) both use the exact Italian sentence "La riunione dura un'ora" verbatim. Violates the corpus rule against reusing an example sentence across entities. One of the two needs a new example.
- **Report's collision claim is now stale.** `task-noun-3-report.md` states "zero collisions remain (script-verified against all live dataset/literals/words/*.js and all sibling .harvest/staged/*.json)" — true at the time of writing, but `noun-batch-2.json` and `adjective-batch-2.json` now sit in the same `staged/` directory with the collisions above. Any downstream consumer trusting that line at face value would miss the problem; needs a re-run before merge.

## Minor

- `serpente.noun` example "Il serpente striscia tra l'erba" — `tra` ("among/between") is a slightly less idiomatic choice than `nell'erba` for a single mass-noun referent; attested but not the most natural phrasing. Not wrong.
- Three time-domain entries (`minuto`, `momento`, `attimo`) all use the same "Aspetta ... " imperative template (Aspetta un minuto / Aspetta il momento giusto / Aspetta solo un attimo). Each sentence is distinct text so it doesn't violate the letter of "no duplicate examples," but the repeated construction across 3 of 150 entries is a thin spot in example diversity.
