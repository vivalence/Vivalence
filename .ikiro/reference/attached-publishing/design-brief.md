# design brief — the blog

A design pass over the blog mode `@commons/publisher/blog`: the writing desk first, the pressed site second.
Read it whole before the first edit.

## what it is

One person writes his blog in it. An essay is a `.md` or `.org` file under `source/` with front matter on top.
`/build` presses every source into a static page under `public/`. The site is served to strangers outside the login.

The desk is the editing surface. It is one Solid view, mounted in a shadow root inside anima, the vivalence client.
It holds a library of sources, a CodeMirror sheet, a live preview of the pressed page and an inspector for the front matter.
Its shape on screen is state in the buffer, so it comes back as it was left.

Today it works, and it looks like a developer built it. The pass makes it a writing tool someone loves to open.

## where you work

Never in the tree. A save under `commons/` is a deploy to his running instance. Work in a copy, show the diff, he lands it.

```sh
S=<your scratch directory>
cp -Rc /Users/finn/vivalence/code/vivalence $S/rig && rm -rf $S/rig/.git $S/rig/.jj $S/rig/.env*
mkdir -p $S/seat && cp -R ~/.viva/instances/localhost/mountpoint/mode_publisher_blog/source $S/seat/
cp ~/.viva/instances/localhost/mountpoint/mode_publisher_blog/site.json $S/seat/
cd $S/rig && HOME=$(mktemp -d) DENO_DIR=~/Library/Caches/deno \
  deno run -A --no-check --config deno.jsonc \
  .ikiro/reference/attached-publishing/desk.probe.js $S/rig $S/seat 4711 porcelain
```

- The probe boots a real runtime from the copy and copies his sources into it. It never writes to his instance.
- It serves the desk on `http://127.0.0.1:4711/` with the bundle the runtime would build.
- The last argument is a dapper theme: `northsea` (dark) · `porcelain` · `parchment` (light) · `datasette`.
- His screenshot of anima shows a light theme. Judge every screen in `porcelain` and in `northsea`.
- The bundle is built once at start. After an edit, kill the probe and start it again.
- Ports `:2501` and `:1794` are his. Bind only free ports.
- To see the narrow layout, shrink the desk's own box. It measures itself, not the window.

```js
document.getElementById("desk").style.width = "390px";
```

The suite must stay green. Run it after every pass:

```sh
cd $S/rig && NO_COLOR=1 HOME=$(mktemp -d) DENO_DIR=~/Library/Caches/deno \
  deno test -A --no-check commons/publishers/blog/tests/blog.test.js
# today: ok | 6 passed (38 steps)
```

## the files

```
commons/publishers/blog/
  blog.viva.js          the manifest; buffer = v.buffer({ data: Desk })
  schematics.js         Article · Site · Settings · Desk: the buffer's shape, with defaults
  buffer/Blog.jsx       the desk: state, the COMMANDS table, every panel, the shell
  buffer/editor.js      CodeMirror: theme, highlight, markups, compartments for the settings
  buffer/desk.css       the desk's whole stylesheet; the .kit-* rules at its end are shared kit
  aperture/index.js     the routes the desk calls: build · source/* · upload
  press.js              markdown and org into html; front matter apart and back (parted · joined)
  theme/index.js        the site's page templates: framed · essay · page · contents
  files/theme.css       the site's sheet, his own look, ported from his astro site
  tests/blog.test.js    the suite
```

## the rules

These are his. A change that breaks one is sent back.

1. **Colour, type, space and radius come from dapper tokens only**: `var(--plane-sunk)`, `var(--text-muted)`, `var(--signal-primary)`, `var(--size-space-sm)`, `var(--shape-radius-card)`, `var(--font-family-sans-text)` and the rest. A hex value in the desk is a defect. Read the names off `subsystems/dapper` or off the probe's `/theme.css`.
2. **The mode imports nothing outside its directory** except npm packages already there: `solid-js`, `@codemirror/*`, `@lezer/*`. Shared view code is copied in. Icons: copy the paths you need from `subsystems/drapes/Icon.jsx` (`ICONS`) into the mode. Never import drapes.
3. **The `.kit-*` rules at the end of `desk.css` are kit**, copied line for line from darkroom's `commons/editors/darkroom/buffer/desk.css` (a subset of it). Use them, never edit them. A class of your own never starts with `kit-`.
4. **What is on screen is state.** A panel, a width, a mode or a setting that should survive a reload is a key on `Desk` or `Settings` in `schematics.js`, with a `.default(...)`, a `.desc(...)` and an `.example(...)`. A new key updates the step "an empty buffer is a whole desk" in the suite. Transient things stay local signals: an open popover, the palette query, a drag in progress.
5. **Every action is one entry in `COMMANDS`** (`Blog.jsx`): `[label, chord, when, run]`. Keys, the palette and buttons all read it. A new button calls an entry; it never carries its own handler.
6. **The routes, `press.js` and `theme/index.js` are not part of the desk pass.** The desk is a client of them.
7. **Code style:**
   - no comments in source;
   - a line is at most 100 characters;
   - full words for names: `library`, not `lib`;
   - closures, no `this`, no classes;
   - never run `deno fmt` or prettier over a whole file.
8. **Narrow is first class.** Below 760px the docks are drawers and split falls back to one pane (`NARROW` in `Blog.jsx`). Every new piece is designed at 390px too. Touch targets are at least 36px there.

## the anatomy

Each region is listed with its class in `desk.css`.

- **titlebar** `.titlebar`: library toggle, title button (opens the palette), modes, inspector toggle, settings, save and publish/press.
- **library** `.dock.library`: filter, collapsible groups (faults · drafts · essays · pages), rows with a status dot, title, date and an unsaved mark, a new-source field.
- **seams** `.seam`: drag to resize the library, the inspector and the sheet's share of the middle; double-click resets.
- **sheet** `.writing`: a markup toolbar (`.tools`) with a heading crumb, then CodeMirror (`.sheet`).
- **preview** `.pressed`: a device bar (`.pressbar`: desktop · tablet · phone, follow, live link), then the page in an iframe on a stage (`.stage .page`).
- **inspector** `.dock.inspector`: four tabs.
  - post: the front-matter form, lead picture, path and move, save and press, remove.
  - media: upload and a picture grid.
  - outline: headings, the current one lit.
  - stats: counts.
- **status bar** `.status`: line and column, selection, words, minutes, saved or unsaved, the last press, faults.
- **popovers**: settings `.pop.settings`, palette `.veil > .pop.palette`.
- **modes** (`data-mode` on `.desk`):
  - write: sheet only;
  - split: sheet and page;
  - preview: page only;
  - focus: sheet only, chrome faded, Esc leaves.
- **narrow** `.desk.is-narrow`: drawers over a veil, the modes as a select, save alone in the titlebar.

States to design, each at wide and at 390px, in a dark and a light theme:

- nothing open (`.welcome`);
- a source open in each mode;
- unsaved;
- busy (pressing);
- a fault in the front matter (the post tab lists it);
- a build fault (the status bar);
- the remove confirmation;
- an empty outline;
- the media tab with no pictures;
- the palette with a query;
- settings open.

## what is weak now

These were seen in the walks. They are where the pass starts.

1. **Icons are unicode glyphs** (◧ ◨ ⚙ ⌁ ¹ ▣ ⌕ ☐). Their sizes and weights do not match and some are cryptic. Replace them with one icon set, copied from drapes `ICONS`, plus the few you draw in the same 16px grid and stroke.
2. **No hierarchy in the chrome.** Titlebar, toolbar, pressbar and status bar all wear the same mono text in the same muted colour. The title of what is being written does not lead.
3. **The writing surface does not feel like paper.** The measure, margins and spacing of the sheet should invite writing. The title is not shown on the sheet, only in the inspector. Consider a large title and subtitle at the head of the sheet, bound to the same front matter.
4. **The preview is a white page on a dark stage.** The device frames are a bare width change. In a light theme, check that the page still reads as a page.
5. **Dock show and hide jump.** Only the narrow drawers animate. Seams give no affordance until hovered.
6. **The inspector form is plain.**
   - Labels in caps code type.
   - The date is a text field.
   - The status is three chips with no meaning shown.
   - The lead picture is either a "choose" button or a full image.
7. **The palette lists everything flat.** No sections (sources · commands · settings), no recent sources, keys as raw glyphs.
8. **Focus mode only fades the chrome.** No fullscreen feel: no centred measure change, no hidden scrollbar, no quiet status.
9. **Unsaved and saved are weak signals.** A dot and a word in two places.
10. **Empty states are bare text.** Nothing open, no headings, no pictures.
11. **Narrow:**
    - the toolbar scrolls with no hint;
    - the status bar overflows;
    - the inspector actions wrap;
    - nothing was tested with touch.
12. **The light themes were never looked at.** Treat them as unseen.
13. **Four rules in `desk.css` wear the kit's name but are not kit:** `.kit-choice > button.go` (written twice) · `.kit-field.new` · `.kit-row .unsaved` (dead: the rows are `.row` now). Rename them out of `kit-` and drop the dead one.
14. **`.page` sets `background: white`**, a named colour, not a token.

## the site — second, and his

`files/theme.css` and the markup in `theme/index.js` are his own look. Its hex colours are his and not dapper's: the site is not the desk.

- Do not restyle it.
- Fix defects only, and list each one with a screenshot:
  - overflow at 390px;
  - code blocks (shiki, theme dracula);
  - footnotes;
  - katex;
  - images in figures;
  - the index list;
  - the neighbour links.
- Proposals for a new look are separate screenshots plus one sentence each. They are never applied.
- His own `source/theme.css`, if he writes one, shadows the package's sheet. Never touch that file.

## what you hand back

1. The diff of your copy against the tree, for `commons/publishers/blog/` only:

```sh
cd /Users/finn/vivalence/code/vivalence/commons/publishers
diff -ruN blog $S/rig/commons/publishers/blog
```

2. Screenshots of every state above.
   - Dark and light.
   - Wide and at 390px.
   - Named `<state>-<theme>-<width>.png`, in one directory.
3. The suite's result line from your copy.
4. One line per weak point above: what you did, or why not.
5. Every new key on `Desk` or `Settings`, with its default.

## done means

- [ ] The suite is green on the copy.
- [ ] No hex value in `buffer/`.
- [ ] No import from outside the mode except `solid-js`, `@codemirror/*` and `@lezer/*`.
- [ ] No comment added.
- [ ] No line over 100 characters outside the kit rules.
- [ ] Every `.kit-*` line equals its line in darkroom's `desk.css`.
- [ ] Every action is reachable from the palette.
- [ ] Every state is designed at 390px.
- [ ] Every screen was looked at in porcelain and in northsea.
- [ ] No console errors in the probe page.
- [ ] Every probe you started is stopped and every tab is closed.
