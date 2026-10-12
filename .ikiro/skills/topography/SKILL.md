---
name: topography
description: >-
  Build a topology (the vocabulary of a KIND) or a topography (the vocabulary and freight of ONE body) —
  DATASET traits exactly, symbols shipped in dataset/symbols/, literals in dataset/literals/ ONLY when the
  topography also drains them (DATASINK + a harvest writing Datasink.canonical), FRAUGHT for freight without
  one. Use when harvesting a corpus, adding an ontology's vocabulary, or shipping audio, models, tablebases
  or manuals with a package.
when_to_use: >-
  "add a topography for X" · "new topology" · "harvest the corpus" · authoring
  `dataset/symbols/ontological.js` · "why is there data in the dataset" · shipping freight (audio, models,
  tablebases, manuals) · "FRAUGHT" · a row is about to be written into `dataset/literals/`.
---
<!-- limit: 5000 chars -->
# topography — "add a topography for X" · "harvest the corpus": vocabulary of a kind or a body

Canon: `quests/done/m61-chess-domain.org:73` · `quests/done/m22-datasink.org` · the assembly ontology quest's ruling 19 and vocabulary law. Measured on disk: every `type: "topology"` declares exactly `["DATASET"]` (11/11); every `type: "topography"` declares `DATASET` plus optional `FRAUGHT` (4) / `DATASINK` (1) (7/7). Both are modes → the path and export laws of skill `mode` apply. /"copus -> topography. ontology -> topology"/ — module TYPE only.

## The two laws

- **topology** — /"a topology ships the kind's root symbol and the vocabulary true of EVERY product"/. `dataset/symbols/ontological.js` names the kind (`part` · `placement` · `step` in assembly; the four chess topologies). Traits `["DATASET"]`, nothing else.
- **topography** — /"a topography ships the vocabulary true of ONE"/ body — its symbols and its freight (`traits: ["DATASET", "FRAUGHT"]`, `export const freight`). `@droneaid/topography/models` is one drone, `@droneaid/topography/guides` its manual; `english-to-spanish` is one language pair. A topography that holds LITERALS adds `DATASINK` and a `datasink` whose literal sinks select by the ontology's root symbol slug, leaned (`~/.viva/registry/droneaid/topographies/models/models.viva.js`), and a `harvest/` that writes `dataset/` in `Datasink.canonical` form.

## What a dataset ships — ruling 19

/"why is there data in at all?!??!!?"/ · /"makes no sense. shouldnt be"/ → **a topography ships its vocabulary and its pages.** Rows ride `dataset/literals/` under ONE condition, ruled 10-06 (m71 fork 7, /"the drone, its parts, and the guide are something i install. and when i change something, i want the dataset to be persisted to disk. dataset <> datasink loop closed."/): the topography declares `DATASINK` with a sink per ontology, and the files are written by a `harvest/` in `Datasink.canonical` form so the first drain is a no-op — the file is the record, the daemon working memory. An upsert never deletes, so a cut row (a symbol, a literal) stays in the db until removed (m71 fork 10). Symbols are abstract, literals are concrete: /"events are not fucking symbols stupid. they are concrete - literal."/ REJECTED: a checked-in literal with no sink draining it back (the 09-24 reading, superseded) · a literal typed by hand into a drained file while the daemon runs.

## Freight without a dataset

A body that ships only payloads (audio, a tablebase, a manual, a 3D model) is a topography with `traits: ["FRAUGHT"]` and no dataset (`m61:73`). REJECTED: a new module type. `freight.path.nature` is read at `systems/runtime/mode/traits/fraught.js:17`; `statics.ignore` filters the walk. FRAUGHT carries, MOUNTED serves; a path is not a URL — decode out, encode per segment in.

## Corpus builds — the standing laws

- read ≥3 existing entries before authoring into any dataset (skill `change`, pre-flight).
- a fixture slug that passes through a lens is a WORD, never a letter.
- br vs pt identification before any Portuguese row.
- the snapshot regime for a topography is the corpus snapshot family.
- derived content is never checked in as source.

## Layout

```
topologies/<kind>/<kind>.viva.js
topologies/<kind>/dataset/symbols/ontological.js
topographies/<body>/<body>.viva.js
topographies/<body>/freight/…
```

- `<kind>.viva.js` — `manifest { type:"topology", slug:<kind>, traits:["DATASET"] }` · `export const dataset`.
- `<body>.viva.js` — `manifest { type:"topography", …, traits:["DATASET","FRAUGHT"] }` · `dataset` · `freight`.
- `freight/…` — the payloads, walked at mount.

Two manifests can mount the same topology — the package's and `~/.viva/instances/<slug>/instance.viva.json` — one module listed twice in `modes` is two modes (skill `package`). The shelf copy drifts → skill `debug`.
