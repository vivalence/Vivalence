<!-- limit: 14000 chars -->
# ocr — drill ledger 11-13 · ONE lock (the layer), the rest SKETCH

Beside this file: `shapes.probe.js` · `verbatim.probe.js` · `page.probe.js` (run command in each head) · `one-word` · `two-column` as `.png` + `.tsv` (tesseract 5.5.2 reads of two generated images).

## his words

- trigger: `https://www.science.org/doi/epdf/10.1126/science.132.3436.1291` into the reader — /"needs OCR no?"/
- /"need an ocr service. is ocr faculty or service? note how we treat nlp. ocr service. should be rich serivce. all the capability. nice loooong term scalable semantically and ontologically correct schema."/
- after Q0 (A · B · C below), no lock: /"interesting. ok. now think about it in vivalence terms. i will watn that at some point in the future in the system and maybe as faculty but for sure as an ontrology and schematic from typology. tooling provided, service implementation, eye on deeper integration. what does that look like? conoisseur pass."/
- /"and for the download. is there some trick to maybe load an iframe and capture the downloaded file??"/

## locked

OCR is a service, the nlp seat — never a faculty today.

```js
// commons/services/nlp/service.viva.js:7
const manifest = {
  type: "service",
  slug: "nlp-stanza",
  name: "Stanza NLP service",
  traits: ["SERVER", "DOCKER", "COMPOSE", "TOOLING"],
};
```

Ruled 11-13, after the walk: /"lets keep it selfcontained. build for integration. but no changes or additions in typology. write the serivec such that it will fit into typology later. might mean duplication."/ Landed `commons/services/ocr/` (`@commons/service/ocr-tesseract`, `traits: ["TOOLING"]`): `schematics.js` holds `Word` (typology's + `page` · `box`) · `Final` · `Source` (`Part.Document | Part.Image`) · `Settings`, the rows that lift into `hallucination.js:317` later; `provider/index.js` = `(source, settings)` → async generator of `/verbatim/final`, one per tesseract PARAGRAPH (polish can join, never split), pdf drawn by `pdftoppm`, both binaries statics; `tools/index.js` `/transcribe { file, language? }`. Tests: translate 5 · transcribe 3 · provider 6 steps green (3 of them gated on the two binaries). MINE, unruled: slug · `/transcribe` · `box` · statics keys `tesseract` · `pdftoppm`.

Wired 11-13 — /"i will want you to attach this to the reader mode. modes can take services. wire that up"/: `commons/reader/reader` reads `ctx.providers.ocr` (`aperture/pdf.js` `scanned`: the pdf whole as a `Part.Document`, `verbatim.fold`, one `<p>` per segment, a read step per page); `PdfOptions.reader` gains `ocr`, `PdfOptions.scannable` is offered by `OFFERS.pdf` and shows the button (`buffer/Reader.jsx:119`). Reader suite 27 → 34 steps green. The seat is the MODE's mask, proven on a real runtime on a free port (`hello.boot`, real tesseract: put → `scannable: true` → parse → 3 blocks):

```jsonc
// ~/.viva/instances/localhost/instance.viva.jsonc:13 — bak ~/.viva/bak/instances/localhost-20261113/
      { "module": "@commons/reader/reader", "consume": { "ocr": { "module": "@commons/service/ocr-tesseract" } } }
```

`viva instance/doctor`: problems — · faults —. His `:2501` seats it at its next restart. MINE: enum word `ocr` · `scannable`.

PROD OWED — /"note that on prod well also want that"/: (1) the image has neither binary: `Dockerfile:3` (`vivalence/viva:alpine`, the runtime's `FROM`) needs `tesseract-ocr` · `tesseract-ocr-data-eng` · `poppler-utils` (alpine names RECALLED, not run); (2) R000's recipe takes the same mode mask, swapped WITH the image — a recipe naming a module the image lacks is a crash loop (`reference/prod-deploy/m8-reader-darkroom.md`). A missing binary alone is a sentence at the first read, never a boot fault.

Lookup: home `commons/services/ocr/` (/"mail, telegram, slack, and OCR etc go to commons."/, `quests/discarded/m53-vcompany.org:36`); nlp's slug names its engine.

## terrain

The reader has no OCR. A pdf is read by its text layer, or by a document-reading dialogue faculty in 8-page windows.

```js
// commons/reader/reader/schematics.js:34
  reader: v.enum(["text", "model"]).default("text")
// commons/reader/reader/aperture/pdf.js:178
  const documents = cortex.find({ type: "dialogue", via: "render" }).filter((faculty) => faculty.channels.in.includes("document"));
```

The url itself never arrives: `/add` is a plain `fetch` (`aperture/index.js:90`), science.org answers 403 `cf-mitigated: challenge` on `/doi/epdf/` and `/doi/pdf/` (curl, 11-13). A dropped pdf does arrive (`buffer/Reader.jsx:295` → `/put/:buffer`).

## the tree already has this act — `verbatim`

A medium goes in, its text comes out word for word: the faculty type exists, for audio.

```js
// subsystems/typology/schematics/primitives/hallucination.js:19
  v.const("verbatim"),
// subsystems/typology/schematics/primitives/hallucination.js:317
export const Word = v.object({
  word: v.string(),
  start: v.number().optional(),
  end: v.number().optional(),
  confidence: v.number().optional(),
  language: v.string().optional(),
});
// subsystems/typology/schematics/primitives/hallucination.js:373
Verbatim.Final = v.object({
  event: v.const("/verbatim/final"),
  transcript: v.string(),
  segment: v.integer().optional(),
  words: v.array(Word).optional(),
});
Verbatim.Polish = v.object({
  event: v.const("/verbatim/polish"),
  transcript: v.string(),
  segments: v.array(v.integer()),
});
```

Its state is a fold of events; the transcript is read off the state.

```js
// subsystems/typology/gestalten/belt/verbatim.js:78
export const empty = { settled: [], open: "", tail: "" };
export const transcript = (state) => join(...state.settled.map((entry) => entry.text), state.open);
// subsystems/typology/gestalten/belt/hallucinate.js:219
export async function transcript(faculty, input, policy) {
  let state = verbatim.empty;
  for await (const event of transcribe(faculty, input, policy)) state = verbatim.fold(state, event);
  return verbatim.transcript(state);
}
```

A provider of it is a hallucinator whose faculty carries the function at `via.stream`.

```js
// commons/hallucinators/deepgram/provider/index.js:125
  const novaFaculty = () => ({
    type: "verbatim",
    id: "nova-3",
    tune: [0.5, 0.9, 0.6],
    context: 0,
    channels: {
      in: [{ type: "audio", codec: "pcm_16000" }],
      out: [{ type: "event" }],
    },
```

## probe — a page through the EXISTING fold (`verbatim.probe.js`)

One `/verbatim/final` per tesseract block, each word carrying `page` · `box` beside `word` · `confidence`. Nothing in typology changed.

```
Verbatim.Final errors: 0
Verbatim.Final errors: 0
transcript: "Tide Tables The tide rises twice Fig. 3. A tide gauge a day at Brest. read in 1907."
after polish: [{"id":1,"text":"Tide Tables. The tide rises twice a day at Brest."}]
```

- `Verbatim.Final` admits `page` · `box` today (open object). Nothing READS them.
- the second block reads ACROSS the two columns: tesseract's geometry is not reading order.
- `/verbatim/polish` over segments `[1, 2]` leaves one settled entry and DROPS its words (`belt/verbatim.js:94`).

## precedent — one row per system

| system | word box | word confidence | block role | text anchor |
|---|---|---|---|---|
| Tesseract 5.5.2 (RUN) | ✓ | ✓ | ✗ | ✗ |
| Azure Document Intelligence | ✓ | ✓ | ✓ | ✓ |
| Google Document AI | ✓ | ✓ | ✓ | page tree only |
| Mistral OCR | ✗ | ✓ | ✓ | ✗ |
| Docling | ✗ | ✗ | ✓ | ✓ |
| reader `Window` (`pdf.js:134`) | ✗ | ✗ | ✓ | ✗ |

Vendors' docs fetched 11-13; Mistral's and Docling's pages cut off mid-read.

- **Azure** `analyzeResult`: one top-level `content` string, every element points into it by `spans: [{ offset, length }]` and onto the sheet by `boundingRegions: [{ pageNumber, polygon }]`. `pages[].words` carry `content · polygon · confidence · span`. `paragraphs[].role` ∈ `title · sectionHeading · footnote · pageHeader · pageFooter · pageNumber`. `tables[].cells` carry `kind · rowIndex · columnIndex · columnSpan`. `figures[].elements` · `sections[].elements` are JSON pointers (`"/paragraphs/15"`). Polygon: 4 points clockwise from top-left, pixels for an image, inches for a pdf.
- **Google** `Document`: `text` + `pages[]` holding FLAT lists `blocks · paragraphs · tokens · symbols · tables`, each with `layout { textAnchor.textSegments[{ startIndex, endIndex }], confidence, boundingPoly { vertices, normalizedVertices }, orientation }`. A second tree `documentLayout.blocks[]` (`textBlock.type` ∈ `paragraph · subtitle · heading-1…5 · header · footer`, nested) carries its OWN text and no anchor: two texts, free to drift.
- **Mistral** `/v1/ocr`: `pages[] { index, markdown, images[], dimensions { dpi, height, width } }`; newer models add `blocks[] { type, top_left_x, top_left_y, bottom_right_x, bottom_right_y, content }` with types `text · title · list · table · image · equation · caption · code · references · aside_text · header · footer · signature`, and `confidence_scores_granularity: "word" | "page" | "block"`. No word boxes.
- **Docling** `DoclingDocument`: item lists `texts · tables · pictures`, a `body` tree linked by `{ "$ref": "#/texts/1" }`, every item `prov[] { page_no, bbox { l, t, r, b, coord_origin }, charspan }`, a `content_layer` ∈ `body · furniture · background · invisible · notes`. No word level.

## Q0 as asked — superseded, then DEFERRED by the ruling

One OCR call hands back: A a geometry tree (tesseract) · B reading blocks, no box (the reader's `Window`) · C one text, words and blocks pointing into it by offsets (Azure). All three cast, 0 errors (`shapes.probe.js`). `Recognition` · `Segment`: my names, dead.

## sketch — vivalence terms (SKETCH · typology is HOLY · nothing here is ruled)

**ontology** — OCR is no new act: `verbatim` over a second medium. The words exist: `verbatim` (the act) · `transcript` (its fold) · `segment` (one settled unit: an utterance, here a block) · `Word` · `polish` (the repair: join across a column or a page, mend a margin hyphen — the reader's `MANUAL`, `pdf.js:52`). New words are only what a page has and a sound has not: `page` · `box` · `kind`.

**schematic** — the minimal delta, siblings' optionality: `commons/services/ocr/schematics.js:17` until the lift.

Q0's C falls out as a PROJECTION of the fold's state (offsets computed from the join), never a stored shape.

**service · tooling** — LANDED 11-13, see `## locked`.

**faculty, later** — the SAME function re-seated at `via.stream` (the faculty literal: `page.probe.js`); then `cortex.hallucinate.verbatim.render` reads a pdf and the reader's `modeled` splits into verbatim + polish.

What BREAKS (`page.probe.js`, RUN): the cortex picks a verbatim faculty by type alone. Beside `nova-3`: a bare call THROWS `[cortex] 2 'verbatim' faculties match — name a tier, a tune or an id`; tier `frugal` → `tesseract-5`, every other tier → `nova-3`. A dictation at `frugal` gets the page reader.

```js
// subsystems/typology/prototypes/cortex.js:140
  verbatim: (cortex, query) => {
    if (query.via !== "render") return undefined;
    return cortex.findOne({ ...query, type: "verbatim", via: "stream" });
  },
```

**deeper** — a transcript is a File beside its source, content-addressed, as the reader's book already is (`aperture/index.js:54` `stored`: `originals/<digest>.pdf` → `books/<digest>.html`). m53's fork is still his: a sibling file on the mount, or a trait field (`quests/done/m53-vcompany.org:307`).

## probe 2 — tesseract through the REAL cortex (`page.probe.js`, 11-13)

`new Cortex().register({ type: "verbatim", id: "tesseract-5", via: { stream } })`, the stream spawning `tesseract <image> - tsv`: `cortex.hallucinate.verbatim.render` answers `"Tides"` today, typology untouched. `harmonize` (`belt/verbatim.js:57`) puts a `/verbatim/commit` before each final and RENUMBERS `segment` from 0. `box` cast there as FRACTIONS of the page (`[0.1033, 0.37, 0.31, 0.28]`): no page-size carrier needed, as `start` · `end` are seconds, never samples.

Seats read after the sketch:
- `role` was MY word and is taken (`Turn.role` · `Picture.Reference.role`); the tree says `kind`, nine of them (`commons/reader/reader/aperture/pdf.js:83`): chapter · heading · paragraph · list · quote · code · table · figure · note.
- faculty `channels` come in TWO shapes: strings (`openrouter/provider/index.js:194`) and objects (`deepgram/provider/index.js:130`); `pdf.js:178` filters by string.
- /"copus -> topography. ontology -> topology"/ (skill `topography`): a scanned manual already ships as a topography, pages on the freight, steps as literals, a `harvest/` writing them (`~/.viva/registry/droneaid/topographies/guides/guides.viva.js`). OCR is a harvest's missing first step.

## open — the question list for the next context

- Q0A DEFERRED by the ruling: the service carries A's shape locally; the typology lift is a later act.
- WHERE on a `Word`: optional siblings `page` · `box`, or a tagged extent (time | region)?
- `box`: fractions (probe 2) or pixels + a page-size carrier · a box or a 4-point polygon (a skewed scan).
- `kind`: on `Verbatim.Final`, the reader's nine as a NAMED export of the group, or symbols of a `document` topology (his /"ontrology"/ — AS READ: a typology vocabulary; a topology module is the other reading).
- tables · figures · formulas: a segment each, or their own events.
- polish drops `words` — keep the boxes through a repair?
- the reader reads RAW segments, no polish, no `kind`; measured 11-13 on his page → `campaign.md`.
- cortex resolution by channel (the break above).
- the transcript's home: File sibling · trait.

## download — no frame trick

science.org sends `x-frame-options: SAMEORIGIN` · `cross-origin-resource-policy: same-origin` (off the 403 challenge). Works: drag from the download bar (today) · a watched folder via `showDirectoryPicker` (Chrome; Downloads root may be refused — recalled, not run) · an extension posting to `/put/:buffer`.
