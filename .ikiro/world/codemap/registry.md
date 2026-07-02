---
paths: ["registry/**"]
---
<!-- writer: agent · derived-from: registry + corpus read · verified: session c795a2f7 · limit: 40 lines -->
# codemap: registry — marketplace (→ M11 package)

- **shape today**: `{kernels,modes,services,wafers}/@vivalence/<type>/<slug>/<slug>.viva.js` + flat `playground/<slug>/`. M11 flattens to `registry/<type>/<slug>/` (playground already there; wafers variant-scope-loaded, untouched). [[m11_packages.quest]]
- **manifest**: `{owner?, type, slug, version, traits[]}`. **Manifest is METADATA** — new behavior = sibling export, never a manifest field. HARD STOP.
- **mode anatomy**: `manifest` + `app` (App descriptor + `v.buffer` schema; export name = cake key) + `emitter` (Vector of `{nature,input,valence}` descriptors) + `dataset` (intent[]) + optional `tools`.
- **kernels**: domain/learning (Literal/Symbol/Memory/Product; drivers BAYESIAN ebisu / BOOLEAN / COUNTER; status UNTOUCHED→…→GRADUATED; aperture `/pick/literal/*` + `/review/*`) · ontology/{word,sentence,conjugation} · corpus/english-to-brazilian (2086 literals, 1160 mp3; audit spec → [[corpus-quality-criteria]]) · corpus/english-to-spanish (M1, boot pending).
- **literal traits**: TRANSLATED EXEMPLIFIED RANKED ANNOTATED VOCALIZED CONJUGATED — each a `literal.data.{TRAIT}` contract; LiteralSubscriber (afterFlush) resolves slugs → `uses` junctions via raw SQL (hooks cannot `em.flush`).
- **services**: datamap/libsql (provider → {orm, entities}, automigration) · hallucinator/{anthropic,elevenlabs,deepgram} (Faculty[]: type/accepts/produces/delivery/tune/context/`hallucinate(turns,config)`; `object` is a DERIVED cortex faculty) · lighthouse/multiplayer (ATTACHED) · nlp (stanza docker). Hallucinator tests hit live APIs.
- blind spot: pick/review endpoints + BOOLEAN/COUNTER drivers untested.
