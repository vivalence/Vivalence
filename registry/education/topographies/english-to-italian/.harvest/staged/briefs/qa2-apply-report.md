# QA2 — apply report

Source briefs:
- `briefs/qa2-example-naturalness.md` — Important + Minor (Critical was already applied upstream)
- `briefs/qa2-gloss-consistency.md` — Task A REAL, Task B Critical + Important, Task C misbands

**APPLIED: 84 findings · 228 field edits · SKIPPED: 28 findings · audit findings 5 (all pre-existing)**

---

## Applied — per file

```
adjective.js      16 field edits
adposition.js      2
adverb.js          2
contraction.js     2
noun.js           34
pronoun.js         4
verb.js          168
                 ---
                 228
```

Every edit was applied only after asserting the finding's stated *current* value matched the
file byte-for-byte. 0 mismatches, 0 slugs not found.

### By brief section

```
naturalness · Important      17 of 27 findings
naturalness · Minor          40 of 58 findings
gloss · Task A REAL          12 of 12
gloss · Task B Critical       4 of 4   (B1 B2 B3 B4)
gloss · Task B Important      7 of 7   (B5 B6 B7 B8 B9 B10 B11)
gloss · Task C misbands       4 of 4
```

Task B **Minor** (B12–B20) and the Task A "optional polish" list were out of scope per the
instruction and were not touched. The Task C band-policy question (192 conditional/subjunctive
entities at `a1`) is a policy decision, not a misband — untouched.

---

## Skipped — 28 findings

### A · The proposal removes the entity's own `learning` form from its example (19)

Corpus criteria § EXEMPLIFIED: *"If the entity's `learning` is X, the example's `learning`
must contain X. **No exceptions.**"* — machine-enforced by `audit.py` as
`FORM-NOT-IN-EXAMPLE`. Each of these proposals pluralises or lexically replaces the very word
the entity teaches, which would delete the entity's teaching surface and add a new audit
finding. Applying them needs a decision that is not in the brief (rewrite the frame, or
re-lemmatise the entity to the plural).

```
mattone.noun          mattone rosso        → mattoni rossi
saldo.noun            il saldo             → i saldi
contante.noun         di contante          → di contanti
elettricità.noun      l'elettricità        → la corrente
elezione.noun         L'elezione si terrà  → Le elezioni si terranno
sospetto.noun         un sospetto          → dei sospetti
erbaccia.noun         l'erbaccia           → le erbacce
molecola.noun         una molecola         → molecole semplici
morta.adjective.feminine.singular     è morta        → è scarica
dipendente.adjective                  è dipendente   → dipende
durevole.adjective                    è durevole     → resistente
riempire.verb.infinitive              riempire       → compilare
riempire.verb.indicative.present.second.singular   riempi → compili
salvare.verb.indicative.present.first.plural       Salviamo → Risparmiamo
crollare.verb.indicative.present.first.plural      Crolliamo → Scoppiamo
girare.verb.indicative.present.second.singular     giri → alzi
gettare.verb.indicative.present.second.singular    getti → lanci
realizzare.verb.participle.past                    realizzato → ottenuto
dare.verb.imperative.second.singular               Dai → Dammi
potere.verb.infinitive                             potere → poter
dovere.verb.infinitive                             dovere → dover
```

(`riempire` and `potere`/`dovere` are one brief bullet each covering two slugs — 19 bullets,
21 slugs.)

Where a finding offered a **second** alternative that preserved the form, that alternative was
taken instead of skipping — see the Adjustments section (`vanga`, `salire.2pl`, `interruttore`).

### B · No proposal given — the bullet is a diagnosis, not a fix (8)

```
colino.noun          "EN says through, IT says nel; also a colino is a tea strainer"
centimetro.noun      "semantically odd for a sheet of paper"
temperino.noun       "collides with temperamatite; in most of Italy a penknife"
irritata.adjective.feminine.singular   "la capa is markedly colloquial"
regnare.verb.indicative.present.first.singular   "tautological"
esistere.verb.indicative.present.first.singular  "unnatural in both languages"
crollare.verb.indicative.present.third.singular  "mixes present with a completed past event"
piovere.verb.infinitive                          "sta per sits awkwardly with stanotte"
```

### C · Self-cancelling (1)

```
potere.verb.indicative.imperfect.second.plural / .third.plural
  the finding proposes passato prossimo, then states "the imperfetto is defensible in a
  tense drill" — the cells exist to teach the imperfetto, so the proposal cannot be applied
  without deleting the paradigm slot.
```

---

## Adjustments and interpretive calls (flagged)

1. **Second-alternative selection** where the first proposal broke the form rule:
   - `vanga.noun` → `Scavo il terreno con la vanga` (not `Vango il campo`).
   - `salire…second.plural` → `Salite sull'autobus?` (not `Prendete l'autobus?`).
   - `interruttore.noun` → `Premi l'interruttore…` (not `spegni la luce`).

2. **English updated alongside an Italian fix even though the finding gave no EN string**,
   because the change moved person, subject or lexis and the old EN no longer translated it:
   `vanga` (field → ground), `scolapasta` (3sg → 1sg), `evidenziatore` (underline → highlight),
   `interruttore` (turn off → press), `salire.2pl` (go up by bus → get on the bus),
   `dritta` (miles → kilometers), `aggiustato` (is fixed → has been fixed).

3. **Minimal licensed substitutions** where the finding named the correct collocation but not
   the sentence: `fascio.noun` `fiori` → `legna` ("fascio is for firewood"); `semino.noun`
   gloss + example `seedling` → `small seed` ("IT semino (small seed) vs EN seedling");
   `avvicinare.2sg` "so much closer" → "so close".

4. **B1 `stare` scope.** The finding is internally contradictory: it says *"dual-gloss every
   cell `be / stay`"* with worked examples `'I would be / stay'`, `'we would be / stay'`, but
   also *"in the order the corpus already uses on `stare.verb.infinitive` (`'to stay / to be'`)"*.
   Resolution taken: **`be / stay` order**, applied to the 23 cells in the four blocks the
   finding actually tabulates (conditional, future, subjunctive, present). Left untouched:
   the infinitive (already dual-glossed, cited by the finding as the model), the imperfect
   block (already internally uniform — no lexeme split to fix), the gerund and the imperative.
   The participle went to `'stayed'` per A-12 / B-4, not `be / stay`.

5. **`opporre` / `ritirare` / `girare.pp` / `pescare.pp` / `cedere`** — the fixes were applied to
   the **example** English only, which is what those bullets quote. Consequence: the entity
   `TRANSLATED.known` (`'to oppose'`, `'you withdraw'`, `'turned'`, `'fished'`, `'given in'`)
   no longer appears verbatim in its own English example. That is criteria rule 6, which is not
   machine-audited, and widening those glosses was not proposed. Flagging for a follow-up
   decision — `ritirare` in particular still glosses one lemma with two senses.

6. **B8 imperfect convention** was applied to the gloss column only, as proposed ("4 lemmas,
   24 cells"). Four examples now narrate with *was …ing* under a *used to* gloss
   (`dormire` 1sg/2sg/2pl/3pl). Not proposed; left alone.

7. `bugiardo` and `bugiarda` now carry the identical English example (`The witness is a liar`);
   their Italian examples differ, so no `DUPE-EXAMPLE` finding. This follows from the brief
   treating both cells in one bullet.

8. **VOCALIZED**: confirmed `grep -c VOCALIZED dataset/literals/words/*.js` → 0 in all 14 files.
   `dataset/literals/sentences.js` was not opened or modified.

---

## Audit / rank / audit

### audit.py — after edits, before rank

```
literals 6035 · bundles 351 · findings 5 · orphan-mp3s 0
  FORM-NOT-IN-EXAMPLE dare.verb.gerund
  FORM-NOT-IN-EXAMPLE dire.verb.gerund
  FORM-NOT-IN-EXAMPLE piovere.verb.indicative.present.second.singular
  FORM-NOT-IN-EXAMPLE piovere.verb.indicative.present.first.plural
  FORM-NOT-IN-EXAMPLE piovere.verb.indicative.present.second.plural
```

### rank.py — all word files

```
adjective.js: 560 ranked
adposition.js: 18 ranked
adverb.js: 197 ranked
contraction.js: 30 ranked
coordinating-conjunction.js: 4 ranked
determiner.js: 33 ranked
interjection.js: 21 ranked
noun.js: 1336 ranked
numeral.js: 25 ranked
pronoun.js: 84 ranked
subordinating-conjunction.js: 3 ranked
  ZERO-FREQ (RANKED dropped): dormire.verb.conditional.first.plural (dormiremmo)
  ZERO-FREQ (RANKED dropped): dormire.verb.conditional.second.plural (dormireste)
  ZERO-FREQ (RANKED dropped): dormire.verb.conditional.third.plural (dormirebbero)
  ZERO-FREQ (RANKED dropped): dormire.verb.subjunctive.present.second.plural (dormiate)
  ZERO-FREQ (RANKED dropped): finire.verb.indicative.imperfect.second.plural (finivate)
  ZERO-FREQ (RANKED dropped): succedere.verb.indicative.present.first.singular (succedo)
  ZERO-FREQ (RANKED dropped): succedere.verb.indicative.present.second.singular (succedi)
  ZERO-FREQ (RANKED dropped): succedere.verb.indicative.present.first.plural (succediamo)
  ZERO-FREQ (RANKED dropped): succedere.verb.indicative.present.second.plural (succedete)
  ZERO-FREQ (RANKED dropped): nascere.verb.indicative.present.second.plural (nascete)
  ZERO-FREQ (RANKED dropped): dimagrire.verb.indicative.present.first.plural (dimagriamo)
  ZERO-FREQ (RANKED dropped): guarire.verb.indicative.present.first.plural (guariamo)
  ZERO-FREQ (RANKED dropped): pattinare.verb.indicative.present.first.plural (pattiniamo)
  ZERO-FREQ (RANKED dropped): pattinare.verb.indicative.present.second.plural (pattinate)
  ZERO-FREQ (RANKED dropped): piovere.verb.indicative.present.first.singular (piovo)
  ZERO-FREQ (RANKED dropped): piovere.verb.indicative.present.first.plural (pioviamo)
  ZERO-FREQ (RANKED dropped): piovere.verb.indicative.present.second.plural (piovete)
  ZERO-FREQ (RANKED dropped): prescrivere.verb.indicative.present.second.plural (prescrivete)
  ZERO-FREQ (RANKED dropped): regnare.verb.indicative.present.first.plural (regniamo)
  ZERO-FREQ (RANKED dropped): scomparire.verb.indicative.present.first.plural (scompariamo)
  ZERO-FREQ (RANKED dropped): sconfiggere.verb.indicative.present.first.singular (sconfiggo)
verb.js: 2688 ranked
```

The ZERO-FREQ list is pre-existing `wordfreq` coverage, unrelated to this pass — none of those
slugs were edited here except the `succedere` and `finire` gloss widenings, which do not touch
`learning`.

### audit.py — after rank

```
literals 6035 · bundles 351 · findings 5 · orphan-mp3s 0
  FORM-NOT-IN-EXAMPLE dare.verb.gerund
  FORM-NOT-IN-EXAMPLE dire.verb.gerund
  FORM-NOT-IN-EXAMPLE piovere.verb.indicative.present.second.singular
  FORM-NOT-IN-EXAMPLE piovere.verb.indicative.present.first.plural
  FORM-NOT-IN-EXAMPLE piovere.verb.indicative.present.second.plural
```

**Net audit delta: 0.** The 5 findings are the baseline measured before this pass began — they
were introduced by the already-applied **Critical 3, 4 and 6** fixes (`Dare consigli…` no longer
contains `dando`; `Dire addio…` no longer contains `dicendo`; the three rebuilt `piovere` cells
no longer contain `piovi` / `pioviamo` / `piovete`). Those four Critical cells now teach a form
their example does not show and need a second pass — outside this task's scope, flagged here.
