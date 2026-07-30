# Report: Italian didactic sentences, set 2 — staged

Output: `registry/education/topographies/english-to-italian/.harvest/staged/sentences-authored-2.json`

250 entities, valid JSON (`python3 -c "import json; print(len(json.load(open(...))))"` → `250`).

## Theme counts

| theme | count |
|---|---|
| family/people descriptions | 45 |
| weather/time/dates | 40 |
| health/body | 35 |
| work/school | 45 |
| feelings/preferences | 45 |
| negations + comparisons | 40 |
| **total** | **250** |

Matches the brief's requested 45/40/35/45/45/40 exactly.

## Vocabulary coverage law — method

Built the allowed-form set programmatically from `dataset/literals/words/*.js` (13 files, 2350 word entities, 2249 unique lowercased `trait.TRANSLATED.learning` strings) before authoring a single sentence. Elision handling implemented exactly per the brief: `l'`/`un'` prefixes resolve their remainder against the base form; `dell'`/`all'`/`dall'`/`nell'`/`sull'` prefixes likewise; `po'` and `c'è` (→ `ci`+`è`) are standalone-allowed. Proper names (Marco, Anna, Roma, Milano, Napoli, Firenze, Venezia, Italia) allowed, capped at 1/sentence — in the end none were used (no theme needed one).

Key vocabulary-shape findings that drove sentence construction:
- **No plurals exist anywhere** — every noun and adjective in the corpus is tagged `word.number.singular` only (verified programmatically: 0 plural nouns among 750, 0 plural adjectives among 350). Every one of the 250 sentences was therefore kept to singular nouns/adjectives; plural articles (`i`/`gli`/`le`) and plural possessives (`miei`/`tuoi`/etc.) were avoided.
- **No `piacere`** — the verb does not exist in the corpus at all (0 of 989 verb entries), so the "piace-constructions where forms exist" clause resolved to: don't use them. Feelings/preferences theme instead leans on `essere`/`stare` + feeling-adjective, `preferire`, `volere`/`vorrei`, and the idiom `volere bene a` (all attested forms).
- **No `tempo` (weather/time noun), no month or season names, no `piovere`, `studiare`/`imparare`/`insegnare`/`lavorare`/`abitare`/`vivere`/`amare`/`tè`/`bisogno`/`ogni`/`molti`/`migliore`/`così`/`ritardo`(present)/`ritardo`-family** — weather sentences route through weather *adjectives* (`nuvoloso`, `piovoso`, `soleggiato`, `umido`, `ventoso`) plus `fare`/`c'è` idioms instead of a "weather" noun; comparisons route through `più`/`meno`...`di` and `tanto`...`quanto` (no `così` available); "every" has no lexical form in the corpus at all, so no sentence needed it.
- Adjective gender pairs were spot-checked individually before use — several common adjectives exist in only ONE gender in this corpus (e.g. `generoso` but no `generosa`; `sicuro`/`occupato`/`affamato`/`confuso`/`spaventato`/`vero`/`alta`/`chiara`/`prossimo` all missing their counterpart or missing entirely) — sentences were built around whichever gendered form actually exists.
- Only the 16 "deep" verbs (essere, avere, parlare, credere, dormire, finire, andare, fare, stare, dare, dire, venire, sapere, potere, volere, dovere) carry futuro/imperfetto/condizionale/congiuntivo; the other 56 carry presente (6 persons) + infinitive + participle only. Compound past (avere + participle) was used only where the auxiliary is `avere` (participle is invariant there); essere-auxiliary shallow verbs (cadere, diventare, salire, scendere, succedere) were kept to presente only to avoid needing an unavailable gender-agreeing participle form.

## Verification performed (final, re-run against the written file, clean-room)

- Re-parsed `sentences-authored-2.json` directly (not the in-memory draft) and re-tokenized every `learning` string against the independently-rebuilt allowed-form set: **0 out-of-vocabulary tokens**.
- Re-checked every `slug` against the brief's NFD→ascii→kebab rule: **0 mismatches**.
- Dedup re-verify against: every `EXEMPLIFIED.learning` across `dataset/literals/words/*.js` (2350 sentences), every `sentences.js` `TRANSLATED.learning` (495) + its slugs, the sibling `sentences-authored-1.json` (255 entities, appeared partway through this task — included per the brief's "if present" instruction) + its slugs, and internal duplicates within the 250: **0 collisions** (several were caught and fixed mid-authoring: `Mio padre è medico.`/`Oggi è nuvoloso.`/`Oggi fa caldo.`/`Il cielo è grigio.`/`Ho freddo.`/`Ieri era domenica.`/`Ho la febbre.`/`Sto bene.`/`La riunione è importante.`/`Devo firmare il contratto.`/`La matematica è difficile per me.`/`Sono triste.`/`Sono preoccupato.`/`Non ho paura.`/`Sei felice?`/`Non voglio niente.`/`Questo non è vero.` against the live corpus; `Finisco il lavoro alle sei.`/`Vorrei un caffè.`/`Non sono sicuro.`/`Sei molto stanco?` against the sibling set once it appeared; one internal repeat of `Non dormo mai tardi.` across two themes).
- Word-count re-verify: all 250 sentences are 3–9 words (min 3, max 8) — inherited from the set-1 brief's length rule under "identical regime."
- JSON structural check: every entity has exactly `{slug, traits: ["TRANSLATED"], trait: {TRANSLATED: {known, learning}}, symbols: [{slug: "sentence"}]}`, no extra/missing keys.
- No proper names ended up used (none of the 6 themes needed one), so the max-1-per-sentence cap was never at risk.

## Judgment calls

- Several planned sentences hit real vocabulary gaps mid-draft (`tempo`, `tè`, `ogni`, `molti`, `bisogno`, `sala`, `così`, `migliore`, `cambiare`, `uscire`, `rendere`, `sentire`, `silenzio`, `altro`, `diverso`, `pazienza`, `soluzione`, gendered adjective gaps) — every one was rewritten to a different sentence using only confirmed forms rather than approximated or forced.
- Clock-time and date idioms (`È l'una.`/`Sono le due.`/`Sono le sei di sera.`, day-of-week statements) rely on the standard Italian ellipsis of "ore" — no plural noun needed, consistent with the singular-only corpus.
- `dell'`/`un'`/`l'`/`c'è`/`po'` are the only elisions used; the live corpus also uses unlisted elisions like `Dov'è`/`Com'è` (confirmed present in `sentences.js`, and even used as the brief's own slug-conversion example), but since the brief enumerates its allowed elision set explicitly and none of my six themes required "where is" phrasing, none of those were used — no invented elision rule was needed.

No PII. No git/jj commands run. Only the staged JSON file and this report were written.
