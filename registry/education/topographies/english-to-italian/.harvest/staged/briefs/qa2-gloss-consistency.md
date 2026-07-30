# QA2 — gloss/example sense consistency, cross-entity gloss coherence, CEFR banding

Corpus: `registry/education/topographies/english-to-italian/dataset/literals/words/*.js` — 5020 entities.
Criteria: `.ikiro/reference/corpus-quality-criteria.md` § EXEMPLIFIED → "The known word should appear in the English example… demonstrates the meaning the learner just learned".

Adjudication rule applied: **CLEARED** when the example's English expresses the *same sense* by a synonym, clipped form, or standard collocation (sense identity, not string identity — the flagger checks strings). **REAL** when the example demonstrates a sense or a verb form the gloss does not teach.

Note on intervention cost: no `words/*.js` entity carries VOCALIZED (`grep -c VOCALIZED words/*.js` → 0 in all 14 files). Example sentences have no audio dependency, so widening `known` and rewriting `EXEMPLIFIED` cost the same. "Smaller intervention" below therefore means *preserves more teaching value*, not *touches fewer bytes*.

---

## Task A — 74 flagged · 12 REAL · 62 CLEARED

### Why 62 cleared

The flag list matched only the **gloss head** (text before the first ` / `). 54 of the 74 carry a two-sense gloss whose *second* alternative is exactly what the example demonstrates:

```
basso     'short / low'                → 'The table is low'            ✓ "low" is glossed
occupato  'busy / occupied'            → 'The bathroom is occupied'    ✓
sicuro    'sure / safe'                → 'The bridge is safe'          ✓
unico     'unique / only'              → 'He is the only son…'         ✓
fra       'between / in (time)'        → 'I arrive in ten minutes'     ✓
molto     'very / a lot'               → 'I like it a lot'             ✓
conto     'bill / account'             → 'I open an account…'          ✓
lo        'him / it (masc.)'           → 'I buy it'                    ✓
sua       'his / her (fem. noun)'      → 'Her voice is beautiful'      ✓
dire.inf  'to say / to tell'           → 'I need to tell you…'         ✓
```

Full cleared-by-second-alternative set: `gigante occupato giusto sicuro basso bassa tranquillo spenta guasto opaca elastico elastica sicura unico celebre improbabile fra fino molto anche dopo dietro subito allora insomma proprio cioè appunto sopra sotto debolmente però centro conto cassa attimo polso lavoro desiderio viaggio quesito responso comune lo sua altro altra fare.participle.past fare.3pl dire.infinitive dire.participle.past dovere.infinitive`.

The remaining 8 cleared are genuine synonym/paraphrase/collocation equivalences:

```
aereo      'airplane'  → 'flying by plane'              clipped form
benzina    'gasoline'  → 'get gas'                      clipped form
fuori      'outside'   → 'We eat out tonight'           same locative sense, idiomatic collocation
paura      'fear'      → 'I am afraid of the dark'      avere paura → be afraid; standard rendering
alcuna     'any (negative, fem.)' → 'There is no reason' negative concord — gloss already annotates it
sentenza   'verdict'   → 'issued its ruling'            synonym, same legal sense
scorta     'stock'     → 'a supply of water'            synonym
finire.3pl 'they finish' → 'The holidays end on Sunday' synonym; 3pl subject present
scendere.3sg 'it goes down' → 'The temperature drops'   synonym; 3sg subject present
cantare.3pl 'they sing' → 'The fans sing the anthem'    exact verb; 3pl subject present
```

Polish (optional, one-word English edits that would make the mapping literal — not counted as REAL):
`sentenza` → "issued its **verdict**" · `scorta` → widen to `'stock / supply'` · `finire.3pl` → "The holidays **finish** on Sunday" · `scendere.3sg` → "The temperature **goes down** at night".

### The 12 REAL — with proposed fix

**Sense mismatches** (example teaches a sense the gloss does not cover):

1. `numerosa.adjective.feminine.singular` — `'numerous (fem.)'` / *"The family is large"* (`La famiglia è numerosa`)
   → **widen the pair**: `numeroso` → `'numerous / large (in number)'`, `numerosa` → `'numerous / large (in number) (fem.)'`.
   Rationale: `La famiglia è numerosa` is the idiomatic collocation; "The family is numerous" is unnatural English. The corpus already dual-glosses both genders for `basso/bassa`, `sicuro/sicura`, `elastico/elastica`, `opaco/opaca`, `spento/spenta` — this follows its own convention and closes the Task B pair-inconsistency (masc example teaches "numerous", fem teaches "large") in one edit.

2. `stretta.adjective.feminine.singular` — `'narrow (fem.)'` / *"The shoe is tight"* (`La scarpa è stretta`)
   → **widen the pair**: `stretto` → `'narrow / tight'`, `stretta` → `'narrow / tight (fem.)'`.
   Rationale: masc example teaches "narrow" (`Il corridoio è stretto`), fem teaches "tight" — same Task B pair split. Both senses are core; keep both examples.

3. `secondo.adposition` — `'according to'` / *"In my opinion, you are right"* (`Secondo me, hai ragione`)
   → **realign example**: `'According to Marco, the film is beautiful'` / `'Secondo Marco, il film è bello'`.
   Rationale: widening to `'according to / in my opinion'` would gloss an adposition with a full phrase. A third-person example makes "according to" the natural English and keeps the adposition visible.

4. `male.adverb` — `'badly'` / *"I feel sick"* (`Mi sento male`)
   → **widen known**: `'badly / unwell'`.
   Rationale: `sentirsi male` is high-value survival vocabulary — keep the example. `male` genuinely covers both.

5. `ci.pronoun` — `'us / there'` / *"See you later"* (`Ci vediamo dopo`)
   → **realign example**: `'He calls us tomorrow'` / `'Ci chiama domani'`.
   Rationale: the example demonstrates a **third** sense the gloss does not carry — reciprocal/reflexive 1pl ("each other"). Neither "us" nor "there" is present. Widening to a three-way gloss overloads an a1 card; a clean accusative example teaches the glossed sense.

6. `dalla.contraction` — `'from the (fem.)'` / *"I come out of the bank"* (`Esco dalla banca`)
   → **realign example**: `'I take the book from the bag'` / `'Prendo il libro dalla borsa'`.
   Rationale: after `uscire`, `da` is rendered "out of" — the contraction's own gloss never surfaces. A non-motion verb makes "from the" literal.

7. `avere.verb.gerund` — `'having'` / *"Being hungry, I order right away"* (`Avendo fame, ordino subito`)
   → **realign example**: `'Having a car, I travel often'` / `'Avendo una macchina, viaggio spesso'`.
   Rationale: `avere fame` → "be hungry" erases "having" entirely. A possessive object keeps the gerund visible.

8. `fare.verb.indicative.present.first.plural` — `'we do'` / *"Let's take a break"* (`Facciamo una pausa`)
   → **realign example**: `'We do the homework together'` / `'Facciamo i compiti insieme'`.
   Rationale: the example is hortative ("let's"), not indicative, *and* the collocation renders as "take". Two layers of drift on one card.

9. `fare.verb.imperative.second.singular` — `'do...!'` / *"Pay attention!"* (`Fai attenzione!`)
   → **realign example**: `'Do your homework!'` / `'Fai i compiti!'`.
   Rationale: `fare attenzione` is a lexicalized collocation where "do" vanishes.

**Form mismatches** (participle glossed; example's English never shows the participle):

10. `dormire.verb.participle.past` — `'slept'` / *"Did you sleep well?"* (`Hai dormito bene?`)
    → **English-only**: `'Have you slept well?'`. Italian unchanged.

11. `andare.verb.participle.past` — `'gone'` / *"I went on foot"* (`Sono andato a piedi`)
    → **realign example**: `'Where has Marco gone?'` / `'Dov'è andato Marco?'` (`andato` stays masc. sing.).
    Rationale: "I have gone on foot" is marked English; an interrogative gives "gone" naturally.

12. `stare.verb.participle.past` — `'stayed / been'` / *"I was unwell yesterday"* (`Sono stato male ieri`)
    → **narrow known + realign example**: `'stayed'` / `'I have stayed home all day'` / `'Sono stato a casa tutto il giorno'`.
    Rationale: also resolves B4 — `essere.verb.participle.past` is `'been'` = `stato` with example "I have been to Venice". Two entities, one surface, overlapping gloss → indistinguishable cards. Reserving "been" for `essere` and "stayed" for `stare` splits them cleanly.

### Coverage gap in the brief itself

An independent re-run of the same check against **all** gloss alternatives (not just the head), with morphological variants, finds **58** violations — of which **37 are not in the 74-item brief**. 9 of those 37 are matcher artifacts (`a`, `di`, `ecco`, `fare.infinitive`, `mia`, `mio`, `stare.future.1sg`, `tutte`, `neanche` — the gloss word *is* present as a stopword, a contraction, or a licensed NPI). **28 are genuine** and are folded into Task B below, because they cluster by lemma family rather than scattering.

The brief's generator should match every ` / `-separated alternative and stem English inflection; as written it produces ~73% false positives and misses ~48% of true violations.

---

## Task B — cross-entity gloss consistency

### Critical

**B1 · `stare` paradigm: the English lexeme changes per cell with no pattern.** 34 forms; three different lexemes (*be* / *stay* / *look*) distributed arbitrarily *within single tense-mood blocks*:

```
conditional   1sg 'I would stay'          1pl 'we would be'
              2sg 'you would be'          2pl 'you all would be'
              3sg 'it would look / he would be'   3pl 'they would stay'
future        1sg 'I will be / stay'      1pl 'we will be'
              2sg 'you will be'           2pl 'you all will be'
              3sg 'he/she/it will stay'   3pl 'they will be'
subjunctive   1sg '(that) I stay / be'    1pl '(that) we stay'
              2sg '(that) you be'         2pl '(that) you all stay'
              3sg '(that) he/she be'      3pl '(that) they be'
present       1sg 'I am / I stay'         1pl 'we are'  2sg 'you are'  3sg 'he/she is'
```

The paradigm grid is the learner-facing artifact (criteria § Paradigm Shape). A grid whose English column reads *stay, be, be, be, look, stay* teaches noise. **Fix**: one family convention — dual-gloss every cell `be / stay` in the order the corpus already uses on `stare.verb.infinitive` (`'to stay / to be'`), e.g. `starei` → `'I would be / stay'`, `staremmo` → `'we would be / stay'`. The third sense (`stare bene` → "look good", 3sg conditional) should be dropped from the gloss or added family-wide, not left on one cell.

**B2 · `succedere`: one lemma, two unrelated verbs, split by person, undocumented.**

```
1sg 'I succeed (someone)'      | 'I succeed my father in the family business'
2sg 'you succeed (someone)'    | 'You succeed the outgoing director'
1pl 'we succeed (someone)'     | 'We succeed the previous owners of the shop'
2pl 'you all succeed (someone)'| 'You all succeed your father in the company'
3sg 'it happens'               | 'Sometimes it happens without warning'
3pl 'they happen'              | 'Strange things happen in this house'
inf 'to happen'                | 'Nobody knows what is going to happen'
pp  'happened'                 | "I don't know what has happened here"
```

The split is linguistically principled (the "happen" sense is third-person only), but the criteria doc's carve-out is for *documented impersonal exceptions* and nothing here documents it. The infinitive card teaches "to happen"; the 1sg card teaches "I succeed my father". A learner drilling this lemma gets an incoherent set. **Fix**: annotate the third-person cells `'it happens (impersonal)'` / `'they happen (impersonal)'` and the infinitive `'to happen (impersonal) / to succeed (someone)'`, matching the `(someone)` annotation the personal cells already carry.

**B3 · `fare.verb.indicative.present.third.singular` glosses the wrong sense for its own example.**

```
present 3sg  'he/she/it does'          | 'It is cold tonight'          / 'Fa freddo stasera'
future  3sg  'it will be / he will do' | 'Tomorrow the weather will be nice' / 'Domani farà bel tempo'
```

The future cell already models the correct dual gloss for meteorological `fare`; the present cell does not, so the highest-frequency card in the family (`fa`) teaches "does" against a weather example. **Fix**: `'he/she/it does / it is (weather)'`.

**B4 · `stato` — two entities, one surface, overlapping gloss.**

```
essere.verb.participle.past  'been'           | 'I have been to Venice'    / 'Sono stato a Venezia'
stare.verb.participle.past   'stayed / been'  | 'I was unwell yesterday'   / 'Sono stato male ieri'
```

Both correct Italian (the participle is shared), but as cards they are not discriminable: prompt "been" has two right answers, both `stato`. **Fix**: as A-12 — narrow `stare` to `'stayed'`, realign its example to the stay sense.

### Important

**B5 · `finire` family — gloss "finish" everywhere, 6 examples teach "end".**
```
present.3pl     'they finish'          | 'The holidays end on Sunday'
future.3sg      'he/she will finish'   | 'The course will end in June'
future.3pl      'they will finish'     | 'The works will end in May'
imperfect.3sg   'he/she used to finish'| 'The shift used to end at midnight'
imperfect.3pl   'they used to finish'  | 'The parties used to end at dawn'
subjunctive.3sg '(that) he/she finish' | 'I hope that the cold ends'
conditional.3sg 'he/she would finish'  | 'She would never stop reading'   ← "stop", a third lexeme
```
The 3rd-person examples all take inanimate subjects, where English prefers "end". **Fix**: widen the family to `'finish / end'` (34 cells, mechanical) rather than rewriting six examples — the examples are good, the gloss is narrow. Rewrite `conditional.3sg` separately (`'She would finish the book in one evening'` / `'Finirebbe il libro in una sera'`).

**B6 · `scendere` family — gloss "go down" everywhere, examples teach "get off" and "drops".**
```
present.1pl 'we go down'      | 'We get off at the next station'
present.2sg 'you go down'     | 'At which stop do you get off?'
present.2pl 'you all go down' | 'Do you all get off here?'
present.3sg 'it goes down'    | 'The temperature drops at night'
```
Half the paradigm teaches the transport sense, which the gloss never names — and it is the more useful sense for a traveller. **Fix**: widen the family to `'go down / get off'`.

**B7 · `dire` family — dual gloss on the non-finite forms, single gloss on the finite ones, examples use the missing alternative.**
```
infinitive  'to say / to tell'   participle 'said / told'      ← dual, correct
imperative  'tell!'              | "Di' la verità!"            ← only "tell"
future.1pl  'we will say'        | 'We will tell everyone the good news'
future.2pl  'you all will say'   | 'You all will tell the story at the party'
future.3sg  'he/she/it will say' | 'The doctor will tell us the results tomorrow'
cond.2sg    'you would say'      | 'Would you tell me the truth?'
cond.2pl    'you all would say'  | 'Would you all tell me your secret?'
subj.1sg    '(that) I say'       | 'It is better that I tell the truth'
subj.2sg    '(that) you say'     | 'I want you to tell me everything'
subj.3sg    '(that) he/she say'  | 'I hope that he tells the truth'
```
**Fix**: extend the `say / tell` dual gloss the infinitive already establishes to all 9 forms (`'we will say / tell'`, `'say! / tell!'`, …).

**B8 · Imperfect English convention splits within a single paradigm block.** The criteria doc permits `I used to [verb]` **or** `I was [verb]ing`; mixing them inside one block breaks the grid.
```
credere  1sg 'I believed'  1pl 'we believed'  2pl 'you all believed'  3sg 'he/she believed'
         2sg 'you used to believe'  3pl 'they used to believe'
dormire  1sg 'I was sleeping'  2sg/2pl/3pl 'was/were sleeping'
         1pl 'we used to sleep'  3sg 'he/she used to sleep'
fare     2sg 'you were doing'  2pl 'you all were doing'
         1sg/1pl/3sg/3pl 'used to do'
parlare  2sg 'you were speaking'  2pl 'you all were speaking'
         1sg/1pl/3sg/3pl 'used to speak'
```
`credere`'s four simple-past cells are worse than inconsistent — bare simple past is neither permitted pattern and collides with the participle gloss `'believed'`. **Fix**: pick one pattern per lemma; `finire` (6/6 "used to") is the clean model. 4 lemmas, 24 cells.

**B9 · `conoscere.verb.participle.past` glossed `'met'` while all 7 siblings gloss "know".** Example *"I met my wife in Italy"* / `Ho conosciuto mia moglie in Italia`. **Fix**: `'known / met'` and English → *"I have met my wife in Italy"* (also repairs the passato-prossimo → simple-past drift, B-Minor below).

**B10 · `invecchiare` — register split by person within one block.** 1sg/2sg/1pl/2pl `'get old'`, 3sg `'it ages'`, 3pl `'they age'`, participle `'gotten old'`, infinitive `'to get old'`. Same sense, two registers, no rule. **Fix**: `'get old / age'` family-wide, or `'age'` on all cells with inanimate-subject examples.

**B11 · `minimo` / `minima` glossed as a noun, exemplified as an adjective.**
```
minimo  'minimum'        | 'The risk is minimal'   / 'Il rischio è minimo'
minima  'minimum (fem.)' | 'The speed is minimal'  / 'La velocità è minima'
```
These are `word.part-of-speech.adjective` entities. **Fix**: `'minimal / minimum'` + `(fem.)`.

### Minor

- **B12 · `mancare` glossed only `'to be absent'`** across all 8 forms — misses the dominant sense `to miss / to be missing` (`mi manchi`, `manca poco`). The 3pl example already leaks it: `'they are absent'` / *"They are missing from the roll call"*. Widen to `'to be absent / to be missing'`.
- **B13 · `distributore.noun`** `'dispenser'` / *"The vending machine dispenses drinks"* (`Il distributore automatico eroga bevande`) → `'dispenser / vending machine'`.
- **B14 · `sugli.contraction`** `'on the (masc. pl., …)'` / *"The birds fly over the trees"* → example `'The books are on the shelves'` / `'I libri sono sugli scaffali'`.
- **B15 · `diciannove.numeral`** cardinal gloss, ordinal example: *"I was born on the nineteenth of May"* → `'I am nineteen years old'` / `'Ho diciannove anni'`.
- **B16 · `andare.verb.conditional.third.singular`** `'he/she/it would go'` / *"Would tomorrow work?"* (`Andrebbe bene domani?` — `andare bene` = to suit) → `'He would go to school by bike'` / `'Andrebbe a scuola in bici'`. Same family, minor: `andare.verb.indicative.future.second.plural` `'you all will go'` / *"Will you all leave early?"* (`Andrete via presto?`) → English *"Will you all go away early?"*.
- **B17 · `risparmio.noun`** `'savings'` / *"Saving is important"* → widen to `'saving / savings'` (the Italian singular denotes the practice).
- **B18 · `credere` participle + imperfect 1sg** — `'believed'` / *"I did not believe it"* and `'I believed'` / *"I thought I knew you"* (`Credevo di conoscerti`). Realign both to the glossed sense: *"I have believed his story"* / `'Ho creduto alla sua storia'`, and *"I used to believe his story"* / `'Credevo alla sua storia'`.
- **B19 · English-gloss collisions across distinct lemmas** — `sentenza` and `responso` both carry "verdict" (`responso` as `'response / verdict'`); prompt "verdict" has two answers. Narrow `responso` to `'response / opinion (expert)'`. Also `stomaco` / `testa`: examples fuse the gloss into a compound (*"stomachache"*, *"headache"*) — split to *"stomach ache"* / *"head ache"* or use a non-compound example.
- **B20 · Systemic: passato-prossimo participles exemplified with English simple past.** The Italian is right, the English erases the participle: `andare` (*"I went"*), `stare` (*"I was"*), `conoscere` (*"I met"*), `credere` (*"I did not believe"*), `dormire` (*"Did you sleep"*). `fare` (*"I have made a cake"*) and `dire` (*"I have already told the truth"*) already model the fix. Worth a one-pass sweep over all `*.verb.participle.past` entities, not just the five surfaced here.

### Verified clean (no finding)

- **214 adjective masculine/feminine pairs** — 0 gloss-core mismatches. The `(fem.)` convention is applied uniformly.
- **91 same-surface homograph groups** (`porta` noun/verb, `piano` adverb/noun, `spesso` adjective/adverb, `la`/`le`/`lo` determiner/pronoun, `sei` verb/numeral, `uno` determiner/numeral, …) — all deliberate, all correctly disambiguated by gloss.
- **`dovere` / `potere` / `volere` conditional blocks** glossed `should` / `could` / `would like` against `have to` / `can` / `want` elsewhere — correct English modal semantics, not drift.
- **287 verb families** checked for lexical-core split; the 41 machine flags reduce to the 9 findings above, the rest being stemmer artifacts.

---

## Task C — CEFR banding spot-audit

Sampled ~246 entities: all 41 `b2`; 45 lowest-zipf `a1`; 40 highest-zipf `b1/b2` non-verbs; random 40 each of `a1` non-verb, `b1` non-verb, `a2`; plus two structural sweeps.

Distribution: `a1` 1498 · `a2` 1851 · `b1` 1630 · `b2` 41. `proficiency.survival` on 795.

### Structural checks — clean

- **Same lemma, different bands across forms: 0.** Banding is lemma-inherited without exception.
- **Day-one concepts at b1/b2: 0.** The six hits (`boccetta`, `bustina`, `pentolino`, `vasetto`, `scatolone`, `funivia`) are diminutive/augmentative derivatives and correctly late.
- **Low corpus frequency at a1 is not misbanding.** The lowest-zipf `a1` non-verbs (`carota` 3.42, `pera` 3.48, `ombrello` 3.65, `quaderno` 3.69, `elefante` 3.70, `matita` 3.81, `cipolla` 3.85) are exactly the concrete everyday nouns A1 requires. Correct.

### Important — band policy, not data error

**192 entities (96 conditional + 96 subjunctive) sit at `a1`**; 180 of them also carry `proficiency.survival`. No conditional or subjunctive entity exists at `a2` or `b1`. CEFR reference levels place *condizionale presente* at A2/B1 and *congiuntivo presente* at B1 — so ~13% of the `a1` band is grammar a day-one learner will not produce (`finireste` zipf 1.05, `crederemmo` 1.30, `dormiresti` 1.55, `finiate` 1.75, `parliate` 2.11 …).

This follows the corpus's own documented convention (criteria § Survival vs A1: "all conjugations of these lemmas live in survival"), so it is a policy call, not a bug — but it is the single largest banding anomaly and worth an explicit decision: either keep lemma-inheritance and accept the inflation, or band by *form* (mood/tense) and move conditional → a2, subjunctive → b1.

### Misbands — 4 entities

```
proprio.adverb   b1  zipf 5.93  'really / exactly'      → a2.  Everyday intensifier ("proprio bello"),
                                                          top-tier frequency; b1 is two bands late.
stesso.pronoun   b1  zipf 5.83  'the same one (masc.)'  → a2.  "lo stesso" is core A2.
stessa.pronoun   b1  zipf 5.57  'the same one (fem.)'   → a2.  Same, pair-consistent.
rugiada.noun     b1  zipf 3.21  'dew'                   → b2.  Concrete but non-transactional; sits
                                                          among everyday b1 vocabulary as an outlier.
```

Borderline, not flagged: `cioè` (b1, zipf 5.28 — discourse marker, defensible at b1); `cui` (b1, zipf 6.27 — frequent in writing, productive use is B1); `causa.noun` (a1, zipf 5.44 — abstract for a1, but high-frequency and paired with everyday collocations); `damigiana` / `tanica` / `fusto` at b2 (genuinely C1-rare, but b2 is the corpus ceiling so capping there is correct).
