# QA2 · NM1 — VOCALIZED translation fidelity audit

Scope: all 506 entities carrying trait `VOCALIZED` in
`registry/education/topographies/english-to-italian/dataset/literals/sentences.js`.

`learning` is audio-locked and is never proposed for change. Only `trait.TRANSLATED.known`
is proposed for change.

Method: every one of the 506 pairs read individually; plus three mechanical sweeps —
terminal-punctuation parity (`learning` final char vs `known` final char), `known`
duplicate-collision detection, and a modal/idiom/false-friend keyword sweep
(`potere`/`dovere`/`volere`/`sapere`, `ne`/`ci` clitics, `mancare`, `farcela`, `avercela`,
`magari`, `attualmente`, `eventualmente`).

Totals: **Critical 4 · Important 17 · Minor 52**

Punctuation sweep result: exactly one terminal mismatch across 506 (`vado-a-letto`, listed
under Minor). All other pairs agree on `.` / `?` / `!`.

---

## CRITICAL — wrong meaning

### 1. `e-libero-qui`
- learning: `È libero qui?`
- current known: `Is this seat taken?`
- proposed known: `Is this seat free?`
- reason: **Polarity inversion.** `libero` = free/unoccupied. The Italian asks whether the
  place is *free*; the English asks whether it is *taken*. "Yes" answers opposite
  propositions. A learner prompted with "Is this seat taken?" produces `È occupato?` /
  `È preso?`, never `È libero qui?`. This is the single worst pair in the VOCALIZED set.

### 2. `ordini-del-direttore`
- learning: `Ordini del direttore.`
- current known: `That's a direct order.`
- proposed known: `The manager's orders.`
- reason: **False-cognate mistranslation.** `direttore` = director / manager / headmaster /
  conductor — a *person*. The English reads it as the adjective "direct". `Ordini del
  direttore` names the source of the orders; "That's a direct order" asserts the orders'
  *manner* and would be `È un ordine diretto.` Nothing in the Italian corresponds to
  "That's" or to "direct". Alternative proposal: `Director's orders.`

### 3. `fai-esattamente-come-ti-ho-detto`
- learning: `Fai esattamente come ti ho detto.`
- current known: `Do exactly as I say.`
- proposed known: `Do exactly as I told you.`
- reason: **Tense error producing a corpus collision.** `ti ho detto` is passato prossimo
  ("I told you"), not present. The corpus already holds the present-tense sibling
  `fai-esattamente-come-ti-dico` → `Do exactly as I say.`, so both entries currently carry
  byte-identical `known` while the Italian differs in tense. The corpus is also
  self-contradicting: `fai-come-ti-ho-detto` correctly renders the same clause as
  `Do as I told you.`

### 4. `questo-non-e-vero`
- learning: `Questo non è vero.`
- current known: `This isn't real.`
- proposed known: `This isn't true.`
- reason: **False friend `vero`.** As a standalone assertion `Questo non è vero` denies the
  *truth* of a statement, not the *reality* of an object. `vero` only reads as "real" in
  attributive material collocations (`oro vero`, `vera pelle`). The corpus already renders
  `è vero` correctly at `e-vero` → `Is it true?`, so this entry is internally inconsistent.
  A learner prompted with "This isn't real." produces `Questo non è reale.`

---

## IMPORTANT — drift, omission, awkward or malformed English

### 5. `non-e-importante`
- learning: `Non è importante.`
- current known: `It doesn't matter.`
- proposed known: `It's not important.`
- reason: Paraphrase, not translation. "It doesn't matter" is `Non importa.` / `Non fa
  niente.` — a different Italian construction (impersonal verb vs copula + adjective). The
  prompt cannot elicit the target sentence.

### 6. `quanto-e-profondo-questo-lago`
- learning: `Quanto è profondo questo lago?`
- current known: `How deep is that lake?`
- proposed known: `How deep is this lake?`
- reason: Deixis inverted. `questo` = this; `that` would be `quel`/`quello`. The corpus
  otherwise maintains the questo/quello ↔ this/that distinction rigorously
  (`e-un-gatto-quello`, `voglio-quella-borsa`, `quella-casa-e-grande`).

### 7. `stai-qui-con-noi`
- learning: `Stai qui con noi.`
- current known: `Stay with us.`
- proposed known: `Stay here with us.`
- reason: `qui` dropped. The corpus renders `qui` everywhere else (`vieni-qui`,
  `sei-ancora-li`, `loro-sono-qui`); omitting it here yields a prompt that maps to
  `Stai con noi.`

### 8. `possiamo-avere-un-cucchiaio`
- learning: `Possiamo avere un cucchiaio?`
- current known: `Could we have a spoon?`
- proposed known: `Can we have a spoon?`
- reason: Mood drift. `Possiamo` is present indicative; "Could we" is the conditional
  `Potremmo`. Every other `posso`/`possiamo` entry in the set renders as Can/May
  (`posso-venire-con-te`, `possiamo-contare-su-di-te`), so this is also the lone outlier.

### 9. `e-molto-bella`
- learning: `È molto bella.`
- current known: `It's very nice.`
- proposed known: `It's very beautiful.`
- reason: Register/strength loss and internal inconsistency. `bella` is rendered
  "beautiful" at `sei-molto-bella` (`You're very beautiful.`) and `non-e-bello`
  (`Isn't it beautiful?`). "nice" back-translates to `carino`/`gentile` — note the corpus
  separately uses "nice" for `gentile` at `tom-e-molto-gentile`, so the two adjectives are
  currently collapsed.

### 10. `non-ne-ho-idea`
- learning: `Non ne ho idea.`
- current known: `No idea.`
- proposed known: `I have no idea.`
- reason: The Italian is a full finite clause with the partitive clitic `ne`; the English is
  an elliptical fragment. The clitic construction (`ne ho`) is precisely what this entry
  should be teaching, and a bare fragment prompt cannot elicit it.

### 11. `nessuno-lo-sapra`
- learning: `Nessuno lo saprà.`
- current known: `Nobody'll know.`
- proposed known: `Nobody will know.`
- reason: Malformed written English. `'ll` does not cliticise onto full nouns in standard
  written English. The corpus handles the identical future elsewhere correctly at
  `tom-non-lo-sapra` → `Tom won't know.`

### 12. `ha-un-piano`
- learning: `Ha un piano?`
- current known: `Has she a piano?`
- proposed known: `Does she have a piano?`
- reason: Archaic/non-standard English inversion. Modern English requires do-support for
  lexical `have`. The corpus uses do-support everywhere else (`hai-una-domanda` →
  `Do you have a question?`, `avete-un-calendario` → `Do you have a calendar?`).

### 13. `io-mi-sveglio-alle-6`
- learning: `Io mi sveglio alle 6.`
- current known: `I get up at six.`
- proposed known: `I wake up at six.`
- reason: Wrong verb. `svegliarsi` = to wake up; `alzarsi` = to get up. The corpus keeps the
  pair distinct elsewhere — `mi-sveglio-presto` → `I wake up early.` and
  `mi-sono-appena-alzato` → `I just got up.` — so this entry alone crosses the two.

### 14. `vuoi-andare-anche-tu`
- learning: `Vuoi andare anche tu?`
- current known: `Will you go, too?`
- proposed known: `Do you want to go, too?`
- reason: `Vuoi` is volition, not future. "Will you go" is `Andrai?` — which the corpus
  already holds at `andrai-con-tom` → `Will you go with Tom?`. As written this also makes
  the entry near-indistinguishable from `stai-andando-anche-tu` → `Are you going, too?`

### 15. `che-cosa-fa`
- learning: `Che cosa fa?`
- current known: `What does he do?`
- proposed known: `What is he doing?`
- reason: `Che cosa fa?` asks about the current action; occupation is `Che lavoro fa?`,
  which the corpus already carries with exactly this English. Two entries currently share
  the identical `known`, and the more likely reading of the bare form is lost.

### 16. `che-cosa-fai-ora`
- learning: `Che cosa fai ora?`
- current known: `What are you doing?`
- proposed known: `What are you doing now?`
- reason: `ora` dropped. Without it the English collapses onto the generic form and the
  temporal adverb — the only thing distinguishing this entry — is unrecoverable.

### 17. `ho-letto-il-libro`
- learning: `Ho letto il libro.`
- current known: `I read the book.`
- proposed known: `I have read the book.`
- reason: Written-English homograph trap. "read" is orthographically ambiguous between
  present and past; as a production prompt it elicits `Leggo il libro.` just as readily as
  the target. The passato prossimo maps cleanly onto the present perfect here.

### 18. `l-errore-e-mio`
- learning: `L'errore è mio.`
- current known: `I'm to blame.`
- proposed known: `The mistake is mine.`
- reason: Paraphrase. The Italian is copula + noun + possessive (structurally the same as
  `questo-libro-e-mio` → `This book is mine.`). "I'm to blame" back-translates to
  `È colpa mia.` / `Sono io il colpevole.` and drops `errore` entirely.

### 19. `anch-io-sono-stato-li`
- learning: `Anch'io sono stato lì.`
- current known: `I also went there.`
- proposed known: `I've been there too.`
- reason: `essere stato` is a state-of-experience ("have been"), not `andare` ("went").
  The corpus renders `andare` correctly at `tom-e-andato-a-boston` → `Tom went to Boston.`,
  so this prompt currently maps to `Anch'io sono andato lì.`

### 20. `vuoi-del-ghiaccio`
- learning: `Vuoi del ghiaccio?`
- current known: `Would you like ice?`
- proposed known: `Do you want some ice?`
- reason: Two drifts in one. `Vuoi` is present indicative, not conditional (`Vorresti`),
  and `del` is partitive ("some") — dropped. The corpus handles the parallel
  `vuoi-dello-zucchero` with "Do you want", so the modal rendering is also inconsistent.

### 21. `ho-quasi-fatto`
- learning: `Ho quasi fatto.`
- current known: `I almost did it.`
- proposed known: `I'm almost done.`
- reason: `Ho quasi fatto` is the colloquial "I've nearly finished" (elliptical for
  `ho quasi fatto tutto`). "I almost did it" — the counterfactual near-miss — is
  `Per poco non l'ho fatto.` / `Ci sono quasi riuscito.` Flagged as Important rather than
  Critical because the source pairing is ambiguous without wider context; recommend a
  native check before applying.

---

## MINOR — style, consistency, and unresolvable-collision notes

### Wording / naturalness

22. `ecco-il-resto` · `Ecco il resto.` · `Here is your change.` → `Here's the change.` —
    "your" has no source; the Italian uses the definite article.
23. `vuoi-andare` · `Vuoi andare?` · `You want to go?` → `Do you want to go?` —
    echo-question form; the corpus otherwise uses do-support for `Vuoi …?`.
24. `vado-in-citta` · `Vado in città.` · `I'm going downtown.` → `I'm going into town.` —
    "downtown" is US-specific and diverges from the sibling `vivo-in-citta` → `I live in town.`
25. `suono-il-piano` · `Suono il piano.` · `I play piano.` → `I play the piano.` —
    article dropped; `mary-suona-il-piano` and `posso-suonare-il-piano` both keep "the".
26. `vuoi-dello-zucchero` · `Vuoi dello zucchero?` · `Do you want sugar?` →
    `Do you want some sugar?` — partitive `dello` unrendered.
27. `questo-libro-e-nuovo` · `Questo libro è nuovo.` · `This book's new.` →
    `This book is new.` — noun+`'s` contraction is awkward written English and breaks the
    pattern of its four siblings (`questo-libro-e-{piccolo,pesante,mio,vecchio}`), which all use "is".
28. `parla-bene` · `Parla bene.` · `He talks well.` → `He speaks well.` — "talks well" is
    marked English; `parlare` renders as "speak" elsewhere (`parla-anche-francese`).
29. `posso-avere-un-cuscino` · `Posso avere un cuscino?` · `Can I get a pillow?` →
    `Can I have a pillow?` — `avere` = have; the other six `posso avere` entries all use "have".
30. `e-una-buona-idea` · `È una buona idea!` · `That's a good idea!` → `It's a good idea!` —
    `È` is "It's"; "That's" is `Quella è`.
31. `ha-dormito-un-ora` · `Ha dormito un'ora.` · `He slept an hour.` →
    `He slept for an hour.` — bare duration NP reads as clipped.
32. `tutto-era-calmo` · `Tutto era calmo.` · `All was calm.` → `Everything was calm.` —
    "All was" is literary; `tutto` renders as "everything" at `so-tutto`.
33. `e-ora-di-cena` · `È ora di cena.` · `Time for dinner.` → `It's time for dinner.` —
    copula dropped, turning a clause into a fragment.
34. `oggi-fa-molto-caldo` · `Oggi fa molto caldo.` · `Today is very warm.` →
    `It's very hot today.` — `molto caldo` = very hot; `fa-molto-freddo-ora` is correctly
    rendered `It's very cold now.`, so the `fa + temperature` frame is inconsistent here.
35. `tutto-bene` · `Tutto bene.` · `All is well.` → `Everything's fine.` — same "All is"
    literariness; also sits oddly beside `va-tutto-bene` → `It's all OK.`
36. `oggi-offro-io` · `Oggi offro io.` · `Today is my treat.` → `It's my treat today.` —
    English word order is stilted.
37. `tom-e-piu-alto-di-me` · `Tom è più alto di me.` · `Tom is taller than I.` →
    `Tom is taller than me.` — prescriptive nominative; unnatural in speech.
38. `vorrei-essere-piu-giovane` · `Vorrei essere più giovane.` · `I wish I was younger.` →
    `I wish I were younger.` — its two siblings (`vorrei-essere-piu-alto`,
    `vorrei-essere-giovane`) both use the subjunctive "were".
39. `mio-padre-e-in-casa` · `Mio padre è in casa.` · `My father is in.` →
    `My father is at home.` — British elliptical idiom; opaque as a production prompt.
40. `chiedo-scusa-per-questo` · `Chiedo scusa per questo.` · `Sorry about that.` →
    `I apologize for this.` — drops the verb and flips `questo` to "that".
41. `e-un-regalo-per-te` · `È un regalo per te.` · `This gift is for you.` →
    `It's a gift for you.` — restructures the clause; `È` is not "This".
42. `lo-voglio-veramente` · `Lo voglio veramente.` · `I really do want that.` →
    `I really want it.` — `lo` = it, and the emphatic "do" has no source. Its mirror entry
    `lo-vuoi-veramente` is correctly `Do you really want it?`
43. `vieni-presto` · `Vieni presto.` · `Come soon.` → `Come early.` — `presto` is primarily
    "early"; "soon" is `fra poco`/`presto` only in future contexts.
44. `non-ho-la-macchina` · `Non ho la macchina.` · `I don't have a car.` →
    `I don't have the car.` — definite article carries the specific reading; "a car" is
    `una macchina`.
45. `ne-faccio-anche-a-meno` · `Ne faccio anche a meno.` · `I can do without it.` →
    `I can even do without it.` — `anche` unrendered.
46. `mio-marito-e-un-essere-inutile` · `Mio marito è un essere inutile.` ·
    `My husband is useless.` → `My husband is a useless creature.` — the Italian is
    predicate-nominal (`un essere`), the English predicate-adjectival.
47. `sono-stanco-di-quello` · `Sono stanco di quello.` · `I'm tired of it.` →
    `I'm tired of that.` — `quello` = that.
48. `che-dobbiamo-fare` · `Che dobbiamo fare?` · `What are we to do?` →
    `What should we do?` — archaic register; also collides in feel with
    `che-cosa-dovrei-fare` → `What should I do?`
49. `hai-il-lavoro` · `Hai il lavoro.` · `You got the job.` → `You've got the job.` —
    `Hai` is present; simple past reads as `Hai ottenuto`.
50. `dov-e-la-mia-giacca` · `Dov'è la mia giacca?` · `Where's my coat?` →
    `Where's my jacket?` — `giacca` = jacket; coat is `cappotto`.
51. `lo-vedo-raramente` · `Lo vedo raramente.` · `I see it rarely.` →
    `I rarely see him.` — adverb placement is unnatural post-verbally, and `lo` for an
    animate object is more naturally "him".
52. `sei-cambiato-molto` · `Sei cambiato molto.` · `You changed a lot.` →
    `You've changed a lot.` — passato prossimo with present relevance reads as perfect.
53. `tom-e-un-mio-amico` · `Tom è un mio amico.` · `Tom's my friend.` →
    `Tom is a friend of mine.` — `un mio amico` is explicitly indefinite; "my friend" is
    `il mio amico`.
54. `non-sono-in-buona-salute` · `Non sono in buona salute.` · `I'm not healthy.` →
    `I'm not in good health.` — the Italian is a PP idiom; the adjective form is `sano`.
55. `ho-perso-l-orologio` · `Ho perso l'orologio.` · `I lost the watch.` →
    `I lost my watch.` — Italian uses the definite article for inalienable/personal
    possession; English requires the possessive.
56. `lavare-e-il-mio-lavoro` · `Lavare è il mio lavoro.` · `Washing is my work.` →
    `Washing is my job.` — "my work" is uncountable/abstract; `il mio lavoro` here is the
    countable job, as rendered in `sto-solo-facendo-il-mio-lavoro` → `I'm only doing my job.`
57. `sicuramente-mi-ha-spaventato` · `Sicuramente mi ha spaventato.` · `It sure scared me.` →
    `It certainly scared me.` — "sure" as adverb is US-colloquial and non-standard.
58. `ne-abbiamo-abbastanza` · `Ne abbiamo abbastanza.` · `We have enough.` →
    `We have enough of it.` — partitive `ne` unrendered; the phrase also carries the
    idiomatic "we've had enough" reading, worth disambiguating.
59. `vado-a-letto` · `Vado a letto!` · `I'm going to bed.` → `I'm going to bed!` —
    **the only terminal-punctuation mismatch in all 506.** Italian `!`, English `.`

### Cross-entry inconsistencies (grouped)

60. **`posso` → "May I" vs "Can I" is split arbitrarily.** "May I":
    `posso-avere-questo-libro`, `posso-fare-una-domanda`, `posso-andare-a-casa`,
    `posso-suonare-il-piano`. "Can I": `posso-avere-questa-arancia`,
    `posso-avere-un-cuscino`, `posso-avere-dell-acqua`, `posso-avere-un-caffe`,
    `posso-avere-un-abbraccio`, `posso-avere-un-bacio`, `posso-venire-con-te`,
    `posso-venire-con-tom`, `posso-contare-su-di-te`. Both are defensible for `posso`;
    pick one and apply it uniformly.
61. **`È di X` → "It's" vs "That's" is split.** `e-di-mio-fratello` → `It's my brother's.`
    but `e-di-mio-padre` → `That's my father's.` Same construction, two deixes. Recommend
    "It's" for both.

### Duplicate `known` collisions (two Italian sentences sharing one English prompt)

Detected mechanically across all 506. Split into fixable and structural.

**Fixable — the English is genuinely wrong or avoidably identical:**

62. `fai-esattamente-come-ti-dico` / `fai-esattamente-come-ti-ho-detto` — resolved by
    Critical #3.
63. `che-lavoro-fa` / `che-cosa-fa` — resolved by Important #15.
64. `sono-un-insegnante` / `sono-un-professore` — both `I'm a teacher.` Propose
    `sono-un-professore` → `I'm a professor.` (or `I'm a schoolteacher.`) to separate them.
65. `mio-padre-e-un-dottore` / `mio-padre-e-medico` — both `My father's a doctor.` Propose
    `mio-padre-e-medico` → `My father is a physician.` to separate them.
66. `non-fare-tardi` / `non-fare-ritardo` — both `Don't be late.` Propose
    `non-fare-ritardo` → `Don't be delayed.` to separate them.
67. `tom-non-e-in-casa` / `tom-non-e-a-casa` — both `Tom isn't home.` Propose
    `tom-non-e-in-casa` → `Tom isn't indoors.` / `Tom isn't in the house.`; compare the
    already-distinguished pair `ero-a-casa` → `I was home.` vs `ero-in-casa` → `I was at home.`
68. `casa-tua-e-grande` / `la-tua-casa-e-grande` — both `Your house is big.` The Italian
    differs only in possessive syntax, which English cannot mark; consider dropping one.
69. `veramente` / `davvero` — both `Really?`; true synonyms, one is redundant.
70. `alla-vostra` / `salute` — both `Cheers!` Propose `alla-vostra` → `To your health!`
71. `dopo-di-te` / `dopo-di-voi` — both `After you.` (singular vs plural addressee).
72. `come-sta-tua-madre` / `come-sta-vostra-madre` — both `How's your mother?`
73. `dove-stavi` / `dov-eri` / `dove-eravate` — all three `Where were you?` A three-way
    collision; `dove-stavi` uses `stare`, the other two `essere`, sg vs pl.
74. `devo-andare-adesso` / `devo-andare-ora` — both `I must go now.` (`adesso`/`ora` synonyms).
75. `ha-un-cane` / `lui-ha-un-cane` — both `He has a dog.` (null vs overt subject pronoun).
76. `parlo-molto` / `io-parlo-molto` — both `I talk a lot.` (null vs overt subject pronoun).
77. `potete-venire-con-noi` / `puoi-venire-con-noi` — both `You can come with us.` (pl vs sg).
78. `non-sei-in-ritardo` / `non-siete-in-ritardo` — both `Aren't you late?` (sg vs pl).

**Structural — English cannot distinguish these; listed for awareness only, no fix proposed:**

79. `sono-pieno` / `sono-piena` — `I'm full.` (speaker gender).
80. `sei-grasso` / `sei-grassa` — `Are you fat?` (addressee gender).
81. `sono-preoccupato` / `sono-preoccupata` — `I'm worried.` (speaker gender).
82. `le-conosco` / `li-conosco` — `I know them.` (object gender).

For groups 71–82 the collision is inherent to the Italian↔English mapping. If the drill
engine grades by exact match, these pairs will produce unfixable false negatives regardless
of translation quality — that is a corpus-composition question, not a translation defect.

---

## Passed clean — notable idiom and false-friend checks

Verified correct, no change proposed:

- `mi-manchi` → `I miss you.` — the `mancare` inversion is handled correctly.
- `a-chi-lo-dici` → `Tell me about it!` — idiomatic, not literal.
- `ci-ha-fatto-da-guida` → `He acted as our guide.` — `fare da` + dative `ci` correct.
- `mi-sono-chiuso-fuori` → `I locked myself out.` — reflexive correct.
- `ora-o-mai-piu` → `It's now or never.`
- `fino-a-qui-tutto-bene` → `So far, so good.`
- `si-che-lo-voglio` → `I do want it.` — emphatic `sì che` correctly rendered as do-support.
- `e-tutto` → `That's it.`
- `deve-avere-nostalgia-di-casa` → `He must be homesick.` — epistemic `dovere` correct.
- `mi-sta-venendo-nostalgia-di-casa` → `I'm getting homesick.`
- `eravamo-uno-di-troppo` → `We were one too many.`
- `ordiniamo` → `Shall we order?` — hortative correct.
- `cosa-abbiamo-qui` → `What have we here?`
- `l-hai-fatto-ancora` → `You've done it again.`
- `sono-sceso-dal-treno` → `I got off the train.`
- `l-ho-gia-detto-a-tom` → `I already told Tom.`
- `a-mia-madre-piace-la-musica` → `My mother likes music.` — `piacere` inversion correct.
- Subjunctive triggers all render correctly: `credo-che-sia-felice`, `credo-che-sia-malata`,
  `io-credo-che-tom-sappia`, `sono-felice-che-tom-sia-a-casa`, `voglio-che-tom-vada-a-casa`.
- No instance of `attualmente`, `eventualmente`, or `magari` appears in the VOCALIZED set,
  so those false-friend families carry no risk here.
