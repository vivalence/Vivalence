<!-- writer: agent · reference, unbudgeted · written 2026-10-05 against the working tree (a sibling was editing anima) · every claim cites file:line · LIVE vs DESIGNED (m79) marked -->
# tui — the terminal face of `viva`, for the designer of the ghost chrome

`viva` is the command-line client of vivalence, a fair-source, source-available language-learning OS. The repo calls it **ghost** (`systems/ghost`). Today it is a verb runner: one command in, one effect out, a few interactive screens on the way. Quest m79 (`.ikiro/quests/benched/m79-terminal-ghost.org`) turns it into a second **client** beside **anima**, the browser: a persistent frame, the **chrome**, around a chat **dock**, over the same lighthouse, terminals and threads anima uses. This file is what a designer needs to mock that chrome up without opening the code.

## contents

0. who this is for · how to read it · the glossary
1. the terminal as a medium — the constraints
2. the kit today — sheets, every component, one render each
3. ghost's screens today — every interactive or printed surface
4. the render ways — three today, two designed
5. anima's chrome — what the terminal must rhyme with
6. the designed ghost chrome — DESIGNED (m79), and what it leaves open
7. mapping anima → terminal — elements, colours, what does not translate
8. comparative chrome — Emacs, tmux, Neovim
9. the brief for the designer
10. sources — files read, commands run

---

## 0 · who this is for

A designer who has never seen the code and will produce text mockups of the ghost chrome at 80 and 120 columns, in a dark and a light theme. A developer can verify every sentence: each claim carries `path:line`, container-rooted.

How to read it:

- **LIVE** — in the tree on 2026-10-05; the render shown was captured from the real component (§10 says how).
- **DESIGNED (m79)** — written in the quest, not built. A render marked DESIGNED was captured from the quest's own source, copied into a scratch file, never from the tree.
- **QUESTIONED** — the tree and the quest do not decide it; the designer proposes.
- Renders are plain text. Colours are named beside them as the terminal's 16 ANSI names, read back from the escape codes the render emitted (`gray` is SGR 90, "bright black").
- The tree was live while this was read: a sibling session was editing `systems/anima/src/app/bones/pincer` and `panels/d`; their line numbers are the ones seen at the read.

### glossary

The house nouns. Use these words exactly; never a synonym ("pane" is not a terminal, "chat window" is not the dock).

- **instance** — one deployment record (`instance.viva.json`): its manifest, daemons (each with its `modes`), optionally `runtime.modes`; every other slot it inherits from the ledger recipe; `commons/instances/hello-world/instance.viva.json`. One per ghost process (m79 law, quest :206).
- **ledger** (`~/.viva`) — the machine's home: `locks · logs · registry · instances · sessions` plus `instances.json`, `environment.json`, `ledger.viva.json`; `systems/ghost/trajectories/ledger/index.js:11` (the scaffold), `.ikiro/world/ledger.md`.
- **runtime** — the server process an instance boots; ready when it prints `Status:RUNNING`; `systems/runtime/run.js` (`.ikiro/world/map.md`), serves `:2501`; itself a HOST at `/runtime/<slug>` (m81) that can seat modes (`runtime.modes`).
- **daemon** — a host inside the runtime at `/daemon/<slug>` that holds modes and their rows (one shared db, scoped by its slug); a row `systems/runtime/entities/Daemon.ts:11`.
- **mode** — one thing a host serves (a home, a game, a tool) at `<host>/mode/<type>/<slug>`, shaped by its traits; on a daemon or the runtime (`systems/runtime/gestalten/belt/host.js`); `systems/runtime/entities/Mode.ts:12` (`APPLICATION` · `HARNESSED` · `CONVERSATIONAL` …).
- **trait** — a named capability on a row: a `traits` list plus a `trait` config object; `subsystems/typology/gestalten/belt/traits.js:5` (`define`).
- **lighthouse** — the runtime's auth at `/lighthouse/…` (m80: no separate server) every client logs in against; `systems/runtime/lifecycle/runtime/aperture/lighthouse.js:4-12`; anima connects through `PUBLIC_VIVA_RUNTIME_REMOTE` (`systems/anima/src/app/+layout.svelte:28-31`).
- **identity** — the logged-in user, a runtime row `UserEntity` (`systems/runtime/entities/User.ts:32`) with a free `traits` list; `THEMED · HOMED` no longer exist, `DOCKED` lives on the terminal.
- **terminal** — a runtime row that seats ONE thread (and its buffer and dock) for a user: `user · daemon · thread · index · traits · trait`, `systems/runtime/entities/Terminal.ts:13-19`; anima's tab, `systems/anima/src/typology/entities/terminal.js:11`.
- **thread** — a daemon row binding a mode and a trait config, with a render phase `inert · manual · continuous · escort`; `systems/runtime/entities/Thread.ts:13-31`.
- **buffer** — a daemon row that IS one screen of a mode (`data · view · traits · trait`); `systems/runtime/entities/Buffer.ts:37`.
- **dock** — the chat surface of a `HARNESSED` mode, one per terminal: transcript, live turn, composer; `systems/anima/src/typology/stores/bridge/dock.js:7`, `systems/anima/src/app/panels/a/widgets/Dock.svelte:316`.
- **turn** — one message of a thread's transcript, `role` + `parts` (text, tool calls); `systems/runtime/entities/Turn.ts:45-47`.
- **activity** — a live server process (a hallucination) with a status machine and signal stdin; `systems/runtime/entities/Activity.ts:6-53`; its status → tone map `systems/anima/src/typology/entities/activity.js:42-52`.
- **home** — the user's home mode (the trait `HOMED` died with `Identity.ts` in m80; m81's home mode is designed, not landed); beef: /"home is an identity trait."/ (quest :31, F4 :219).
- **yap** — DESIGNED (m79): free text after `viva` that matches no command or reference; the root remainder `(.*)`, sent as a turn to home (quest :25-27, :159).
- **command** — a ghost verb on the trajectory, `noun/verb` (`instance/use`); `systems/ghost/trajectories/index.js:23-165`.
- **reference** — DESIGNED (m79): a mode slug or `home` opened as a literal verb at mount (`viva flashcards`), quest :156-163.
- **chrome** — three meanings, keep them apart: in sheets TODAY, `Chrome.jsx` = Background + Logo + children (`subsystems/sheets/components/Chrome.jsx:6-12`); in anima, zone 0, the application's own interface (`.ikiro/reference/design.md` §2); in m79, beef: /"i guess chrome might be how we name the custom interactive fullscreen components."/ (quest :35).
- **slot** — DESIGNED (m79): the region of the shell where an inline command paints; `Slot.jsx` (quest :1067) and the Dock's `slot` prop (quest :3052).
- **sheets** — the terminal UI kit, ink 5 + react 18; `subsystems/sheets/mod.jsx`.
- **dapper** — the design tokens: themes completed and emitted as CSS at build time; `subsystems/dapper/lib/emit.js:63`.
- **drapes** — the Svelte component kit anima's chrome is built from; `subsystems/drapes/mod.js`.
- **anima** — the browser client, SvelteKit on `:1794`; `systems/anima`.
- **ghost** — the CLI `viva`; `systems/ghost/mod.js`.
- **trajectory** — ghost's routing tree of verbs (a `Vector`) with five middlewares; `systems/ghost/mod.js:20-124`.
- **effect** — what a verb produces (`ctx.effect`); printed once, after the verb, by the render middleware; `systems/ghost/mod.js:12-18`, `:116-120`.
- **`--json`** — the effect as JSON on stdout, no screen at all; `systems/ghost/trajectories/index.js:11`, `systems/ghost/mod.js:116-117`.
- **`--buffer`** — render the verb inside the `Chrome` shell; `systems/ghost/trajectories/index.js:12`, `systems/ghost/mod.js:97-100`.

---

## 1 · the terminal as a medium

What a terminal is, as the kit meets it. Everything here binds the mockups.

### the grid

- A screen is a grid of character cells, `columns × rows`. No pixels, no sub-cell placement, one monospace font chosen by the user. A box edge, a rule, a gap is a whole cell.
- ink lays out at `stdout.columns`, or 80 when it cannot tell (`ink 5.2.1 build/ink.js:93`). A resize re-lays the live frame (`ink.js:77-86`). Three places read the width themselves, once, at render time, and never again: `subsystems/sheets/components/Table.jsx:9` (`columns - 2`), `systems/ghost/trajectories/ledger/Doctor.jsx:5` (`- 6`), `systems/ghost/trajectories/registry/Doctor.jsx:5` (`- 2`).
- Text wraps by default (`wrap = "wrap"`, `ink build/components/Text.js:7`). A long line breaks at the frame edge and its continuation starts at column 0, not under its column: `viva help` shows it on every row (§3, captured).
- Height: when the live frame is as tall as the terminal or taller, ink clears the whole screen and repaints every frame (`ink.js:121-122`). The design codemap names the trap: never `minHeight = stdout.rows` (`.ikiro/world/map.md`, sheets line). An inline frame must stay shorter than the window.

### colour

The kit names colours, it never states them. `subsystems/sheets/theme.js`, whole:

```js
// subsystems/sheets/theme.js
export const theme = {
  brand: "magenta",
  accent: "cyan",
  dim: "gray",
  ok: "green",
  warn: "yellow",
  bad: "red",
  name: "vivalence",
  short: "viva",
  tagline: "language learning OS",
  glyph: { mark: "✦", gutter: "│", active: "◆", done: "◇", pending: "○" },
};
```

- These are the terminal's 16 ANSI names. What "cyan" looks like is the user's terminal palette, not ours: Solarized cyan, Dracula cyan and Terminal.app cyan differ. `gray` is SGR 90 ("bright black", captured: `viva help` with colour forced prints `ESC[90m` before every valence).
- ink accepts more than names: `#rrggbb`, `ansi256(n)`, `rgb(r,g,b)` (`ink build/colorize.js:11-44`), through chalk, which downgrades to what it detects. Nothing in the tree passes a hex or an `ansi256` today; nothing reads `COLORTERM`, `FORCE_COLOR` or `NO_COLOR` for its own choice (grep over `systems subsystems` → only `NO_COLOR` carried into child envs, `systems/ghost/trajectories/instance/target.js:10`).
- 256 colours or truecolor would take: a dapper → terminal mapping (a hex per role per theme), a capability check (`COLORTERM=truecolor|24bit`, else 256, else 16), and a decision on what the 16-colour fallback is. QUESTIONED (§7).
- Background: ink 5 has NO box fill. `backgroundColor` exists on `Text` only (`ink build/components/Text.js:7`; `Box.d.ts` and `styles.d.ts` mention it 0 times). A painted region means every line padded to width with a background on its text. Nothing in sheets or ghost paints a background today (grep `backgroundColor` → 0): the user's terminal background IS the ground of every screen.
- In a pipe (no TTY) chalk emits no colour at all: `viva help | cat` is plain text (captured, §3).

### type attributes

`Text` takes `bold · dimColor · italic · underline · strikethrough · inverse` (`ink build/components/Text.js:7`). Used today: `bold` (headings, active labels), `dimColor` (table headers, `Table.jsx:45`; shadowed env voices, `ledger/Doctor.jsx:130`), `inverse` (the latched choice in `Confirm.jsx:21-22` and `Actions.jsx:19`). `italic`, `underline`, `strikethrough` are unused. Italic and dim render differently across terminals (some show dim as a colour shift, some ignore italic).

### boxes and glyphs

- Borders are named styles from `cli-boxes`: `single · double · round · bold · singleDouble · doubleSingle · classic · arrow` (read from the cached `cli-boxes/boxes.json`). The tree uses only `round`: `Banner.jsx:9`, `TextArea.jsx:12`, `systems/ghost/trajectories/instance/Init.jsx:131`. A border costs one cell on every side and is coloured by `borderColor`.
- The glyph vocabulary in use: `theme.glyph` above, plus `›` (cursor/prompt), `▌` (caret), `•` (list, mask), `◯ ◉` (multiselect), `○ ◐ ● ✕` (task states, `Tasks.jsx:4-9`), `✓ ✗` (doctor rows), `⋯` (shadowed value), `—` (empty), `↑↓ → ← ⏎` (key hints), `▸` (DESIGNED tool line). anima adds the four phase digrams `⚏ ⚎ ⚌ ⚍` (`systems/anima/src/app/bones/shoulder/widgets/Phase.svelte:9`).

### width hazards

- ink measures text with `string-width` (`ink build/output.js:2`): CJK ideographs and most emoji take 2 cells, combining marks 0. vivalence teaches languages; turns WILL carry Japanese, Chinese, accented Italian (precomposed `è` is 1 cell, `e` + combining grave is 1 cell but 2 code units).
- The kit pads with JavaScript string length, not cells: `Table.jsx:22,41`, `Effect.jsx:26`, `Search.jsx:92,99`, `Help.jsx:29,31`, `ledger/Doctor.jsx:125`. A CJK value in a column misaligns every column after it. LIVE defect, not a design choice.
- East-Asian "ambiguous" glyphs (`◐ ◯ ◉ ✦ ⏎` and others) are 1 cell in most Western setups and 2 in CJK locales or some fonts; a mockup that aligns columns after one of them is fragile.

### input

ink's `useInput` hands every key as `(input, key)`; `key` has exactly these flags (`ink build/hooks/use-input.js:47-66`):

| key flag | |
|---|---|
| `upArrow` `downArrow` `leftArrow` `rightArrow` | arrows |
| `pageUp` `pageDown` | |
| `return` | enter |
| `escape` | also sets `meta` |
| `tab` · `shift` | shift-tab is `tab` + `shift` |
| `backspace` · `delete` | |
| `ctrl` · `meta` | modifiers; `input` is the letter |

- No Home, End, Insert, function keys, no mouse, no scroll wheel. Everything a mockup puts on screen must be reachable from those keys or typed text.
- macOS sends DEL (0x7f) for backspace and ink reports it as `key.delete` (`ink build/parse-keypress.js:163-166`); every edit handler takes `key.backspace || key.delete` (`subsystems/sheets/components/TextInput.jsx:34`).
- There is no focus routing in the kit. ink has `useFocus` / `useFocusManager` (re-exported, `subsystems/sheets/mod.jsx:11-12`) but no component or verb uses them (grep → 0). Each component takes `isActive`/`focus`; EVERY active `useInput` hears EVERY key (quest :1051). Two live inputs on one screen both react unless one is told to stand down.
- ctrl-c: ink exits on ctrl-c by default (`exitOnCtrlC: true`, `ink build/render.js:14`) and every sheets `render` call passes no options (`subsystems/sheets/mod.jsx:98,119,134,156`). What the verb does after ink unmounts mid-`scroll.render` (its promise never settles) is QUESTIONED — it needs a TTY walk. Nothing in ghost traps `SIGINT` (grep: only the exit-code decoder `systems/ghost/trajectories/instance/run.js:4`). The m79 shell turns ink's ctrl-c off and gives it to the body (quest :1029, :1051).
- ink patches `console` while a frame is live (`patchConsole: true`, `ink build/render.js:15`): anything a verb or an in-process runtime logs prints above the frame. m79 measured that noise in its walks (quest `* deferred`, "an inline runtime's console taps").
- ink keeps ONE instance per stdout (`ink build/render.js:18`, `getInstance`): a second `render` while one is mounted re-renders into the same root.

### alternate screen vs inline scrollback

- Two ways a terminal program can own the screen: the **alternate screen** (`CSI ? 1049 h` on, `CSI ? 1049 l` off — what `less`, `vim`, `htop` use: the session's scrollback is untouched and comes back on exit) or **inline** (the frame is drawn at the prompt; what ink commits stays in scrollback).
- NO alternate-screen escape exists in the tree today. Commands run 2026-10-05:
  - `grep -rn '1049' subsystems/sheets` → no output, exit 1
  - `grep -rn 'x1b\|u001b' subsystems/sheets systems/ghost --include=*.js --include=*.jsx` → no output, exit 1
  - `grep -rn 'alt-screen' subsystems/sheets systems/ghost` → three COMMENTS only: `subsystems/sheets/mod.jsx:125`, `:142`, `systems/ghost/mod.js:115`. The quest calls the first one false (quest :98).
- Everything ghost draws today is inline. m79 fork F12 (quest :227): /alternate screen (`?1049h/l`, scrollback untouched) · inline (the transcript IS the scrollback)/, lean inline for the chat; DESIGNED (m79) `Fullscreen.jsx` is the one home of the escape pair (quest :1053-1064).
- ink's `Static` is append-only: what it prints goes ABOVE the live frame, once, and is never redrawn. Consequence for any inline chrome: there is no persistent top line. A head drawn first is pushed below every line `Static` commits (captured, §6).

### pipes, `--json`, and who may prompt

```js
// systems/ghost/mod.js:90
ctx.interactive = !flags.json && Deno.stdin.isTerminal() && Deno.stdout.isTerminal();
```

- `ctx.interactive` is ruled once; pickers and wizards read it (`mod.js:89-90`).
- Non-interactive `render` THROWS: `${nature}: needs a terminal — run it in one, or pass its inputs as parameters (viva help ${nature})` (`mod.js:104-108`).
- `emit` runs everywhere, uncoloured in a pipe; `--json` turns `emit` into a no-op and prints the effect as JSON instead (`mod.js:102`, `:116-117`).
- The picker in a pipe throws listing the candidates (`systems/ghost/belt/pick.js:23-28`); `instance/delete` without `--force` in a pipe throws (`systems/ghost/trajectories/instance/delete.js:48-50`).
- `--buffer` without a TTY crashes: captured `viva help instance/doctor --buffer < /dev/null` → the logo line, then ink's `ERROR Raw mode is not supported on the current process.stdin`, exit 1. The flag builds its shell before asking `ctx.interactive` (`mod.js:97-100`). m79 M3 fixes it (`own = … && ctx.interactive`, quest :1234).
- Flags must follow the verb today: `viva --json help instance/doctor` → `ghost: no handler for --json help instance/doctor` · `try: viva help`, exit 127 (captured); `viva help instance/doctor --json` works. DESIGNED (m79) M1 moves flags to the last segment of one grammar (quest :258).

### what the program cannot know

The terminal's background colour, its palette, its font, and whether glyphs are wide. Nothing in the tree asks (no query sequence, no `COLORTERM` read). Some terminals answer an OSC 11 background query; tmux, ssh hops and many emulators do not reliably. A design must read on both a dark and a light terminal without knowing which it is on (§7).

---

## 2 · the kit today — sheets

`@vivalence/sheets` = ink@5 + react@18 + cliffy, one ink instance for the whole program: consumers import `Box · Text · React · useInput` from `@vivalence/sheets`, never `ink` (`subsystems/sheets/mod.jsx:18-38`, `.ikiro/world/codemap/design.md:24`). Its TDD surface is `state/*.js`, pure `init` + `reduce` (`subsystems/sheets/tests/*.state.test.js`); `components/*.jsx` stay thin views.

### inventory

| component | file | props | keys | reducer | for |
|---|---|---|---|---|---|
| `TextInput` | `components/TextInput.jsx:5` | `value defaultValue onChange onSubmit done isDisabled focus placeholder prompt="› " mask` | ← → move · backspace/delete · enter submits · printable inserts | `state/text.js` | one-line entry |
| `PasswordInput` | `components/PasswordInput.jsx:4` | as TextInput | as TextInput | `state/text.js` | TextInput with `mask` (`•`) |
| `TextArea` | `components/TextArea.jsx:4` | `value onChange onSubmit focus placeholder cursorChar="▌" cursorColor="cyan" borderStyle="round" borderColor` | shift-enter newline · enter submits · backspace/delete · printable | none (controlled) | boxed multi-line entry; no caller in ghost |
| `Select` | `components/Select.jsx:10` | `items options onSelect onSubmit done isDisabled focus cursor="› " pad color="cyan"` | ↑↓ or k j · enter | `state/select.js` | one choice from a list |
| `MultiSelect` | `components/MultiSelect.jsx:10` | `options defaultValue onChange onSubmit done isDisabled focus color="cyan"` | ↑↓ or k j · space toggles · enter | `state/multiselect.js` | several choices; no caller in ghost |
| `Search` | `components/Search.jsx:10` | `rows keys facets columns query index height=12 label placeholder onSubmit onCancel buffer` | type · ← → caret · ↑↓ or ctrl-p ctrl-n · pgup pgdn · enter picks · esc cancels | `state/search.js` + `state/text.js` | the picker: a windowed filter over records with `key:value` facets |
| `Confirm` | `components/Confirm.jsx:4` | `label defaultChoice=true onSubmit done isDisabled focus` | ← → flip · y · n · enter | none | yes/no |
| `Actions` | `components/Actions.jsx:4` | `options active onAction` | ← → · enter | none | a row of buttons (the form's commit/skip) |
| `Field` | `components/Field.jsx:7` | `label hint width active children` | none | none | a labelled row with a gutter glyph; hint only under the active row |
| `Form` | `components/Form.jsx:7` | `pages actions done` | tab / ↓ next · shift-tab / ↑ prev (fields own the rest) | `state/form.js` | pages of fields + an actions row |
| `List` | `components/List.jsx:9` | `items bullet="•" color` | none | none | bullets; no caller in ghost |
| `Table` | `components/Table.jsx:18` | `rows columns width` | none | none | columns inferred, empty columns dropped, widest shrunk first, paths clipped from the head |
| `Effect` | `components/Effect.jsx:13` | `data` | none | none | the default print of any effect: key/value tree, arrays of flat rows as a `Table` |
| `JsonTree` | `components/JsonTree.jsx:8` | `data buffer` | ↑↓ · → / enter drill · ← back · esc (or ← at root) releases | none | walk any JSON; imported by ghost (`mod.js:3`), never rendered |
| `Tasks` | `components/Tasks.jsx:11` | `items: {label status detail}` | none | none | status list `pending ○ · running ◐ · done ● · failed ✕` |
| `Banner` | `components/Banner.jsx:6` | `variant=info·success·warning·error headline body nextSteps` | none | none | a round-bordered notice |
| `Logo` | `components/Logo.jsx:18` | `variant=word·mark·banner·(other)` | none | none | the wordmark |
| `Background` | `components/Background.jsx:4` | `padding=1 children` | none | none | a padded column, no fill |
| `Chrome` | `components/Chrome.jsx:6` | `children` | none | none | `Background` + `Logo` + children: the only "chrome" in code |

Also exported: `theme`, `BufferControl` (five hook lists `mount · render · tick · release · destroy`, `mod.jsx:65-91`), `view` (§4), `search` (the state module as a namespace, `mod.jsx:59`), `cliffy` (the dead predecessor's survivor, `subsystems/sheets/cliffy.js:1-8`), and ink's `Box · Newline · Spacer · Static · Text · Transform · useApp · useFocus · useFocusManager · useInput · useStdin · useStdout` plus React's hooks (`mod.jsx:18-38`).

The reducers, verified: `deno test` is a watcher here; the suite count recorded in the design codemap is `37 passed | 0 failed` (`.ikiro/world/codemap/design.md:25`, 09-28). This read did not re-run it.

### the theme, and what bypasses it

`theme.js` is quoted whole in §1. 23 lines of the components read `theme.*` (grep `theme\.` → 23). Fourteen literal `color="…"` attributes bypass it — `grep -rn 'color="' subsystems/sheets/components` → 14:

- `components/JsonTree.jsx:36` `cyan` · `:37` `gray` · `:42` `gray` (twice on the line) · `:46` `gray`
- `components/TextInput.jsx:44` `cyan` · `:47` `cyan`
- `components/Table.jsx:45` `gray` + `dimColor`
- `components/Tasks.jsx:20` `gray`
- `components/Banner.jsx:14` `gray`
- `components/Effect.jsx:21` `gray` · `:26` `cyan` · `:27` `gray` · `:40` `cyan` · `:41` `gray`

The grep counts 14 lines; there are 15 attributes (`JsonTree.jsx:42` holds two). Fifteen more literal names ride as defaults and expressions, outside that grep: `JsonTree.jsx:39`, `TextArea.jsx:11,27`, `Select.jsx:20`, `MultiSelect.jsx:18`, `Banner.jsx:4,7` (the whole variant palette `info cyan · success green · warning yellow · error red`), `TextInput.jsx:45`, `Effect.jsx:31,45` (`white` for depth-0 headings — the only `white` in the kit), `Tasks.jsx:5-8`, `Actions.jsx:19`. ghost's own screens add 45 more literal colour names (`grep -rnE '"(cyan|gray|magenta|green|yellow|red|white)"|color="' systems/ghost/trajectories --include=*.jsx` → 45). In practice the whole terminal palette is `magenta · cyan · gray · green · yellow · red · white` plus default ink.

### one render per component (LIVE, captured)

Each fence below is the component rendered by a scratch harness through ink's own `render` with a fake 80-column TTY (§10), the last frame, ANSI stripped; the colour line under it is read from the escape codes. Fixture data is mine; the paint is the component's.

```text
// subsystems/sheets/components/TextInput.jsx — placeholder · typed · isDisabled
› type a slug▌
› italian▌
› italian
```
Colours: `›` and `▌` cyan; the placeholder gray; typed text default. The inactive input drops the caret.

```text
// subsystems/sheets/components/PasswordInput.jsx — typed
› ••••••••▌
```
Colours: `›` `▌` cyan.

```text
// subsystems/sheets/components/TextArea.jsx — empty, then typed (full width: the box stretches to the frame)
╭──────────────────────────────────────────────────────────────────────────────╮
│ a sentence▌                                                                  │
╰──────────────────────────────────────────────────────────────────────────────╯
╭──────────────────────────────────────────────────────────────────────────────╮
│ what did i get wrong yesterday▌                                              │
╰──────────────────────────────────────────────────────────────────────────────╯
```
Colours: border default (no `borderColor`), placeholder gray, caret cyan.

```text
// subsystems/sheets/components/Select.jsx — after one ↓
  alpha
› beta
  gamma
  delta
```
Colours: the whole cursor row cyan.

```text
// subsystems/sheets/components/MultiSelect.jsx — "packages" preselected, cursor moved onto it
  ◯ env
› ◉ packages
  ◯ daemons
```
Colours: the cursor row cyan.

```text
// subsystems/sheets/components/Search.jsx — instance lens, empty query, opened on the live row (index 2)
instance › type to narrow▌
  hello-world  2026-10-01  /Users/you/.viva/instances/hello-world
  italian      2026-10-04  /Users/you/.viva/instances/italian
› localhost    2026-10-05  /Users/you/code/vivalence/commons/instances/localhost
  multiplayer  2026-09-28  /Users/you/.viva/instances/multiplayer
4/4  ·  slug:  ·  ↑↓ move  ⏎ pick  esc cancel
```
Colours: `instance ›`, `▌` and the whole cursor row cyan; placeholder, unselected `slug`/`updated` cells and the footer gray; the `mount` column default (the lens overrides its colour to none, `systems/ghost/belt/lens.js:42`). Narrowed to `ita` it shows one row and `1/4`; with no match it shows `  no match` in gray and `0/4`. The window holds `height = 12` rows centred on the cursor (`Search.jsx:17`, `state/search.js:34-39`).

```text
// subsystems/sheets/components/Confirm.jsx — default yes; then the long label instance/delete passes, default no
delete italian?  yes   no
delete italian — rm -rf /Users/you/.viva/instances/italian, 1          yes   no
sessions?
```
Colours: the chosen word `inverse` (`yes` in the first, `no` in the second). A long label wraps inside its own column and pushes the buttons to the right edge.

```text
// subsystems/sheets/components/Actions.jsx — active (first latched), then inactive
 commit   skip
 commit   skip
```
Colours: active — `commit` cyan + inverse, `skip` cyan; inactive — both gray.

```text
// subsystems/sheets/components/Field.jsx — active with hint, then inactive
◆ VIVA_RUNTIME_SERVE     › http://localhost:2501▌
    where the runtime listens
│ VIVA_RUNTIME_SERVE     › http://localhost:2501
```
Colours: active — `◆` cyan, label bold cyan, hint gray; inactive — `│` and label gray.

```text
// subsystems/sheets/components/Form.jsx — two fields, first active; then tab tab onto the actions row
◆ username › ▌
│ password ›
 commit   skip
│ username ›
│ password ›
 commit   skip
```
Colours: as Field and Actions. A page's `title` is never painted (`Form.jsx:22-45` reads only `fields`): the init wizard's group names (`addresses`, `keys`) never reach the screen.

```text
// subsystems/sheets/components/List.jsx
• env
• packages
• daemons
```

```text
// subsystems/sheets/components/Table.jsx — width 78, then the same rows at width 48
slug         mount                                                updated
hello-world  /Users/you/.viva/instances/hello-world               2026-10-01
italian      /Users/you/.viva/instances/italian                   2026-10-04
localhost    …ers/you/code/vivalence/commons/instances/localhost  2026-10-05
multiplayer  /Users/you/.viva/instances/multiplayer               2026-09-28
slug         mount                  updated
hello-world  …nstances/hello-world  2026-10-01
italian      …va/instances/italian  2026-10-04
localhost    …/instances/localhost  2026-10-05
multiplayer  …nstances/multiplayer  2026-09-28
```
Colours: header row gray + dim; cells default. Two spaces between columns; a path keeps its tail (`Table.jsx:34-40`); the floor per column is 6 (`Table.jsx:5`).

```text
// subsystems/sheets/components/Tasks.jsx — every status
● runtime pid 4242 · alive
◐ anima spawning…
○ .env
✕ auth/signup USERNAME_EXISTS
```
Colours: `●` green, `◐` cyan, `○` gray, `✕` red; labels default; details gray.

```text
// subsystems/sheets/components/Banner.jsx — info (the default), with next steps
╭──────────────────────────────────────────────────────────────────────────────╮
│ instance up                                                                  │
│ admin beef  ·  ••••••••                                                      │
│                                                                              │
│ next steps                                                                   │
│   1. enter to stop + exit                                                    │
╰──────────────────────────────────────────────────────────────────────────────╯
```
Colours: border and headline (bold) take the variant — info cyan, success green, warning yellow, error red (all four captured); "next steps" gray; body default.

```text
// subsystems/sheets/components/Logo.jsx — word (default) · mark · banner · any other variant
✦ vivalence
✦
✦ V I V A  L E N C E
language learning OS
✦ vivalence
language learning OS
```
Colours: `✦` and `viva` bold magenta, `lence` bold cyan; banner `✦ V I V A` bold magenta, `L E N C E` bold cyan; tagline gray.

```text
// subsystems/sheets/components/Background.jsx — padding 1 around one line
(blank row)
 content
```
A padded column; no fill, no border.

```text
// subsystems/sheets/components/Chrome.jsx — around one line
(blank row)
 ✦ vivalence
 content
```
Colours: the Logo's.

```text
// subsystems/sheets/components/JsonTree.jsx — root, then enter on "manifest"
/
› manifest (2)
  daemons (1)
  clients (1)
  lock :: null
↑↓ move · → enter · ← back · esc exit
/manifest
› slug :: "localhost"
  owner :: "@commons"
↑↓ move · → enter · ← back · esc exit
```
Colours: path bold cyan; cursor row cyan; counts, leaf previews and the hint gray.

`Effect` is shown in §3, where every verb uses it.

---

## 3 · ghost's screens today

ghost's whole interactive surface. Every screen is inline: drawn at the prompt, its last frame left in scrollback. Each entry: the line that triggers it · a render · keys · exit · file.

### help — the list

- Trigger: `viva` (no argument becomes `help`, `systems/ghost/mod.js:128`), `viva help`, `viva help <prefix>`, `viva --help` (`mod.js:129`).
- File: `systems/ghost/trajectories/Help.jsx:9-44` via `systems/ghost/trajectories/index.js:150-165` (`emit`, one frame).
- Keys: none. Exit 0.
- Layout law: rows group by the first segment (`Help.jsx:12-17`); nature padded to 24, params to 20 (`Help.jsx:29-31`); the valence wraps to column 0.

Captured from the real binary, `deno run -A systems/ghost/mod.js help` in a non-TTY shell (80 columns, no colour):

```text
// systems/ghost/trajectories/Help.jsx — viva help, real run, 80 columns
viva

ledger
  ledger/init              [path]               machine first-run — pick +
persist the ledger home, scaffold locks/logs/registry/instances
  ledger/doctor                                 ledger report card — every organ
 of the ledger home with its count and anomalies, then the environment strata

registry
  registry/doctor                               registry report card — the
record against the store and what the taps supply: stale locations, untapped
residents, the mode census by owner
  registry/list                                 every tapped package — mount,
the owner it declares, how many modes it carries, and its identifier
  registry/tap             [source] [target]    tap a package — record a
location; a remote source clones into the store (or target)
  registry/untap           [location]           untap a package — record removal
 only, the store keeps the working copy
  registry/bootstrap       [destination] [source] bootstrap a package — a bare
manifest, or a clone of another package renamed to the destination; the result
is tapped

instances
  instances/tap            [path] [--slug=<slug>] adopt a hand-placed instance
dir into the record — the record is the identity authority; --slug=<slug>
required, the path is a PATH (./name, never a bare slug)
  instances/list                                every instance on the shelf —
slug, mount, valence, and which are running

instance
  instance/use             [token] [--ledger]   select this shell's instance
(VIVA_PROCESS_ID session) — a bare slug resolves against the ledger, an
ambiguous or missing one opens the picker; bare use in a pipe prints current +
provenance; trailing segments chain under /instance (instance/use italian run)
  instance/create          [source] [target] [--use] [--init] [--slug=<slug>]
create an instance from a source — a bare slug resolves against the registry, an
 ambiguous or missing one opens the picker; no target lands it in
<ledger>/instances/<slug>
  instance/init            [username] [password] instance first-run — seed .env;
 then the wizard (or <user> <pass>) boots, signs up the admin, tears down
  instance/run             [process] [--logged] run the mounted instance
attached (foreground) — exit 1 iff a child exits non-zero; --logged sends their
output to <ledger>/logs/<slug>/
  instance/start           [process]            start the mounted instance
detached — a supervisor ghost runs it logged (instance/run --logged) and holds
the lock
  instance/stop                                 stop the mounted instance —
SIGTERM its supervisor, wait for the lock to clear
  instance/delete          [target] [--force]   remove an instance from this
machine — record, dead locks, logs, the sessions that selected it, and the dir
when it lives on the shelf (a tapped dir stays); refuses while running; asks
unless --force
  instance/rename          [target] [next]      rename an instance — record key,
 logs, the sessions that selected it, and the dir when it lives on the shelf (a
tapped dir stays); refuses while running
  instance/lighthouse      [action] [username] [password] signup or login
against the mounted instance's lighthouse
  instance/doctor          [target] [filter]    instance report card — manifest,
 services, locks

help
  help                     [filter]             every nature with its params and
 valence; a prefix narrows, an exact nature details

flags  --json  --buffer  --help  --verbose  --env=<path>  --ledger=<path>
--repository=<path>  --registry=<path>  --instance=<slug|path>
--mountpoint=<path>
viva help <prefix> narrows; an exact nature shows its params
```

Colours (from the 120-column capture through the harness, same component): `viva` and group nouns bold; natures cyan; params magenta; valences gray; the flags footer and the last line gray. At 120 columns the same wrap happens one valence later — the layout has no valence column, it has a valence tail.

`viva help nosuch` → `viva` · `nothing matches` (gray) · the flags footer, exit 0 (captured).

### help — the detail

- Trigger: `viva help <exact nature>` or `viva <nature> --help` (`mod.js:132-138`).
- File: `systems/ghost/trajectories/Help.jsx:46-69`.

```text
// systems/ghost/trajectories/Help.jsx — viva help instance/doctor, real run, 80 columns
viva instance/doctor [target] [filter]
instance report card — manifest, services, locks

  target       slug or path (defaults to the mounted instance)
  filter       narrow the env table — a substring, or a facet: group:keys ·
verdict:REQUIRED · key:NLP

also  --json  --buffer  --help  --verbose  --env=<path>  --ledger=<path>
--repository=<path>  --registry=<path>  --instance=<slug|path>
--mountpoint=<path>
```

Colours: `viva instance/doctor` bold cyan; params magenta; valence and descriptions gray. A value-carrying flag shows its shape and no description (`--slug=<slug>` in the `instance/create` capture, `Help.jsx:60`).

`--json` prints the same census as data: `{ "commands": [{ "nature", "valence", "params": [{ "name", "type", "description" }] }], "flags": [...] }` (captured, `viva help instance/doctor --json`).

### the default print — `Effect`

- Trigger: any verb that sets an effect and paints nothing itself (`instance/use`, `instance/doctor`, `instance/create`, `registry/list`, `instances/list` …): `systems/ghost/mod.js:118-119`.
- File: `subsystems/sheets/components/Effect.jsx:13-53`.
- Law: a key column of 30 cells (minus 2 per depth, `Effect.jsx:26`); a nested object is a bold heading (white at depth 0) with a blank line above; an array of more than one flat object is a `Table` (`Effect.jsx:8-11`); a single-row array prints as a numbered block; empty prints `—`.
- Errors never reach `Effect`: an effect `{ error }` or a throw leaves through the one exit, `ghost: <message>` on stderr, exit 1; no handler → exit 127 (`mod.js:143-154`). Captured: `viva bogus/verb` → `ghost: no handler for bogus/verb` · `try: viva help`, exit 127.

```text
// subsystems/sheets/components/Effect.jsx — an instance/doctor-shaped effect (fixture shaped after systems/ghost/trajectories/instance/doctor.js:75-104), 80 columns
mount                          /Users/you/.viva/instances/localhost

manifest
  owner                        @commons
  type                         instance
  slug                         localhost
  version                      0.0.1
runtime                        runtime
ledger                         null

inherited
  —
clients                        anima
mountpoint                     /Users/you/.viva/instances/localhost/mountpoint

daemons
  hello
    mountpoint                 daemon_hello
    chaosmonkey/oracle         mode_chaosmonkey_oracle

services
  lighthouse                   service_lighthouse

env
!  key                        value                  stratum
!  VIVA_RUNTIME_SERVE         http://localhost:2501  instan
—  VIVA_ANIMA_SERVE           http://localhost:1794  instan
!  SECRET_VIVA_ANTHROPIC_KEY  —                      —

problems
  0
    !                          !
    key                        SECRET_VIVA_ANTHROPIC_KEY
    at                         daemon/hello
    verdict                    REQUIRED
    reason                     blank
faults                         —

dormant
  —
lock                           null
```

Colours: keys cyan; values gray; depth-0 headings bold white; the table header gray + dim; table cells default. Nothing marks a problem: the `!` column and `REQUIRED` are the same gray as every other value.

The real `viva instance/doctor` was NOT run: `instance/*` verbs are off limits for this read (they read the ledger, whose lock reads reap processes). The fixture follows the effect's own shape.

### the picker — `pick` + `Search`

- Trigger: `viva instance/use` (bare, no token, `systems/ghost/trajectories/instance/use.js:20-23`); `viva instance/use <ambiguous>` and any verb that takes a slug through `locate` (`systems/ghost/trajectories/instance/target.js:19`); `viva instance/create` with no or an ambiguous source (`systems/ghost/trajectories/instance/create.js:12`).
- Law: one match answers without a frame; none returns null; many open `Search` preset with what you typed, `/` read as spaces (`systems/ghost/belt/pick.js:11-20`); a pipe throws listing the candidates (`pick.js:23-28`).
- Lenses: instances — columns `slug · updated · mount`, opened on the selected row (`systems/ghost/belt/lens.js:28-45`); modes — `owner · type · slug`, facets `owner: type:` (`lens.js:7-26`).
- Keys: type to narrow · ↑↓ / ctrl-p ctrl-n · pgup pgdn · enter picks · esc → `{ aborted: true }` (`Search.jsx:35-51`).
- File: `systems/ghost/belt/pick.js:30`, `subsystems/sheets/components/Search.jsx`.

The instances lens is the `Search` capture in §2. The modes lens, as `instance/create` opens it with no source:

```text
// subsystems/sheets/components/Search.jsx — modes lens, type "instance" (fixture rows)
instance › type to narrow▌
› @commons    hello-world
  @commons    localhost
  @education  italian
3/3  ·  owner: type:  ·  ↑↓ move  ⏎ pick  esc cancel
```

Colours: as §2.

### instance/init — the wizard

- Trigger: `viva instance/init` in a TTY (`systems/ghost/trajectories/instance/init.js:147-150`); `viva instance/create … --init`. In a pipe or with `<username> <password>` it answers an effect instead (`init.js:112-136`).
- File: `systems/ghost/trajectories/instance/Init.jsx`.
- Phases: `fill → boot → create → install → ready`, or `boot → failed` (`Init.jsx:19`, `:110-125`). `fill` only when the instance's `.env` owes keys (`init.js:91-95`).
- Frame: a `Background`, a round border in `theme.brand` (magenta) padded 2×1, a head row with the Logo left and the phase title right in gray, the phase body, a gray hint line (`Init.jsx:127-224`).
- Keys: fill/create — ↑↓/tab move · type · enter next · ←→ on the actions row, `commit` or `skip`; ready/failed — enter or esc tears the booted processes down and releases (`Init.jsx:51-61`).
- Two live defects visible in the renders: `<Logo instance="banner" />` (`Init.jsx:137`) and `<Banner instance="success" … />` (`Init.jsx:212`) pass a prop the components do not read (they read `variant`, `Logo.jsx:18`, `Banner.jsx:6`): the head shows the word mark, not the banner, and the "instance up" banner is cyan (info), not green.

Every phase, captured with fixture callbacks (`boot`, `signup` faked, keys sent through a fake stdin):

```text
// systems/ghost/trajectories/instance/Init.jsx — fill, page 1 of 2
(blank row)
 ╭────────────────────────────────────────────────────────────────────────────╮
 │                                                                            │
 │  ✦ vivalence                                                  environment  │
 │                                                                            │
 │  ◆ VIVA_RUNTIME_SERVE     › http://localhost:2501▌                         │
 │      where the runtime listens                                             │
 │  │ VIVA_LIGHTHOUSE_REMOTE › http://localhost:2503                          │
 │   commit   skip                                                            │
 │                                                                            │
 │  ↑↓/tab move · type · enter next · ←→ action                               │
 │                                                                            │
 ╰────────────────────────────────────────────────────────────────────────────╯
```
Colours: border magenta; Logo magenta/cyan; title, hint, inactive rows gray; active field cyan (label bold). Page 2 (after tab past page 1's actions) replaces the fields with `◆ SECRET_VIVA_ANTHROPIC_KEY › ▌` and its hint; a `SECRET_` key gets a `PasswordInput` (`Init.jsx:182`). The page title (`addresses`, `keys`) is never shown.

```text
// systems/ghost/trajectories/instance/Init.jsx — boot
 │  ✦ vivalence                                                      booting  │
 │                                                                            │
 │  ◐ runtime spawning…                                                       │
 │  ◐ anima spawning…                                                         │
 │                                                                            │
 │  runtime  [migrator] applied 0                                             │
 │  runtime  serve http://localhost:2501                                      │
 │  runtime  Status:RUNNING                                                   │
 │  anima  VITE v6 ready in 812 ms                                            │
 │  anima  Local: http://localhost:1794/                                      │
 │                                                                            │
 │  starting processes…                                                       │
```
Colours: `◐` cyan; the log tail (last 13 lines, `Init.jsx:37`) gray. (Border rows omitted here and below: the same as fill.)

```text
// systems/ghost/trajectories/instance/Init.jsx — failed
 │  ✦ vivalence                                                  boot failed  │
 │                                                                            │
 │  ✕ runtime exited (code 1)                                                 │
 │                                                                            │
 │  runtime  [instance] SECRET_VIVA_ANTHROPIC_KEY empty                       │
 │  runtime  error: listen EADDRINUSE :2501                                   │
 │                                                                            │
 │  runtime exited before Status:RUNNING (code 1)                             │
 │                                                                            │
 │  enter → exit 1                                                            │
```
Colours: `✕` and the fault line red; tail and detail gray.

```text
// systems/ghost/trajectories/instance/Init.jsx — create (admin)
 │  ✦ vivalence                                                 create admin  │
 │                                                                            │
 │  ◆ username › ▌                                                            │
 │  │ password ›                                                              │
 │   commit   skip                                                            │
 │                                                                            │
 │  ↑↓/tab move · type · enter next · ←→ action                               │
```

```text
// systems/ghost/trajectories/instance/Init.jsx — install (signup pending)
 │  ✦ vivalence                                                   installing  │
 │                                                                            │
 │  ◐ auth/signup beef                                                        │
 │                                                                            │
 │  creating user…                                                            │
```

```text
// systems/ghost/trajectories/instance/Init.jsx — ready
 │  ✦ vivalence                                                        ready  │
 │                                                                            │
 │  ╭──────────────────────────────────────────────────────────────────────╮  │
 │  │ instance up                                                          │  │
 │  │ admin beef  ·  ••••••••                                              │  │
 │  │                                                                      │  │
 │  │ next steps                                                           │  │
 │  │   1. enter to stop + exit                                            │  │
 │  ╰──────────────────────────────────────────────────────────────────────╯  │
 │                                                                            │
 │  ● auth/signup CREATED  01JB8Z4K2M                                         │
 │  ● runtime pid 40211 · alive                                               │
 │  ● anima pid 40212 · alive                                                 │
 │                                                                            │
 │  enter → stop + exit                                                       │
```
Colours: inner banner cyan (the defect above), `●` green, details gray. The box inside a box is the deepest nesting ghost draws today.

### ledger/init — the narrative wizard

- Trigger: `viva ledger/init` in a TTY, no path (`systems/ghost/trajectories/ledger/index.js:36-47`).
- File: `systems/ghost/trajectories/ledger/Init.jsx`.
- Phases `how → where → (manual)`; keys: ↑↓ enter on the select, typing + enter on the path, enter/esc on the manual line (`Init.jsx:12-22`). No frame, no logo.

```text
// systems/ghost/trajectories/ledger/Init.jsx — how · where (after enter on .config) · manual (after ↓ enter enter)
How is vivalence(viva) embedded?
› .config
  manual
  abort
where does $viva live? $VIVA_LEDGER_MOUNT
› /Users/you/.viva▌
add this to your shell rc (.bashrc / .zshrc):
export VIVA_LEDGER_MOUNT="/Users/you/.viva"
enter → done
```
Colours: questions bold; `$VIVA_LEDGER_MOUNT` bold gray; cursor row and the export line cyan; `enter → done` gray.

### the two Doctors

- Trigger: `viva ledger/doctor` (`systems/ghost/trajectories/ledger/index.js:96-161`), `viva registry/doctor` (`systems/ghost/trajectories/registry/index.js:52-98`). Both `emit` one frame; keys none; exit 0.
- `instance/doctor` has no Doctor component: it prints through `Effect` (above).
- Not run for real: `ledger/doctor` pings every session's pid and deletes dead session files as it reads (`ledger/index.js:180-202`) — a read with side effects. Fixture reports below follow the reports' shapes.

```text
// systems/ghost/trajectories/ledger/Doctor.jsx — fixture report, 80 columns
viva ledger/doctor

✓ ledger       /Users/you/.viva
  .env            present       2 vars · 1 secrets · 1 blank
  ledger.viva.js  present       ledger · runtime lighthouse
    runtime       @viva/runtime/runtime · serve :2501
    lighthouse    @commons/lighthouse/multiplayer
  registry.json   3 tapped      1 pinned · 2 store · 1 stale  → registry/doctor
    ✗ gone-pkg  gone — viva registry/untap
  registry/       2 resident    1 untapped
    ○ assembly  untapped — viva registry/tap
  instances.json  3 recorded
    slug       valence           mount             updated     flags
    localhost  one identity, in  —                 2026-10-05  —
    italian    —                 …ou/code/italian  2026-10-04  —
    old        —                 —                 —           orphan — tap it
  instances/      2 shelved     1 orphan · 0 dangling · 0 shadowed
  locks/          1 running
    instance   pid    status  processes                  started
    localhost  51200  ALIVE   runtime=51201 anima=51202  2026-10-05T09:13:00Z
  sessions/       1 shells
    shell  instance   VIVA_INSTANCE_MOUNT
    48812  localhost  /Users/you/.viva/instances/localhost
  logs/           1 files
    name                   size   mtime
    localhost/runtime.log  18234  2026-10-05T09:20:00.000Z

✓ repository   /Users/you/code/vivalence
✓ instance     /Users/you/.viva/instances/localhost
  ✗ mountpoint   —

environment (2 vars · os › ledger › session › cwd › flag)
VIVA_LEDGER_MOUNT              os        /Users/you/.viva
VIVA_INSTANCE_MOUNT            session   /Users/you/.viva/instances/localhost
                               ⋯ ledger    /Users/you/.viva/instances/italian
```
Colours: title and `environment` bold; a present home `✓` + name green (name bold), absent `✗` red; organ names cyan; a note yellow when it warns, else gray; `→ registry/doctor` and table headers gray + dim; stale rows red, untapped rows yellow; strata magenta; shadowed voices gray + dim. The doctor is the one screen that already speaks in signal colours: green ok, yellow warn, red bad.

```text
// systems/ghost/trajectories/registry/Doctor.jsx — fixture report, 80 columns
viva registry/doctor

record    3 tapped · 1 stale              /Users/you/.viva/registry.json
  ✗ gone-pkg  gone — viva registry/untap
store     2 resident · 1 untapped         /Users/you/.viva/registry
  ○ assembly  untapped — viva registry/tap
pensieve  9 modes · 4 types · 2 owners
integrity 1 faulted
  ✗ education/modes/game/dojo
      export 'app' is not one of the twelve names

@education      6 modes  /Users/you/.viva/registry/education
  home           aprende
  game           dojo  flashcards  riddler
  tool           help  lexicon

@chess          3 modes  /Users/you/code/chess
  board          play  puzzles
  game           flashcards
```
Colours: title bold; line names cyan; warning notes yellow; faults red; paths gray; owners bold cyan.

### instance/delete — the Confirm

- Trigger: `viva instance/delete [target]` in a TTY without `--force` (`systems/ghost/trajectories/instance/delete.js:47-61`).
- Label: `delete <slug> — rm -rf <mount>, N sessions?` for a shelved instance, `unrecord <slug> — files at <mount> stay, N sessions?` for a tapped one (`delete.js:52-54`); default **no**.
- Keys: ← → · y · n · enter. Exit: the effect `{ aborted: true, … }` or `{ deleted, … }`.

```text
// subsystems/sheets/components/Confirm.jsx — as instance/delete paints it (fixture slug), 80 columns
delete italian — rm -rf /Users/you/.viva/instances/italian, 1          yes   no
sessions?
```
Colours: `no` inverse. The only destructive prompt in ghost has no red, no warning glyph.

### `--buffer` — the only Chrome today

- Trigger: any verb with `--buffer`, e.g. `viva instance/doctor --buffer` (`systems/ghost/mod.js:97-100`).
- What happens: `view.buffer.shell()` mounts `<Chrome>` with an empty slot (`subsystems/sheets/mod.jsx:144-168`); `hijack` reroutes the verb's `emit`/`render` into that slot (`mod.jsx:171-194`); the default `Effect` paints into it; the frame holds until **esc or return** (`mod.jsx:150-152`), then unmounts (`systems/ghost/mod.js:115`, `:122`).
- It is inline like everything else; "alt-screen" in its comments is false (§1).

```text
// subsystems/sheets/components/Chrome.jsx — wrapping the doctor's Effect (fixture), 80 columns
(blank row)
 ✦ vivalence
 mount                          /Users/you/.viva/instances/localhost

 manifest
   owner                        @commons
   type                         instance
   …                            (the Effect above, indented one cell)
 lock                           null
```
Colours: Logo bold magenta + cyan, then the Effect's.

**What "chrome" means in code today**: thirteen lines.

```jsx
// subsystems/sheets/components/Chrome.jsx
import React from "react";
import { Background } from "./Background.jsx";
import { Logo } from "./Logo.jsx";

// chrome for view.buffer.render — bg + logo. Field/video bg later.
export function Chrome({ children }) {
  return (
    <Background>
      <Logo />
      {children}
    </Background>
  );
}
```

A one-cell padding and a word mark. No status, no input line, no hint row, no border. Everything the designer draws beyond that is new.

### dead surfaces

- `systems/ghost/trajectories/sheets/text-select-a.js` · `text-select-b.js`: two `Select` demos, exported from `trajectories/sheets/index.js:1-2`, imported by nothing (grep). Not reachable from `viva`.
- `JsonTree`: imported at `systems/ghost/mod.js:3`, never rendered; the `--tree` flag its comment names (`mod.js:84`) does not exist in `flags` (`trajectories/index.js:10-16`).

---

## 4 · the render ways

### LIVE — three surfaces of `view` (`subsystems/sheets/mod.jsx:93-195`)

```jsx
// subsystems/sheets/mod.jsx:93
export const view = {
  scroll: {
    emit(data, control, Component) { /* <Static> one frame, unmount next tick */ },
    render(data, control, Component) { /* inline, resolves on buffer.release(opts) */ },
  },
  buffer: {
    render(data, control, Component) { /* the same, wrapped in <Chrome>; no caller */ },
    shell() { /* <Chrome>{slot}</Chrome>, mount(child) swaps the slot, untilExit on esc/return */ },
  },
  hijack(shell) { /* scroll.* paints into shell.mount(...) */ },
};
```

- `scroll.emit` — one frame into scrollback through `Static`, fire-and-forget (`mod.jsx:96-109`). Callers: help (`trajectories/index.js:163`), ledger Doctor (`ledger/index.js:160`), registry Doctor (`registry/index.js:97`), the default Effect (`systems/ghost/mod.js:119`).
- `scroll.render` — a live inline frame; resolves when the component calls `buffer.release(opts)`; its last frame stays in scrollback (`mod.jsx:111-122`). Callers: `pick` (`belt/pick.js:30`), ledger Init (`ledger/index.js:45`), instance Init (`instance/init.js:149`), delete Confirm (`instance/delete.js:55-59`). A component that never releases hangs its verb (`.ikiro/world/codemap/design.md:26`).
- `buffer.shell` + `hijack` — the `--buffer` path (`systems/ghost/mod.js:97-100`). `buffer.render` has no caller.

### DESIGNED (m79) — two ways

beef, 10-05 (quest :35): /"its really view.render(data, Component) where component is either fullscreen or inline. i dont see view emit as relevant. so we have two ways. rendering inside the effect - might be fullscreen or inline. rendering a persistant app - like chat harness whatever."/ → /"render interactive and shell. i guess chrome might be how we name the custom interactive fullscreen components."/

```jsx
// .ikiro/quests/benched/m79-terminal-ghost.org:997 — the new view (tangled for subsystems/sheets/mod.jsx, not built)
export const view = {
  emit(data, Component) { /* one frame, as today */ },
  render(data, Component, controller) { /* the Component owns inline or fullscreen; resolves on controller.stdout.close(result) */ },
  shell(data, Chrome, Body, controller) { /* a long-lived root, exitOnCtrlC off; returns { controller, settled, emit, render } that paint into the slot */ },
};
```

- `Fullscreen` — the ONE escape pair: writes `CSI ? 1049 h` on mount, `CSI ? 1049 l` on unmount, and binds no height (quest :1053-1064). A component that wants the alternate screen wraps itself in it; inline is the default.
- `Slot` — the shell's default body: whatever the last effect painted; esc ends the session unless a live component holds the slot (quest :1067-1078).
- The control becomes a typology `Controller` (F10, QUESTIONED, quest :225): a component receives `controller`, ends with `controller.stdout.close(result)`, cancels with `controller.kill("SIGTERM", why)`; a stop or kill resolves `{ aborted: true }` (quest :1051). beef: /"i want to give buffers controllers. … same controller as elsewhere. buffer hooks stay on buffer."/ (quest :37).
- `--buffer` becomes the shell's first consumer (quest :823): any verb painted into the chrome, held until esc.

| way | screen covering | who owns the head | resolves when | state |
|---|---|---|---|---|
| `view.scroll.emit` | inline, one frame | the verb | next tick | LIVE |
| `view.scroll.render` | inline, live frame | the verb (the effect waits) | `buffer.release(opts)` | LIVE |
| `view.buffer.render` | inline inside `Chrome` | the verb | `buffer.release(opts)` | LIVE, no caller |
| `view.buffer.shell` + `hijack` | inline inside `Chrome`, held | ghost's render middleware | esc or return | LIVE (`--buffer`) |
| `view.emit` | inline, one frame | the verb | next tick | DESIGNED (m79) |
| `view.render` | inline, or fullscreen when wrapped in `Fullscreen` | the verb (the effect waits) | `controller.stdout.close(result)` · stop → `{ aborted: true }` | DESIGNED (m79) |
| `view.shell` | per F12 (lean inline) | the session; effects are its turns | the shell's controller settles (esc) | DESIGNED (m79) |

---

## 5 · anima's chrome — what the terminal must rhyme with

"Aligned with anima" means the same nouns in the same relations, not the same pixels. This is anima as the tree draws it on 2026-10-05.

### the tree

```text
// .ikiro/world/codemap/anima.md:35 — DOGMA
+layout   LIGHTHOUSE · TERMINALS · BRIDGE · BOX      setContext, once      systems/anima/src/app/+layout.svelte:35-44
  panel   TERMINAL                                    panel A holds the active terminal
    frame THREAD                                      subsystems/drapes/panels/Frame.svelte
      buffer view  BUFFER                             the mode's bundle, mounted with { terminal, daemon, mode, thread, buffer }  Frame.svelte:64-70
```

- The gate (`+layout.svelte:109-124`): `boot` → the Boot widget; `signin` → the Login widget; `ready` → the page.
- At 0 terminals a blurred overlay covers everything with one key, **open terminal** (`+layout.svelte:113-117`, style `:138-147`, `position: fixed; inset: 0; z-index: 300; backdrop-filter: blur(12px)`). A terminal is never created automatically.
- The theme is the identity's `THEMED` trait if set, else the saved one (`systems/anima/src/app/+page.svelte:62-64`).

### the layout, as the CSS places it

anima is NOT a CSS grid. Every panel and bone is `position: fixed` at a pixel rect computed by a pure function of the **pincer** position and the **orientation** (`systems/anima/src/typology/stores/bridge/geometry.js:60-256`); the page passes the rects down (`+page.svelte:44-58`, `:85-100`). Bones are 45 px thick (`geometry.js:1`), 4 px in hairline mode (`geometry.js:2`). With nothing saved the pincer starts at 33 % × 40 % (`systems/anima/src/typology/stores/bridge/bridge.js:76`).

```text
// systems/anima/src/typology/stores/bridge/geometry.js:62-77,144-170 — orientation 0 at the default pincer, a 1200 × 800 viewport, 1 char ≈ 15 px wide, 30 px tall
┌──────────────────────────────────────────────────────────────────────────────┐
│ A · stage  data-zone="1"                     ┃ dock (HARNESSED, open):       │
│                                              ┃  side right · share .32       │
│   Frame: the active terminal's buffer view   ┃  DockHead  ● running · label  │
│   or Empty: "no thread · pick a mode in      ┃  log       you / assistant …  │
│   navigation · or a thread"                  ┃            ▸ tool rows        │
│                                              ┃  Composer  [draft…]  [stop]   │
│                                            seam (7 px, drag = share)         │
├─────────────────────────┬───┬────────────────────────────────────────────────┤
│ shoulder  ⚎ 1/3 · ✺ · ▣ │ ✦ │ crown            [● oracle ✕] [○ empty ✕]  [+] │
├─────────────────────────┤ s ├────────────────────────────────────────────────┤
│ B · rail  data-zone="0" │ p │ C · panes  data-zone="0"                       │
│   config                │ i │   terminals · navigation · thread              │
│   auth                  │ n │   mode · buffer · harness                      │
│   box                   │ e │   (laid out by fold: page · stack ·            │
│   dock                  │   │    accordion · free)                           │
│                         │ ● │                                                │
│                         │ ● │                                                │
│                         │ ● │                                                │
│ [config auth box dock]  │   │ [terminals navigation thread mode … ] [page]   │
└─────────────────────────┴───┴────────────────────────────────────────────────┘
  pincer = the 45 px square (the viket) at (pincer.x, pincer.y); G (logger) and H (inspector) float above, no rect
  stand-ins, not anima's glyphs: ✦ for the viket's theme pictogram, ✺ for the harness brain (an SVG), ▣ for the dock key, ● for daemon pips
```

- A spans the full width above the bone row (`geometry.js:64`); B is bottom-left (`:65-70`), C bottom-right (`:71-76`). The shoulder bone runs left of the pincer, the crown right of it, the spine down from it (`geometry.js:146-169`).
- Orientation turns the T: 0 stage on top · 90 stage left · 180 stage below · 270 stage right (`systems/anima/src/app/bones/pincer/pincer.svelte:29-33` `HINTS`, read live). `full` gives A the whole viewport and hides the chassis (`+page.svelte:48`, `:115-117`).
- A bone whose rect is 45 wide and taller re-flows its content into a column (`geometry.js:56-58` `axisFor`): in orientation 0 the spine is a column, the shoulder and crown are rows.

### what sits where

- **A · stage** (`systems/anima/src/app/panels/a/a.svelte`, zone 1 `:105-112`): `Frame` for the active terminal's buffer; Empty states `settling · thread` · `no thread` · `conversational · no application — the dock is the surface` · `resolving buffer` (`a.svelte:90-102`). When the mode is `HARNESSED` and a thread is seated and the dock is not collapsed, A splits with a 7 px seam and the dock slot (`a.svelte:133-152`); flex direction from the dock side (`systems/anima/src/typology/stores/bridge/dock.js:22-28`).
- **shoulder** (`systems/anima/src/app/bones/shoulder/shoulder.svelte:36-45`), only with a seated thread: **Phase** — the render phase as an I-Ching digram `inert ⚏ · manual ⚎ · continuous ⚌ · escort ⚍` and the cursor position `n/total` (`shoulder/widgets/Phase.svelte:9`, `:73-76`); **Harness** — a brain glyph pulsing while an activity runs, with up to 15 activity ticks coloured by status (`shoulder/widgets/Harness.svelte:10`, `:42-61`); **Dock** — the dock toggle, muted when the mode is not harnessed (`shoulder/widgets/Dock.svelte:32`).
- **crown** (`systems/anima/src/app/bones/crown/crown.svelte:24-52`): the terminal tabs, right-aligned (`:68` `justify-content: flex-end`), then `+` (new terminal, `:44-49`). A tab = a pip (pulsing primary while its thread runs, contrast with a thread, muted without) · the thread's label or `restoring…` / `empty` · `✕`; its tooltip is `terminal id · daemon › mode` (`crown/widgets/Tab.svelte:17-34`).
- **pincer** (`systems/anima/src/app/bones/pincer/pincer.svelte`, read live): the viket, a 45 px square with the theme pictogram you drag; hold opens a radial with four spokes (the orientations) and three toggles `snap · hair · full` at 315° · 225° · 135° (`systems/anima/src/typology/stores/bridge/gesture.js:32`), plus home and lock. Taps: < 250 ms (`gesture.js:13`), multi-tap window 280 ms (`:15`), radial radius 108 px (`:20`).
- **spine** (`systems/anima/src/app/bones/spine/spine.svelte`): one pill, the lighthouse's standing, holding one pip per daemon (`spine.svelte:189-221`). Standing words and tones: `verified` positive · `checking` / `populating` primary · `unreachable` negative · `expired` / `signed out` / `idle` idle (`spine.svelte:14-27`). A daemon's pip: `healthy` positive, `mounting`/`unknown` primary (pulsing while mounting), else negative (`spine.svelte:66-68`). Hover → a card (slug, state, modes, threads, live activities); click → a pinned detail with `pause · stop · resume` per activity (`spine.svelte:225-312`).
- **B · rail** (`systems/anima/src/app/panels/b/b.svelte`, zone 0): sections `config · auth · box · dock` (`b.svelte:12-17`) — theme, font size, lighthouse identity and logout, devices, dock side/share/show/full — with a `Strip` of section keys.
- **C · panes** (`systems/anima/src/app/panels/c/c.svelte`, zone 0, its thread body zone 1 `:255`): six panes `terminal · navigation · thread · mode · buffer · harness` (`systems/anima/src/typology/stores/bridge/panes.js:4`), the terminal pane labelled `terminals` (`c.svelte:23`); folds `page · stack · accordion · free` (`panes.js:5`). The terminals pane is a list: label (or italic `no thread`) · `daemon/mode · id` · `✕`, Empty `no terminals — a terminal holds one thread and its cursor` + `+ terminal` (`systems/anima/src/app/panels/c/panes/Terminals.svelte:44-56`). `navigation` is panel D (daemons → modes, threads, intents; `panels/d/d.svelte:387-469`), `thread` is panels E + F (thread traits; cursor, buffer verbs, buffer list; `panels/e/e.svelte:135`, `panels/f/f.svelte:146-216`).
- **G** (`systems/anima/src/app/panels/g/g.svelte:49`, zone 0): the telemetry overlay. **H** (`systems/anima/src/app/panels/h/h.svelte:45`, zone 3): the inspector drawer.

### the strip

A row of keys that places itself (`order: -1` for top and rail) and degrades as it narrows (`subsystems/drapes/display/strip.js:20-34`): full labels → 3-letter labels (`SHORT = 3`, `:3`) → zoom down to 0.8 → a vertical rail (stacked fold) → pages with `‹ ›` arrows (at least 3 keys a page) → one merged key that opens a list (`subsystems/drapes/display/Strip.svelte:18-27`, `:52-77`). Its default place is the bottom (`bridge.js:84`). This ladder is the closest thing anima has to a width-breakpoint policy; a terminal status row will need one.

### the dock

Per terminal (`.ikiro/world/codemap/anima.md:37`); default `{ side: "right", share: 0.32, collapsed: true, full: false }`, share clamped 0.18–1.0, drop within 72 px of either end snaps to collapsed or full (`systems/anima/src/typology/stores/bridge/dock.js:1-7`, `:51-58`).

Inside (`systems/anima/src/app/panels/a/widgets/Dock.svelte:316-390`), top to bottom:

- **DockHead** (`panels/a/widgets/DockHead.svelte:33-46`): a status lamp (tone of the loudest activity, pulsing while busy) · the thread's label · `⋮⋮ meta` · the side picker · `⤢`/`⤡` full · `×` collapse. The meta bar opens three consoles `context · meter · activity` (`Dock.svelte:72`).
- **log**: the persisted turns (`thread.$turns`), consecutive assistant turns merged; tool calls as rows with status · input digest · output (`panels/a/widgets/Turn.svelte`); buffers a tool yielded get a `▶ run`; then the **live turn** with dots, the word `calling <tool>` · `streaming` · `thinking` (`Dock.svelte:120`) and the elapsed time (`panels/a/widgets/LiveTurn.svelte`); `begin` when empty (`Dock.svelte:362`).
- **Composer** (`panels/a/widgets/Composer.svelte`): an error line (`error: …`), a `↓ N new` pill when scrolled up, the textarea (placeholder `—` when not harnessed), the intelligence tune key, dictation, and **send** — or **stop** while anything runs; holding stop 2 s arms SIGKILL (`panels/a/widgets/stop.svelte.js:4`, `:22-36`).
- Keys (`Dock.svelte:206-223`): enter sends (shift-enter when `enterSends` is off), ↑ on an empty draft recalls your last message, esc cancels dictation, else stops what runs.
- Activity tones everywhere: `RUNNING primary · PAUSED/STOPPING caution · DONE positive · FAILED/ABORTED negative · IDLE/STOPPED idle` (`systems/anima/src/typology/entities/activity.js:42-52`).

### zones and themes

A zone is a territory with its own complete token set; a view never names a zone, it reads names inside one (`.ikiro/reference/design.md` §2). The places, as the test pins them (`systems/anima/tests/zones/places.test.js:5-17`):

| place | zone |
|---|---|
| `client.html` body | 1 |
| panel A | 1 |
| panel B | 0 |
| panel C (its thread body 1) | 0, 1 |
| G | 0 |
| H | 3 |
| crown · shoulder · spine · pincer | 0 |

Zones: 0 chrome · 1 body · 2 island · 3 bench (`.ikiro/reference/design.md` §2).

- Four themes, one list: `northsea · parchment · porcelain · datasette` (`systems/anima/src/typology/stores/bridge/bridge.js:27`); default northsea (`systems/anima/src/client.html:2`, `:8`).
- **A theme states no polarity** (m72 cut `scheme`, `.ikiro/world/codemap/design.md:11`). And the polarity is per zone, not per theme: porcelain and datasette are "light" themes with a DARK zone 0 (resolved below, §7). anima's chrome is dark in three of the four themes.
- dapper's token groups: `shape · size · text · control · signal · brand · font` (`subsystems/typology/schematics/primitives/theme.js:106`), and 12 ground keys per zone: `surface · surface-sunk · surface-lift · boundary · boundary-strong · boundary-soft · divider · inverse · inverse-on · shadow · scrim · dim` (`theme.js:80-87`). Emitted as `--<group>-<key>` CSS variables; `:root[data-theme]` is zone 1 whole, then one block per `[data-zone]` (`subsystems/dapper/lib/emit.js:58-66`). Signals are four: `primary · positive · caution · negative`, each `fill · ink · tint · on` (`emit.js:46-52`).
- Font scale (rem): `2xs .55 · xs .6 · sm .8 · md .875 · base 1 · lg 1.4 …` (`subsystems/dapper/lib/tokens.js:3-19`); the one knob is the root font size (`bridge.js:17-25`). The terminal has neither.

### the FOCUS LAW

/"ONE field element per session, no `{#key}`, never `disabled`/`readonly` (revert `oninput`); `subsystems/drapes/controls/Keyboard.svelte` is the offscreen holder."/ (`.ikiro/world/codemap/anima.md:19`). The terminal analogue: one live input at a time; everything else stands down (`isActive`), because every active `useInput` hears every key (§1).

---

## 6 · the designed ghost chrome — DESIGNED (m79)

Nothing in this section is built. The quest is `TANGLED, PROVEN IN A SANDBOX 10-05`, the repo untouched, every milestone waiting on beef's go (quest :3).

### what beef asked for, verbatim

- /"and then we go into the full ghost app … it requires that we have multiple render styles in ghost … where we go from plain cli to active continuous client."/ (quest :29)
- /"we have. execution where we run and done. in the execution we can elevate. … interactive component - ctx head stays inside the effect. chrome - where we render our UI but stay in the effect. and shell where we drop the ctx / head back from the effect and expect it to continue to run."/ (quest :35)
- /"a terminal (entity in lighthouse and container in anima) exists to render buffers and docks. thats what we will do on ghost as well. … on ghost, do we only ever render one terminal? no tmux capabilities built in? … only ever one buffer per cli. hmmm. yes. for sure we can add a table somewhere to open and navigate and crud multiple terminals. trivy. we use the same ways and methods that anima uses. ok. … inline and interactive. interactive rendering the vivalence chrome and multiple terminals."/ (quest :37)
- /"we dont start with rendering mode buffers tho. that comes later. i want to start with chat and the harness. … when i $viva home yap yap yap yap yap. then i want the effect triggering interactive, full shell chrome, runtime started if instance not already live …, logged in with credentials from VIVA_CLIENT_GHOST_CREDENTIALS_FILE, lighthouse connected, terminals and daemons loaded, mode harness connected."/ (quest :39)
- /"i write in shell viva yap yap yap yap. i want my default/home mode to receive that. … if reference is ambivalent, we fall into a selection screen."/ (quest :25) · /"and then we have the no match where we assume a default mode and just start chatting directly with home. harness. some default mode home gets that unmatchable yap as turn. well. we get a choice screen. send to $home, retry search, open as turn."/ (quest :27)

### the surfaces it specifies

- **`viva` bare** → help today; /"the shell once the chat cut lands"/ (quest :160).
- **`viva home <yap>`** → host the runtime (inline in this process, or join one already ALIVE), log in from the credentials file, open the shell — `view.shell({ session }, Chrome, Dock)` — create ONE terminal row, seat it on a new thread of the home mode, send the yap as the first turn (quest :2852, :3049; `belt/session.js` at quest :2855-2955).
- **the dock in the terminal** — `Dock.jsx` (quest :3052-3131): a gray status line `launch · origin · identity · daemon › type/slug`; the transcript through `Static` (each turn: `you` bold cyan / role bold gray, its text, a gray `▸ tool tool` line); the live streaming turn; `● streaming  ctrl-c stop` in cyan while an activity runs; `error: …` in red; the **slot**; one `TextInput` with placeholder `a sentence · a command · a mode`; a gray key-hint line `⏎ send  ctrl-c stop · again to leave  esc leave`.
- **the slot** — a typed command (`instance/doctor`) paints its `Effect` above the input line and stays until the next paint (quest :3133). Every line typed goes through the SAME trajectory: a command paints into the slot, a reference reseats the terminal, a sentence is a turn (quest :2853).
- **a reference reseats the terminal** — typing `oracle hi there` inside the dock reseats onto a new oracle thread and streams `hi there` (QA, quest :3402). `Static` is keyed by the thread, so a reseat prints the new thread's transcript whole below the old one (quest :3133).
- **the choice screen** (`Choice.jsx`, quest :1498-1515) — a sentence that matches nothing: `no handler for <text>`, `home: <ref>` or a yellow `your identity carries no HOMED trait — nothing to send to`, `near: …`, a `Select` of three options `send to home · retry search · open as turn` (only `retry search` without a home), the hint `↑↓ move  ⏎ choose  esc cancel`. F8 (quest :223): the third option is QUESTIONED — today both `send to home` and `open as turn` dispatch `home <words>` (quest :1496).
- **the picker on ambiguity** — one word near a nature opens `Search` over the natures, preset with that word; one match runs without a frame (`viva visio` → the dock opens on `vision`, QA :3404); a headless miss prints `ghost: no handler for … · near: …` and exits 127 (quest :1559-1562).
- **esc → teardown** — esc kills the shell's controller; the terminal row is removed (anima's roster loses it at once) and a hosted runtime stops and clears its lock; the transcript stays in scrollback (quest :2965, QA :3400).
- **ctrl-c** — first press stops what runs (SIGTERM to every owed activity), a press with nothing running leaves (quest :3133). The shell sets ink's `exitOnCtrlC: false` (quest :1029).
- **one terminal, one buffer per CLI** — beef: /"only ever one buffer per cli… for sure we can add a table somewhere to open and navigate and crud multiple terminals"/ (quest :37).
- **postponed (M13)** — the terminals table (`Terminals.jsx`, anima's `panels/c/panes/Terminals.svelte` in ink over `$entities · activate · remove · create`, reached as a verb `terminals`) and a buffer in a frame; a buffer bundle needs a DOM, so the terminal shows a buffer's `data` through `Effect` until a TUI view kind exists (quest :3150).

### the dock and the choice as the quest's code paints them

Captured from the quest's `Choice.jsx` and `Dock.jsx` copied into a scratch file (sheets imports, a fake session over nanostores atoms, the client's `roster`/`owed` stubbed). DESIGNED (m79): not in the tree.

```text
// .ikiro/quests/benched/m79-terminal-ghost.org:1498 — Choice.jsx, with a home, then without
no handler for what did i get wrong yesterday
home: @education/home/aprende
› send to home
  retry search
  open as turn
↑↓ move  ⏎ choose  esc cancel
no handler for nope deeper
your identity carries no HOMED trait — nothing to send to
› retry search
↑↓ move  ⏎ choose  esc cancel
```
Colours: `no handler for`, `home: …`, the hint gray; the sentence bold; the missing-trait line yellow; the cursor row cyan.

```text
// .ikiro/quests/benched/m79-terminal-ghost.org:3052 — Dock.jsx, the first turn streaming (fixture session, inline launch), 80 columns
you
what did i get wrong yesterday

inline · http://localhost:2503 · localhost · hello › chaosmonkey/oracle
assistant
You asked about the subjunctive after 'penso che' — twice you wrote
▸ viva_doctor

● streaming  ctrl-c stop
› a sentence · a command · a mode▌
⏎ send  ctrl-c stop · again to leave  esc leave
```

```text
// .ikiro/quests/benched/m79-terminal-ghost.org:3052 — Dock.jsx, idle after two turns, instance/doctor's effect in the slot (joined launch)
you
what did i get wrong yesterday

assistant
Two things: 'penso che è' should be 'penso che sia', and 'ho andato' should be
'sono andato'.

joined · http://localhost:2503 · localhost · hello › chaosmonkey/oracle
instance                       localhost
lock                           ALIVE
runtime                        runtime
› a sentence · a command · a mode▌
⏎ send  ctrl-c stop · again to leave  esc leave
```

```text
// .ikiro/quests/benched/m79-terminal-ghost.org:3052 — Dock.jsx, an error on the line
you
hi

inline · http://localhost:2503 · localhost · hello › chaosmonkey/oracle
error: 500 — [hallucination] no 'dialogue' faculty resolves a 'stream' avenue
› a sentence · a command · a mode▌
⏎ send  ctrl-c stop · again to leave  esc leave
```

Colours: status line, hint, `▸` tool line, placeholder gray; `you` bold cyan; `assistant` bold GRAY (the role falls through to `theme.dim`); `● streaming` cyan; `error:` red; the slot's Effect cyan keys + gray values.

Read these three renders before drawing anything:

1. **The status line is not on top.** The quest writes it first in the JSX and its walk shows it first (quest :3138-3146, QA :3400 /"the first line reads `inline · …`"/). ink prints `Static` output above the live frame, so every committed turn lands ABOVE the status line; the status line, the slot, the input and the hint always sit at the bottom, below the transcript. Only before the first turn commits is it the first line.
2. **The streaming turn is part of the live frame.** It repaints in place under the status line, then moves into `Static` (above) when it lands as a row.
3. **The slot sits between the live turn and the input**, so a command's output and the transcript share the bottom region; a tall effect pushes the input down and, past the window height, triggers ink's full-screen repaint (§1).

### QUESTIONED — what the quest does not decide

The designer proposes each of these.

1. **The status/mode row's contents and place.** Candidates the tree knows: instance slug · launch `inline | joined` (quest :2950 `toJSON`) · lighthouse origin and standing (anima's spine words, `spine.svelte:14-27`) · identity · daemon › type/slug · thread label · the render phase digram (`Phase.svelte:9`) · activity state (`activity.js:42-52`) · connection state. Which, in what order, what drops first at 80 columns, and whether it is a footer (where inline puts it anyway) or a header that requires the alternate screen.
2. **Where the input line sits** — bottom of the live frame (the quest), or under the last turn, and how a multi-line draft grows (the kit's `TextArea` is boxed and full-width; the quest uses one-line `TextInput`).
3. **How a streaming turn paints** — live repaint of the whole turn in the frame (the quest), or line-by-line commits to `Static` as lines complete. `Static` is append-only: a committed line can never be edited, so markdown that resolves late (a code fence, a table) cannot be re-flowed after commit.
4. **How tool calls and activity show** — the quest: one gray `▸ name name` line per turn. anima: rows with status · digest · output and per-entity channels (`Turn.svelte`). What a running tool, a failed tool, a paused activity look like in cells.
5. **How errors show** — the quest: one red `error: …` line, cleared on the next send. A transport failure, a 401, a dead runtime, a refused seat all land there today.
6. **The key-hint footer** — always on, or on demand (`?`); which keys per state (idle · streaming · a picker holding the slot · a confirm holding it).
7. **Truecolor mapping from dapper** — §7.
8. **Light vs dark terminals** — the program cannot know (§1); every colour must read on both.
9. **Widths 80 · 120 · 200** — what each row keeps; whether 200 columns gets a second column (anima's dock beside a stage) or just longer lines.
10. **What persists to scrollback on exit** — the transcript (inline commits it), the status line (its last frame, or nothing), a closing summary line.
11. **How a command's inline render and the transcript share the screen** — the slot between the live turn and the input (the quest), or committed into the transcript as its own block; and what happens to the slot's content on the next turn.
12. **The choice screen's third option (F8)** and the picker's look inside the shell (the same `Search`, or framed).
13. **Fullscreen or inline for the shell (F12)** — the quest leans inline; a header, a pinned status line, a side-by-side terminals table all need the alternate screen.
14. **The terminals table (M13)** — anima's terminals pane in cells: `label · daemon/mode · id · ✕`, the active row, `+ terminal`.

---

## 7 · mapping anima → terminal

| anima element | file | terminal counterpart | what does not translate | the rhyme |
|---|---|---|---|---|
| gate: boot · signin · ready | `+layout.svelte:109-124` | none LIVE; DESIGNED login through `instance/lighthouse` + the credentials file (quest :21, M9) | a login form in the shell | the same words: verified · checking · signed out |
| empty overlay at 0 terminals | `+layout.svelte:113-117` | none; DESIGNED the session always creates its one terminal (quest :2870) | blur, click anywhere | — |
| A · stage, `Frame` + buffer view | `panels/a/a.svelte:113-131` | none; M13 postponed: a buffer's `data` through `Effect` | a JS bundle mounted into a DOM node | the Empty words (`no thread`, `the dock is the surface`) |
| dock (log + live turn + composer) | `panels/a/widgets/Dock.svelte:316` | DESIGNED `Dock.jsx` (quest :3052) | side/share/drag, full, the seam, the meta consoles, dictation, copy, `▶ run` | turns · live word `calling X · streaming · thinking` · stop then kill · enter sends · esc stops |
| DockHead status lamp + label | `DockHead.svelte:33-35` | DESIGNED the gray status line | a pulsing lamp (a terminal can blink, rarely should) | tone from the loudest activity |
| crown: terminal tabs + `+` | `bones/crown/crown.svelte:35-50` | none; one terminal per CLI; M13 table postponed | tabs side by side, click to activate | label · pip (running) · ✕ |
| shoulder: phase · harness · dock toggle | `bones/shoulder/shoulder.svelte:41-43` | none | popovers (`Float`), the brain glyph | the digram `⚏⚎⚌⚍` and `n/total` fit in cells |
| spine: lighthouse standing + daemon pips | `bones/spine/spine.svelte:189-221` | none; candidate for the status row | hover cards, pinned detail | standing words + one pip per daemon: `●` coloured by health |
| pincer: viket + radial | `bones/pincer/pincer.svelte` | none | the whole gesture: drag, hold, radial, orientations, snap | — |
| B · rail (config · auth · box · dock) | `panels/b/b.svelte:12-17` | none; theme and font are the terminal's own settings | font size, theme picker per session | — |
| C · panes (terminals · navigation · thread · mode · buffer · harness) | `panels/c/c.svelte`, `panes.js:4` | `help` (the census), the doctors, M13 terminals | folds, drag between panes, resize grips | the pane names as verbs or sections |
| Strip (keys, degrading with width) | `drapes/display/strip.js:20-34` | none; a width ladder for the status row is QUESTIONED | zoom | full label → 3-letter label → merged |
| G telemetry · H inspector | `panels/g/g.svelte:49` · `panels/h/h.svelte:45` | `--verbose` prints the stack (`systems/ghost/mod.js:151`) | overlays | — |
| themes + zones | `bridge.js:27` · `places.test.js:5-17` | `sheets/theme.js` names | nested `data-zone` boxes with their own grounds (no box fill in ink 5) | palettes and signal colours (below) |
| FOCUS LAW | `.ikiro/world/codemap/anima.md:19` | `isActive` on every input | an offscreen focus holder | one live input at a time |

Does not translate at all: mouse drag, the radial gesture, pixel layout, hover, fonts and font size, blur, shadows, rounded corners beyond `round` box glyphs, zones as nested painted boxes. Carries over: the nouns (terminal · thread · buffer · dock · turn · activity), the words anima already prints (`no thread`, `begin`, `calling X`, `streaming`, `thinking`, `verified`, `unreachable`), the palettes, and the four signals → `ok · warn · bad` plus `accent`.

### colours — dapper hexes beside the kit's names

The four themes' zone 0 (the chrome) resolved through `theme()` — the definitions are `subsystems/dapper/themes/{northsea,parchment,porcelain,datasette}/theme.js`; northsea and parchment name gradient stops, so the hexes below are the completed values read from `subsystems/dapper/themes/index.js` `THEMES` by a probe (§10).

| role (zone 0) | sheets name | northsea | parchment | porcelain | datasette |
|---|---|---|---|---|---|
| `surface` | — (terminal bg) | `#0E1A25` | `#F0EDDE` | `#0E1A25` | `#111111` |
| `surface-sunk` | — | `#060D14` | `#E9E5D3` | `#060D14` | `#000000` |
| `surface-lift` | — | `#1A2A38` | `#F5F3E8` | `#243544` | `#2A2A2A` |
| `boundary` | — | `#243544` | `#A0967C` | `#040A10` | `#000000` |
| `text.header` | default bold | `#F4F6F9` | `#06081E` | `#FFFFFF` | `#FFFFFF` |
| `text.strong` | default | `#E6EAEF` | `#0B0F2D` | `#EDF0F4` | `#F4F4F1` |
| `text.ink` | default | `#B4BFCB` | `#3D372A` | `#CBD3DD` | `#D9D9D4` |
| `text.light` | — | `#8FA0B1` | `#5A5240` | `#AEBBCD` | `#A8A8A2` |
| `text.muted` | `dim` gray | `#6B7E91` | `#7C725B` | `#8B97A3` | `#8A8A84` |
| `signal.primary` fill | — | `#1EBCB5` | `#066F6D` | `#3D528C` | `#C8401A` |
| `signal.primary` ink | `accent` cyan | `#51D8D0` | `#045554` | `#AEBBD6` | `#F0A18B` |
| `signal.positive` ink | `ok` green | `#B0D19A` | `#2E561C` | `#9CCB98` | `#8FCF98` |
| `signal.caution` ink | `warn` yellow | `#E7C271` | `#682C34` | `#E2B86A` | `#E3B85A` |
| `signal.negative` ink | `bad` red | `#D9A18D` | `#7C2A16` | `#E9A08C` | `#F0A18B` |
| `brand.outline` | `brand` magenta | `#1EBCB5` | `#A0967C` | `#AEBBD6` | `#C8401A` |
| zone 1 `surface` (the body) | — | `#06101D` | `#F5F3E8` | `#EDF0F4` | `#F4F4F1` |

Facts the table carries:

- Zone 0 is dark in northsea, porcelain and datasette; only parchment's chrome is light. porcelain and datasette are light BODIES (zone 1) under dark chrome.
- dapper has no magenta: the kit's `brand: "magenta"` matches no theme's brand (`brand.outline` defaults to `signal.primary`, `.ikiro/reference/design.md` intro).
- datasette's primary and negative are the same orange-red (`#C8401A` fill, `#F0A18B` ink on zone 0, `themes/datasette/theme.js:12,15,22`): `accent` and `bad` would collide.
- parchment's caution ink `#682C34` is a dark rose, not a yellow: the meaning "warn" is not a hue across themes.

Nearest xterm-256 index for each, computed by the probe's Euclidean match over the 6×6×6 cube and the gray ramp (not in the tree; for the designer's orientation):

| role (zone 0) | northsea | parchment | porcelain | datasette |
|---|---|---|---|---|
| `surface` | 234 | 254 | 234 | 233 |
| `text.ink` | 250 | 236 | 188 | 188 |
| `text.muted` | 66 | 95 | 246 | 102 |
| `signal.primary` ink | 80 | 23 | 146 | 216 |
| `signal.positive` ink | 150 | 237 | 150 | 114 |
| `signal.caution` ink | 179 | 238 | 179 | 179 |
| `signal.negative` ink | 180 | 88 | 180 | 216 |

A truecolor path is a design decision, QUESTIONED. The two real options:

- **nearest-ANSI from dapper** — keep the 16 names (or 256 indices) and pick, per role, the name or index nearest each theme's hex; the user's terminal palette still decides the final colour; works everywhere, matches anima only loosely, and cannot follow a theme switch unless the mapping is per theme.
- **truecolor passthrough gated by `COLORTERM`** — when `COLORTERM` is `truecolor` or `24bit`, hand ink the dapper hex (`#rrggbb`, which `colorize.js:18-21` already accepts); else fall back to the names. Matches anima exactly — but the hexes were drawn for dapper's own grounds, and the terminal's background is unknown (§1): northsea's `text.ink #B4BFCB` on a white terminal reads about as badly as parchment's `#3D372A` on a black one. Passthrough of ink colours without also painting the ground (Text `backgroundColor` per line) re-creates the polarity problem the zones solve in the browser.

Which theme the terminal follows (the identity's `THEMED` trait as anima does, `+page.svelte:62`; a flag; or none) is part of the same decision.

---

## 8 · comparative chrome (orientation only)

- **Emacs.** Each window ends in a **mode line**: one inverse-video row naming the buffer, its modified flag, position, major and minor modes; it belongs to the window, so a split screen has several. Below everything sits the **echo area**, one line where messages appear and fade. The same line becomes the **minibuffer** when Emacs asks for input — `M-x`, a file name, a search — with completion; so prompts and messages share one place at the bottom, never a dialog.
- **tmux.** One **status line**, bottom by default (top optional), shared by every pane of the session: left the session name, middle the window list with the current one marked, right host and clock, all user-formatted. Panes are bordered by single lines; a pane's own title is optional. Prompts (`:` command, rename) take over the status line temporarily, like Emacs' minibuffer.
- **Neovim.** Top: an optional **tabline** listing tab pages. Each window has a **statusline** at its bottom (file, mode, position), or one global statusline (`laststatus=3`). The last row is the **cmdline**: `:` commands, `/` searches, messages; `cmdheight=0` hides it until needed. Insert/normal mode shows in the statusline or the cmdline (`-- INSERT --`).

Common pattern: a status row tied to what you look at, a single bottom line for prompts and messages that swaps between the two, everything keyboard-reachable, colour carried by inverse video and a few accents rather than painted grounds.

---

## 9 · the brief for the designer

Deliverables beef wants mocked up, each at **80 and 120 columns**, in **northsea** (dark chrome) and **parchment** (light chrome), as monospace text mockups with colour annotations (a role name per span: `accent`, `ok`, `warn`, `bad`, `dim`, `brand`, or a dapper role from §7):

1. **the bare shell** — `viva` with an instance live, nothing typed: status row, empty transcript, input, hints.
2. **`viva home <yap>` streaming** — the first turn: your sentence, the assistant streaming, a tool call, stop affordance.
3. **the choice screen** — a sentence that matches nothing, with and without a home (F8's third option open).
4. **the picker** — one word near several natures or modes; inside the shell and standalone.
5. **help** — `viva help` and `viva help <nature>`, fixing the wrap (§3).
6. **the doctor** — `instance/doctor` (today the raw `Effect`) and `ledger/doctor`; where problems are signalled.
7. **the init wizard** — the six phases of `instance/init`, page titles shown.
8. **the terminals table (later, M13)** — list, active row, create, close.
9. **the status row** — its contents and its width ladder (80 → 120 → 200), in every state: inline · joined · connecting · unreachable · streaming · error.

Constraints recap:

- Cells, not pixels; one monospace font you do not choose; no box fill (ink 5 colours text only); `round` and the other `cli-boxes` borders cost a cell per side.
- 16 named colours today; hex/256 possible but undecided; the background is the user's and unknowable; every screen must read on dark and light terminals.
- Keys only: arrows, pgup/pgdn, enter, esc, tab/shift-tab, backspace, ctrl/meta + letter; no mouse, no Home/End.
- Inline by default: committed lines go to scrollback above a live frame at the bottom; no persistent header unless the alternate screen is chosen (F12); a live frame taller than the window repaints the whole screen.
- One live input at a time; every other component's keys stand down.
- Wide glyphs (CJK, emoji) take 2 cells; the kit's padding does not know that yet.
- A pipe gets no screen at all: every interactive surface needs its headless sentence.

Vocabulary recap: instance · ledger · runtime · daemon · mode · trait · lighthouse · identity · **terminal** (one per CLI) · **thread** · **buffer** · **dock** · **turn** · **activity** · home · yap · command · reference · **chrome** · **slot** · sheets · dapper · drapes · anima · ghost · trajectory · effect. The product is fair-source, source-available.

---

## 10 · sources

Files read (line counts by `wc -l`, 2026-10-05; anima files marked * were being edited by a sibling during the read):

- `.ikiro/world/codemap/design.md` 76 · `.ikiro/world/codemap/anima.md` 77 · `.ikiro/world/codemap/ghost.md` 39 · `.ikiro/reference/design.md` 519 (TOC, §1–3, §7–8) · `.ikiro/reference/anima.md` 674 (TOC, §1, §6–9) · `.ikiro/quests/benched/m79-terminal-ghost.org` 3472 (:1-275, :822-1352, :1353-1580, :2852-3165, :3396-3472)
- `subsystems/sheets/mod.jsx` 195 · `theme.js` 12 · `deno.jsonc` 10 · `cliffy.js` 8 · `components/` Actions 26 · Background 10 · Banner 25 · Chrome 13 · Confirm 25 · Effect 53 · Field 21 · Form 46 · JsonTree 77 · List 19 · Logo 55 · MultiSelect 55 · PasswordInput 6 · Search 100 · Select 52 · Table 53 · Tasks 26 · TextArea 37 · TextInput 51 · `state/` form 46 · multiselect 21 · search 61 · select 14 · text 22 · `tests/` field-protocol 13 · form.pages 87 · form.state 48 · multiselect.state 28 · search.state 89 · select.state 30 · text.state 33
- `systems/ghost/mod.js` 202 · `trajectories/Help.jsx` 70 · `trajectories/help.js` 30 · `trajectories/index.js` 166 · `trajectories/instance/Init.jsx` 225 · `init.js` 151 · `delete.js` 69 · `doctor.js` 105 · `use.js` 68 · `trajectories/ledger/Init.jsx` 72 · `Doctor.jsx` 170 · `index.js` 289 · `trajectories/registry/Doctor.jsx` 80 · `index.js` 161 · `belt/pick.js` 33 · `belt/lens.js` 47 · `trajectories/sheets/index.js` 2 · `text-select-a.js` 20 · `text-select-b.js` 64
- `systems/anima/src/app/+layout.svelte` 148* (141 at first read) · `+page.svelte` 121 · `bones/crown/crown.svelte` 88 · `bones/crown/widgets/Tab.svelte` 61 · `bones/shoulder/shoulder.svelte` 66 · `bones/shoulder/widgets/Phase.svelte` 207 · `Harness.svelte` 125 · `Dock.svelte` 113 · `bones/spine/spine.svelte` 644 · `bones/pincer/pincer.svelte` 608* (640 at first read) · `panels/a/a.svelte` 213 · `panels/a/widgets/Dock.svelte` 434 · `DockHead.svelte` 118 · `Turn.svelte` 321 · `LiveTurn.svelte` 104 · `Composer.svelte` 236 · `stop.svelte.js` 61 · `panels/b/b.svelte` 106 · `panels/c/c.svelte` 409 · `panels/c/panes/Terminals.svelte` 93 · `panels/d/d.svelte` 665* · `panels/e/e.svelte` 232 · `panels/f/f.svelte` 310 · `panels/g/g.svelte` 484 · `panels/h/h.svelte` 186 · `typology/stores/bridge/bridge.js` 258 · `geometry.js` 290 · `dock.js` 96 · `gesture.js` 461* (478 at first read) · `panes.js` 132 · `typology/entities/terminal.js` 176 · `typology/entities/activity.js` (lines 40-60) · `client.html` 55 · `tests/zones/places.test.js` 83
- `subsystems/drapes/display/Strip.svelte` 172 · `display/strip.js` 34 · `panels/Frame.svelte` 148 · `subsystems/dapper/lib/tokens.js` 112 · `lib/emit.js` 69 · `themes/index.js` 6 · `themes/northsea/theme.js` 21 · `parchment/theme.js` 24 · `porcelain/theme.js` 27 · `datasette/theme.js` 27 · `subsystems/typology/schematics/primitives/theme.js` 139 · `subsystems/typology/entities/lighthouse/Terminal.ts` 61 · `Identity.ts` 70 · `systems/runtime/entities/kernel/Mode.ts` 130 · `userspace/Thread.ts` 164 · `userspace/Turn.ts` (lines 40-67) · `transient/Activity.ts` (lines 6-53) · `commons/instances/hello-world/instance.viva.js` (lines 55-65)
- ink 5.2.1 from the deno cache (`~/Library/Caches/deno/npm/registry.npmjs.org/ink/5.2.1/build/`): `ink.js`, `render.js`, `colorize.js`, `components/App.js`, `components/Text.js`, `components/Box.d.ts`, `styles.d.ts`, `hooks/use-input.js`, `parse-keypress.js`, `output.js`; `cli-boxes/boxes.json`

Commands run (from the repo root; read-only on the repo and on `~/.viva`):

- `deno run -A systems/ghost/mod.js help` → exit 0 (§3 list) · `… help instance/doctor` → exit 0 (§3 detail) · `… help instance/doctor --json` → exit 0 · `… help --json` → exit 0 (the census fed to the 120-column capture) · `… --json help instance/doctor` → exit 127 · `… help nosuch` → exit 0 · `… bogus/verb` → exit 127 · `FORCE_COLOR=3 … help instance/doctor` (colour codes) · `… help instance/doctor --buffer < /dev/null` → exit 1, ink raw-mode error
- `grep -rn '1049' subsystems/sheets` → none · `grep -rn 'x1b\|u001b' subsystems/sheets systems/ghost --include=*.js --include=*.jsx` → none · `grep -rn 'alt-screen' subsystems/sheets systems/ghost` → 3 comments · `grep -rn 'color="' subsystems/sheets/components` → 14 lines · `grep -rnE '"(cyan|gray|…)"' subsystems/sheets/components` → 15 more · `grep -rnE '…|color="' systems/ghost/trajectories --include=*.jsx | wc -l` → 45 · `grep -rn 'backgroundColor\|borderStyle' …` → 3 borders, 0 backgrounds · `grep -rn 'useFocus\|useFocusManager\|…' subsystems/sheets/components systems/ghost` → 0 · `grep -rn 'COLORTERM\|FORCE_COLOR\|NO_COLOR\|…' systems subsystems` → 2 env allowlists
- The capture harness, scratch only (`/private/tmp/claude-501/…/scratchpad/tui/`): `rig.js` renders a React element through sheets' own ink `render` with a fake TTY stdout (`columns 80`, or 120 for help) and a fake stdin that feeds key bytes through ink's `readable` path, `debug: true`, `exitOnCtrlC: false`, `patchConsole: false`, and keeps the last frame; colours read back from the SGR codes with `FORCE_COLOR=1`. `kit.jsx` (35 renders, every sheets component), `ghost.jsx` (18 renders: help ×2 at 120, Effect, the modes picker, the instance/init wizard ×7 phases and pages, ledger/init ×3, both Doctors, the delete Confirm, `--buffer`), `designed.jsx` (5 renders of the quest's `Choice.jsx` ×2 and `Dock.jsx` ×3), `themes.js` (the four completed themes' zone 0 and zone 1 hexes and their nearest xterm-256 index). All run with `deno run -A --config deno.jsonc --no-check <file>`, exit 0.
- Not captured, and why: anything needing a real TTY — resize, ctrl-c, the alternate screen (absent), the live repaint between frames; the real `instance/*`, `ledger/*`, `registry/*` verbs (off limits: ledger reads reap locks); the m79 shell as a whole (not built — only its two components were rendered from the quest's source).
