<!-- limit: 4000 chars -->
# reader-mode — the comp's panes, one line each: shows what, from where

Comp: artifact `abfa428b` `project/Main.dc.html` (592 rows, read 11-10) · `Cell.dc.html` (41 rows). Theme `northsea`. Sheet `reader.css` + DS `ds/vivalence/components/bundle.css` (`kit-*`).

| pane (comp class) | comp state | shows | from where (ours) |
|---|---|---|---|
| `rd-empty .card` | `showEmpty` | glyph · "no article in the buffer" · `/add` field + `add` | `buffer.data.article === null`; `add` → mode route `/add {buffer, url}` |
| `rd-recent` | `showEmpty` | "currently reading": title · meter pct · `N left · M min` | `mode.entities.buffer.find({})` with an article, no done filter (Q18A); left · mins · pct read off each html |
| `rd-load` | `parsing` | host · pct · meter · 5 rows fetch · snapshot · parse · assets · layout | `/add` in flight — one call, no steps today (Q16) |
| `rd-top` | `loaded` | parse dot · host · `refining` label · undo · face choice · settings toggle | `article.parse` · `article.url` · newest `data-done` · `face` |
| `rd-hint` ⌃v → `r refine` | `loaded` | a key hint row for refine | KILLED Q7 (no `r` key) → `* dropped` |
| `rd-set` | `setOpen` | face (narrow) · type · size − + · lines · width · audio | `$settings` (Q9); audio row only when `voiced()` (Q11) |
| `rd-rail` | `loaded` | one cell per block: done · media · cur; `N left · M min` | `[data-block]` of `article.html`, `data-done`, `cursor` |
| `rd-sheet .f-original` | `face=original` | a mock site bar over the same blocks | the snapshot File in `<iframe sandbox>` (Q6) |
| `rd-sheet .f-reader` `rd-art` | `face=reader` | blocks; sentence spans; swipe-to-done; acts: speak-from (audio) · done | `article.html` minus `[data-done]`; sentences split at read (Q5) |
| `figure` image · movie · embed | per block kind | media + `tag` + `figcaption` | the cleaned html's own `img` · `figure`; movie · embed playback DEFERRED |
| `rd-speech` | `audio` | prev · play/pause · next · `b6 · 2/4` · sentence cells · now text · rates | DEFERRED 11-11 — speech bypassed (Q21) |
| `Cell` empty · reading · speaking · read | client sidebar | `◆ b1 reader · empty` · title · meter · `9 left` · `b6 · 2/4` · `done · 13/13` | `LABELED.name` = the title, set by `/add` (Q19); the rest dropped |

Comp data (verbatim keys): `RD_BLOCKS` 13 (h1 · p · image · h2 · list · movie · quote · embed) · `RD_STEPS` 5 · `RD_RECENT` 3 `[title, left, pct, mins]` · `RD_LEAD` 1.5 · 1.7 · 1.95 · `RD_MEASURE` 28 · 34 · 42em · `RD_SWIPE` 110px · rates 0.8 · 1 · 1.25 · 1.5 · size 14–28.
