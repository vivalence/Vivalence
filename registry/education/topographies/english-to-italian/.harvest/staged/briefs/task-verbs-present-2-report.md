# Report: Italian present-only verbs, set 2 — staged

Output: `registry/education/topographies/english-to-italian/.harvest/staged/verbs-present-2.json`

56 lemmas, valid JSON (`python3 -c "import json; d=json.load(open('<path>')); print(len(d), all(len(v['present'])==6 for v in d))"` → `56 True`).

## Brief count discrepancy

The brief's title/intro says "55 lemmas" but the space-separated list actually contains **56** words. Counted programmatically (`s.split()` → `len==56`). Per the hard law "do not add or substitute," I staged every lemma in the list verbatim rather than guessing which one to drop — all 56 are present, in the brief's exact order, no additions.

## Schema

Each entry: `{lemma, band, suffix, regularity, infinitive:[learning,known,knownExample,italianExample], participle:[...], present:[6 × [...]]}` — matches `build-present-verbs.py`'s expected shape (`entity()` unpacks each row as `learning, known, known_example, learning_example`). Present-cell order is 1sg/2sg/3sg/1pl/2pl/3pl, matching `CELLS` in the build script.

Regularity distribution: 52 regular / 4 irregular (`salire`, `scegliere`, `togliere`, `spegnere` — all 1sg/3pl `-go/-gono` insertion verbs). Per the brief's explicit instruction, `regularity` reflects **present-tense** regularity only: verbs with irregular participles but fully regular present (`decidere→deciso`, `scendere→sceso`, `cadere→caduto`, `aggiungere→aggiunto`, `accendere→acceso`, `rompere→rotto`, `vincere→vinto`, `dipingere→dipinto`, `conoscere→conosciuto`, `succedere→successo`) are tagged `regular`. `-isc-` verbs (`pulire`, `preferire`, `costruire`) tagged `regular` per the brief's explicit callout. Suffix split: 34 `-are` / 17 `-ere` / 5 `-ire`. Band split: 16 a1 / 40 a2 (judgment call, no strict rubric given).

## Verification performed (programmatic)

- Parsed all 13 `dataset/literals/words/*.js` entity files + `conjugation.js` (`index.js` skipped, barrel not entity data) into a forbidden-set of 990 known-examples / 992 learning-examples.
- Added every sibling staged file present at run time (`adjective-batch-1/2.json`, `noun-batch-1/2/3.json`) to the same set — 397 more known / 400 more learning examples. **`verbs-present-1.json` did not exist yet at any point during this task** (parallel author hadn't produced it) — per the brief, proceeded on uniqueness duty against everything else.
- Checked all 448 new example rows (56 lemmas × 8 forms: infinitive + participle + 6 present cells) against that combined set: **zero external collisions**, known or learning side.
- Checked internal uniqueness across the 448 rows: **zero duplicate known examples, zero duplicate learning examples**.
- Checked every `learning` form is a literal (case/word-boundary insensitive) substring of its own Italian example: **all 448 pass**. Caught and fixed 7 infinitive-row failures where a clitic was fused onto the infinitive (`raccontarti`, `mostrarti`, `incontrarlo`, `ringraziarti`, `mandarti`, `regalarle`, `offrirti` — none of these literally contain the bare infinitive string) by rewriting with clitic-climbing before the modal verb instead (`Ti voglio raccontare una storia` instead of `Voglio raccontarti una storia`), which is equally natural standard Italian and keeps the bare infinitive visible.
- Checked `known != learning` for every row: no collisions.
- Dry-ran the actual `build-present-verbs.py` merge logic (read-only simulation, no files touched) against the staged file plus real `dataset/literals/words/verb.js`: 448/448 word literals would be added cleanly, zero lemma collisions with the 16 lemmas already in `build-verbs.py`'s `VERBS` list (essere, avere, parlare, credere, dormire, finire, andare, fare, stare, dare, dire, venire, potere, volere, dovere, sapere) or with anything already in `verb.js`, zero duplicate slugs.

## Judgment calls

- **`succedere` / `significare` impersonal handling**: per the brief, all 6 present cells are filled with grammatically valid forms. 3rd person cells use the natural impersonal sense ("it happens" / "it means"); 1st/2nd person cells use the verbs' other legitimate sense (`succedere a qualcuno` = "to succeed/follow someone" in a role; `significare` used reflexively-figuratively as "to mean [something] to someone," e.g. "Significhi tutto per me" = "You mean everything to me" — a common, natural construction).
- **`conoscere` participle gloss = "met," not "known"**: `Ho conosciuto mia moglie in Italia` is the standard Italian for "I met my wife in Italy" — passato prossimo of `conoscere` carries an inceptive ("came to know") meaning, not continuous "have known" (which Italian expresses with present tense: `La conosco da anni`). Kept the infinitive's `known` as plain "to know" but gave the participle row its own accurate gloss, matching the criteria doc's instruction that each cell's English must reflect what the Italian form actually means.
- **3sg `known` field**: used "he/she [verb]s" for person-subject examples, "it [verb]s" where the chosen example's subject is inanimate (`mostrare`→"the map shows," `offrire`→"the restaurant offers," `scendere`→"the temperature drops," `cadere`→"the rain falls," `pesare`→"this suitcase weighs," `misurare`→"this table measures," `costruire`→"the company builds," `vincere`→"the team wins," `attraversare`→"the train crosses," plus the already-impersonal `succede`/`significa`).
- **Essere-auxiliary participles** (`salire→salito`, `scendere→sceso`, `cadere→caduto`, `diventare→diventato`, `succedere→successo`): all example subjects kept masculine-singular or impersonal so the citation participle form (base masculine singular) matches the example without a gender-agreement mismatch.
- **`-are` spelling-rule verbs** (h-insertion for `-care`/`-gare`: `spiegare`, `toccare`, `significare`; stem-final-i non-doubling for `-iare`: `ringraziare`, `tagliare`, `noleggiare`) conjugated per standard orthographic rules, e.g. `spieghi`/`spieghiamo` but `spiegate`; `ringrazi`/`ringraziamo` not `ringrazii`/`ringraziiamo`.
- **RANKED and VOCALIZED omitted**, matching the set-1 precedent (present-only-verbs regime) — not requested by the brief.

## Concerns

- **Lemma count mismatch** (55 vs. actual 56 in the brief's list) — flagged above; resolved by staging all 56 rather than dropping one, since the brief forbids substitution/omission and the discrepancy reads as a header typo, not an instruction to cut a specific verb.
- `verbs-present-1.json` was absent throughout this run, so cross-file dupe-checking against it could not be performed — only checked against everything else per the brief's fallback instruction. Recommend a follow-up diff once set 1 lands.

No PII. No git/jj commands run. Only the staged JSON file and this report were written.
