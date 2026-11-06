<!-- limit: 6000 chars -->
# reader-mode — the parser loop: what landed 11-12, how to re-run it, what is still red

Trigger, beef 11-12: `commandlinesystems.com/magic.txt` added, buffer empty (`0 left · 1 min`). /"i guess the parser is shit."/

## landed in the mode

- `commons/reader/reader/aperture/parse.js` (391 rows): `normalized(bytes, type)` → html string · `extracted(html, url)` → `{ title, html, blocks }`.
- `commons/reader/reader/aperture/index.js`: fetch · snapshot · buffer write only.
- `import_map.json`: `"parse5": "npm:parse5@7.3.0"` (linkedom builds no `<html>/<body>` on its own).

What the parser does, in order:

1. decode by BOM, then the header `charset`, then a 1 024-byte prescan for `<meta charset>` or the XML prolog, then UTF-8; non-HTML `text/*` is typeset at blank rows (`h2` setext or outdented, `pre` when laid out, else `p`); HTML goes through parse5.
2. one fold measures every element: chars, link chars, sentence prose, furniture.
3. root by score (descend while one child holds 90% of the prose); headline matched against `<title>`; root = their common ancestor; the headline's own `<article>` wins over sibling cards.
4. prune on positive evidence only: `nav` · `footer` · link-dense `aside` · hidden · tokens `footer` `meta` · link density ≥ 0.95 · half-furniture.
5. flatten: wrappers unwrap, inline runs become `p`, layout tables unwrap, paired `<br>` splits, spacers drop, `hr` and empty blocks emit nothing.

All 14 thresholds sit in `LIMITS` in `parse.js`.

## the loop — `testament/prototypes/reader-corpus/` (VCS-ignored, `.gitignore:1`)

```sh
DENO_DIR=~/Library/Caches/deno HOME=$(mktemp -d) deno run -A --no-check testament/prototypes/reader-corpus/run.js
DENO_DIR=~/Library/Caches/deno HOME=$(mktemp -d) deno run -A --no-check testament/prototypes/reader-corpus/gate.js
```

- `run.js` scores `expectations/*.js` against `pages/` + `corpus/` with `parse.js` (the loop's copy).
- `gate.js` proves the mode's `/add` equals the loop's copy byte for byte (49/49 at close).
- `process.md` holds the protocol: expectations sealed by hash before the first parse (`seal.js` · `seal.log`), disputes in `amendments.md`.
- Port = `cp testament/prototypes/reader-corpus/parse.js commons/reader/reader/aperture/parse.js`, then the mode's suite, then `gate.js`. A save under `commons/` restarts a live `runtime/watch`.

Criteria per page: block count got/expected (±10%) · tree shape (`unkinded` `compound` `wrapped` `giant`, all 0) · furniture `leaks` by class · `kept` ≥ 98% (share of the region's text runs that survive; outranks everything).

## rules of the loop, each paid for

- Pruning needs POSITIVE evidence of furniture; "no sentence here" is not evidence. REJECTED twice: Norvig lost 30 blocks, the suite's 6-block page came back as 3.
- A convention (HTML/ARIA semantics, pre-CSS authoring habits) is admitted on one host; a statistical rule (threshold · token · density) needs 3 hosts on 3 CMSs. REJECTED: one quorum for both — it deleted paired-`<br>` and layout-table rules, Paul Graham fell 69 → 5 blocks.
- Every stage is tested on held-out pages the loop never saw; the loop's own corpus missed three regressions the mode's suite or held-out pages caught.
- No port before the mode's suite passes on the candidate.
- A gain is measured BEFORE it is offered. REJECTED 11-12: the `<time>` rule offered as "~18 pages" fired on 1.

## state at close: 49 fixtures, 19 green

- Through B5 (39 fixtures): 19 green · `kept` 100% everywhere · nesting 0.
- B6 (10 hard pages) is saved, sealed and scored, NOT fixed: wound down on his word.

Remaining reds, by class:

| class | pages | signal |
|---|---|---|
| byline · dateline · tag line after the headline | ~16 | `<time>` rule landed 11-12 (short, no prose, no passage); fires on 9 hosts, clears BBC · stratechery. Most datelines are plain text: none general |
| promo · related box inside the body | ~12 | none for prose promos |
| trailing furniture after the body | ~13 | weak, risks `kept` |
| `<title>` differs from the headline | 5 | use the headline; changes what `title` means |
| single-`<br>` paragraphs | 1 | weak |
| `<noscript>` content dropped | 1 | keep it; "Enable JavaScript" notices then leak |
| forum layouts | 2 | undiagnosed |
| wiki chrome (`[edit]`, hatnotes, See also) | 4 | class tokens only |
| paged RFC inside `<pre>` | 1 | second code path |
| needs JS · CSS reorder | 5 | none |

Unruled, his: bylines as furniture · a list as ONE block · front pages out of scope · plain-text title = first row.
