<!-- writer: agent · reference, uncapped · written 2026-10-16 · answers the design agent's four research asks over `client-design-briefing.md`; measured on the WORKING TREE of 10-16 (the design agent's master checkout lacks the m86 tree) -->
# the client — a design briefing II: assets · cargo · box · chess bundle

Four census agents (10-16, opus, each wrote its section against the live tree): `assets-census` (§1) · `cargo-census` (§2) · `box-census` (§3) · `chess-census` (§4). Every claim cites `file:line`; `~/.viva/registry/…` paths are registry packages, everything else is repo-rooted. Where the ask named a path that moved, the section opens with the live path.

| § | ask (design agent, verbatim) |
|---|---|
| 1 | "From systems/anima/static, list every logo/wordmark asset and viket pictogram variant with dimensions and intended use (from .ikiro/reference/design.md and m73-anima-and-design-system-comps.org). Confirm which fonts dapper/primitives/font.css maps to --font-family-brand/code/sans-* per theme." |
| 2 | "Read systems/runtime/entities/* and prototypes/cargo.js: what is the row shape of cargo/artifacts (fields, mime, relations to thread/turn/buffer), how /metadata/cargo answers, and give one real listing from a running hello-world." |
| 3 | "Dump the public surface of systems/anima/src/typology/box/** (microphone.js, speaker.js, audio.js, worklet, drivers): atoms, methods, permission states, VAD constants, queue/jitter behaviour, and how dictation.js streams /audio/packet into harness.verbatim." |
| 4 | "Read ~/.viva/registry/chess/modes/board/play/buffer/play.jsx (+ its dom face): the boot signature, the bag it receives (terminal, mode, thread, buffer, renderer, palette, dispatch, focused), which keys it consumes and how it writes buffer.data." |


## 1 · assets — logos · pictograms · fonts

Measured 2026-10-16 on the live tree. `systems/anima/static` holds **4107 files** (`find -type f`, `.DS_Store` excluded): icons 3852 (`icons/carbon` 2347 · `icons/heroicons` 1288 · `icons/data` 212 · `icons/anima` 5) · fonts ~240 · pictograms 6 · images 1 · videos 3 · favicons 2 · `manifest.json`. Dimensions come from `sips` (png/gif), the svg `width`/`height`/`viewBox`, and `ffprobe` (mp4). References were grepped over `systems/anima/src` · `systems/anima/static` · `subsystems`, and repo-wide with `rg` excluding node_modules and docs.

### logos / wordmarks

**No logo or wordmark file exists under `systems/anima/static`.** There is no `logo/` dir and no file named `*logo*` or `*wordmark*`. The live "logo" is a component that pairs the viket mark with the word "vivalence" set as text:

| thing | where | what |
|---|---|---|
| `Logo` (Solid) | `subsystems/drapes/dom/Logo.jsx:3` | `MARK = "/images/pictogram_viket/pic-vinca-viket_white.svg"`, used as a CSS mask on `currentColor`, `filter: var(--brand-filter)` |
| wordmark | `subsystems/drapes/dom/Logo.jsx:11` + style `.kit-logo-word` | the text `vivalence`, `font-family: var(--font-family-brand)`, `font-size: calc(size * 0.6)`, weight 600 |
| consumer | `subsystems/drapes/dom/panes/signin.jsx:21` | `<Logo size={40} />` (drapes `./dom` is red per map.md, state of the tree 10-16) |
| dead wordmark ref | `subsystems/drapes/panels/loader/Loader.svelte:32` | commented `<img class="wordmark" src="/logo/vivalence-white.svg">`. The file does not exist |
| docs logo | `documentation/public/vivalence-viket-logo-plasma.png` | 1000×1000 · 320838 B. **Byte-identical to `static/favicon.png`** (`cmp`). Used at `documentation/src/layouts/Layout.astro:67` (icon) and `:576`, `:593` (24×24 brand mark) |

Stated role: `.ikiro/reference/design.md:7`: "`brand` (outline · glow · filter) is identity, never state: the pincer's ring, its inset glow, its mark's filter".

### viket pictograms (every variant), `images/pictogram_viket/`

| file | WxH | bytes | referenced from | stated use |
|---|---|---|---|---|
| `pic-vinca-viket_white.svg` | 1447×1317 (viewBox `0 0 1447 1317`) | 457904 | `src/app/bones/pincer/pincer.svelte:347-348`, `:577-578` (mask) · `src/app/panels/a/widgets/Turn.svelte:255-256` (mask) · `subsystems/drapes/dom/Logo.jsx:3` · `subsystems/drapes/panels/loader/Loader.svelte:29` (`<img src="/static/images/…">`) | m73.org:222: "(a) the mark is a CSS mask on =currentColor= (=pic-vinca-viket_white.svg= as the mask image): it takes its box's glyph colour — =text.strong= on the pincer's disc, =-on= on a signal fill, =text.header= in a brand row" · "The mask is 27px in the 35px knob — the comp's =--mark-size= for the svg; its 21px is the png's." |
| `pic-vinca-viket_black.svg` | 1447×1317 (same viewBox) | 475824 | unreferenced | no stated use |
| `pic-vinca-viket_white.png` | 1447×1317 | 266616 | unreferenced | m73.org:103 lists the designer's handoff `viket_{black,white}.png` as "the mark" |
| `pic-vinca-viket_black.png` | 1447×1317 | 232785 | unreferenced (removed from `pincer.svelte` by m73 patch 3, m73.org:2165-2167 `PICTOGRAMS.parchment`) | m73.org:507: porcelain · datasette took "the black png" until patch 3 deleted the table |
| `pic-vinca-viket_aqua.png` | 1097×1097 | 1401640 | unreferenced under this name | no stated use. **Byte-identical to `static/favicon_aqua.png`** |
| `pic-vinca-viket_glitch-dark.png` | 917×884 | 375323 | unreferenced | no stated use |

Both svgs are **raster wrappers**: `fill="url(#pattern0_22_294)"` over an embedded `<image width="1826" height="1662" … data:image/png;base64,…>`. They are not vector paths. As a mask only the alpha channel counts. Design tokens: `.ikiro/reference/design.md:464` maps the comp's `--viket` · `--viketInv` as "open, §11", and `design.md:478` does the same for `--bone-viket`. `design.md:500` lists the open point "the mark's variant | composed in the view · `shape.key` · `shape.mark`". m73 ruled (a), the mask, so `pincer.svelte` lost `PICTOGRAMS`/`TINTS` (m73.org:2160-2175).

### favicons / manifest

| file | WxH | bytes | referenced from | stated use |
|---|---|---|---|---|
| `favicon.png` | 1000×1000 | 320838 | `src/client.html:11` (`<link rel="icon">`) · `static/manifest.json:9` (`sizes 1000x1000`) | no stated use in design.md/m73 |
| `favicon_aqua.png` | 1097×1097 | 1401640 | `static/manifest.json:10` only | no stated use. Same bytes as `pic-vinca-viket_aqua.png` |
| `manifest.json` | n/a | n/a | `src/client.html:12` | `name "@vivalence"`, `short_name "viva"`, `background_color #000000`, `theme_color #00FFFB` (manifest.json:1-8) |

No 16/32/180/192/512 icon sizes exist. Both icons are large non-square-standard PNGs.

### images · videos

| file | WxH | bytes | referenced from | stated use |
|---|---|---|---|---|
| `images/banner.png` | 2478×928 | 569209 | unreferenced (repo-wide) | none |
| `videos/vid-viket-seldoncrisis-1280x256p-16fps.mp4` | 1280×256 · 16 fps · 16.19 s | 2231864 | unreferenced | none |
| `videos/vid-viket-seldoncrisis-800x160p-12fps.gif` | 800×160 | 1612385 | unreferenced | none |
| `videos/720x480p-flight10-seldoncrisis-entry-vhs-16fps.mp4` | 720×480 · 16 fps · 7.29 s | 881731 | unreferenced | none |

### icons (summary, not per-file)

| set | svgs | referenced | note |
|---|---|---|---|
| `icons/heroicons/{16,20}/solid`, `24/{solid,outline}` | 1288 | `widgets/Dictaphone.svelte:39` `20/solid/microphone.svg` · `widgets/Composer.svelte:233` `20/solid/paper-airplane.svg` | m73.org:102: the comp's "58 svgs, heroicons + =icons/chat/*=" |
| `icons/anima/` | 5: `brain` · `eye-off` · `view-columns` · `chat/{prompt,lines}` | via `src/app/widgets/Glyph.svelte:8` (`url(/icons/{set}/{name}.svg)`): `Harness.svelte:49` brain · `Dock.svelte:33` chat/lines · `Terminals.svelte:56` view-columns · `pincer.svelte:508` eye-off | `chat/prompt` unreferenced. 24×24 viewBox, stroke 1.5 |
| `icons/carbon/{16,20,24,32}` | 2347 | none found | |
| `icons/data` | 211 + `README.org` ("carbondesignsystem.com … only a subset") | none found | |

### fonts on disk, `systems/anima/static/fonts/`

| family dir | files (format) | weights / styles | size | `@font-face` in font.css |
|---|---|---|---|---|
| `K2D` | 16 ttf | Thin…ExtraBold + italics | 1.5 MB | **4 live**: 300 Light · 500 Regular(!) · 600 · 700 (`font.css:14-37`). The rest are commented out at `:39` |
| `Inter` | 2 ttf variable (`opsz,wght`) + OFL | 100–900, normal + italic | 1.7 MB | 2 (`:41-56`) |
| `IBM Plex Sans` | 2 ttf variable (`wdth,wght`) + OFL | 100–700, normal + italic | 1.1 MB | 2 (`:58-69`) |
| `IBM Plex Mono` | 3 ttf + OFL | 400 · 500 · 600 | 0.4 MB | 3 (`:70-87`) |
| `Space Mono` | 2 ttf + OFL | 400 · 700 | 0.2 MB | 2 (`:88-99`) |
| `VT323` | 1 ttf + OFL | 400 | 0.16 MB | 1 (`:100-105`) |
| `Poppins` | 18 ttf + OFL | 100–900, normal + italic | 3.0 MB | 18 (`:107-218`) |
| `Victor Mono` | 21 each in `WOFF2` · `WOFF` · `TTF`, plus `OTF` · `EOT` (44) + LICENSE | 100–700, normal · italic · oblique | 12.8 MB | 14 woff2, normal + italic only (`:219-311`) |
| `Sabon` | 4 ttf | 400 · 700, normal + italic | 0.9 MB | 0. Commented out (`:321-345`) |
| `Kabel` (Neue Kabel) | 18 otf | Thin…Black + italics | 3.9 MB | 0. Commented out (`:346-407`) |
| `Space Grotesk` | ttf var · woff2 var · 4 otf | 300–700 | 1.1 MB | 0. Commented out (`:313-320`) |
| `SFMono` (Liga SFMono Nerd Font) | 12 otf + `.gitmodules`, README | Light…Heavy + italics | 50.4 MB | 0. Never declared |
| `Avant Garde` (ITC Std) | 20 otf | XLt…Bold, Cn, Obl | 0.9 MB | 0. Never declared |
| `Founders Grotesk` | 10 woff2 (`test-` trial files) | 300–700 + italics | 0.1 MB | 0. Never declared |
| `Source Code Pro` | 2 ttf variable | wght, normal + italic | 0.35 MB | 0. Never declared |

All 46 live `@font-face` `src` URLs resolve to a file on disk (each checked with `[ -f ]`). None loads from a remote URL. The font files live only in anima's `static/fonts`. dapper holds none (`subsystems/dapper/` contains `primitives/font.css` and no font binaries). The four OFL families (Plex Sans/Mono, Space Mono, VT323) came in with m73 patch 1 (m73.org:474-487, `m73-anima-and-design-system-comps/fonts.sh`).

### `--font-family-*` per theme

**`subsystems/dapper/primitives/font.css` declares no custom property at all.** `grep -n -- '--' font.css` finds 0 lines. It holds only `@font-face` blocks and is imported once at `systems/anima/src/app/+layout.svelte:2` (alias `vite.config.mjs:130`). The `--font-family-*` tokens are emitted by `subsystems/dapper/lib/emit.js:56` (`--font-family-${kebab(key)}`) from the theme's `font.family` group. Defaults are at `subsystems/typology/schematics/primitives/theme.js:97-102` and get merged per theme by `subsystems/dapper/lib/theme.js:152`. They are emitted into every theme root and zone block, never into bare `:root` (m73.org:271, :539).

| token | default (`theme.js:97-102`) = northsea · parchment | porcelain (`themes/porcelain/theme.js:3,9`) | datasette (`themes/datasette/theme.js:3-4,9`) |
|---|---|---|---|
| `--font-family-brand` | `K2D, sans-serif` | `IBM Plex Sans, sans-serif` | `VT323, Space Mono, monospace` |
| `--font-family-code` | `Victor Mono, monospace` | `IBM Plex Mono, monospace` | `Space Mono, monospace` |
| `--font-family-sans-heading` | `Poppins, sans-serif` | `IBM Plex Sans, sans-serif` | `VT323, Space Mono, monospace` |
| `--font-family-sans-text` | `Inter, sans-serif` | `IBM Plex Sans, sans-serif` | `Space Mono, monospace` |
| `--font-family-serif-heading` | `Poppins, serif` | `IBM Plex Sans, sans-serif` | `VT323, Space Mono, monospace` |
| `--font-family-serif-text` | `Inter, Sabon, serif` | `IBM Plex Sans, sans-serif` | `Space Mono, monospace` |

Northsea and parchment carry no `font` key (`grep font themes/{northsea,parchment}/theme.js` finds 0), so they take the defaults. The themes are listed in `subsystems/dapper/themes/index.js:6`: `{ northsea, parchment, porcelain, datasette }`. The default theme is `data-theme="northsea"` (`systems/anima/src/client.html:2`). The ruling is m73.org:219, beef 09-28: /"fonts inside the theme; yes"/, keeping the six names `sansHeading · sansText · serifHeading · serifText · brand · code`.

Other `--font-*` tokens in dapper: only `--font-size-{2xs…8xl}` + `--line-height-*` (sizes from `lib/tokens.js:5-20`, read at `belt/tailwind-theme.js:47-61`). Tailwind maps the six families at `belt/tailwind-theme.js:39-45`. dapper has no `.css` file that sets a `--font` token; the `grep --include='*.css'` from the ask returns 0 hits, and the only hits are in `.js`.

Family → face check: every family named in a live stack has a face, except **Sabon**. It appears in the default `serifText` (`Inter, Sabon, serif`), but its faces are commented out (`font.css:321-345`). Since Inter comes first, Sabon never renders unless it is installed locally.

### mismatches between the ask and the tree

1. **No logo or wordmark assets exist.** The wordmark is live text in `--font-family-brand` (`drapes/dom/Logo.jsx`). `/logo/vivalence-white.svg` is referenced only in a comment (`Loader.svelte:32`) and is missing.
2. **Duplicates:** `favicon_aqua.png` and `pic-vinca-viket_aqua.png` are byte-identical. `favicon.png` and `documentation/public/vivalence-viket-logo-plasma.png` are byte-identical.
3. **`font.css` is not a token map.** It holds faces only. The family tokens live in `typology/schematics/primitives/theme.js:97-102` plus `dapper/themes/<name>/theme.js`, emitted by `dapper/lib/emit.js:56`. "sans-*" is two of the six tokens; the serif ones exist too.
4. **They are themes, not skins:** `subsystems/dapper/themes/{northsea,parchment,porcelain,datasette}/theme.js`. Only northsea and parchment have `gradients.js`.
5. **Two URL prefixes in `font.css`:** `/static/fonts/…` (K2D, Inter, Plex, Space Mono, VT323, Poppins) and `/fonts/…` (Victor Mono, `:222-307`). SvelteKit serves `static/` at `/`. My inference is that `/static/…` resolves only through vite dev serving the project root (`vite.config.mjs:32` `fs.allow`); I have not verified it in a build. The same split shows up in pictogram refs: `Loader.svelte:29` uses `/static/images/…`, while everything else uses `/images/…`.
6. **The build is not evidence.** Per map.md, anima "does NOT build" (state of the tree 10-16). The `systems/anima/build/` dir dates from Oct 11 and its CSS holds no `@font-face`.
7. **`.ikiro/reference/design.md` is stale on fonts.** Its §11 (`:502`) still lists "fonts | outside the tree · a sixth group `font`" as open, but m73.org:219 settled it. design.md:12 also still names `sheets`, which map.md lists as DEAD (10-15). m73.org:170 cites `lib/tokens.js:18` for Poppins · Inter · Victor Mono, but `tokens.js` now holds only `font.size` (`:5`).
8. **The m73 comps are not in the tree.** `.ikiro/quests/done/m73-anima-and-design-system-comps/` holds `common.md` · `patch-1..6.patch` · `patch4.md` · `patch5.md` · `fonts.sh` · `deferred/`. The `.dc.html` comps and the designer's `viket_{black,white}.png` (m73.org:95-103) lived in a scratchpad (m73.org:105).
9. **Unreferenced assets:** 4 of 6 pictogram variants (all but `_white.svg`; `_aqua.png` is reachable only as `favicon_aqua.png`), `banner.png`, all 3 videos, all carbon/data icons, and 8 of 15 font dirs (Sabon, Kabel, Space Grotesk, SFMono 50 MB, Avant Garde, Founders Grotesk trial, Source Code Pro, plus the unused K2D/Victor Mono files).

## 2 · cargo — the row, the route, one listing

### 0 · verdict
- **There is no Cargo or Artifact entity.** `systems/runtime/entities/` has Activity Buffer Constraint Daemon Intent Issue Literal Mode Note Process Symbol Terminal Thread Turn User. `entities/todo/Artifact.js` and `todo/Asset.js` exist but are **0 bytes** (`wc -c systems/runtime/entities/todo/*` → 0 total).
- **Cargo is a stored-nowhere VIEW over files.** It's a fold of every FRAUGHT/MOUNTED mode's `Freight.catalog` into one object keyed by file path. There are no rows, no db column and no thread/turn/buffer relation. It is recomputed on every read.
- The bytes are served separately at `/attached/cargo/<host-ref>/<path>` (`systems/runtime/lifecycle/runtime/resolution.js:66-71`).

### 1 · the classes

**`subsystems/typology/prototypes/cargo.js:1-17`** (server, used by the runtime and the daemon):
```js
export class Cargo {
  freights = () => [];
  constructor(freights) { if (freights) this.freights = freights; }
  get catalog() { const folded = {}; for (const freight of this.freights()) Object.assign(folded, freight.catalog); return folded; }
  toJSON() { return this.catalog; }
}
```
- Its fields are only `freights`, a thunk returning `Freight[]`. `catalog` is a getter (`:8`) that merges with `Object.assign`, so **a later mode's key wins on a collision**. The daemon only warns about it: `[FREIGHT] slug collision` at `systems/runtime/lifecycle/daemon/resolution.js:43-45`.
- Serialization: `toJSON()` returns the catalog (`:14`), so a route that returns the Cargo instance comes out as the flat catalog over JSON.
- Defaults: `new Cargo()` on `systems/runtime/prototypes/daemon.js:13` and `prototypes/runtime.js:13`. Re-minted with a real thunk at `lifecycle/daemon/resolution.js:40` and `lifecycle/runtime/resolution.js:33`. Both filter `mode.implements("FRAUGHT") || mode.implements("MOUNTED")` → `mode.freight`.

**Where the mime lives: `subsystems/typology/prototypes/freight.js`.** Cargo never carries a mime itself.
- `MIME` is an extension → type table (`:3-24`, mp3 wav ogg png jpg svg webp mp4 webm json pdf md org txt tex html csv). Anything else is `application/octet-stream` (`:46`).
- `entry(path)` → `{slug, path, type}`, where slug is the basename without its extension (`:41-48`).
- `Freight.catalog` (`:79-90`) → `{ [path]: { path, type, url } }`. `url` = `this.url.branch("/" + encoded(path)).absolute` or `null`, and every segment is `encodeURIComponent`'d (`:28`).
- `resolve(query)` matches exact path, then path without extension, then slug, then retries decoded (`:38-39,75-77`).
- The lading is minted by `systems/runtime/traits/fraught.js:5-14` (`carry`). It walks the dir and `stow`s it, then sets `withUrl(context.attach.branch("/cargo").branch(context.reference.nature))` (`:9`). It also adds `receive(path, bytes)` (`:10-13`), which writes the file and then `admit`s it.
- `FRAUGHT` uses `<mode source dir>/<module.freight.path>` (`:17`). `MOUNTED` uses `mode.mountpoint` (`traits/mounted.js:3`).

**Client copies** (`systems/ghost/typology/prototypes/cargo.js` and `systems/anima/src/typology/prototypes/cargo.js`) are a **different class with the same name**, a consumer:
- Fields: `catalog = {}`, `sought = new Set()`, `connection`, and `refresh = fn.debounce(refetch, 2000)` (`:4-10`).
- `refetch()` → `this.catalog = await this.connection.call("/metadata/cargo")` (`:12-14`).
- `resolve({path})` does an exact lookup. On a miss it records the path once in `sought` and fires a debounced refetch (`:18-24`).
- `resolve({slug})` takes the first key that `endsWith("/"+slug)` or `startsWith(slug)` (`:26-29`).
- `diff ghost anima` shows only a line-wrap at `:27` (anima's is split over 3 lines), so the logic is identical.
- Wiring: ghost sets `die[type].cargo = new Cargo(die[type].aperture); await …refetch()` (`systems/ghost/typology/gestalten/shard/host.js:28-29`). anima uses `new Cargo(daemon.connection)` (`systems/anima/src/typology/entities/daemon/dossier.js:78`) and `daemon.getAsset(asset)` → `cargo.resolve` (`daemon/daemon.js:20-22`). Tested in `systems/anima/tests/cargo.test.js`.
- The context word is `contexts.cargo`: "The host's Cargo — every fraught mode's catalog by slug" (`subsystems/typology/schematics/primitives/contexts.js:23`), spread into `host` (`:61`). The desc says "by slug", but the catalog is keyed by **path**.

### 2 · relation to Thread / Turn / Buffer rows
**None. No entity or schematic references cargo or freight.** The only mime-bearing column is `Buffer.bundle`, a JSON blob describing compiled view bundles (a different system, `/attached/bundle`). Turn parts carry inline `media` strings.

All rows extend `DataEntity`, which adds `id` (string, PK, `v7()`), `createdAt` and `updatedAt` (`subsystems/typology/entities/base/DataEntity.ts:5-9,159-178`).

**Buffer** (`systems/runtime/entities/Buffer.ts:37-118`; schematic `subsystems/typology/schematics/entities/buffer.js:4-21`)
| field | type | nullable | relation |
|---|---|---|---|
| status | enum PENDING·ACTIVE·DONE·ERROR·STALE | no (default PENDING) | — |
| data | json | no (default `{}`) | — |
| bundle | json `Bundle` | **yes** | — |
| index | integer | no (default 0) | — |
| traits | json enum[] `LABELED` | no (`[]`) | — |
| trait | json | no (`{}`) | — |
| mode | m:1 | yes | `Mode` (cascade) |
| thread | m:1 | yes | `Thread` (cascade) |
| literals | m:n owner | — | `Literal` via `buffer_literals` |
| symbols | m:n owner | — | `Symbol` via `buffer_symbols` |

`Bundle` (`subsystems/typology/schematics/prototypes/bundle.js:4-16`) = `{ entries: [{ mime, hash, mount, integrity, bytes }] }` with minItems 1. `mime` is the RFC 6838 `type()` (`schematics/scalars/mime.js:8-11`). The vnd mimes `application/vnd.vivalence.{dom,tty}.<fw>+javascript` are at `mime.js:13-22`. A Buffer has **no turn relation**.

**Turn** (`systems/runtime/entities/Turn.ts:45-105`; schematic `schematics/entities/turn.js:3-16`)
| field | type | nullable | relation |
|---|---|---|---|
| role | string | no | — |
| parts | json `Part[]` | no (`[]`) | — |
| meta | json | yes | — |
| parent | m:1 | yes | `Turn` |
| children | 1:m | — | `Turn` mappedBy parent |
| thread | m:1 | **no** | `Thread` (cascade) |
| mode | m:1 | yes | `Mode` (cascade) |

The binary-carrying `Part.Image|Audio|Video|Document` = `{type, data: string, media: string}` (`subsystems/typology/schematics/primitives/hallucination.js:31-53`). Here mime is called `media` and the bytes are inline `data`, with no cargo url.

**Thread** (`systems/runtime/entities/Thread.ts:31-158`; schematic `schematics/entities/thread.js:28-46`)
| field | type | nullable | relation |
|---|---|---|---|
| user | m:1 | no | `User` |
| mode | m:1 | yes | `Mode` |
| intent | m:1 | yes | `Intent` |
| phase | string enum inert·manual·continuous·escort·stream | no (manual) | — |
| traits | json enum[] MASKED·AIMED·QUEUEING·LABELED | no | — |
| trait | json | not declared nullable | — |
| counter · cursor | integer | no | — |
| parent / children | m:1 / 1:m | yes | `Thread` |
| buffers | 1:m | — | `Buffer` mappedBy thread |
| turns | 1:m | — | `Turn` mappedBy thread |

### 3 · the routes
Every "cargo" route returns the same `Cargo` instance, serialized by `toJSON` → `{ [path]: {path, type, url} }`. There's no input schema: `.open(nature, () => …)` with no `input` signature, and the handler ignores input.
```js
// systems/runtime/gestalten/shard/host.js:18   — inside metadata(context), per host (runtime AND daemon)
  root.open("/cargo", () => context.cargo);            // root = context.aperture.branch("/metadata")
// systems/runtime/gestalten/shard/host.js:44   — per mode
    if (mode.implements("FRAUGHT") || mode.implements("MOUNTED")) meta.open("/freight", () => mode.freight.catalog);
// systems/runtime/lifecycle/daemon/aperture/freight.js:2   — daemon only, the alias bruno hits
  die.daemon.aperture.open("/cargo", () => die.daemon.cargo);
// systems/runtime/traits/fraught.js:14   — on the mode's own aperture
  mode.aperture.open("/freight", () => mode.freight.catalog);
// systems/runtime/lifecycle/runtime/resolution.js:66-71   — the bytes
    die.aperture.branch("/attached/cargo").branch(context.reference.nature)
      .use(shard.context.spread(contexts.host, context))
      .open("/(.*)", cargo.serve(() => fraught));
```
- **Dispatch chain for the daemon.** `lifecycle/daemon/execution.js:19` `resolution.freight` mints `die.daemon.cargo`. `:21` `aperture.freight` opens `/cargo`. `:23` `aperture.host.metadata` → `lifecycle/daemon/aperture/host.js:9` → `shard.host.metadata(die.daemon)` opens `/metadata/cargo`. The runtime mounts the daemon under `/daemon/<slug>` behind `lighthouse.authenticate` (`resolution.js:30`), so a token is required: the live run returned 401 `MISSING_TOKEN` without one.
- **Runtime host.** `lifecycle/runtime/execution.js:24` `resolution.modes` mints `die.runtime.cargo` (`resolution.js:33`). `:26` `aperture.host.metadata` opens `/runtime/house/metadata/cargo`.
- **The bytes.** `shard/cargo.js` is NOT the catalog. It's `serve(fraught)` (`systems/runtime/gestalten/shard/cargo.js:5-26`): it does `mode.freight.resolve(query)` and `Deno.stat`, builds headers `content-type: entry.type`, `cache-control: no-cache`, `etag "<size>-<mtimeMs>"` and `accept-ranges: bytes`, answers 304 on `if-none-match`, and handles a byte `range` → 206/416. A miss returns 404.
- Method: an aperture `.open` answered both GET and POST in the live run (both 200, same body).

### 4 · REAL listing (booted, not derived)
Beef's `:2501` (pid 17220) was not touched; it was still LISTENing after the run. The rig `hello.boot` picks its port with `free()` = `Deno.listen({port:0})` (`systems/runtime/tests/scenarios/hello.js:59-64`), so no port env is needed. I got `53055` for the plain run and `53094` for the latin run. The probe script is `/Users/finn/.claude/jobs/91ae4d77/tmp/probe/cargo-probe.js`. It imports `boot`/`RECIPE` from `hello.js`, does lighthouse signup and login (token = `login.authority.access`, as in `tests/runtime/hello.test.js:52-58`), GETs the routes, then calls `world.stop()`. `stop()` SIGKILLs only that child and removes its temp root (`hello.js:173-182`).
```sh
cd /Users/finn/vivalence/code/vivalence; export HOME=$(mktemp -d)
SNAPSHOT_HOT=1 deno run -A --no-check --config /Users/finn/vivalence/code/vivalence/deno.jsonc \
  /Users/finn/.claude/jobs/91ae4d77/tmp/probe/cargo-probe.js plain     # then: … latin
```
**a) stock hello-world.** The `@commons/demo/hello-world` traits contain no FRAUGHT/MOUNTED (`commons/instances/hello-world/mode.viva.js:8-18`), so the catalog is empty:
```
PID 36492 PORT 53055 READY Status:RUNNING
--- GET /daemon/hello/cargo (no token) -> 401 application/json
{"status":"ERROR","error":{"code":"MISSING_TOKEN","message":"Authorization header or token param required"}}
--- GET /daemon/hello/cargo -> 200 application/json
{}
--- GET /daemon/hello/metadata/cargo -> 200 application/json
{}
--- POST /daemon/hello/metadata/cargo {} -> 200 application/json
{}
--- GET /runtime/house/metadata/cargo -> 200 application/json
{}
STOPPED 36492
```
**b) hello daemon + `@memo/topography/latin`.** This is the same `RECIPE` with that mode appended to `daemons[0].modes`. latin declares `["DATASET","FRAUGHT"]` (`commons/fixtures/memo/dataset/latin.viva.js:11`). The body is one JSON line, shown here truncated after 3 of 20 entries (10 `audio/*.wav` + 10 `images/*.noun.png`):
```
PID 36787 PORT 53094 READY Status:RUNNING
--- GET /daemon/hello/metadata/cargo -> 200 application/json
{"audio/alea-iacta-est.wav":{"path":"audio/alea-iacta-est.wav","type":"audio/wav","url":"http://localhost:53094/attached/cargo/daemon/hello/audio/alea-iacta-est.wav"},"audio/amor-omnia-vincit.wav":{"path":"audio/amor-omnia-vincit.wav","type":"audio/wav","url":"http://localhost:53094/attached/cargo/daemon/hello/audio/amor-omnia-vincit.wav"}, … ,"images/gladius.noun.png":{"path":"images/gladius.noun.png","type":"image/png","url":"http://localhost:53094/attached/cargo/daemon/hello/images/gladius.noun.png"}, …}
   (GET /daemon/hello/cargo and POST /daemon/hello/metadata/cargo: byte-identical)
--- GET /runtime/house/metadata/cargo -> 200 application/json
{}
--- GET /daemon/hello/metadata/modes -> 200 application/json
[{"type":"demo","slug":"hello-world",…},{"type":"topography","slug":"latin","name":"Latin","traits":["DATASET","FRAUGHT"],"reference":"/daemon/hello/mode/topography/latin","metadata":"/daemon/hello/mode/topography/latin/metadata"}]
--- GET /attached/cargo/daemon/hello/audio/alea-iacta-est.wav -> 200 {"accept-ranges":"bytes","access-control-allow-origin":"*","cache-control":"no-cache","content-length":"12844","content-type":"audio/wav","date":"Fri, 16 Oct 2026 18:04:50 GMT","etag":"\"12844-1791839529202\""}
STOPPED 36787
```
Cleanup: I checked both pids afterwards with `ps -p 36492` and `ps -p 36787`, and both were gone. `lsof :2501` still showed pid 17220.

### 5 · DESIGNED, not built: `.ikiro/quests/artifacts.org`
`#+status: DESIGNED 10-16 — twenty rulings … nothing tangled, nothing landed` (`:3`). What it rules about the row (law `:68-79`, entity sketch `:83-100`):
1. `ArtifactEntity` is a real row, one per `(mode, slug, mime)`. Columns: `slug · mime · mount · hash · integrity · bytes · target(cell|frame|null) · traits · trait`. Its identity is the row id, and an update mutates the row in place (Q2, Q4).
2. Bytes stay on disk, with no `source`, data or history columns; the old file is pruned (Q3, Q5).
3. `artifact.mode` is a mandatory m:1 owner (the terminal's seated mode). There is **no thread relation** (Q6, Q7).
4. Buffer gains `turn` (m:1, nullable), `artifacts` (m:n owner `buffer_artifacts`) and `target`. **`Buffer.bundle` is dropped** (Q17, Q18, Q20).
5. Artifacts are not Turn parts; they reach a turn only through buffers (Q8, Q17).
6. Artifact has m:n `literals · symbols · notes`, and Note gains `buffer`/`turn` (F).
7. It is served at `/attached/artifact/:id` with `x-viva-integrity`. **Cargo · Freight · Bundle · `/attached/cargo` · `/attached/bundle` die** (law 7, Q14).
8. FRAUGHT/MOUNTED are renamed `FILESET` (reads a dir into rows) / `FILESINK` (`receive · compile` into the mountpoint) (Q13, Q19).
9. Presence is checked by a patrol beat that sets the `MISSING` trait, never a status column (law 9).
10. The model gets `artifact_create · update · read · list` repository verbs (Q9).

### 6 · mismatches between the ask and the tree
- "cargo/artifacts row shape": **cargo has no row**. Artifact exists only as the design in `artifacts.org` and an empty `entities/todo/Artifact.js`.
- "relations to thread/turn/buffer": **none today**. The only mime column on a row is `Buffer.bundle.entries[].mime`, which belongs to compiled views, not cargo.
- "`prototypes/cargo.js`" names two different classes. typology's is the server fold. ghost's and anima's are client consumers that fetch `/metadata/cargo`.
- `shard/cargo.js` serves bytes (`/attached/cargo/...`), not the `/metadata/cargo` listing.
- `testament/_bruno/system/daemon/cargo.bru:8` hits `{{DAEMON}}/cargo` (the `freight.js:2` alias), not `/metadata/cargo`. Both return the same body.
- "a running hello-world": stock hello-world's cargo is `{}`. A non-empty listing needed a FRAUGHT mode (latin) added.
- `contexts.js:23` says "catalog by slug", but keys are paths (`freight.js:81-82`).
- The Turn schematic marks `mode` as required (`schematics/entities/turn.js:14`, no `.optional()`), while the entity says `nullable: true` (`Turn.ts:100`).
- The runtime host's cargo was `{}` even with latin loaded, because latin rides the daemon. The runtime cargo only folds `die.runtime.modes` (`resolution.js:33`).

## 3 · box — microphone · speaker · worklet · dictation

Live root: `systems/anima/src/typology/stores/box/`. All paths below are relative to `systems/anima/src/typology/stores/box/` unless they start with a container (`systems/…`, `subsystems/…`, `commons/…`). Already in the briefing: the atom-name table (`.ikiro/reference/client-design-briefing.md:1334-1336`), the four box bullets (`:1352-1356`), the 3-line dictation summary (`:1534-1537`) and the BoxSection controls (`:1245`). `.ikiro/world/codemap/design.md:24` has only the file list. This file adds initial values, method signatures, state transitions, the worklet protocol, the full wire chain and the defects.

### 1 · tree (393 lines)
```
stores/box/
├── index.js                          export { Box }                                   :1
├── box.js                            class Box { drivers.audio, device.{microphone,speaker} }  :5-14
├── drivers/index.js                  export { AudioDriver }                           :1
├── drivers/audio/index.js            export { AudioDriver }                           :1
├── drivers/audio/audio.js            class AudioDriver ($state, acquire, release)     :4-27
├── device/microphone/index.js        export { Microphone }                            :1
├── device/microphone/microphone.js   class Microphone + acquire/teardown/pollLevel/hydratePermission/updateSpeaking  :9-172
├── device/microphone/worklet.js      AudioWorkletProcessor "microphone-pcm"           :3-26
├── device/speaker/index.js           export { Speaker }                               :1
├── device/speaker/speaker.js         class Speaker + acquire/teardown/drainLoop       :7-93
└── device/speaker/worklet.js         AudioWorkletProcessor "speaker-pcm"              :1-56
```
There is no `audio.js` at the box root and no `drivers/` beyond `audio`. The two worklets are loaded with `?url` (`microphone.js:3`, `speaker.js:3`).

### 2 · surfaces

**Box** (`box.js:5-14`): a plain holder with no atoms or methods. Its constructor builds `drivers.audio = new AudioDriver()` and then `device.microphone = new Microphone(this)` and `device.speaker = new Speaker(this)` (`:10-12`). It is made once in `systems/anima/src/app/+layout.svelte:43` and exposed as `setContext(BOX, box)` (`:44`) and `window.__viva.box` (`:47`). `BOX = Symbol("box")` is defined at `systems/anima/src/client.js:4`.

**AudioDriver** (`drivers/audio/audio.js`)
| atom | initial | getter | at |
|---|---|---|---|
| `$state` | `"idle"` | NO | `:5` |

| member | effect | at |
|---|---|---|
| `context` | `null` until `acquire()` | `:6` |
| `acquire(): AudioContext` | creates `new AudioContext({sampleRate:16000})` when it is missing or closed; logs a `box/audio` note if the browser gives another rate; mirrors `onstatechange` into `$state`; returns the context | `:8-20` |
| `async release()` | `context.close()`, sets it to null, `$state ← "idle"` | `:22-26` |

`release()` has 0 callers (`grep -rn 'audio\.release' systems/anima/src`). The context is shared by mic and speaker and never closed. `audio.js:2` imports `$telemetry`, which is aliased at `systems/anima/vite.config.mjs:123`.

**Microphone** (`device/microphone/microphone.js`)
| atom | initial | getter | at |
|---|---|---|---|
| `$claimed` | `false` | `claimed` `:32` | `:10` |
| `$permission` | `"prompt"` | `permission` `:33` | `:11` |
| `$error` | `null` | `error` `:34` | `:12` |
| `$level` | `0` | `level` `:35` | `:13` |
| `$speaking` | `false` | `speaking` `:36` | `:14` |
| `$paused` | `false` | `paused` `:37` | `:15` |

Non-atom fields: `in = new Pipe()` (`:16`; a hot fan-out, `subsystems/typology/prototypes/pipe.js:5-75`), plus `stream source worklet analyser raf inflight audioUnsubscribe riseSince fallSince` (`:17-25`).

| method | effect | at |
|---|---|---|
| `constructor(box)` | stores `box` and calls `hydratePermission` | `:27-30` |
| `async claim()` | no-op if already claimed; while a claim is running it returns the same in-flight promise; otherwise runs `acquire` | `:39-48` |
| `release()` | `teardown(this, null)` | `:50-52` |
| `pause()` | needs claimed and not paused; `source.disconnect(worklet)` (the analyser stays connected, so `$level` keeps moving); `$paused ← true` | `:54-58` |
| `resume()` | reconnects source → worklet; `$paused ← false` | `:60-64` |
| `acquire(mic)` | `getUserMedia({audio:true})`; each track's `onended` tears down with "track ended"; `driver.acquire()` + resume if suspended; `addModule`; `MediaStreamSource` → `AudioWorkletNode("microphone-pcm")` and an `Analyser(fftSize 256)`; subscribes to driver `"closed"` → teardown; starts `pollLevel`; then `permission←"granted"`, `claimed←true`, `error←null` | `:67-100` |
| `teardown(mic, err)` | cancels the rAF, unsubscribes, disconnects everything, stops tracks, resets `level/speaking/paused/rise/fall`, `claimed←false`; with `err`: `NotAllowedError` → `"denied"`, `$error ← message` | `:102-124` |

Events: worklet `port.onmessage` → `in.send(Float32Array)`, gated on `$claimed` (`:79-82`). Track `onended` (`:71`). Driver `$state` `"closed"` (`:87-91`). `PermissionStatus.onchange` (`:149`).

**Speaker** (`device/speaker/speaker.js`)
| atom | initial | getter | at |
|---|---|---|---|
| `$claimed` | `false` | `claimed` `:21` | `:8` |
| `$playing` | `false` | `playing` `:22` | `:9` |
| `$error` | `null` | `error` `:23` | `:10` |

Non-atom fields: `out = new Queue()` (`:11`; an unbounded backlog, `subsystems/typology/prototypes/queue.js:4-51`), plus `worklet drainController inflight audioUnsubscribe` (`:12-15`).

| method | effect | at |
|---|---|---|
| `async claim()` | same in-flight pattern as the mic | `:25-34` |
| `release()` | `teardown(this, null)` | `:36-38` |
| `flush()` | `out.flush()`; `port.postMessage({flush:true})`; `$playing ← false` | `:40-44` |
| `acquire(spk)` | driver context, resume, `addModule`; `AudioWorkletNode("speaker-pcm", {processorOptions:{jitter:1600}})` → `destination`; a new `AbortController`; driver `"closed"` → teardown; starts `drainLoop`; `claimed←true` | `:47-73` |
| `teardown` | aborts the drain, disconnects, `out.flush()`, `playing←false`, `claimed←false`, sets `$error` when there is an error | `:75-86` |

Events: worklet `{playing}` → `$playing` (`:56-58`).

### 3 · permission + lifecycle states

These are the only literal strings: `"prompt"` (`microphone.js:11`), `"granted"` (`:93`), `"denied"` (`:121`), plus whatever `PermissionStatus.state` is (`:148-149`). `"claimed"` is NOT a permission string; it is the separate boolean `$claimed`. The speaker has no permission atom.

| from | event | to | at |
|---|---|---|---|
| — | construct | `prompt` | `microphone.js:11` |
| any | `permissions.query({name:"microphone"})` resolves | `status.state` (`granted`·`denied`·`prompt`) | `:147-148` |
| any | `status.onchange` | `status.state` | `:149` |
| any | `acquire` succeeds | `granted` (+ `claimed=true`) | `:93-94` |
| any | `acquire` throws `NotAllowedError` | `denied` (+ `$error`) | `:121-122` |
| any | other throw (`NotFoundError`, track ended, ctx closed) | unchanged; `claimed=false`, `$error` set | `:119-122` |

AudioDriver `$state`: `"idle"` (`audio.js:5`) → `context.state` (`suspended`·`running`·`closed`) on acquire and on statechange (`:16,18`) → `"idle"` on release (`:25`).

UI label derivation (`systems/anima/src/app/panels/b/widgets/BoxSection.svelte:33-44`):
```js
// systems/anima/src/app/panels/b/widgets/BoxSection.svelte:33
micPermission === "denied" ? "blocked" : !micClaimed ? "off" : micPaused ? "muted" : micSpeaking ? "listening" : "ready"
!spkClaimed ? "off" : spkPlaying ? "playing" : "ready"
```

Dictation `$active` (`systems/anima/src/typology/prototypes/dictation.js`): `idle` →start→ `arming` (`:57`) →claim ok→ `listening` (`:77`) →stop→ `settling` (`:83`) →events end→ `idle` (`:41`). A failed claim goes `arming` → `idle` (`:61-64`). `cancel()` goes from any state → `idle` (`:88-97`).

### 4 · VAD (client-side, level-only)
| constant | value | at |
|---|---|---|
| `SPEAKING_THRESHOLD` | `0.02` (RMS, 0..1) | `microphone.js:5` |
| `SPEAKING_RISE_MS` | `100` | `:6` |
| `SPEAKING_FALL_MS` | `600` (hangover) | `:7` |
| `analyser.fftSize` | `256` → 128 time-domain bytes per tick | `:84`, `:127` |
| tick | `requestAnimationFrame` (~16 ms, display-bound) | `:139` |
| sample rate | `16000` requested | `audio.js:10` |

```js
// systems/anima/src/typology/stores/box/device/microphone/microphone.js:132
const sample = (buffer[i] - 128) / 128; sum += sample * sample;   // RMS of the byte time-domain
// :153
if (level > SPEAKING_THRESHOLD) {
  microphone.fallSince = 0;
  if (!speaking) { riseSince ||= now; if (now - riseSince > SPEAKING_RISE_MS) $speaking.set(true); }
} else {
  microphone.riseSince = 0;
  if (speaking)  { fallSince ||= now; if (now - fallSince > SPEAKING_FALL_MS) $speaking.set(false); }
}
```
`$speaking` gates nothing. Its only reader is the BoxSection label (`BoxSection.svelte:17,37`). Dictation streams every frame whether or not anyone is speaking (`dictation.js:18-19`). Turn segmentation is done server-side by Deepgram (`vad_events=true`, `utterance_end_ms=1000`, `endpointing=100`; `commons/hallucinators/deepgram/provider/index.js:140-142`).

### 5 · speaker queue / jitter

There are two stages.
- **Main thread:** `Queue.out` (an array backlog plus a waiter gate, with no cap) is pumped by `drainLoop`. It posts each `Float32Array` to the worklet with a transfer (`speaker.js:88-93`).
- **Render thread:** the worklet keeps its own `queue[]`, a `cursor` and `bufferedSamples` (`device/speaker/worklet.js:4-8`).

Playback is a worklet pull model. It does **not** schedule with `AudioContext.currentTime` and uses no `AudioBufferSourceNode`.
```js
// systems/anima/src/typology/stores/box/device/speaker/worklet.js:25
if (this.priming) {
  if (this.bufferedSamples < this.jitter) { channel.fill(0); return true; }   // prime to 1600 samples = 100 ms @16k
  this.priming = false;
}
while (written < channel.length && this.queue.length > 0) {                   // copy across frame boundaries
  const head = this.queue[0]; const take = Math.min(head.length - this.cursor, channel.length - written);
  channel.set(head.subarray(this.cursor, this.cursor + take), written);
  written += take; this.cursor += take; this.bufferedSamples -= take;
  if (this.cursor >= head.length) { this.queue.shift(); this.cursor = 0; }
}
while (written < channel.length) channel[written++] = 0;                      // underrun → silence
```
- **jitter:** `JITTER_BUFFER_SAMPLES = 1600` (`speaker.js:5`), passed in as `processorOptions.jitter`, with a fallback of `1600` (`worklet.js:9`).
- **underrun:** the worklet pads with zeros and sends `{playing:false}` (`:46-51`). Priming is **not** re-armed after an underrun. Only `flush` sets `priming = true` (`:15`), so a stuttering stream plays each late frame straight away with no rebuffer.
- **drop policy:** there is none. Both queues are unbounded (`queue.js:9-13`, `worklet.js:18`). A frame is dropped only by `flush()`, which clears both, or by `teardown`.
- **while unclaimed:** `out.enqueue` keeps growing the backlog and nothing drains it. `conversation.js:16` enqueues without claiming.
- **mono:** only `outputs[0][0]` is written (`worklet.js:24`).

### 6 · worklets
| | mic `"microphone-pcm"` | speaker `"speaker-pcm"` |
|---|---|---|
| file | `device/microphone/worklet.js` | `device/speaker/worklet.js` |
| constant | `FRAME_SAMPLES = 1024` `:1` | `jitter` (opt) `:9` |
| in | `inputs[0][0]` (channel 0 only) `:8` | `port` messages |
| out | `port.postMessage(Float32Array(≥1024), [buffer])` `:21` | `outputs[0][0]`; `port.postMessage({playing:boolean})` on change `:50` |
| main→worklet | — | `Float32Array` (pushed) `:18` · `{flush:true}` `:11-16` |

The mic accumulates render quanta (128 samples each) until it has at least 1024. In practice every frame is exactly 1024 samples = **64 ms @16 kHz** (`:12-21`).

### 7 · dictation, end to end

The wire path is `/harness/verbatim/stream`. `/audio/packet` is the **event name inside each SSE frame**, not a route.
1. The Dock builds `dictation({terminals, box})` (`systems/anima/src/app/panels/a/widgets/Dock.svelte:48`). The Dictaphone key is shown only when the mode's daemon cortex has a `verbatim/stream` faculty (`Dock.svelte:35`, `Composer.svelte:103-104`).
2. `start()` checks `thread.mode.harness.verbatim.stream` (`dictation.js:49`) and awaits `microphone.claim()` (`:59`).
3. Framing: `frames(signal)` reads `microphone.in.stream()` and yields `{event:"/audio/packet", audio: pcm.encode(samples), rate, pts}` (`dictation.js:15-22`).
   - `pcm.encode` clamps to Int16 LE and returns base64 (`subsystems/typology/gestalten/belt/pcm.js:1-12`).
   - 1024 samples → 2048 bytes → ~2732 base64 chars.
   - `rate` = the `context.sampleRate`. `pts` is in seconds. `codec` and `align` are never set (schema: `subsystems/typology/schematics/primitives/hallucination.js:321-337`).
4. Client wire: `mode.harness = shape.connection.wire(mode.connection.branch("/harness"), metadata)` (`systems/anima/src/typology/entities/mode/traits/harnessed.js:16,38-39`). Because the stripped edge carries `feeds`, the call becomes `connection.converse("", source, {input:{thread}, signal})` (`subsystems/typology/gestalten/shape/connection.js:35-36`).
5. `converse` sends POST with body `{thread}` and `raw.body = sse.encode(source)`, so each packet goes out as one `data: <json>\n\n` frame of a `ReadableStream` (`subsystems/typology/prototypes/connection.js:134-142`, `subsystems/typology/gestalten/belt/sse.js:4-22`). This needs the multiplex transport: plain `fetcher` throws on input beside an upstream body (`subsystems/typology/gestalten/shard/transmitter.js:268-274`). anima's daemon connection is multiplex (`systems/anima/src/typology/entities/daemon/dossier.js:63-64`).
6. Runtime route: `harness.branch("/verbatim").open({nature:"stream", feeds: Audio.Packet, yields: Verbatim.Any}, shard.hal.verbatim({polish: POLISH, tune:"fast"}))` (`systems/runtime/traits/harnessed.js:190-195`), mounted at `mode.aperture.branch("/harness", harness)` (`:226`). The ROOT middlewares run first:
   - `normalizing` (`:18`)
   - `claiming`, which loads the thread and sets `ctx.vocal = v.thread.trait(ctx.thread,"VOCAL")` (`:23-31`). The VOCAL schema is `{language?, tune?, harmonize?{window,tolerance,tail}, polish?}` (`subsystems/typology/schematics/entities/thread.js:15-26`). An unclaimed trait gives `{}` (`subsystems/typology/gestalten/belt/traits.js:31-34`).
   - `activating` (`:33-39`)
   - `requesting`
7. `shard.hal.verbatim` sets `source = ctx.input.source ?? ctx.request.subscribe()`, which turns the SSE body back into packets (`subsystems/typology/gestalten/shard/hal.js:51`, `subsystems/typology/prototypes/request.js:43-47`). It then calls `ctx.cortex.hallucinate.verbatim.stream({controller, source, settings:{language}, policy:{tune, harmonize}})` (`hal.js:55-60`).
8. The cortex runs `/verbatim/stream` → `transcribing` → `hallucinate.transcribe` = `verbatim.harmonize(faculty.via.stream(source, settings), policy.harmonize)` (`subsystems/typology/prototypes/cortex.js:54-56`, `gestalten/shard/hallucinate.js:61-64`, `gestalten/belt/hallucinate.js:204-216`).
9. Provider (Deepgram): `pump` sends `pcm.bytes(packet.audio)` as binary WS frames and finishes with `{type:"CloseStream"}` (`commons/hallucinators/deepgram/provider/index.js:35-44`).
   - nova-3 runs on `v1/listen?encoding=linear16&sample_rate=16000` (`:137-143`).
   - flux runs on `v2/listen` (`:164-173`).
   - `packet.rate` is **ignored**: the rate 16000 is hard-coded in the URL.
10. Translation:
    - nova: `SpeechStarted` → `/turn/open`, `UtteranceEnd` → `/turn/close`, `is_final` → `/verbatim/final` (+`words`), otherwise `/verbatim/partial` (`:78-91`).
    - flux adds `/verbatim/eager` and `/verbatim/resume` (`:93-119`).
11. `harmonize` (window 2, tolerance 0.8, tail 8; `gestalten/belt/verbatim.js:3`) turns partials into stable `/verbatim/commit {text}` plus a trimmed `/verbatim/partial`. On final it emits a remainder commit, then `/verbatim/final` stamped with `segment` (`:26-74`).
12. `polishing`: on each `/turn/close` it batches the finals and sends them through `dialogue.render` with the `POLISH` system prompt (`systems/runtime/traits/harnessed.js:8-13`). The result is merged back as `/verbatim/polish {transcript, segments}` (`hal.js:4-47,61-70`). It is skipped when `vocal.polish === false`. Output is wrapped in `controlled` (stdout span) (`hal.js:73-83`). The verbatim branch has no `persisting`, so **transcripts are not stored as turns** (`harnessed.js:190-197`).
13. Back on the client, the SSE event set is `Verbatim.Any` = `/turn/open · /turn/close · /verbatim/commit · /verbatim/partial · /verbatim/eager · /verbatim/resume · /verbatim/final · /verbatim/polish` (`hallucination.js:380-389`). `reduce` folds them with `verbatim.fold` into `{settled[], open, tail}`; then `$committed ← transcript(state)` and `$tail ← state.tail` (`dictation.js:24-32`, `verbatim.js:78-107`). `eager` and `resume` are no-ops in `fold`.
14. `stop()`: `settling`, aborts `feed` (which ends the upstream SSE body → the provider sends CloseStream), `microphone.pause()` (`dictation.js:81-86`). When the server closes, `reduce` finishes, which releases the mic and sets `idle` (`:36-42`).
15. Dock `settle()` awaits `settled()` and splices `$committed` at the caret (`Dock.svelte:136-147`). While listening, the Composer renders `$committed` and `$tail` (`Composer.svelte:72-77`). A terminal or thread switch calls `cancel()` (`Dock.svelte:150`).

Proof that the chain is LIVE: `systems/runtime/tests/dictation.integration.test.js:51-67,88,111` drives `harness.verbatim.stream` and `converse("/harness/verbatim/stream", …)`. The client half cannot run today because anima does not build (`.ikiro/world/codemap/map.md`, state 10-16).

### 8 · UI consumers
| component | reads | calls |
|---|---|---|
| `app/+layout.svelte:43-47` | — | `new stores.box.Box()`, context `BOX` |
| `app/panels/b/widgets/BoxSection.svelte:9-91` | all 6 mic atoms + 3 speaker atoms (getter seed + `.subscribe`) `:13-31` | `microphone.claim/release/pause/resume` `:70,77`; `speaker.claim/release/flush` `:89,91`; `tone()` = a 440 Hz 0.3 s `out.enqueue` via `drivers.audio.acquire().sampleRate` `:46-54` |
| `app/panels/a/widgets/Dock.svelte:20,48-50` | `microphone.$level` | `dictation({terminals, box})`; `start/stop/settled/cancel` `:131-155` |
| `app/panels/a/widgets/Composer.svelte:20-22,72-77,104` | `recorder.$committed/$tail`, `level` | passes `$active` + `level` to Dictaphone |
| `app/panels/a/widgets/Dictaphone.svelte:4-18` | `$active` (`arming`/`settling` = busy), `$level` → pulse `scale(1+min(level*6,0.9))` | `onstart/onstop` |
| `typology/prototypes/conversation.js:16,49` | — | `speaker.out.enqueue(pcm.decode(packet.audio))` for `channel==="speech"`, `speaker.flush()`; **0 importers** (only `prototypes/index.js:3`) |
| `typology/prototypes/todo/bell/bell.js:6,40` | — | its own `Queue` + its own `AudioContext({sampleRate:8000})`, does not use box; unexported |

### 9 · ask vs live tree; defects
| ask | live |
|---|---|
| `typology/box/**` | `typology/stores/box/**` |
| `audio.js` (at the box root) | `drivers/audio/audio.js` (`AudioDriver`) |
| "worklet" (one) | two: `device/microphone/worklet.js`, `device/speaker/worklet.js` |
| "drivers" (several) | one: `audio` |
| `/audio/packet` route | event name; the route is `/harness/verbatim/stream` |
| "VAD constants" | client VAD only drives a UI flag; the real endpointing is Deepgram's (`provider/index.js:140-142,166`) |
| "queue/jitter … AudioContext time" | no `currentTime` scheduling; a worklet pull plus a 1600-sample prime |
| "permission states … claimed" | `claimed` is a separate boolean; the speaker has no permission state |

Defects and gaps found:
- **`AudioDriver.$state` has no plain getter**, against the codestyle `$`-store rule (`audio.js:5`).
- **The sample rate is not honoured end to end.** `audio.js:11-15` only logs a mismatch. `dictation.js:16` puts the real rate on each packet, but Deepgram hard-codes 16000 (`provider/index.js:138,165`). On a browser that refuses 16 kHz the transcription will be wrong.
- **`microphone.in` is a hot `Pipe` with no backlog** (`pipe.js:47-49`). Frames before `frames()` first iterates, i.e. before the converse body is pulled, are lost.
- **`pause()` leaves the analyser connected** (`microphone.js:56`), so `$level` and `$speaking` keep updating while muted.
- **Speaker priming is not re-armed on underrun** (`worklet.js:25-31`). There is no backpressure or cap on either queue.
- **`conversation.js` is dead** (0 importers). It enqueues speech without `speaker.claim()`.
- **`AudioDriver.release()` has 0 callers**, so the shared context is never closed.
- **`ctx.vocal` is typed in contexts as `v.boolean()`** (`subsystems/typology/schematics/primitives/contexts.js:37`), but it is the VOCAL object, read as `vocal.tune/.language/.harmonize/.polish` (`hal.js:50-59`). The contract and the code disagree.

## 4 · chess bundle — two faces, one bag, buffer.data

Measured by read, 10-16. Extends briefing §7/§8. Line drift against the briefing: `play.jsx:57` → `Play` is now at `:53`, `default` at `:268` (not `:267`). `Play.svelte:12` → `$props()` is at `:14`.

### 1 · the App declaration

```js
// ~/.viva/registry/chess/modes/board/play/play.viva.js:19
export const application = new App(
  [
    { mime: mime.dom.svelte, mount: "buffer/Play.svelte" },
    { mime: mime.tty.solid, mount: "buffer/play.jsx" },
  ],
  v.buffer({ data: MATCH, literals: v.array(v.rel(v.literal())).desc(…) }).desc(…),
);
```
- Two faces, two mimes. No `faces` key and no `entries` in the declaration. Entries are minted later by the bundler, one per source: `{mime, hash, mount:"/<hash16>.<stem>.mjs", integrity, bytes}`.
- **No App schema exists.** `App` is a class, not a schematic. The constructor is the only guard: every source names a `mime` plus a `mount` or a `source` (`subsystems/typology/prototypes/app.js:15-16`). `declared()` infers a mime from the extension, but only for `.svelte` and `.html` (`app.js:3-5`). A `.jsx` source must name its mime explicitly, and chess does. The runtime re-wraps it with `new App(declared.sources, declared.schema)` (`systems/runtime/traits/application.js:8`).
- The schematic that does exist is `Bundle`, the compiled output: `{entries: [{mime: type(), hash, mount, integrity, bytes}] minItems 1}` (`subsystems/typology/schematics/prototypes/bundle.js:4-15`). It is used only on `Buffer.bundle` (`schematics/entities/buffer.js:11`). Mime strings are at `schematics/scalars/mime.js:13-22` (`dom.svelte` · `tty.solid`).
- The wire shape: `/metadata/application` → `{url, bundle: mode.application.bundle.json, schema}` (`systems/runtime/gestalten/shard/host.js:32-38`).
- The `MATCH` data schema is at `~/.viva/registry/chess/modes/board/play/types.js:63-89`.

### 2 · tty face `play.jsx`: signature and bag

```jsx
// ~/.viva/registry/chess/modes/board/play/buffer/play.jsx:268
export default (element, bag) => { const dispose = _render(() => createComponent(RendererContext.Provider, { value: bag.renderer, get children() { return createComponent(Play, bag); } }), element);
  return { destroy: () => { dispose(); for (const child of element.getChildren()) child.destroyRecursively(); } }; };
// :53
export function Play(props) { const { palette, mode, buffer, thread } = props;
```
The bag is built at `systems/ghost/app/surface/chrome/panes/frame.jsx:29`:
`module.default(element, { terminal: props.terminal, mode: props.buffer.mode, thread: props.terminal.thread, buffer: props.buffer, renderer, palette, dispatch: props.dispatch, focused })`

| key | type | ghost source | face uses it for |
|---|---|---|---|
| `terminal` | Terminal entity | `from(props.client.$active)` `frame.jsx:55`, passed `:68` | **ignored** |
| `mode` | ghost `Mode` | `props.buffer.mode` `:29` | `mode.connection.call("/match/…")` `play.jsx:63`. `connection` = `(daemon ?? runtime).aperture.branch("/mode/<type>/<slug>")` (`systems/ghost/typology/mode/mode.js:56`) |
| `thread` | Thread entity | `props.terminal.thread` `:29`, i.e. the TERMINAL's thread, not `buffer.thread` | `thread.id` in `/match/create` `play.jsx:118` |
| `buffer` | ghost `Buffer` | `belt.atom.chain(client.$active,"$buffer")` `frame.jsx:56` | `buffer.$data` `:55` · `buffer.id` `:63` · `buffer.data =` `:65-66` |
| `renderer` | opentui CliRenderer | `useRenderer()` `frame.jsx:13` | RendererContext `:272` · `renderer.keyInput.prependListener/off` `:175,183` |
| `palette` | dapper tokens | `usePalette()` `frame.jsx:12` | every `fg`/`bg` (`textStrong · textMuted · textLink · textInk · signalPrimary · signalCaution · signalNegative`) |
| `dispatch` | `(line) => client.dispatch(line)` | `frame.jsx:68` → `shard.repl.dispatch` `systems/ghost/typology/client/client.js:26-27` | **ignored** |
| `focused` | Solid accessor `() => boolean` | `createSignal(true)` `frame.jsx:15`, flipped by ⇥ `:18-23` | key gate `play.jsx:164` |

- Keys the face reads that ghost does not provide: **none**.
- Keys ghost provides that the face ignores: `terminal` and `dispatch`.
- The test rig passes `terminal: {daemon:{connection,statics}, thread}` (`tests/tty.render.test.js:52`), which is a richer terminal than the face reads.

### 3 · dom face `Play.svelte` against the Frame bag

`Frame.svelte` is **not** under `systems/anima/src/lib/**`. It lives at `subsystems/drapes/panels/Frame.svelte`, and anima imports it from `@vivalence/drapes` (`systems/anima/src/app/panels/a/a.svelte:5`).

```svelte
<!-- subsystems/drapes/panels/Frame.svelte:64 -->
component = module.default(target, { terminal, daemon: next.mode.daemon, mode: next.mode, thread: next.thread, buffer: next });
<!-- ~/.viva/registry/chess/modes/board/play/buffer/Play.svelte:14 -->
const { terminal, daemon, mode, thread, buffer } = $props();
```

| key | Frame source | face uses it for |
|---|---|---|
| `terminal` | prop `Frame.svelte:5` | `Shell`/`Nav` tabs, `openMode`/`show` `Play.svelte:151-153` → `kit/open.js:20-23` (`terminal.thread =`, `terminal.buffer =`) |
| `daemon` | `next.mode.daemon` `:66` | `kit/open.js:12-37` lists sibling modes, creates thread and buffer (the analyse button) |
| `mode` | `next.mode` `:67` | `mode.call.match[path](input)` `Play.svelte:34`. `mode.call` = `shape.connection.wire(mode.connection, metadata.aperture)` (`systems/anima/src/typology/entities/mode/traits/exposed.js:5`) |
| `thread` | `next.thread` `:68`, i.e. the BUFFER's thread (ghost uses the terminal's) | `thread?.id` `:136` |
| `buffer` | `next` `:69` | `buffer.$data` `:15` · `buffer.id` in every call |

All five match: no missing key and no ignored key. There is no `renderer`, `palette`, `dispatch` or `focused` on dom.

**DEAD today.** Anima hands `<Frame terminal={$terminal} {view}>` (`a.svelte:114`), but Frame takes `{terminal, bundle = null, accept = []}` (`Frame.svelte:5`). So `bundle` is null and the `if (!bundle)` branch runs `next.mount()` and renders children (`:48-53`). `module.default` is never reached. Anima also does not build: `View` is imported at `systems/anima/src/typology/entities/buffer.js:2` (known-issues `anima-imports-view-from-typology` `.ikiro/known-issues.org:2911`, `frame-bag-drift` `:18`).

A third bag, `{buffer, dispatch}`, sits at `drapes/dom/panes/frame.jsx:23` (known-issues `:20`).

Side note: `kit/open.js:22` `terminal.buffer = buffer` would throw on a ghost terminal, which has a getter only (`systems/ghost/typology/terminal/terminal.js:34`). It is dom-only today.

### 4 · keys consumed

| key/chord | face | effect | file:line |
|---|---|---|---|
| `a-h`,`1-8` (my move, not busy) | tty | build a UCI draft; auto-submit at 4 chars unless promotion | `play.jsx:136-148` |
| `q r b n` after 4 chars | tty | promotion piece, then submit | `:141` |
| backspace · escape | tty | draft −1 · clear | `:138-139` |
| return · linefeed · enter | tty | submit draft → `/match/move` | `:140` |
| ← · → | tty | `seek(at ∓ 1)` (no-op unless `rewindable`) | `:151-152` |
| `n` | tty | `fresh()` → `/match/create` in place | `:153` |
| `s` (when `waiting()`) | tty | `start` → drive `/match/step` | `:154` |
| `r` · `d` | tty | resign · offer draw | `:155-156` |
| `f` | tty | flip (local signal) | `:157` |
| `w` · `b` · `o` (unlocked) | tty | cycle white kind · black kind · bot strength/assisted | `:158-160` |
| `f` | dom | flip | `kit/Shell.svelte:107` |
| `p` (docked) | dom | toggle panel open | `Shell.svelte:108` |
| `s` | dom | toggle sound (localStorage `chess.sound`, `kit/sound.js:8`) | `Shell.svelte:109` |
| ←/→/Home/End (rewindable) | dom | back · forward · seek(0) · seek(plies) | `Play.svelte:254-260` |
| pointer drag/click | dom | `onmove(uci)` → `/match/move` | `kit/Board.svelte:90,97` · `Play.svelte:294` |

**Gating, tty.**
- `keys` returns early when `!props.focused() || key.defaultPrevented` (`play.jsx:164`).
- When it claims a key it calls `preventDefault()` + `stopPropagation()` (`:168-169`).
- `prependListener` (`:175`) runs after the frame's own prepended ⇥ toggle (`frame.jsx:25`), so the face sits FIRST.
- opentui stops the global-listener loop on `propagationStopped` (`node_modules/.deno/@opentui+core@0.5.17/.../chunk-bun-6rvkxs1v.js:1533-1537`).

**Gating, dom.** A window `keydown` acts only if `root.contains(document.activeElement)`, and skips input/textarea/select and meta/ctrl/alt (`Shell.svelte:103-106`). There is no focused prop.

**Collision, tty.** On the user's move, `d` (draw), `f` (flip) and `b` (black seat) are file letters, so `typing` claims them first (`:142-145` before the COMMANDS lookup at `:166`). Draw and flip are unreachable while it is your move and the draft is empty. `s` means start on tty but sound on dom.

**Left for the client chrome (tty):**
- ⇥ focus toggle (`frame.jsx:18-23`): the face never claims tab.
- ctrl-c → SIGINT (`systems/ghost/app/surface/chrome/index.js:13-15`).
- `` ` `` console (`index.js:18-19`).
- Everything the face does not claim also reaches the **dock Input**. `useKeyboard` is a plain global `keyInput.on` (`@opentui/solid/index.bun.js:147-151`), and `Input` checks only `defaultPrevented` (`chrome/views/Input.jsx:20-21`; mounted at `panes/dock.jsx:83`). So with the frame focused, an unclaimed `x` types into the dock. The dock has no focus gate.

### 5 · `buffer.data`: writes, reads, wire

**Writes (client).** Exactly one:
```jsx
// ~/.viva/registry/chess/modes/board/play/buffer/play.jsx:64
const hold = (next) => { buffer.data = next.fen === undefined && next.data !== undefined ? next.data : next; return buffer.data; };
```
- This is local only. Ghost `set data` is `this.$data.set(value ?? {})` (`systems/ghost/typology/buffer.js:10-12`).
- The `next.data` branch exists because `/match/create` returns the buffer entity (`aperture/index.js:211,218`), while the others return `data` (`:231,266,304`) or `{moved,data}` (`:282`, unwrapped in `drive` `play.jsx:107`).
- dom never writes. It relies on the subscription alone (`Play.svelte:11-13` comment, `drive` `:116`).
- `grep -rn '/buffer/update\|\.accept(\|dispatch(' ~/.viva/registry/chess/modes/board/play/buffer` → **0**. Neither face uses a buffer verb, `dispatch` or `accept`.

**Reads.** All through `$data`.
- tty (`play.jsx:69-84, 191-263`): `seats · status · cursor · shown.{fen,turn,lastMove} · fen · turn · moves · sans · clock.{initial,increment,running,at,white,black} · rewindable · result · reason · opening.{eco,name} · offers.draw · thinking · check`.
- dom adds `dests` (`Play.svelte:294`), `initial` (`:58`), `marks` (`:249-250`), `variations` (`:251`) and `game` (`:152,211`).
- tty never reads `dests`. Its draft is regex-checked only (`:12,144`), and the server rejects an illegal move.

**Codestyle gap ("selection · cursor · draft → buffer.data").** Only `cursor` lives in data, and it is server-owned via `/match/seek` (`aperture/index.js:303`). These are face-local and not in the row:
- tty: `typed` (draft), `flipped`, `fault`, `busy` (`play.jsx:56-59`).
- dom: `flipped · panel · open · hidden` (`Play.svelte:25-32`), plus sound in localStorage.

**One write traced, tty `e2e4`:**
1. A keypress builds `typed = "e2e4"` and auto-submits → `move("e2e4")` (`play.jsx:146,134,112`).
2. `call("move",{uci})` → `mode.connection.call("/match/move",{buffer: buffer.id, uci})` (`play.jsx:63`). `Connection.call` → `fetch` (`subsystems/typology/prototypes/connection.js:97-106`) at `<daemon|runtime aperture>/mode/board/play/match/move` (`ghost/typology/mode/mode.js:56`).
3. Runtime routing: `context.aperture.branch(mode.reference.nature, mode.aperture)` (`systems/runtime/gestalten/belt/modes.js:9`). `mode.aperture` grafts the module's aperture (`systems/runtime/lifecycle/mode/population.js:15-20`).
4. The route `/match/move` (`~/.viva/registry/chess/modes/board/play/aperture/index.js:246-267`):
   - `load` → `ctx.entities.buffer.findOneOrFail` (`:11`).
   - `play` → domain `ctx.call.rules.apply` (`:6,68`).
   - `finish` → `save`, which recomputes `shown · dests · check` (`:18-29`).
   - then `step` for the bot reply and `finish` again (`:262-265`).
5. `ctx.entities.buffer.updateOne({id},{data})` (`aperture/index.js:30`) → `DataRepository.updateOne`: `findOneOrFail` · `assign` · `em.flush()` (`subsystems/typology/entities/base/DataEntity.ts:54-59`). `BufferRepository extends DataRepository` (`systems/runtime/entities/Buffer.ts:22`).
6. The flush fires the mikro subscriber `afterUpdate` → twitch `/after/buffer/update` (`subsystems/typology/gestalten/shape/subscriber.js:21`; registered at `systems/runtime/lifecycle/daemon/population.js:32` and `runtime/population.js:72`) → `broadcaster.push` (`subsystems/typology/gestalten/shard/datamap.js:205-217`).
7. The userspace `/subscribe` stream (`datamap.js:222-229`; `buffer` row at `systems/runtime/lifecycle/runtime/aperture/userspace.js:15`) → ghost `buffer.subscribe()` (`systems/ghost/typology/client/execution.js:127`) → `repo.merge(event.entity)` sets `$data` (`subsystems/typology/prototypes/remote-repository.js:165`).
8. Meanwhile the route's response lands in `hold()` (`play.jsx:112`), an optimistic `$data.set` with the same object. The face re-renders twice. This is not a race, because both carry the server's data.

The `/match/create` in-place reset skips `updateOne`: `buffer.data = ctx.mode.application.fill({data}); em.flush()` (`aperture/index.js:209-210`). It reaches step 6 through the same subscriber.

### 6 · `kit/` and `panels/`

All are relative `./` imports. **No import past the package root, and none past the mode dir.** All 11 kit files are byte-identical across the five modes (`board/play · study/analysis · riddle/puzzles · coach/practice · library/games`, md5 equal), and the test pins them (`~/.viva/registry/chess/tests/kit.test.js:30` P-kit-equal). They are copied, not shared, because a mode may not import outside its directory.

| file | exports | imported by (in play) |
|---|---|---|
| `kit/Shell.svelte` | frame: Theme · Nav · layout · keys · sound · overlay · dock (props `:35`) | `Play.svelte:3` |
| `kit/Board.svelte` | board `{fen, orientation, lastMove, dests, movable, check, hint, tints, onmove}` (`:7`) | `Play.svelte:4` |
| `kit/Seat.svelte` | seat row `{name, kind, option, active, clock, running, …, lost, edge, white}` (`:7`) | `Play.svelte:5` |
| `kit/Moves.svelte` | move list `{sans, cursor, marks, onseek, label, meta, empty}` (`:4`) | `Play.svelte:6` |
| `kit/Nav.svelte` | mode tabs `{terminal, daemon, active, narrow}` (`:9`) | `Shell.svelte:4` |
| `kit/Theme.svelte` | theme CSS vars as a component (`:4` comment) | `Shell.svelte:3` |
| `kit/Ladder.svelte` | elo ladder `{ladder, label, move, empty}` | **unused in play**; analysis/practice copies only |
| `kit/layout.js` | `NAV SEATS FLOOR PHONE BAR place()` | `Shell.svelte:5` |
| `kit/material.js` | `captures({fen, initial})` | `Play.svelte:8` |
| `kit/open.js` | `TABS modes sibling show open` | `Play.svelte:9` · `Nav.svelte:3` |
| `kit/sound.js` | `KEY wanted remember play` | `Shell.svelte:6` · `Board.svelte:5` |
| `panels/Setup.svelte` | seats/clock/rewindable panel `{seats, clock, locked, busy, rewindable, onseat, onclock, onrewindable}` (`:6`) | `Play.svelte:7` |

Bare (non-URL) specifiers, all host-provided framework or typology: `solid-js` and `@opentui/solid` (`play.jsx:1-2`), `svelte` (`Play.svelte:2`), `@vivalence/typology` (`play.viva.js:1`). tty.solid compiles with `packages: "external"` (`subsystems/paladin/belt/bundler.js:42`), so these stay bare in the blob.

### 7 · engine and data side

- **The board state lives in `buffer.data` and nowhere else.** `MATCH` (`types.js:63-89`): `moves` is the truth, `fen` a cache, plus `shown/dests/check` recomputed at each `save` (`aperture/index.js:18-31`).
- Neither the harness nor the thread holds the board. The `dialogue` harness re-reads it each message via `beside()` → newest buffer on the thread (`harness.js:41-42`, `tools/index.js:46-53`).
- The mode holds no chess logic. Rules go through the domain `ctx.call.rules.{legal,apply,replay}` (`aperture/index.js:5-6`).
- Bots come from `seats.js:14-38`:
  - `engine` → `ctx.services.engine.play` (stockfish service);
  - `hallucinator` → model, with two retries then a random legal fallback;
  - `remote` throws; `user` → null.
- `tools` (the agent's hands): `match_list` (`tools/index.js:61`), `match_board` (`:91`, with engine lines via `ctx.call.position.lines`) and `match_move` (`:112`, which marks the ply `kind:"agent"` and lets the bot answer).
- A finished game seals as a literal: `literal.seal`, `buffer.literals.add`, `data.game = id` (`aperture/index.js:114-141`).
- **A move end to end:** `/match/move` → tick clock → rules.apply → lists/clock/end-checks (fifty, repetition) → save+seal → bot `step` → save → broadcast (steps in §4·5).

### 8 · the ask vs the live tree

- All 8 named bag keys exist on ghost (`frame.jsx:29`). The face ignores `terminal` and `dispatch`.
- "how it writes buffer.data": it does not write the row. The only `buffer.data =` is a local optimistic set. The authority is mode routes `/match/*`. There is no `/buffer/update`, no `accept`, and no `dispatch` use.
- "its dom face": `Play.svelte` takes `{terminal, daemon, mode, thread, buffer}`, not the 8-key bag. `daemon` is dom-only. The dom `thread` is the buffer's; the tty `thread` is the terminal's.
- `systems/anima/src/lib/**/Frame.svelte` does not exist. It is `subsystems/drapes/panels/Frame.svelte`, and it never mounts the face today (§4·3).
- `play.viva.js` is verified at that path. The App has no `faces` or `entries` field: entries come from the bundler, and no App schematic exists (§4·1).
- The briefing's line refs `play.jsx:57`, `:267` and `Play.svelte:12` are stale by 1–4 lines (top note).
- `kit/` and `panels/` are clean, with one twist: the kit is a 5× byte-identical copy (§4·6).
