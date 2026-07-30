# QA2 — EXEMPLIFIED example naturalness (Italian)

Audit of the `EXEMPLIFIED` trait on word literals in
`registry/education/topographies/english-to-italian/dataset/literals/words/`.

Judged per entity: is the Italian natural, idiomatic, contemporary Italian; is it
grammatical (agreement, articles, preposition contraction, clitics, tense/mood
semantics); does the English translate it faithfully. Style-only preferences are
excluded unless the current text is actually misleading.

Format: `slug` · current · proposed fix · reason.

---

## Critical

Broken Italian, or an English gloss that teaches the reverse of what the Italian means.

**1. `temperamatite.noun`** (noun.js:59545)
- current: `Temperlo la matita con il temperamatite`
- fix: `Tempero la matita con il temperamatite`
- reason: **`Temperlo` is not an Italian word.** The 1sg present of `temperare` is
  `tempero`; `Temperlo` looks like a mangled clitic form and is unparseable. Broken output.

**2. `piastra.noun`** (noun.js:58944)
- current: `Mi lisciano i capelli con la piastra` / EN `I straighten my hair with the hair straightener`
- fix: `Mi liscio i capelli con la piastra`
- reason: 3rd-person-plural verb with a 1sg English gloss. As written the Italian means
  "they straighten my hair for me" — wrong person, and it contradicts its own translation.

**3. `dare.verb.gerund`** (verb.js:19142)
- current: `Dando consigli non è sempre facile` / EN `Giving advice is not always easy`
- fix: `Dare consigli non è sempre facile`
- reason: The Italian gerund **cannot be a clausal subject.** English `-ing`-as-subject maps
  onto the Italian infinitive. `Dando consigli non è...` is ungrammatical — a textbook
  English calque, and it is sitting in the cell that is supposed to teach the gerund.

**4. `dire.verb.gerund`** (verb.js:21255)
- current: `Dicendo addio non è mai facile` / EN `Saying goodbye is never easy`
- fix: `Dire addio non è mai facile`
- reason: Same defect as (3). Note the sibling gerund cells are correct
  (`Stando qui, si vede il mare`, `Venendo dalla stazione, ho visto la chiesa`,
  `Sapendo il rischio, ho deciso di non andare`), so these two are isolated breakages.

**5. `muovere.verb.indicative.present.third.plural`** (verb.js:131883)
- current: `I ballerini muovono con grazia sul palco` / EN `The dancers move gracefully across the stage`
- fix: `I ballerini si muovono con grazia sul palco`
- reason: `muovere` is transitive. Intransitive motion requires the pronominal `muoversi`.
  Without `si` the sentence is ungrammatical (it demands a direct object that never arrives).

**6. `piovere` — 4 personal cells** (verb.js:139809, 139865, 139986, 140041)
- `piovere.verb.indicative.present.first.singular` — `Le piovo addosso domande senza sosta`
- `piovere.verb.indicative.present.second.singular` — `Gli piovi addosso critiche ogni singolo giorno`
- `piovere.verb.indicative.present.first.plural` — `Pioviamo regali sui bambini ogni Natale`
- `piovere.verb.indicative.present.second.plural` — `Piovete scuse su di me ogni volta che qualcosa va storto`
- fix: rebuild these cells around the only construction Italian licenses, e.g.
  `Le piovono addosso domande senza sosta` / `Gli piovono addosso critiche ogni giorno` /
  `Sui bambini piovono regali ogni Natale` / `Su di me piovono scuse ogni volta che qualcosa va storto`
  (or replace the personal-subject sense with `rovesciare addosso` / `far piovere`).
- reason: `piovere` never takes a personal subject with a direct object. Figuratively it is
  strictly intransitive with the *thing* as subject — which is exactly what the 3pl cell
  already does correctly (`Le lamentele piovono sul direttore ogni settimana`). All four
  personal cells are fabricated Italian.

**7. `dare.verb.indicative.imperfect.second.plural`** (verb.js:19883)
- current: `Davate gli esami a giugno?` / EN `Did you all use to give exams in June?`
- fix EN: `Did you all use to take your exams in June?`
- reason: `dare un esame` in Italian means to **sit/take** an exam (student side), not to
  administer one. The gloss inverts the participant roles and, in a `dare = give` tense
  table, actively teaches the wrong equivalence.

---

## Important

Real grammatical errors, calques, false friends, or English that does not translate the Italian.

### noun.js

- `mattone.noun` — `La casa è fatta di mattone rosso` → `La casa è fatta di mattoni rossi`.
  Material `mattone` takes the plural in this frame; the singular is not Italian usage.
- `lunghezza.noun` — `La lunghezza del tavolo è due metri` → `...è di due metri`.
  Measurement predicates require `di`.
- `saldo.noun` — `Ho comprato questa giacca durante il saldo` → `...durante i saldi`.
  The sale season is plural-only. The singular reads as "balance (of an account)", changing
  the meaning of the very word being taught.
- `contante.noun` — `Ho solo un po' di contante con me` → `...un po' di contanti con me`.
  Cash is `i contanti`; the singular is not used this way.
- `profumo.noun` — `Indossa un profumo leggero` → `Mette un profumo leggero` / `Usa un profumo leggero`.
  `indossare un profumo` is a direct calque of English "wear perfume"; Italians wear clothes,
  not scents.
- `vanga.noun` — `Zappo il campo con la vanga` → `Vango il campo` / `Scavo il terreno con la vanga`.
  `zappare` is what you do with a `zappa` (hoe), not a `vanga` (spade). Tool/verb mismatch.
- `pinzetta.noun` — `Mi spunto le sopracciglia con la pinzetta` / EN `I pluck my eyebrows with tweezers`
  → `Mi depilo le sopracciglia con la pinzetta`.
  `spuntare` = trim (with scissors); it does not translate "pluck".
- `vulcano.noun` — `Il vulcano è eruttato ieri notte` → `Il vulcano ha eruttato ieri notte`.
  Wrong auxiliary: `eruttare` takes `avere`.
- `elettricità.noun` — `Il temporale ha tagliato l'elettricità` → `Il temporale ha fatto saltare la corrente`.
  `tagliare l'elettricità` is what a utility does for non-payment; a storm doesn't do it.
  Straight calque of "cut off the electricity".
- `scolapasta.noun` — `Lo scolapasta scola la pasta` → `Scolo la pasta con lo scolapasta`.
  Tautological and robotic; no native produces this sentence.
- `foto.noun` — `Faccio una foto al tramonto` / EN `I take a photo of the sunset`.
  `al tramonto` = **at** sunset (time), not **of** the sunset. Fix one side:
  IT `Faccio una foto del tramonto` or EN `I take a photo at sunset`.

### adjective.js

- `morta.adjective.feminine.singular` — `La batteria è morta` → `La batteria è scarica`.
  English calque. Note `batteria.noun` gets this right (`La batteria del telefono è scarica`),
  so the dataset contradicts itself.
- `conveniente.adjective` — `Questa offerta è molto conveniente` / EN `This offer is very convenient`.
  **False friend.** `conveniente` = good value / cheap. Fix EN to `This offer is very good value`.
  As it stands the entry teaches the single most common Italian-English false friend backwards.
- `dipendente.adjective` — `Lo stipendio è dipendente dai risultati` → `Lo stipendio dipende dai risultati`.
  Predicative `essere dipendente da` is translationese; Italian uses the verb.
- `rumorosa.adjective.feminine.singular` — `La macchina è rumorosa` / EN `The engine is noisy`.
  `macchina` = car, `motore` = engine. Fix EN to `The car is noisy` (or IT to `Il motore è rumoroso`,
  but that breaks the feminine cell).

### verb.js

- `andare.verb.indicative.imperfect.second.singular` — `Andavi a nuoto da piccolo?` /
  EN `Did you use to go swimming as a kid?` → `Andavi a nuotare da piccolo?` / `Andavi in piscina da piccolo?`.
  `andare a nuoto` means to get somewhere *by swimming*, not to go swimming.
- `dovere.verb.indicative.imperfect.second.singular` — `Dovevi dirmelo prima` /
  EN `You had to tell me sooner`.
  Imperfetto of `dovere` in this frame is reproachful: it means **"You should have told me
  sooner."** The English gloss teaches the wrong modal semantics — precisely the cell where
  tense semantics matter most. Fix EN.
- `salire.verb.indicative.present.second.singular` — `Perché non sali con l'ascensore?` →
  `Perché non sali in ascensore?` (EN: `Why don't you take the elevator?`).
- `salire.verb.indicative.present.second.plural` — `Salite con l'autobus?` / EN `Do you all go up by bus?`
  → `Prendete l'autobus?` or `Salite sull'autobus?`. `salire con l'autobus` is not Italian,
  and "go up by bus" is not English.
- `girare.verb.participle.past` — `Il regista ha girato questa scena tre volte` /
  EN `The director has turned this scene three times` → EN `...has shot this scene three times`.
  `girare una scena` = to film it. "Turned" is nonsense.
- `girare.verb.indicative.present.second.singular` — `Perché giri così tanto il volume?` →
  `Perché alzi così tanto il volume?`. You don't `girare` a volume in Italian.
- `riempire.verb.infinitive` / `riempire.verb.indicative.present.second.singular` —
  `Devo riempire questo modulo...` and `Come riempi questa domanda online?` →
  `Devo compilare questo modulo...` / `Come compili questa domanda online?`.
  `riempire un modulo` is a calque of "fill a form"; the Italian verb is `compilare`.
  `modulo.noun` gets this right (`Compila questo modulo, per favore`).
- `salvare.verb.indicative.present.first.plural` — `Salviamo acqua facendo docce più brevi` →
  `Risparmiamo acqua facendo docce più brevi`. "Save (a resource)" is `risparmiare`, not `salvare`.
- `opporre` — **all 8 cells.** The Italian is idiomatic (`opporre resistenza`, `opporre un netto
  rifiuto`) but the English is not English: `oppose strong resistance`, `oppose a firm refusal`.
  Fix the glosses to `put up strong resistance` / `give a firm refusal` / `raise a strong objection`.
  Currently every cell of the lemma ships a broken translation.
- `ritirare` — 4 of 8 cells mistranslate. `Quando ritiri il pacco dall'ufficio postale?`,
  `Ritiriamo i vecchi mobili dal negozio domani`, `Quando ritirate i biglietti per il concerto?`,
  `Gli operai ritirano l'attrezzatura alla fine del turno` are all glossed with **withdraw**.
  In these frames `ritirare` = **pick up / collect**. (The `contanti`, `domanda` and `offerta`
  cells are correctly "withdraw", so the lemma mixes two senses under one gloss.)
- `dire.verb.indicative.imperfect.second.singular` and `...second.plural` —
  EN `What did you used to say...` (×2). Ungrammatical English (`did ... used to`).
  Fix to `What did you use to say...`.
- `crollare.verb.indicative.present.first.plural` — `Crolliamo dalle risate alle sue battute` →
  `Scoppiamo dalle risate alle sue battute`. `crollare dalle risate` is not the Italian idiom.

---

## Minor

Ambiguity, register slips, mild unidiomatic choices, and English glosses that drift from the
Italian without changing what is taught.

### noun.js

- `altoparlante.noun` — `L'altoparlante è troppo alto` reads as "too tall" for a physical
  object. Prefer `L'altoparlante è troppo forte`.
- `satellite.noun` — `intorno alla terra` → `intorno alla Terra` (planet, capitalised).
- `elezione.noun` — `L'elezione si terrà a marzo`; Italian normally pluralises (`Le elezioni si terranno`).
- `campo.noun` — `I giocatori entrano nel campo` → `entrano in campo` (fixed sports collocation).
- `vela.noun` — `La vela richiede un tempo calmo` → `richiede tempo calmo` (drop the article).
- `colino.noun` — `Versa la pasta nel colino` / EN `through the strainer`; also a `colino` is a
  tea strainer — pasta goes in the `scolapasta`.
- `centimetro.noun` — `Il foglio è largo un centimetro` is semantically odd for a sheet of paper.
- `evidenziatore.noun` — `Sottolineo le parole ... con l'evidenziatore` → `Evidenzio le parole ...`.
  You don't underline with a highlighter.
- `noia.noun` — `Questo film è pura noia` → `Questo film è una noia mortale`.
- `fastidio.noun` — `Il rumore mi causa molto fastidio` → `mi dà molto fastidio` (`dare fastidio` is the idiom).
- `sospetto.noun` — `La polizia ha un sospetto su di lui` reads as "the police have a suspect".
  Prefer `La polizia ha dei sospetti su di lui`.
- `denuncia.noun` — `Voglio sporgere una denuncia` → `sporgere denuncia` (bare, fixed expression).
- `rinnovo.noun` — EN says `my passport`; the Italian has no possessive (`del passaporto`).
- `residenza.noun` — `Devo cambiare la mia residenza` → `Devo cambiare residenza`.
- `anagrafe.noun` — `si ritira in anagrafe` → `all'anagrafe`.
- `reclamo.noun` — `fare un reclamo sul servizio` → `presentare un reclamo per il servizio`.
- `rotolo.noun` — `un rotolo di carta assorbente nuovo` → `un nuovo rotolo di carta assorbente`
  (as written, "nuovo" attaches to the paper).
- `fascio.noun` — `un fascio di fiori`; flowers take `mazzo`. `fascio` is for firewood, sheaves.
- `semino.noun` — IT `semino` (small seed) vs EN `seedling` (= `piantina`).
- `erbaccia.noun` — `Tolgo l'erbaccia dal giardino` → `le erbacce` (normally plural).
- `pinzatrice.noun` — `Spillo i fogli con la pinzatrice` → `Pinzo i fogli...` (`spillare` = to tap/draw off).
- `dentifricio.noun` — `Ci è finito il dentifricio` → `Abbiamo finito il dentifricio`.
- `molecola.noun` — `L'acqua è formata da una molecola semplice` → `da molecole semplici`.
- `interruttore.noun` — `Spegni l'interruttore della luce` is odd; you `premi` a switch or
  `spegni la luce`.
- `cucito.noun` — EN `loves sewing` vs IT `piace` (likes).
- `temperino.noun` — used here as pencil sharpener, which collides with `temperamatite.noun`;
  in most of Italy `temperino` is a penknife.
- `stampante.noun` — `La stampante ha finito l'inchiostro` is acceptable but
  `È finito l'inchiostro della stampante` is the more natural framing.

### adjective.js

- `irritata.adjective.feminine.singular` — `La capa è irritata`; `la capa` is markedly colloquial.
- `trasparente.adjective` — IT `bicchiere` (drinking glass) vs EN `cup`.
- `durevole.adjective` — `La borsa è durevole` → `resistente` (`durevole` belongs to `beni durevoli`).
- `bugiardo/bugiarda.adjective` — EN `The witness is lying` vs IT "is a liar" (habitual trait).
  `sta mentendo` would be "is lying".
- `dritta.adjective.feminine.singular` — `La strada è dritta per miglia`; miles are not an
  Italian unit — `per chilometri`.
- `aggiustato.adjective.masculine.singular` — `Il tetto è aggiustato`; adjectival use is marginal,
  `è stato aggiustato` / `è riparato` is standard.
- `particolare.adjective` — EN `This case is particular` is not idiomatic English for
  `Questo caso è particolare` (= unusual/special).

### verb.js

- `dare.verb.imperative.second.singular` — `Dai una mano, per favore!` / EN `Give me a hand, please!`
  The Italian has no `me`; `Dammi una mano, per favore!`.
- `dire.verb.indicative.imperfect.first.singular` — EN `say the same joke` → `tell the same joke`.
- `dire.verb.subjunctive.present.third.plural` — EN `say the truth` → `tell the truth`
  (sibling cells already use "tell").
- `potere.verb.indicative.imperfect.second.plural` / `...third.plural` —
  `Potevate finire l'esame?` / `Non potevano trovare l'albergo` describe bounded episodes, where
  Italian prefers the passato prossimo (`Avete potuto finire`, `Non sono riusciti a trovare`).
  The imperfetto is defensible in a tense drill but the aspect is off for the English given.
- `potere.verb.infinitive` / `dovere.verb.infinitive` — `Vorrei potere aiutarti`,
  `Non mi piace dovere sempre chiedere` — natives truncate: `poter aiutarti`, `dover sempre chiedere`.
- `scendere.verb.indicative.present.first.singular` — `Scendo le scale piano piano` /
  EN `quietly`. `piano piano` = slowly/gradually, not quietly.
- `aiutare.verb.infinitive` — `Voglio aiutare con i compiti` / EN `I want to help you with the
  homework`; the Italian has no `ti`.
- `contare.verb.indicative.present.first.singular` — `Conto con le dita` → `Conto sulle dita`.
- `completare.verb.indicative.present.second.singular` — `il tuo addestramento` for professional
  training; `addestramento` is for animals/military — `formazione` or `corso`.
- `gettare.verb.indicative.present.second.singular` — `getti il giavellotto` → `lanci il giavellotto`.
- `pescare.verb.participle.past` — EN `I have fished three trout` → `caught three trout`.
- `operare.verb.participle.past` — EN `operated three patients` → `operated on three patients`.
- `cedere.verb.participle.past` / `...third.singular` — EN `the bridge has given in`,
  `the floor gives in` → `given way` / `gives way`.
- `raggiungere.verb.indicative.present.first.plural` — `Raggiungiamo il paese con una stretta
  strada di montagna` → `per una stretta strada di montagna`.
- `realizzare.verb.participle.past` — `Ha realizzato un grande successo` → `Ha ottenuto un grande successo`.
- `regnare.verb.indicative.present.first.singular` — `Regno su questo piccolo regno` is tautological.
- `esistere.verb.indicative.present.first.singular` — `Esisto solo in questa piccola città per ora`
  is unnatural in both languages.
- `buttare.verb.indicative.present.first.plural` — `Buttiamo oggi la sedia rotta` → `Oggi buttiamo
  la sedia rotta`.
- `crollare.verb.indicative.present.third.singular` — `Il vecchio muro crolla dopo il terremoto`
  mixes present tense with a completed past event.
- `piovere.verb.infinitive` — `Stanotte sta per piovere forte`; `sta per` (imminent) sits awkwardly
  with `stanotte`.
- `riflettere` (all cells) — EN uniformly `think over`, which reads oddly in questions
  (`Do you think over the consequences...?`); `reflect on` / `think about` is more natural.
- `muovere.…third.plural`, `saltare.…third.singular`, `girare.…third.singular` — EN `across the
  stage` vs IT `sul palco` (on the stage). Same drift repeated three times.
- `sbagliare.verb.indicative.present.second.singular` — IT has `sempre`, EN drops it.
- `avvicinare.verb.indicative.present.second.singular` — EN `so much closer` is awkward for
  `così tanto`.
- `girare.verb.indicative.present.third.singular` — `La ballerina gira con grazia sul palco`;
  fine, but note the sibling `muovere` cell (Critical 5) shares the frame and is broken.

---

## Coverage

**Tier 1 — noun.js late-integration families: EXHAUSTIVE.**
Every `EXEMPLIFIED` example read in full across the named families:
- indices 600–749 — technology (600–629), materials (630–654), society/politics (655–684),
  objects/tools (685–719), measures/quantities (720–749). 150 entries.
- indices 875–1015 — postal/small objects (875–899), months & seasons (900–915), sport
  (916–949), arts & music (950–979), tableware & kitchenware (980–1014). 140 entries.
- indices 1046–1150 — clothing details & cosmetics (1046–1055), home fittings (1056–1065),
  emotions (1066–1090), law & bureaucracy (1091–1120), nature/science (1121–1150). 105 entries.
- indices 1151–1336 — commerce (1151–1185), containers (1186–1213), measures (1205–1215),
  hobbies & gardening (1216–1250), hygiene & cosmetics (1251–1280), office (1281–1300),
  virtues & abstracts (1301–1335). 186 entries.

**581 noun examples read.** (noun.js holds 2,672 `EXEMPLIFIED` entries in total; the
pre-600 block is the early, already-reviewed core vocabulary and was covered only by the
machine scans below.)

**Tier 2 — adjective.js: EXHAUSTIVE.**
Indices 241–559 read in full: emotions/state (241–259), taste & texture (260–282),
dimension (283–314), condition (315–349), ordinals (350–369), materials (370–389),
time & frequency (390–414), character (415–449), feminine fill (450–479), and the
remaining late fill (480–559). **319 entries read.**

**Tier 3 — verb.js deep-verb tense tables: EXHAUSTIVE.**
All 16 deep lemmas (`essere avere parlare credere dormire finire andare fare stare dare dire
venire sapere potere volere dovere`), every non-present cell — imperfetto (6), futuro (6),
condizionale (6), congiuntivo presente (6), imperativo, infinito, gerundio, participio.
**~430 cells read**, plus the present cells of `essere/avere/parlare/credere/dormire` seen
in passing.

**Tier 4 — partial.**
- verb.js late-batch lemmas `ammettere` → `sconfiggere` (~100 lemmas × 8 cells): **~790 cells
  read in full.** This is where Criticals 5–6 and much of the `opporre`/`ritirare`/`riempire`
  damage lives.
- Machine scans run over **every** `EXEMPLIFIED` entry in all 10 word files (noun, adjective,
  verb, adverb, pronoun, adposition, determiner, contraction, numeral, interjection) for:
  uncontracted prepositions, wrong elision (`l'` + consonant), `un'` before masculine,
  doubled words, `il`/`la` before vowel, double spaces, English leakage, question-mark
  mismatch, polarity mismatch, English-gloss person vs Italian verb person, and
  gerund-as-subject. The gerund-subject scan is what surfaced Criticals 3–4; the
  person scan surfaced Critical 2. All `con + article` hits were verified as false positives
  (`con` does not contract in modern Italian).

**Not covered:** noun.js indices 0–599 and adverb/pronoun/adposition/determiner/contraction/
numeral/interjection example prose beyond the machine scans; verb.js shallow lemmas
`iniziare` → `sconfiggere` before `ammettere` (~170 lemmas) beyond the machine scans.

**Totals: 7 Critical (10 slugs) · 26 Important (45 slugs) · 42 Minor.**
