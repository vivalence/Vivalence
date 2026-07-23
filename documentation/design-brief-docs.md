# Design brief — Vivalence Docs (whole site)

## 0. Mission

Take the Vivalence documentation site from *competent-but-generic* to a **top-tier, distinctive, precise docs experience** — the calibre of Stripe / Tailwind / Astro Starlight / Linear / the Rust Book, but with its own identity. Every surface is in scope: layout, the left nav tree, the right TOC, article typography, code blocks, the signature build-capture components, admonitions, tabs, breadcrumbs, backlinks, pager, the `/jdex` index, the homepage, search, color, motion, responsive, both themes.

The current implementation works and is coherent, but it's under-designed: ad-hoc spacing, no real type scale, a single flat accent, a broken sidebar number-column, and the site's *actual differentiators* (Johnny-Decimal numbering, tangle-1:1 build-capture, span traces) are rendered as plain boxes instead of being made to feel special. Fix the mechanics **and** raise the craft.

This is a **visual/UX task on a static site.** No backend, no content rewrites. You have wide latitude on the design language; §9 gives options, §10 the acceptance bar. A human does the final look-check.

---

## 1. What the site is

- **Astro 7 static docs, on Deno.** Hand-built theme — **no Starlight, no UI framework, no islands.** One layout renders every page. All styling is one inline `<style is:global>` in `Layout.astro`; all behaviour is one inline vanilla `<script is:inline>` (theme toggle, Pagefind init, heading anchors, tabs, copy buttons). The only bundled JS is the CodeMirror editor component.
- **Johnny-Decimal content model.** 3 levels: **Area** (decade `30–39`) → **Category** (`34`) → **Item** (page `34.01`). Numbers ARE the identity — slug, URL, and wikilink are all the number. Routes are flat-by-basename (`/34.01_modes-and-traits`). ~25 pages today, must scale to ~100 and to declared-but-empty areas/categories (*planned*).
- **The signature feature: build-capture-inline / tangle-1:1.** Doc code fences with `tangle=…` are written to disk at build; a capture runner executes each example and inlines its real output. `<Source>` shows the exact source, `<Example>` shows its captured stdout, `<Trace>` shows a captured span (a real runtime primitive) as a depth-nested tree, `<Editor>` is a live CodeMirror+vim playground. **This "the docs run the real system and show you the real output" story is the brand — design it like it matters.**
- **Identity:** Vivalence — an AI-era symbolic OS. Logo is the plasma "viket-chevron" (`public/vivalence-viket-logo-plasma.png`). Accent is purple. Voice: precise, technical, Emacs-hacker-meets-premium, numbered/systematic. Totems: *Less is More · Code is Data · Schema is God.* Let the design echo that: systematic, dense, calm, exact.

---

## 2. Files

**Primary (edit freely):**
- `documentation/src/layouts/Layout.astro` — the whole chrome: data prep, `<style is:global>` (tokens + every rule below), sidebar markup, TOC, breadcrumbs, connections, pager, inline `<script>`.

**Also in scope (small, restyle as needed):**
- `documentation/src/pages/jdex.astro` — the `/jdex` index page (its own `<style>` block).
- `documentation/src/pages/index.mdx` — the homepage content.
- `documentation/src/components/Example.astro`, `Source.astro`, `Trace.astro`, `Tabs.astro`, `Editor.astro` — the capture/interaction components (markup + they rely on classes defined in Layout's global CSS).

**Read for the data model (don't edit):** `src/lib/jdex.js`, `src/lib/tree.js` (shapes in §5).

**Do NOT touch:** `content/**` (the 25 pages — you may assume their markdown; don't rewrite them), `src/content.config.ts`, `astro.config.mjs`, `deno.jsonc`, `src/tangle.js`, `subsystems/**`, `registry/**`, `public/pagefind/**` (generated search index).

---

## 3. Cross-cutting systems — design these FIRST, then apply everywhere

### 3.1 Color tokens
Current (both themes, in `Layout.astro` `:root` and `:root[data-theme="dark"]`, mirrored under `@media(prefers-color-scheme:dark)`):
```css
:root {            --ink:#1b1b2b; --bg:#fbfbfd; --panel:#f4f4f8; --accent:#5b4bd6;
                   --muted:#6a6a80; --line:#e7e7f0; --code:#f0f0f6; --active:#ece9ff; }
[data-theme=dark] {--ink:#e9e9f2; --bg:#101019; --panel:#161624; --accent:#a99bff;
                   --muted:#8a8aa2; --line:#262638; --code:#1a1a2b; --active:#211d3a; }
```
Problems: only 8 tokens; a single accent; **semantic colors are hardcoded hex** scattered in rules (`#d99a00` warning, `#d9484b` danger, `#2faa6a` tip/note) — not tokenized, not theme-tuned, and reused ad hoc for trace verbs. 
Goal: a real token system — add `--accent-soft`/`--accent-strong`, tokenized semantic set (`--info/--warn/--danger/--ok` + their soft backgrounds), a 2–3 step surface ramp (`--bg` → `--panel` → `--panel-2`), and a dedicated `--code-bg`/`--code-border`. Every hardcoded hex in the CSS should become a token, tuned for **both** themes. Keep the purple identity; consider a second harmonizing hue only if it earns it.

### 3.2 Typography scale
Current: system-ui body at `16px/1.65`; `h1` 2rem; `h2` has **no explicit size**; sizes are magic rems everywhere (0.66–0.9rem). No modular scale, no rhythm system.
Goal: adopt a **named type scale** (e.g. a ~1.2 modular scale: h1/h2/h3/h4, body, small, micro) as tokens or utility classes, applied consistently across article + chrome. Monospace (`ui-monospace`) is load-bearing for all JD numbers, code, filenames, trace/log lines, breadcrumbs — treat mono as a first-class part of the identity, not an afterthought. Establish a clear type pairing: system-ui for prose, mono for "the machine" (numbers, code, captures).

### 3.3 Spacing & rhythm
Current: magic numbers everywhere (0.02rem … 6rem). No scale.
Goal: a small spacing scale (tokens or a documented step set) and consistent vertical rhythm. Article sections, chrome blocks, and list density should feel like one system, not per-element guesses.

### 3.4 Readable measure (IMPORTANT layout fix)
The outer `max-width:1200px` centering was removed (user wanted full width) — good — but now `article` has **no max measure**, so on a wide viewport prose lines run painfully long. Fix: cap the *prose* measure (~68–76ch) while letting **full-bleed elements break out** (code blocks, capture/trace panels, tables, diagrams) to a wider column. I.e. keep the chrome wide, keep prose readable. This is the classic docs "centered-measure with full-bleed code" pattern — implement it.

### 3.5 Motion, focus, a11y
Fold/hover/tab transitions should be subtle and consistent (one easing, ~120–160ms). Every interactive element needs a visible focus ring (keyboard a11y) — currently focus states are thin/absent. Check contrast in both themes (muted-on-panel especially). Respect `prefers-reduced-motion`.

### 3.6 Density modes (option to consider)
The user values density but also readability. Consider a comfortable default with tight, aligned rhythm. Optionally a compact toggle — but only if it doesn't bloat the build.

---

## 4. Surface-by-surface — current state, problems, goals

### A. Global layout / grid
Current: `.layout { display:grid; grid-template-columns:320px minmax(0,1fr) 240px; }` full-width; `.content { padding:2.5rem 2.5rem 6rem }`; sidebar sticky `--panel`, TOC sticky. Breakpoint `≤1000px` → single column, sidebar becomes off-canvas drawer (`#nav-toggle` checkbox + `.hamburger`), TOC hidden.
Problems: full-bleed with no prose measure (§3.4); 1000px is the only breakpoint (no tablet mid-state); left/right rails could be visually better tied to the content.
Goals: three-column that breathes; readable measure; a graceful mid-width state; keep sticky rails and the mobile drawer working.

### B. Left sidebar nav tree  *(the known-broken surface)*
Current DOM: `<details class="area" open>` → `<summary class="area-label">` (area number + name) → `.area-body` containing either bare `<a class="entry">` (single-item categories) or nested `<details class="category">` with a `<ul>` (multi-item categories). Fold via native `<details>` + a `▸` chevron that rotates.
**Problems (ranked):**
1. **Number column doesn't align across depths — the headline bug.** Accent jdex numbers (`31.01`, `34`, `34.01`) start at three different x-offsets because single-item entries, category headers, and category children each get different left padding, and the chevron sits *inside* the number's flex row on foldable rows only. The `34 modes` group visibly breaks the column vs its `30.01–36.01` siblings. **Fix: a fixed fold-gutter + a fixed number-gutter, so every `NN.NN` left-aligns in one column and every title in a second, at all depths.**
2. **1-item vs N-item categories render as two different shapes** (bare item vs bordered indented `ul`) → inconsistent hierarchy. Pick one coherent model.
3. `.category > ul` left-border rail collides with the full-width `.entry.active` pill (active child looks like it bleeds left).
4. Uneven density; fold state is ephemeral (resets every navigation — full page reloads), no auto-open of the active section, no active-trail marking.
Goals + structure options are detailed in §9. Non-negotiable: one aligned number column, uniform calm rhythm, active-trail highlight, auto-open current section, and (ideally) persisted fold state via `localStorage` (mirror the theme-toggle pattern).
Preserved facts: sidebar 320px; header cluster order = brand row + theme toggle → `▤ jdex index` link → **search box** → nav tree. EN-DASH (`–`, U+2013) in area keys (helpers split on it).

### C. Right "on this page" TOC
Current: `.toc` sticky, 240px, lists h2/h3 (`.toc li.d3` indents h3); muted, accent on hover.
Problems: plain; no active-heading highlight as you scroll; no visual connection to reading position.
Goals: keep it lightweight but add a **scroll-spy active state** (highlight the current section — a few lines of `IntersectionObserver` in the inline script), clear h2/h3 hierarchy, and don't let entries wrap (≥240px helped). Consider a thin progress indicator.

### D. Article typography (prose)
Current: `h1` 2rem tight; `h2` top-border + top-margin, no explicit size; `h3/h4` unstyled beyond scroll-margin; body 16/1.65; links inherit color (only accent in specific blocks); lists default; `blockquote` left-accent-border muted; heading `#` anchors fade in on hover.
Every content page opens with an **italic thesis line** right under the H1 (a house style — e.g. *"the DOM is a consumer of the dataspace…"*). Design this lede treatment deliberately.
Problems: heading scale is incomplete/ad-hoc; body links aren't visually distinct in prose; the italic lede has no dedicated styling; list/paragraph rhythm is default-browser-ish.
Goals: a full, consistent heading scale (§3.2); a proper **lede/dek** style for the italic opener; readable link styling in prose (underline/color that isn't noise); tuned list, paragraph, blockquote, table rhythm; the measure fix from §3.4.

### E. Code blocks  *(heavily used — the docs are code-first)*
Current: Shiki highlight; `pre` = `--code` bg, border, radius, scroll-x; inline `code` chip; `.code-filename` bar sits above a fence (radius top, negative margin to weld); `.astro-code .line.highlighted` = accent-tint line highlight (from `tangle`/meta ranges); hover-reveal `.copy` button; **`.tangled` badge** = `⟿ tangled → <path>` accent mono line under a tangled fence.
Problems: the filename bar / fence / copy / tangled-badge are separate ad-hoc pieces that don't read as one designed unit; the copy button is a bare text link; line-highlight is a flat tint; no language label; the "this fence was tangled to disk" story (a real differentiator) is a small dim line.
Goals: treat a code block as a **designed component**: optional filename/language header, integrated copy affordance, crisp line-highlight, and make the **tangled badge feel like a feature** ("this exact code was written to disk and executed"). Consistent radii/borders welding header+fence+badge into one object. Works in both themes with Shiki's palette.

### F. Admonitions
Current: `:::note/tip/warning/danger` (remark-directive) → `.admonition` card, left-accent-border, uppercase mono label; semantic colors hardcoded (`#d99a00`, `#d9484b`, `#2faa6a`).
Goals: tokenize the semantic colors (§3.1); give each type a subtle icon or glyph + a soft tinted background (not just a left border); consistent with the code-block/capture visual family.

### G. Tabs
Current: `Tabs.astro` — `data-tabs` container, `.tab-bar` buttons, `.tab-panel`s; first active; toggled by inline JS. Mono tab labels, accent underline on active.
Goals: refine the tab bar (active/hover/focus states, keyboard support), weld tab panels to their content (esp. when a panel holds a code fence — `.tab-panel pre` already squares the top-left corner), keep it framework-free.

### H. Capture components — the signature feature *(make these shine)*
- **`<Source name>`** → renders the exact `*.example.js` via Shiki (`?raw`). 
- **`<Example name>`** → `.capture` card: `.capture-head` (name + "stdout" channel) over `.log-line`s (captured console output); error lines in danger color.
- **`<Trace name>`** → `.trace` card: `.capture-head` (name + "span · N records") over `.trace-row`s, depth-indented, with a `.verb` chip (open/note/close/fault, semantic-colored) and JSON `.trace-data`. This visualizes a **real runtime `Span`** — a live primitive of the system.
- **`<Editor code>`** → CodeMirror 6 + vim mode live playground; `.editor-bar` shows "VIM · esc for normal mode".
Current: all are plain bordered mono boxes sharing `.capture-head`.
Problems: these are the site's *reason to exist* (the docs run the real system and show real output / real traces), but they look like generic terminal boxes. The Source→Example "tangle-1:1" pairing (shown code == executed code == shown output) isn't visually expressed as a pairing.
Goals: elevate this family into a **coherent, premium "living example" system**: a shared visual language for source/output/trace/editor; express the Source↔Example 1:1 relationship (e.g. paired/linked panels, a "▶ ran this" seam); make the **span trace** genuinely readable as a tree (depth guides, verb glyphs, timing); make the channel badges (`stdout` / `span`) meaningful. This is where to spend the most craft.

### I. Breadcrumbs + last-updated
Current: `.crumbs` mono muted line (area › category · title), `.updated` floated right (file mtime). Separators: `›` between levels, `·` before the title.
Goals: keep it lightweight; align the updated-date cleanly (float is fragile); ensure it reads as location, not clutter.

### J. Connections / backlinks
Current: `.connections` card at article end — "→ links to" and "← linked from" wikilink chips (accent, soft-accent bg). Computed from `[[wikilinks]]` across the corpus.
Goals: this graph-y feature is nice — design the chips + the two groups clearly; make outgoing vs incoming visually distinct; tie into the overall card language.

### K. Prev / next pager
Current: `.pager` flex, top-border, prev left / next right, shows `NN.NN Title`.
Goals: make it a satisfying end-of-page control (labels "Previous/Next", the number+title, hover); consistent with the card/link language.

### L. Header cluster (brand · theme · jdex · search)
Current: `.brand-row` (logo 26px + "vivalence docs" + theme toggle button ☾/☀), `▤ jdex index` link, `#search` (Pagefind UI), then nav. Theme toggle persists to `localStorage`; Pagefind inits if present.
Problems: the cluster is functional but plain; search is a valued feature (recently fixed) and must stay prominent and well-styled; the Pagefind UI is themed via `--pagefind-ui-*` vars but under-designed.
Goals: a crisp sidebar header — brand lockup, a good **search field** (cmd-K hint, focus state; Pagefind vars are already wired), theme toggle, jdex link. Search must remain in the header, obvious, keyboard-focusable (cmd/ctrl-K already bound).

### M. `/jdex` index page
Current: `jdex.astro` renders the whole JD map — every area → category → item, empties shown as *"— planned"*, reserved areas as *"reserved."* Its own small `<style>`.
Goals: make this a **beautiful, canonical index** — the "map of everything, including what's planned." It's a signature page (the JD system made visible). Give it real design: area cards or columns, clear planned-vs-live states, the numbering celebrated.

### N. Homepage (`index.mdx`)
Current: plain H1 + intro paragraph + grouped wikilink lists (about / architecture / repository & practice) + link to `/jdex`.
Goals: a proper **landing** — a strong hero (what Vivalence docs are), clear entry points (start-here, the pillars), a nod to the live-examples/JD system. Still content-driven MDX, but designed.

### O. Wikilinks (inline)
`[[34.02_trait-catalog]]` in prose → resolved links (remark plugin; no `|alias` support). 
Goals: style inline wikilinks so they're distinct from external links but not noisy; consistent with the connections chips.

---

## 5. Data model (for the nav + jdex)

`src/lib/jdex.js`: `AREAS` keyed by decade `{title,note}`; `CATEGORIES` keyed by category-number → name; helpers `decadeOf`, `areaKey(decade)→"30–39"`, `areaName(key)`, `areaNote(key)`, `categoryName(cat)`, `isReserved(decade)`.
`src/lib/tree.js`: `buildTree(pages) → { "30–39": { 34:[items…], 31:[item], … }, … }` (area key → category number → sorted items); `flatten(pages)`; `breadcrumb(jdex) → ["30–39 Architecture","34 modes","34.01"]`.
Layout hands the nav: `pages = [{slug,jdex,title,body,file}]`, `tree = buildTree(pages)`, `here = current pathname`. **Most categories have exactly one item** — the nav must handle 1-item and N-item categories with one consistent grammar.

---

## 6. What renders where (page anatomy)

Every doc page (via `[...slug].astro` → `Layout.astro`): sidebar (B) · breadcrumbs+updated (I) · article [lede + prose (D) + code (E) + admonitions (F) + tabs (G) + capture components (H) + tables] · connections (J) · pager (K) · right TOC (C). Plus `/` (N) and `/jdex` (M) as special pages.

---

## 7. The inline script (behaviours to preserve/extend)
Currently in one `<script is:inline>`: theme toggle (localStorage, paints ☾/☀), Pagefind UI init + cmd/ctrl-K focus, heading `#` anchor injection, tab switching, code copy buttons. New behaviours you add (scroll-spy TOC, persisted folds, auto-open active section, collapse-all) go here as **vanilla JS**, patterned on the existing code. No frameworks. Native `<details>` for folding.

---

## 8. Reference targets (calibrate the bar)
Stripe docs (density + code), Tailwind docs (nav + type), Astro Starlight (structure), Linear (restraint + motion), Rust Book / Svelte docs (readability). Steal principles, not pixels. The result must feel like *Vivalence* — systematic, numbered, mono-forward, purple, precise — not like a clone.

---

## 9. Structure & capability options — choose and commit

**Sidebar IA (the crux):**
- **Option A — flat items under foldable areas.** Areas fold; under each, all items in one aligned column; category shown only as a faint caption/tag (the number already encodes it). Densest, uniform, trivial alignment; loses category folding.
- **Option B — two-level fold, uniform rows.** Areas and categories both fold, even 1-item categories (so `31 map` folds to hold `31.01`, exactly like `34 modes`). Perfectly uniform/true-tree, but verbose + `31 map → 31.01 System Map` redundancy.
- **Option C — hybrid, done right.** Areas fold; multi-item categories get a de-emphasized non-folding header, but **children share the same number column as single-item entries** (fixes today's bug without a second indent level). Keeps category names where useful; must be disciplined about the shared column.
Recommendation to beat: **A or C**. Non-negotiable regardless: one aligned number column, uniform rhythm.

**Site-wide capabilities menu** (pick what earns its keep; note deferrals): aligned number+fold gutters · active-trail highlight · auto-open active section · persisted fold state · collapse-all · scroll-spy TOC · readable-measure-with-full-bleed · tokenized color+type+spacing systems · elevated capture/trace components · keyboard nav + focus rings · reduced-motion support · section counts · a real landing + a real jdex index.

---

## 10. Acceptance criteria

1. **Sidebar:** every jdex number aligns in one column, every title in a second, at all depths (verify on `30–39` which mixes single-item cats with the `34 modes` triple); areas (and categories per chosen option) fold via chevron; active page highlighted + ancestor trail marked + active section open on load; uniform density.
2. **Search preserved & styled** — the `#search` slot + Pagefind init stay in the sidebar header, obvious, cmd-K focusable.
3. **Readable measure** — prose capped to a comfortable measure; code/capture/tables/trace break out wider; chrome stays full-width. No painfully long lines on a 2000px screen.
4. **Systems applied** — color, type, spacing tokens defined once and used everywhere; **no stray hardcoded hex** in component rules; both light & dark tuned.
5. **Capture family elevated** — Source/Example/Trace/Editor read as one premium "living examples" system; the span trace is a legible tree; the tangle/1:1 story is visually expressed.
6. **All chrome refined & preserved** — TOC (with scroll-spy), breadcrumbs, connections, pager, admonitions, tabs, code blocks, wikilinks, `/jdex`, homepage — each visibly improved, none broken.
7. **Both themes** shine (toggle light/dark). **Responsive**: ≤1000px drawer works, plus a graceful mid-width state; TOC hides on mobile.
8. **A11y**: visible focus rings, sufficient contrast, `prefers-reduced-motion` honored.
9. **Build clean:** `cd documentation && deno task build` → **27 pages, exit 0**. **No authored code comments anywhere** (project rule — CSS/JS/markup ship comment-free). No abbreviations in any JS variable names you add.

---

## 11. Constraints (hard)
- **Self-contained**: all CSS in the one `<style is:global>` (plus jdex.astro's scoped block); all behaviour in the one inline `<script>` (+ the existing CodeMirror component). No new npm UI deps, no external stylesheets/fonts/CDN, no bundler plugins (Astro-on-Deno rejects them). The CodeMirror editor is the only bundled-JS component — leave its imports intact.
- **No authored comments** in shipped code. Firm.
- **No abbreviations** in JS identifiers (`category` not `cat`).
- **Native-first**: `<details>` for folds; vanilla JS + `localStorage` for enhancements (theme toggle is the pattern).
- **Don't regress**: the width fix (full-bleed chrome), the search (dev-served from `public/pagefind`), the JD structure, the EN-DASH area keys.
- Don't rewrite page content; design the containers/typography the content flows into.

---

## 12. Workflow
1. Read `Layout.astro` fully (data prep · the entire `<style>` · sidebar/TOC/breadcrumb/connections/pager markup · inline script). Read `jdex.astro`, `index.mdx`, and the 5 components. Read `jdex.js`/`tree.js` for shapes.
2. Design the **systems first** (§3: color, type, spacing, measure, motion), then apply them surface by surface (§4).
3. Commit to a sidebar IA option (§9). Implement.
4. `cd documentation && deno task build` → expect **27 pages, exit 0**. If Chrome automation is unavailable, sanity-grep the built CSS/markup (fold structure present, number-gutter CSS present, tokens defined, search slot intact).
5. Report: the design language chosen (color/type/spacing decisions), the sidebar option + why, the capability set implemented vs deferred, per-surface changes, and how you verified. Flag everything a human should eyeball at `deno task run` → `http://127.0.0.1:4321` (light + dark, wide + mobile).

Deliverables: edited `Layout.astro` (primary), plus `jdex.astro`, `index.mdx`, and the components as needed. Make the whole thing feel designed, systematic, and unmistakably Vivalence.
