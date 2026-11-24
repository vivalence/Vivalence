<!-- limit: 6000 chars -->
# tune-triangle — moved whole out of the quest 11-13

## rulings 1 · 2 · 3

** as code

1 — one knob per spoke, never one dot. =subsystems/drapes/Tune.jsx:5=

#+BEGIN_SRC js
export const SPOKES = [
  [0, -1],
  [-0.866, 0.5],
  [0.866, 0.5],
];
#+END_SRC

2 — an explicit point beats a named one. =subsystems/typology/prototypes/cortex.js:35=

#+BEGIN_SRC diff
-  return query.tier ? { ...query, tune: tiers[query.tier] } : query;
+  return query.tier && !query.tune ? { ...query, tune: tiers[query.tier] } : query;
#+END_SRC

3 — =/tier= writes its point. =systems/ghost/subjects/terminal/commands/intelligent.js:26= (the reading is mine, reported; see =* deferred= 2)

#+BEGIN_SRC diff
-        traits.patch(ctx.terminal.thread, { INTELLIGENT: { ...UNPINNED, ...INTELLIGENT } }),
+        traits.patch(ctx.terminal.thread, { INTELLIGENT: { ...UNPINNED, ...INTELLIGENT, tune: tiers[INTELLIGENT.tier] } }),
#+END_SRC


## blast table

* blast table — grep 11-13, =bak/= · =testament/= skipped

| container                                              | files | literals | BREAKS  |
|--------------------------------------------------------+-------+----------+---------|
| =subsystems/typology= product                          |     2 |        7 | at land |
| =commons/hallucinators/openrouter/provider/index.js=   |     1 |        7 | at land |
| =commons/fixtures/testing/hal/stub/provider/index.js=  |     1 |        5 | at land |
| =commons/hallucinators/anthropic/provider/index.js=    |     1 |        3 | at land |
| =commons/hallucinators/elevenlabs/provider/index.js=   |     1 |        2 | at land |
| =commons/hallucinators/deepgram/provider/index.js=     |     1 |        2 | at land |
| =systems/ghost/…/commands/intelligent.js=              |     1 |        1 | at land |
| =systems/anima/…/sidebar/sections.js=                  |     1 |        0 | at land |
| =subsystems/drapes/Tune.jsx= · =parts.css=             |     2 |        0 | at land |
| =commons/reader/reader/aperture/pdf.js:180=            |     1 |        0 | follows |
| =subsystems/typology/tests=                            |     8 |       39 | at land |
| =commons/**/tests= · =commons/fixtures/testing/data=   |     9 |       22 | at land |
| =systems/anima/tests=                                  |     4 |        4 | at land |
| =systems/runtime/tests=                                |     2 |        2 | at land |
| =systems/ghost/tests= · =subsystems/drapes/tests=      |     2 |        2 | at land |
| snapshots (=typology= 3, =runtime= 2)                  |     5 |          | at land |
| =~/.viva/registry= (education · assembly · vcompany)   |     5 |        5 | at land |
| =~/.viva/instances/localhost/…/localhost.viva.db=      |     1 |  unknown | at boot |
| prod, two hosts                                        |       |  unknown | at boot |

Pass-through, no change: =harnessed.js:56-67= · =hal.js:53= · =hallucinate.js:20= · =host.js:28= · =belt/cortex.js:5= · =belt/array.js:53=.


## changelog, four axes

- 11-13 /"go"/ — primer folds like tools: =sections.js= =folded(world, root, leaf, node)=, leaf renderers =peeked= · =armed=; probe on a fake trie, 8 entries as expected.
- 11-13 /"a."/ — =subsystems/drapes/Tune.jsx= new, =Srow.jsx= type =tune=, =parts.css= =.srow.tune=, =sections.js= disclosure, ghost =/tune=. Departure, mine, reported: the spokes are one =path=, the word-guard refused the svg element.
- 11-13 /"t1 seems reasonable"/ — =cortex.js:35=; =/tier= writes its point.
- 11-13 /"lower bounds not aligned. reduce thrift height"/ — the rail on the radar's own rows =22fr 60fr 26fr=.
- 11-13 /"fix."/ ×2 — bottom labels stacked name over value; strokes =non-scaling-stroke=, outline 1px · signal 2px.

## the providers, three axes (landed 11-13)

| file under =commons/=                        | key      | three axes         |
|----------------------------------------------+----------+--------------------|
| =hallucinators/anthropic/provider/index.js=  | opus     | [0.95, 0.15, 0.15] |
|                                              | sonnet   | [0.6, 0.6, 0.5]    |
|                                              | haiku    | [0.25, 0.95, 0.5]  |
| =hallucinators/openrouter/provider/index.js= | strong   | [0.8, 0.35, 0.3]   |
|                                              | standard | [0.45, 0.85, 0.7]  |
|                                              | light    | [0.1, 1.0, 0.95]   |
|                                              | chooser  | [0.4, 1.0, 0.95]   |
|                                              | capable  | [0.8, 0.4, 0.4]    |
|                                              | balanced | [0.6, 0.6, 0.6]    |
|                                              | fast     | [0.4, 0.9, 0.9]    |
| =hallucinators/elevenlabs/provider/index.js= | luiza    | [0.3, 0.4, 0.1]    |
|                                              | leandro  | [0.5, 0.5, 0.1]    |
| =hallucinators/deepgram/provider/index.js=   | nova     | [0.5, 0.9, 0.6]    |
|                                              | flux     | [0.6, 0.8, 0.4]    |
| =fixtures/testing/hal/stub/provider/index.js= | deep    | [0.95, 0.15, 0.15] |
|                                              | middle   | [0.6, 0.6, 0.5]    |
|                                              | quick    | [0.25, 0.95, 0.5]  |
|                                              | verbatim | [0.4, 0.8, 0.9]    |
|                                              | speech   | [0.3, 0.8, 0.9]    |

