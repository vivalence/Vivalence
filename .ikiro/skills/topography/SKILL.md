---
name: topography
description: >-
  Build a topology (the vocabulary of a KIND) or a topography (the vocabulary and freight of ONE body) —
  DATASET traits exactly, symbols shipped in dataset/symbols/, literals in dataset/literals/ ONLY when the
  topography also drains them (DATASINK + a harvest writing Datasink.canonical), FILESET for its freight.
  Use when harvesting a corpus, adding an ontology's vocabulary, or shipping audio, models, tablebases
  or manuals with a package.
when_to_use: >-
  "add a topography for X" · "new topology" · "harvest the corpus" · authoring
  `dataset/symbols/ontological.js` · "why is there data in the dataset" · shipping freight (audio, models,
  tablebases, manuals) · "FILESET" · a row is about to be written into `dataset/literals/`.
---
<!-- limit: 5000 chars -->
# topography — "add a topography for X" · "harvest the corpus": vocabulary of a kind or a body

Canon: `quests/done/m61-chess-domain.org:73` · `quests/done/m22-datasink.org` · the assembly ontology quest's ruling 19 and vocabulary law. Measured on disk: every `type: "topology"` declares exactly `["DATASET"]` (12/12); every `type: "topography"` declares `DATASET` plus optional `FILESET` (5) / `DATASINK` (3) (8/8). Both are modes → the path and export laws of skill `mode` apply. /"copus -> topography. ontology -> topology"/ — module TYPE only.

## The two laws

- **topology** — /"a topology ships the kind's root symbol and the vocabulary true of EVERY product"/. `dataset/symbols/ontological.js` names the kind (`part` · `placement` · `step` in assembly; the four chess topologies). Traits `["DATASET"]`, nothing else.
- **topography** — /"a topography ships the vocabulary true of ONE"/ body — its symbols and its freight (`traits: ["DATASET", "FILESET"]`, `export const fileset = { path: "freight" }`). `@droneaid/topography/models` is one drone, `@droneaid/topography/guides` its manual; `english-to-spanish` is one language pair. A topography that holds LITERALS adds `DATASINK` and a `datasink` whose literal sinks select by the ontology's root symbol slug, leaned (`~/.viva/registry/droneaid/topographies/models/models.viva.js`), and a `harvest/` that writes `dataset/` in `Datasink.canonical` form.

## What a dataset ships — ruling 19

/"why is there data in at all?!??!!?"/ · /"makes no sense. shouldnt be"/ → **a topography ships its vocabulary and its pages.** Rows ride `dataset/literals/` under ONE condition, ruled 10-06 (m71 fork 7, /"the drone, its parts, and the guide are something i install. and when i change something, i want the dataset to be persisted to disk. dataset <> datasink loop closed."/): the topography declares `DATASINK` with a sink per ontology, and the files are written by a `harvest/` in `Datasink.canonical` form so the first drain is a no-op — the file is the record, the daemon working memory. An upsert never deletes, so a cut row (a symbol, a literal) stays in the db until removed (m71 fork 10). Symbols are abstract, literals are concrete: /"events are not fucking symbols stupid. they are concrete - literal."/ REJECTED: a checked-in literal with no sink draining it back (the 09-24 reading, superseded) · a literal typed by hand into a drained file while the daemon runs.
Slugs are daemon-unique; /"Literals don't require an owner."/ (09-22). REJECTED: an owner key.

## Freight without a dataset

Payloads only (audio, tablebase, manual, 3D model) = a topography with `FILESET` (`m61:73`). REJECTED: a new module type. `fileset.path` is walked at `systems/runtime/subjects/mode/traits/fileset.js:6` into `entities.file` (mime · bytes). A path is not a URL — decode out, encode per segment in.

## Corpus builds — the standing laws

- read ≥3 entries (skill `change`), grep dataset + siblings before minting a slug or 'missing' row (/"read the fucking data. topology is full of fucking examples."/ 04-29); wordfreq per FORM, never lemma (/"all frequency data must come from wordfreq. allways!!!"/).
- vocalized FIRST; its text follows its recording (/"the audio here says not fatto but finito."/) — slug + mp3 name stay.
- no symbol guessed (09-21): every slug resolves against the ontology; absent slug · undeclared json key validate SILENTLY.
- a rank-0 row loses `RANKED`, never the row (/"prune that."/): 23 deletions broke 351 bundles.
- a fixture slug through a lens is a WORD, never a letter · br vs pt before any Portuguese row · a form→lemma index is a multimap (`foi` → ir · ser) · snapshots = the corpus family · derived content never checked in.

## Layout

```
topologies/<kind>/<kind>.viva.js
topologies/<kind>/dataset/symbols/ontological.js
topographies/<body>/<body>.viva.js
topographies/<body>/freight/…
```

`<kind>.viva.js` `{ type:"topology", slug:<kind>, traits:["DATASET"] }` · `dataset`; `<body>.viva.js` `traits:["DATASET","FILESET"]` · `dataset` · `fileset`. One module twice in `modes` (package + `~/.viva/instances/<slug>/instance.viva.json`) is two modes (skill `package`); shelf drift → skill `debug`.
