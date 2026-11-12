<!-- limit: 7000 chars -->
# ocr — the campaign 11-13: 45 fixtures, baseline 30 green, LANDED 11-13 at 38, two engines LANDED 11-13 at 39

His words: /"run a testing campaign against the ocr standalone and integrated with the reader. like reader doc parsing was tested"/

## the loop — `testament/prototypes/ocr-corpus/` (VCS-ignored, 125 MB)

Protocol = `reader-corpus`: expectation written from the page, sealed (`seal.log`), then read. `process.md` holds metrics + limits; `amendments.md` two fixes to MY instruments.

```sh
cd testament/prototypes/ocr-corpus
deno run -A --no-check --config ../../../deno.jsonc run.js                 # product provider, every fixture
deno run -A --no-check --config ../../../deno.jsonc run.js --lane=loop     # provider/index.js, the candidate
deno run -A --no-check --config ../../../deno.jsonc run.js --cached s0     # re-score, no read
deno run -A --no-check --config ../../../deno.jsonc gate.js --skip=x05     # reader on a real runtime, free port
deno run -A --no-check --config ../../../deno.jsonc probes.js              # settings · media · tool · early stop
deno run -A --no-check make/make.js                                        # rebuild synthetics (Chrome headless)
```

Fixtures: `s01–s19` synthetic (Chrome → 300 dpi image pdf, `magick` degrades, truth by construction) · `b01–b04` born digital (truth `pdftotext`) · `r01–r04` real scans (holds read by me off a preview) · `i01–i09` images · `x01–x10` hostile. `r01-science` = HIS page, Science 4 Nov 1960 p.1291, `archive.org/details/sim_science_1960-11-04_132_3436`.

Tables: `out/baseline-rescored.txt` · `out/loop-5.txt` · `out/gate-baseline.txt`.

## baseline defects, each reproduced, all FIXED by the land

1. crash on any page whose last word is blank (`tsv.trim()`), 3 of 4 real scans, his page · 2. an "image" that is a text list of paths made tesseract open them · 3. every page drawn before the first read (26.1 s → 1.3) · 4. no pixel cap (120 s kill → 2.7 s) · 5. upside down = garbage, no fault (`--psm 1`) · 6. settings unchecked · 7. `tsv` is a configfile (`-c tessedit_create_tsv=1`) · 8. the binary's whole stderr as the sentence.

## candidate — `testament/prototypes/ocr-corpus/provider/index.js`

Fixes 1–8: no `trim`, magic-byte table `INKS` + `%PDF-` check, `pdfinfo` sizes → one `pdftoppm -f n -l n` per page to stdout, `extent: 6000` px cap, `segmentation: 1`, `v.faults(Settings, given)`, first stderr row. New static `pdfinfo` (same poppler package). No osd data = reads, no turn.

Loop 11-13, three more (`out/loop-3 · 4 · 5.txt`), 35 → 38, corpus 221 → 137 s:
1. **level** (`provider/level.js`, 85 rows, no binary) — `pdftoppm -gray` → projection-profile `skew` (41 angles, acts when the peak is 2x the unturned page) → `level` → boxes back through `tilted` (0.6 px mean off). The engine drops blocks at ≥2° clockwise in every `--psm`, 13 variables tried. A pixmap goes to the engine as a FILE + `--dpi`: on stdin 8.7 MB costs +1 s, without `--dpi` a ruled table is lost. Gray alone: Science 21.5 → 9.6 s, noise 22.6 → 1.5. Images (`single`) are NOT levelled: no decoder.
2. **`sewn`** — a word broken at the margin is one word in `transcript`, two in `words`; only before a lowercase letter. Science 71 → 2.
3. **`joined`** — a final of 2+ rows that ends open, the next resuming lowercase, same page → one final. 33 seams read: 31 true, 2 false (a noise final · two articles the engine interleaved, both Science).

LANDED 11-13 on his /"land"/: one `rsync -a testament/prototypes/ocr-corpus/port/ocr/ commons/services/ocr/`, `commons/services/ocr == port/ocr`. After: suites `7 · 5 · 12 · 3 steps` + reader `34 steps` green; corpus on the product lane 38/45, verdicts == candidate (`out/product-landed.txt`); reader gate 30 of 34 PDFs `ok`, book == service, the 4 hostile ones fault as before (`out/gate-landed.txt`). The defects above are the BASELINE's; `:11` no longer trims.
`port/ocr/` = the candidate tree, fixtures `split-paragraph.tsv` (his page) · `skewed-scan.pgm`. Its suites run from a copy OUTSIDE the repo: the root config finds no test under `testament/`. Re-diff against `commons/services/ocr` before the rsync: a later product edit is overwritten.

## two engines — LANDED 11-13 on his /"land"/

His words: /"external Docker volume Docker image as a default, and fallback of the inline.js npm wasm thing"/ · root `Dockerfile` apk REVERTED (/"We're not going to add fucking Tesseract to our base image"/).

`port/ocr/` = `provider/{index,level,inline,remote}.js` + `server/` (Dockerfile · compose · `server.js` · README) + tests. `statics.remote` given → its server (`POST /read` base64 + language · segmentation · density → tsv, Bearer key, data fetched into `mnt/tessdata` at the first ask). Absent → `npm:tesseract.js@7.0.0`, one worker a read. A pdf is drawn by `npm:@hyzyla/pdfium@3.0.0` in both: poppler · temp folder · local binaries gone. The npm specifiers are COMPUTED: fetched at the first read (cold 6.6 s, restart 0.27 s offline), then `node_modules` + `deno.lock`; plain `deno install` installs lock-only entries, so the image bakes them.

| lane | green | corpus s | peak MB |
|---|---|---|---|
| product | 38 | 132 | |
| inline | 39 | 273 | 800–1150 |
| remote | 39 | 156 | |

Tables `out/inline-1.txt` · `out/remote-1.txt`. Suites from a copy outside the repo, `--lock <scratch copy>`: `8 · 6 · 17 · 3 steps`, `server.test.js` ignored unless `:5556` + `SERVICE_KEY`; 5 mechanisms broken once → FAILED. Traps: `tesseract.js` v7 language objects are broken (`l.data` as the code) → a symlink folder; no `errorHandler` = a worker fault KILLS the process; wasm tsv has no heading; a page-sized bmp faults in `bmp-js` → own `bitmap`; the process keeps ~450 MB after close.

After the rsync, `commons/services/ocr == port/ocr`: suites same counts from the root; corpus 39/45, greens == candidate (`out/product-engines.txt`); reader gate 30 of 34 `ok`, the 4 hostile fault (`out/gate-engines.txt`); root `deno.lock` +53 rows, 0 removed. Pre-land copy `~/.viva/bak/commons/ocr-pre-engines-20261113/`.

## still red — 6

language `s14 b03 b04` (`"statics": { "language": "eng+deu+spa" }` proven through the reader: 97.7 · 99.5 · 99.0) · heic `i07` · order `b01` 83% · long s `r04`.

## the reader, integrated (`gate.js`, product service)

- book == service on all that read: same words, blocks = finals, every block a `p`.
- **a service fault kills the stream**: the client gets `error reading a body from connection`, the view shows `failed`, no sentence. Reader-wide, older than ocr.
- **`text` on an image-only scan = an empty book, 200, no hint**. Blank scan too. Title `untitled` unless the pdf names one.

## his

- recipe `statics.remote` + `secrets.key` and the container, his machine · prod · traits `SERVER DOCKER COMPOSE` as nlp · which languages.
- a fault's sentence on the wire: `response.stream` (typology) has no fault frame.
- skewed IMAGES · heic: a converter. Noise finals · running feet: no rule found.
