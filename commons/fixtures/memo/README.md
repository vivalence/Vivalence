# @memo

Anki rebuilt as one vivalence package. The demo case and the full vertical — domain, dataset, mode, daemon — in the smallest shape that is still complete: the Latin core on a daemon, flashcards in the frame, the Magister in the dock, both grading one SM-2 schedule.

## Anatomy

```
package.viva.js              owner @memo
instance/instance.viva.json  @memo/instance/memo — daemon memo, statics.language, the three modes
domain/                      @memo/domain/srs — EXPOSED · TOOLING, the daemon's domain
  domain.viva.js             traits · aperture · tools · harness · types
  retention/sm2.js           the SM-2 driver: encode · evolve · assess · preview · strength · sql.strength
  traits/literal/            RETAINED: feed · novel · due · byStrength · byStatus · sample · leeches · review · preview · history
                             TRANSLATED (the agent card, text search) · EXEMPLIFIED · RANKED · VOCALIZED · DEPICTED
  traits/note/               RETAINED (the driver's state, evolve, due, byStrength, traces, assess) · TRACED · SUSPENDED
  card.js                    one projection of a literal and its notes, for every deal and both views
  aperture/                  /pick/literal/* · /review/literal · /preview/literal · /history/literal · /suspend/literal · /resume/literal
  tools/                     srs_lookup · srs_sentences · srs_topics · srs_history · srs_leeches · srs_suspend · srs_resume
  harness.js                 the SRS vocabulary, for every HARNESSED mode on the daemon
dataset/                     @memo/topography/latin — DATASET · FILESET
  entities/                  219 words, 50 sentences, 242 symbols, authored in words.js · sentences.js · symbols.js
  files/                     10 voices (sentences), 10 pictures (nouns) — placeholders; FILESET records each as a File row
mode/                        @memo/srs/memo — APPLICATION · EMITTER · EXPOSED · HARNESSED · CONVERSATIONAL · TOOLING
  memo.viva.js               the App: the tty view and the tablet, one buffer schema
  aperture.js                /deck · /grade · /stats · /chat
  emitter.js                 /session — deals a deck as a buffer on the thread
  tools/                     review · grade · progress · add · explain · session — the Magister's loop
  harness.js · hal/          the Magister, the language, today's briefing per dialogue
  buffer/memo.jsx            the tty view: tab reveals, 1 again · 2 hard · 3 good · 4 easy, each with its horizon
  buffer/Memo.svelte         the tablet: Iterum · Durum · Bene · Facile, voice and picture
tests/                       sm2 · dataset · memo (the card, the tty view by keys, the tablet compiled)
```

## The scheduler

SM-2 as Anki ships it: learning steps 1m and 10m, graduation at one day, easy graduation at four, ease starts 2.5 and floors at 1.3, HARD multiplies 1.2 and costs 0.15 ease, GOOD multiplies by ease, EASY adds a bonus and always beats GOOD, a lapse halves the interval, costs 0.2 ease and sends the card to relearning, maturity at 21 days. It implements the retention driver contract — encode, evolve, assess, strength, sql.strength — so another driver can occupy the slot; `preview` is its one extra, the four horizons a grade would move a card to.

A card's retention is a note: `retention.<slug>` RETAINED holds the driver's state, a TRACED child keeps every grade (signal, status, the snapshot, the mode and thread it was given on), `suspension.<slug>` SUSPENDED takes it out of every deal. All three are per daemon and per learner, so the frame and the Magister move one schedule.

## The dataset

English to Latin, classical and ecclesiastical. Ten topics from Religio to Sermo, three genders, two levels, one lemma symbol per word. Sentences carry the lemma symbols of the vocabulary they contain — Amor omnia vincit links amor, omnis, vincere — so `srs_sentences` and `explain` surface the sentences that hold a weak word. `word` / `sentence` are TOPOGRAPHICAL (a literal's ontology derives from them), grammatical facets ONTOLOGICAL, groupings STRUCTURAL. The files are placeholders; drop real recordings and pictures over the same paths.

## The demo

```sh
viva ledger/install
viva instance/clone memo --use --install
viva instance/up
viva
```

`ledger/install` taps every package of the checkout's `commons`, this one included. The Magister talks through the ledger's hallucinators; without keys they stay dormant and the flashcards still deal. In the repo, `deno task ghost/scenario` runs the same daemon on the offline stub: `/terminal/new`, `/thread/new /daemon/memo/mode/srs/memo`, then talk — `--tool session` makes the stub deal a deck into the frame.
