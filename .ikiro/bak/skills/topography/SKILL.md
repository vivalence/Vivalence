---
name: topography
description: Build a topology (the vocabulary of a kind) or a topography (the vocabulary and files of one body).
when_to_use: >-
  "add a topography for X" · "new topology" · "harvest the corpus" · "why is there data in the dataset" ·
  "FILESET" · shipping audio, models or manuals with a package
---
<!-- limit: 3000 chars -->
# topography — the vocabulary of a kind, or of one body

Both are modes. Skill `mode` applies.

- A topology ships the root symbol of a kind and the vocabulary true of every product. Traits: `["DATASET"]`.
- A topography ships the vocabulary and the files of one body. Traits: `["DATASET"]`, plus `FILESET` for files, plus `DATASINK` when it holds literals.

## what a dataset ships

- Symbols are abstract. They ship in `dataset/symbols/`.
- Literals are concrete. They ship in `dataset/literals/` only when the topography declares `DATASINK` and a `harvest/` writes them in `Datasink.canonical` form. Then file and database are one loop.
- Never type a literal by hand into a drained file while the daemon runs.
- An upsert never deletes. A cut entity stays in the database until removed.
- Slugs are unique per daemon. A literal has no owner key.

## files without a dataset

Audio, models, manuals: a topography with `FILESET`.

```js
export const fileset = { path: "freight" };
```

## building a corpus

- A second body of one daemon joins the existing topography as a new file in its `harvest/`.
- The first slice of a body is its model part plus at least one placement. A bare part draws an empty stage.
- A sub-assembly is a part with its own layer, placed once in each body that has it.
- Two bodies share a build stage only where he says they are equal.
- Every document of a source he hands is a deliverable until he cuts it.
- Read three existing entries before minting a slug.
- Word frequency comes from wordfreq, per form, never per lemma.
- Text follows its recording. The slug and the file name stay.
- No symbol is guessed. Every slug resolves against the ontology.
- An entity of rank 0 loses `RANKED`. It is never deleted.
- Derived content is never checked in.

## layout

```
topologies/<kind>/<kind>.viva.js
topologies/<kind>/dataset/symbols/ontological.js
topographies/<body>/<body>.viva.js
topographies/<body>/dataset/
topographies/<body>/harvest/
topographies/<body>/freight/
```
