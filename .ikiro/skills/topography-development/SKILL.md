---
name: topography-development
description: >-
  Build a topology (the vocabulary of a KIND) or a topography (the vocabulary and freight of ONE body) —
  DATASET traits exactly, symbols shipped in dataset/symbols/, NO literals authored into a dataset, FRAUGHT
  for freight without one. Use when harvesting a corpus, adding an ontology's vocabulary, or shipping audio,
  models, tablebases or manuals with a package.
when_to_use: >-
  "add a topography for X" · "new topology" · "harvest the corpus" · authoring `dataset/symbols/ontological.js` ·
  "why is there data in the dataset" · shipping freight (audio, models, tablebases, manuals) · "FRAUGHT" ·
  a row is about to be written into `dataset/literals/`.
---

# topography-development — vocabulary of a kind, vocabulary and freight of a body

Canon: `m67-assembly-ontology.org` rulings 19 and the vocabulary law (`:60`, `:93`) · `done/m61-chess-domain.org:73` · `done/m22-datasink.org` · corpus quests (`tatoeba-harvest` · `english-to-spanish` · `flatten-corpora` · `conjugation-ontology` · `topology-to-corpus`). Measured on disk 09-22: every `type: "topology"` declares exactly `["DATASET"]` (11/11); every `type: "topography"` declares `DATASET` plus optional `FRAUGHT` (4) / `DATASINK` (1) (7/7). Both are modes → the path and export laws of [[mode-development]] apply.

## The two laws

- **topology** — *"a topology ships the kind's root symbol and the vocabulary true of EVERY product"*. `dataset/symbols/ontological.js` names the kind (`part` · `placement` · `step` in assembly; the four chess topologies). Traits `["DATASET"]`, nothing else.
- **topography** — *"a topography ships the vocabulary true of ONE"* body — its symbols, and its freight (`traits: ["DATASET", "FRAUGHT"]`, `export const freight`). `@droneaid/topography/model` is one drone; `english-to-spanish` is one language pair.

## What a dataset ships — beef's ruling 19

*"why is there data in at all?!??!!?"* · *"makes no sense. shouldnt be"* → **a topography ships its vocabulary and its pages; its rows are what the importer writes into `dataset/literals/`.** Nothing authored by hand or by a script rides a dataset — and an upsert never deletes, so a shipped row is permanent. Symbols are abstract, literals are concrete (*"events are not fucking symbols stupid. they are concrete - literal."*). A blend, a corpus file, an audio clip enters through an importer door ([[domain-development]]) or a DATASINK drain, never through a checked-in literal.

## Freight without a dataset

A body that ships only payloads (audio, a tablebase, a manual, a 3D model) is a topography with `traits: ["FRAUGHT"]` and no dataset (`m61:73`) — never a new module type. `freight.path.nature` is read at `daemon/traits/index.js:74`; `statics.ignore` filters the walk. FRAUGHT carries, MOUNTED serves (`project_freight_vs_mountpoint`); a path is not a URL — decode out, encode per segment in (`feedback_a_path_is_not_a_url`).

## Corpus builds — the precedent that recurs

Eleven quests shaped a symbols/literals/freight dataset with no mode of their own. Their standing laws: read ≥3 existing entries before authoring into any dataset (pre-flight 5) · a fixture slug that passes through a lens is a WORD, never a letter (`feedback_tests_comply_with_system`) · br vs pt identification before any Portuguese row (`feedback_br_vs_pt_identification`) · the snapshot regime for a topography is the corpus snapshot family (`project_corpus_snapshot_regime`) · derived content is never checked in as source (`feedback_no_content_codegen`).

## Layout

```
topologies/<kind>/<kind>.viva.js        manifest { type:"topology", slug:<kind>, traits:["DATASET"] } · export const dataset
topologies/<kind>/dataset/symbols/ontological.js
topographies/<body>/<body>.viva.js      manifest { type:"topography", …, traits:["DATASET","FRAUGHT"] } · dataset · freight
topographies/<body>/freight/…           the payloads, walked at mount
```

Two manifests can mount the same topology — the package's and `~/.viva/instances/<slug>/daemon.js` — one module kernelled twice is two modes ([[package-development]]). The shelf copy drifts → [[shelf-sync]].
