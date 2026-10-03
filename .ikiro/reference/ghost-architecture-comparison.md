<!-- writer: agent · reference, unbudgeted · written 2026-10-05 · external claims cite primary docs (URL + section), vivalence claims cite file:line -->

# ghost against Emacs · Neovim · tmux — the reference

This is a study for beef's critical pass on `.ikiro/quests/m79-terminal-ghost.org`. It compares three well-known architectures (Emacs, Neovim, tmux), with short notes on Blender's operators, Plan 9's Acme and plumber, the Language Server Protocol and VS Code's `contributes`, against ghost (`viva`, `systems/ghost`), the runtime daemon it talks to (`systems/runtime`), and the modes the daemon hosts. It sets out options and leaves every decision to beef. QUESTIONED marks a decision that is still open.

**How to read a citation.** An external claim links to its primary document, and the link text names the section. A vivalence claim carries `path:line`, container-rooted. Quest lines are `m79:<line>`, meaning `.ikiro/quests/m79-terminal-ghost.org:<line>`.

**The quest moved while this was written.** `m79-terminal-ghost.org` was edited live during this study (3472 lines at the first read, 3641 at the last). Every `m79:` number here is re-read against the 3641-line file, and a copy of that version sits at `/private/tmp/claude-501/-Users-finn-vivalence-code-vivalence/da11b0ef-dfe0-4389-8aab-b79ed0fcf255/scratchpad/comparison/m79-snapshot.org`. If a line has moved, grep for the quoted anchor.

The quest's own `* critical pass — 10-05, architecture` (m79:3215-3331) already took in several of the points below, as forks F15–F19 (m79:233-237), eighteen findings (m79:3230-3247), a chrome section (m79:3279-3298) and three probes (m79:3314-3322). §6 says where each risk stands against that pass, and where this study disagrees with it.

**(L) — the gnu.org pages could not be fetched.** gnu.org refused this machine every time on 10-05:
- `curl`: HTTP 429, then `Connection reset by peer`, many times;
- WebFetch: HTTP 429 seven times, then `ECONNRESET` twice, on `Using-Interactive.html` and `emacsclient-Options.html`.

Four Emacs nodes did arrive from gnu.org itself: *Active Keymaps* (by WebFetch), and *Major Modes*, *Minor Modes* and *Derived Modes* (by curl). Every other Emacs node carries **(L)**. Its text was read from the GNU Emacs 30.2 manuals installed on this machine (`/opt/homebrew/share/info/emacs/{elisp,emacs}.info`, extracted with `info -n <node>`). That is the same manual and the same version that gnu.org serves; the three nodes that did arrive carry the same section numbers. The URL given is the gnu.org page that was tried. Under the brief's strict rule — a fetch that fails twice makes the claim UNVERIFIED — every (L) claim counts as **UNVERIFIED-by-fetch**, even though it was checked against the local copy. The plain **UNVERIFIED** mark is kept for claims that have no primary source at all.

## contents

1. [thesis per system](#1-thesis-per-system)
2. [the concept map](#2-the-concept-map)
3. [the deep sections](#3-the-deep-sections) — 3.1 Emacs · 3.2 Neovim · 3.3 tmux · 3.4 the nods
4. [the two wirings of a mode into ghost](#4-the-two-wirings-of-a-mode-into-ghost)
5. [the chrome question](#5-the-chrome-question)
6. [risks for ghost found by the comparison](#6-risks-for-ghost-found-by-the-comparison)
7. [sources](#7-sources)

---

## 1. thesis per system

**Emacs.**
- **What it is.** One Lisp process. The buffer is the universal datum, and every interactive function is a command you can reach by a key or by name. A buffer holds text whether or not it visits a file ([Elisp 28.1 Buffer Basics (L)][e-buffer]). A process's output goes into an ordinary buffer ([Elisp 41.9.1 Process Buffers (L)][e-procbuf]). Each buffer has exactly one major mode at a time ([Elisp 24.2 Major Modes][e-major]), and any number of minor modes ([Elisp 24.3 Minor Modes][e-minor]). Any function with an `interactive` form is a command, reachable "via `M-x` or by entering a key sequence bound to it" ([Elisp 22.2.1 Using ‘interactive’ (L)][e-interactive]).
- **The invariant that made it last.** The extension language is the implementation language: "Most of the GNU Emacs text editor is written in the programming language called Emacs Lisp" ([Elisp 1 Introduction (L)][e-intro]). An extension therefore has the same power, the same documentation and the same name space as the core.
- **The regret its own project names.**
  - Concurrency. Threads are "mostly cooperative" ([Elisp 40 Threads (L)][e-threads]). The project's TODO still asks "which form of concurrency' we'll want" ([etc/TODO "Concurrency" (L)][e-todo]).
  - Redisplay. The same TODO says redisplay "has only 2 levels of redrawing … This doesn't scale well" ([etc/TODO "Make redisplay smarter about which parts to redraw" (L)][e-todo]).
  - That the wider community ranks these two as *the* regret is **UNVERIFIED**: the TODO is the project's own word, not a community survey.

**Neovim.**
- **What it is.** Vim's editor core run as an RPC server. GUIs, plugins, scripts and other Nvim processes are all clients of one API: "The API is used by remote plugins and GUIs" over MessagePack-RPC, and "Even Nvim itself can control other Nvim instances" ([Nvim api "API Usage"][n-api]). UIs are "external client processes communicating with Nvim over the RPC API" ([Nvim api-ui-events "UI Events"][n-ui]).
- **The invariant that made it last.** A versioned, self-describing contract:
  - `api_level` · `api_compatible` · `{fn}.since` · `{fn}.deprecated_since` in the metadata ([Nvim "API metadata"][n-meta]);
  - "versionless evolution": new fields are optional and old clients may ignore them ([Nvim "API contract"][n-contract]).
- **The regret.** Carrying Vim:
  - the Lua guide describes **three** API layers, "The 'Vim API' inherited from Vim", "The 'Nvim API'", and "The 'Lua API'" ([Nvim lua-guide "About the API"][n-luaguide]);
  - `vim_diff` documents breaking only "where the benefit outweighs any backwards-compatibility cost", and that "Vim9script … is not supported" ([Nvim vim_diff][n-vimdiff]).
  - Calling this the community's named regret is **UNVERIFIED**.

**tmux.**
- **What it is.** One server per socket owns sessions, windows and panes. Clients are separate processes that attach to a session and draw it: "all sessions are managed by a single server. The server and each client are separate processes which communicate through a socket" ([tmux(1) DESCRIPTION][t-desc]).
- **The invariant that made it last.** The session outlives the client: "Each session is persistent and will survive accidental disconnection … or intentional detaching" ([tmux(1) DESCRIPTION][t-desc]).
- **The regret.** The only machine interface is the command language and the text protocol of control mode ([tmux(1) CONTROL MODE][t-control]). The wiki presents this as a choice, so that clients "use tmux commands … rather than duplicating a separate command set just for control mode" ([tmux wiki "Control mode"][t-wiki]). Naming the missing API as a regret is **UNVERIFIED**.

**ghost, the runtime and modes — for contrast, our side in one paragraph.**
- **ghost.** Ghost is one `Vector`, the trajectory: argv in, one effect out. Five middlewares wrap every verb (span → catch → `ctx.call` → cwd mount → render, `systems/ghost/mod.js:22-124`). Every verb is declared as `trajectory.open({ nature, valence, schema }, handler)` (`systems/ghost/trajectories/index.js:23-165`). `viva help` is a fold over that trie (`systems/ghost/trajectories/help.js:3-21`).
- **The runtime.** The runtime is a vector of lifecycles (`systems/runtime/lifecycle/runtime/execution.js:9-27`) that hosts daemons (`systems/runtime/lifecycle/daemon/execution.js:9-30`). A daemon hosts modes.
- **Modes.** A mode is a module of declared exports whose behaviour is switched on by a manifest of STATE-named traits (`.ikiro/skills/mode/SKILL.md:27-46`). The traits are staggered by an OPEN set of implementations (`systems/runtime/gestalten/belt/stagger.js:3-16`).
- **The quest.** m79 turns ghost into a client of that runtime, the way anima already is (m79:195).

---

## 2. the concept map

One table. Our column names the house noun and where it lives. A dash means the system has no first-class counterpart.

| concept | Emacs | Neovim | tmux | vivalence (our noun · file:line) |
|---|---|---|---|---|
| the server process | the Emacs process; `--daemon` ([41 Using Emacs as a Server (L)][e-server]) | `nvim --listen` / `--embed` ([starting --listen][n-listen]) | the tmux server, one per socket ([DESCRIPTION][t-desc]) | the runtime (`systems/runtime/run.js:6-21`) hosting daemons (`systems/runtime/lifecycle/runtime/resolution.js:15-22`); the instance lock (`subsystems/paladin/prototypes/ledger/lock.js:1-23`) |
| the client | the frame + `emacsclient` ([41.3 emacsclient Options (L)][e-client]) | an attached UI ([UI Events][n-ui]) | a tmux client ([DESCRIPTION][t-desc]) | ghost (`systems/ghost/mod.js`) · anima; after m79 ghost hosts the client structures (m79:227 F9) |
| a session | the whole process (shared buffers, history) ([41 (L)][e-server]) | — | session ([DESCRIPTION][t-desc]) | Terminal row — identity · daemon · thread · index (`subsystems/typology/entities/lighthouse/Terminal.ts:19-26`); m79 F11 (m79:229) |
| the unit of content | buffer ([28.1 (L)][e-buffer]) | buffer ([api-buffer-updates][n-contract]) | pane (a pty) ([DESCRIPTION][t-desc]) | buffer (minted by `systems/runtime/lifecycle/mode/traits/application.js:14-20`); a thread's turns (m79:2966-2982) |
| the viewport | window in a frame ([29.1 (L)][e-windows]) | window / grid ([ui-ext-options][n-ui]) | window / pane ([DESCRIPTION][t-desc]) | terminal (the Terminal row, `Terminal.ts:19-26`); m79 deliverable n, postponed (m79:256) |
| the chrome | mode line ([1.3 The Mode Line (L)][e-modeline-user]) | statusline + tabline, externalizable ([ext_tabline][n-ui]) | status line ([STATUS LINE][t-status]) | `Chrome.jsx` = Background + Logo + children (`subsystems/sheets/components/Chrome.jsx:6-13`) |
| the input line | minibuffer ([21.1 (L)][e-mini]) | cmdline, externalizable ([ext_cmdline][n-ui]) | `command-prompt` ([STATUS LINE][t-status]) | the dock's input (m79:3176, M12) |
| a command | interactive function ([22.2.1 (L)][e-interactive]) | user command ([nvim_create_user_command][n-usercmd]) | tmux command ([COMMANDS][t-cmds]) | an effect on a trajectory edge (`systems/ghost/trajectories/index.js:23-34`) |
| a command's declared interface | the `interactive` spec ([22.2.1 (L)][e-interactive]) | opts: `nargs` · `complete` · `desc` ([nvim_create_user_command][n-usercmd]) | the command table, `list-commands` ([CLIENTS AND SESSIONS][t-clients]) | `open({ nature, valence, schema })` (`trajectories/index.js:23-31`), read by `census` (`help.js:9-18`) |
| a key binding | keymaps by precedence ([23.7 Active Keymaps][e-keymaps]) | mappings | `bind-key -T` key tables ([KEY BINDINGS][t-keys]) | none in ghost; ink `useInput` inside components (`subsystems/sheets/mod.jsx:150-152`; m79:3140) |
| the extension unit | major mode ([24.2][e-major]) | plugin / rplugin ([remote_plugin][n-rplugin]) | — | mode (`commons/instances/hello-world/mode.viva.js:5-41`) |
| a capability flag | minor mode ([24.3][e-minor]) | an `ext_*` option ([ui-ext-options][n-ui]) | — | trait (`systems/runtime/entities/kernel/Mode.ts:10-42`); open set (`stagger.js:6`) |
| the contribution surface | keymap + commands + hooks of the mode ([24.2.4 Derived Modes][e-derived]) | the rplugin manifest ([4. Remote plugin manifest][n-rplugin]) | — | `/metadata/modes` + `/metadata/<mode>/{aperture,harness,emitter,application,freight}` (`systems/runtime/lifecycle/daemon/aperture/metadata.js:14-49`) |
| self-documentation | `describe-*` · `apropos` · `which-key` ([12 Help (L)][e-help]) | `:help` + `nvim_get_api_info` ([API metadata][n-meta]) | `list-commands` · `list-keys` ([CLIENTS AND SESSIONS][t-clients]) | `viva help` = `census` (`help.js:3-21`; `trajectories/index.js:150-165`) |
| health | — | `:checkhealth`, discovered per plugin ([health-dev][n-health]) | — | `instance/doctor` — recipe + env + lock (`systems/ghost/trajectories/instance/doctor.js:37-103`) |
| the wire | — (in-process) | MessagePack-RPC ([API Usage][n-api]) | socket; control mode text ([CONTROL MODE][t-control]) | `Connection` (`subsystems/typology/prototypes/connection.js:90,107,127,179`) over HTTP + `/multiplex` (`systems/runtime/lifecycle/runtime/integration.js:24`); `shape.strip` is what crosses (`subsystems/typology/gestalten/shape/strip.js:13-21`) |
| headless / embedded | `--batch` ([43.17 Batch Mode (L)][e-batch]) + `--daemon` | `--headless` · `--embed` ([starting][n-embed]) | `-CC` ([tmux wiki][t-wiki]) | `--json` (`trajectories/index.js:11`; `mod.js:90,116-117`) + `launch: inline \| embedded` (m79:225 F7) |
| remote / joined | `emacsclient` ([41.3 (L)][e-client]) | `--server … --remote` ([remote][n-remote]) | `attach-session` ([CLIENTS AND SESSIONS][t-clients]) | join an ALIVE instance (m79:207 law; m79:224 F6; `systems/ghost/trajectories/instance/start.js:31-37`) |
| teardown | `C-x C-c` in a client frame deletes the frame, not the session ([41.3 (L)][e-client]) | `--embed`: "If the channel is closed … Nvim exits" ([starting --embed][n-embed]) | `detach-client` ([CLIENTS AND SESSIONS][t-clients]) | esc → die · lock · Terminal row (m79:276 M11; m79:2995) |

---

## 3. the deep sections

### 3.1 Emacs — the longest

**The architecture, in fourteen bullets.**

1. **The buffer is the datum.**
   - A buffer is "a Lisp object containing text to be edited". Buffers "may or may not be displayed in any windows" ([Elisp 28.1 Buffer Basics (L)][e-buffer]).
   - A subprocess's output is "inserted in the associated buffer", and killing the buffer kills the process ([Elisp 41.9.1 Process Buffers (L)][e-procbuf]).
   - Data and its view are separate objects.
2. **One major mode per buffer, any number of minor modes.**
   - "Each buffer has exactly one major mode at a time." A major mode cannot be turned off, only replaced ([Elisp 24.2 Major Modes][e-major]).
   - Minor modes "can be enabled individually or in combination", and "It should be possible to activate and deactivate minor modes in any order" ([Elisp 24.3 Minor Modes][e-minor]).
3. **Modes are made by derivation.** `define-derived-mode` gives the new mode its own keymap, whose parent is the parent mode's keymap. It also gets its own syntax table, abbrev table and mode hook, and runs the ancestors' hooks first ([Elisp 24.2.4 Defining Derived Modes][e-derived]).
4. **Hooks are the extension seam.**
   - "Every major mode command is supposed to run a normal hook called the 'mode hook' as one of the last steps of initialization" ([Elisp 24.1 Hooks (L)][e-hooks]).
   - Normal hooks take no arguments. Abnormal hooks take arguments and may return values (same node).
5. **Commands are declared by `interactive`.**
   - `interactive` "declares that a function is a command, and that it may therefore be called interactively". Its argument descriptor "declares how to compute the arguments to the command when the command is called interactively".
   - Called from Lisp, "the caller supplies the arguments and ARG-DESCRIPTOR has no effect" ([Elisp 22.2.1 (L)][e-interactive]).
   - The same function therefore has an interactive face and a programmatic face.
6. **A command can declare the modes it belongs to.** `(interactive "p" dired-mode)` marks a command "as applicable to ‘dired-mode’ only (or any modes that are derived from ‘dired-mode’)". This changes completion in `M-S-x` ([Elisp 22.2.4 Specifying Modes For Commands (L)][e-cmdmodes]).
7. **The command loop.** It reads a key sequence, translates it "into a command through the currently active keymaps", reads the arguments through `command-execute`, and runs `pre-command-hook` and `post-command-hook` around each command ([Elisp 22.1 Command Loop Overview (L)][e-loop]).
8. **Keymaps have a precedence by source.**
   - Highest first: `overriding-terminal-local-map`, `overriding-local-map`, the text/overlay `keymap` property, minor-mode maps, the buffer's local map, then the global map, which "is always active".
   - Source: [Elisp 23.7 Active Keymaps][e-keymaps].
9. **Recursive editing.**
   - "Lisp programs can also invoke the command loop … we call it 'recursive editing'." A recursive level suspends the command that invoked it.
   - "All command loops, including recursive ones, set up all-purpose error handlers so that an error in a command run from the command loop will not exit the loop."
   - "Minibuffer input is a special kind of recursive editing." `C-]` aborts one level.
   - Source: [Elisp 22.13 Recursive Editing (L)][e-recursive].
10. **The minibuffer.**
    - It is "a normal Emacs buffer" shown in a window that "always appear[s] at the bottom of a frame", starting with a read-only prompt ([Elisp 21.1 (L)][e-mini]).
    - Nesting is off by default. With `enable-recursive-minibuffers` nil "you cannot invoke minibuffer commands when the minibuffer is active" ([Elisp 21.13 Recursive Minibuffers (L)][e-recmini]).
11. **Mode line and echo area.**
    - The mode line comes from the buffer-local `mode-line-format`. It is recomputed only "when circumstances appear to call for it", and code that changes its inputs must call `force-mode-line-update` ([Elisp 24.4.1 Mode Line Basics (L)][e-modeline]).
    - The user-facing format ends `(MAJOR MINOR)` ([Emacs 1.3 The Mode Line (L)][e-modeline-user]).
    - The echo area shows errors, `message` and keystroke echo, and "is not the same as the minibuffer, despite the fact that the minibuffer appears … in the same place" ([Elisp 42.4 The Echo Area (L)][e-echo]).
12. **Frames, windows, terminals.**
    - A frame holds windows ([Elisp 30 Frames (L)][e-frames]).
    - "On a text terminal, each Emacs frame fills the entire terminal screen" ([Elisp 29.1 (L)][e-windows]).
    - One Emacs "can use multiple terminals simultaneously in each session" ([Elisp 30.2 Multiple Terminals (L)][e-terminals]).
13. **Server and client.**
    - `--daemon` "calls ‘server-start’ after initialization and does not open an initial frame" ([Emacs 41 Using Emacs as a Server (L)][e-server]).
    - `emacsclient -c` creates "a new graphical 'client frame'", and `-t` does the same on the current text terminal.
    - `C-x C-c` in a client frame "does not kill the Emacs session … Instead, Emacs deletes the client frame".
    - `--alternate-editor=""` starts a daemon "only if no Emacs daemon is already running".
    - Sources: [Emacs 41.3 emacsclient Options (L)][e-client] and [41 (L)][e-server].
14. **Self-documentation.**
    - "Every Emacs command has a name"; "Most Emacs commands have no key bindings, so the only way to run them is by name" ([Emacs 11 Running Commands by Name (L)][e-mx]).
    - `C-h k` explains a key; `which-key` "displays keybindings following your currently entered incomplete command" ([Emacs 12.2 Documentation for a Key (L)][e-keyhelp]).
    - `C-h x` documents a command by name ([Emacs 12.3 (L)][e-namehelp]).
    - Apropos searches by pattern ([Emacs 12.4 (L)][e-apropos]).
15. **Headless.** `-batch` means "Emacs does not read commands from the terminal … Emacs exits with a non-zero exit status" on an unhandled error ([Elisp 43.17 Batch Mode (L)][e-batch]).
16. **Redisplay belongs to the engine.** "Emacs normally tries to redisplay the screen whenever it waits for input" ([Elisp 42.2 Forcing Redisplay (L)][e-redisplay]). Extension code requests a redisplay; it never draws.

**What ghost should steal.**

- **One function, two faces.** This is the `interactive` spec ([22.2.1 (L)][e-interactive]).
  - Our `open({ nature, valence, schema })` (`systems/ghost/trajectories/index.js:23-31`) is already the declaration. Today it feeds only `help` (`help.js:9-18`) and the bare-flag check (`systems/ghost/mod.js:157-181`). "nothing validates" (`.ikiro/world/codemap/ghost.md:8`).
  - Emacs's lesson: the declared interface is how the *interactive* path collects missing arguments. Without a TTY it has no effect, and the caller supplies everything.
  - `walk(vector, more)` (`subsystems/typology/gestalten/steer/dispatch.js:95-114`) is our version of this for path segments: it asks `more(position.patterns)` when the signal runs short (`dispatch.js:103`).
  - Extending it from patterns to the leaf's `schema` would give every verb a picker or wizard for free, and keep `--json` parity (`mod.js:104-108` throws in a pipe).
  - Bears on: m79:204 (one grammar) · M1 (m79:266) · M3 (m79:268). QUESTIONED.
- **The command loop's error wall.** "an error in a command run from the command loop will not exit the loop" ([22.13 (L)][e-recursive]).
  - The quest's `Session.more` already catches into `$error` (m79:2984-2993).
  - Stealing the *law* means the root middleware's catch (`mod.js:42-48`) must not end the shell when the same trajectory is re-entered. It doesn't: `ctx.call` builds an inner context (`mod.js:64-69`).
  - What is not covered: a fault thrown in the render middleware's `finally` (`mod.js:121-123`) while the shell holds the head.
  - Bears on: the law m79:202 and M11 (m79:276).
- **Mode-scoped commands.**
  - `interactive … dired-mode` ([22.2.4 (L)][e-cmdmodes]) is the closest precedent for "a mode offers verbs to ghost".
  - The command stays in the global name space, but completion and help filter it by the current mode.
  - Ours: a verb could stay on the daemon aperture (option (i), §4), and `help` could filter it by the seated mode. Bears on M4 (m79:269: "`help` shows a `modes` group").
- **Precedence by source, written down.**
  - Emacs ranks *who* contributed a binding ([23.7][e-keymaps]). The quest ranks *what kind of pattern* matched: `literal < parameter < wildcard < remainder` (m79:203; the ranked `feed` at m79:747-758).
  - The two axes are orthogonal. While only ghost contributes edges, kind is enough. Once modes contribute (references today, verbs in §4 (ii)), the trie needs a written rule for a mode's literal against a command's literal.
  - The quest settles collisions by renaming. A slug that is already an edge lives under its daemon: `references.nature(trajectory, row, all)` asks `trajectory.trie.has(row.slug)` (m79:1431-1432). The hand-kept `VERBS` set is gone (probe 2, m79:3319). That is a source precedence — shell edges win over references — made by renaming, not ranking. Emacs does the opposite: the local map beats the global map ([23.7][e-keymaps]).
  - F16's sigil (m79:234) is the same question inside the Dock, where the quest leans the other way (bare text is a turn, `/` opens the trajectory).
  - **Where this study disagrees with the quest.** The quest's "held" (m79:3326) reads Emacs's stack and our segment-type rank as one rule, "the specific beats the general". The stack ranks *contributors*, the rank ranks *pattern kinds*, so they agree only while one contributor owns the trie.
  - QUESTIONED: the source rule, written once for the shell argv and the Dock. Bears on the law m79:203, M2 (m79:267) and F16 (m79:234).
- **Client frame ≠ session.**
  - `C-x C-c` in an `emacsclient` frame deletes the frame and leaves the server and its buffers alive ([41.3 (L)][e-client]).
  - The quest's esc tears down "die · lock · row" (m79:276, m79:2995-2998). For `launch: embedded`, the Emacs model says esc should drop the *client* (the Terminal row is optional) and never the runtime.
  - The quest's `hosting.disintegrate()` does the right thing only if it distinguishes inline from embedded. QUESTIONED.
  - Bears on F6 (m79:224) · F11 (m79:229) · M8 (m79:273).
- **The mode line's update discipline.**
  - The mode line is recomputed on events, not continuously, and is forced explicitly ([24.4.1 (L)][e-modeline]).
  - A chrome status line in ghost (§5) should derive from atoms that change rarely (`terminal.$thread`, identity, hosting), never from the per-delta `$live` (m79:2974).

**What ghost must not copy.**

- **A single-threaded image as the host.** Emacs's own TODO names concurrency and the redisplay granularity as open problems ([etc/TODO (L)][e-todo]).
  - m79's inline host runs the runtime *in the ghost process* (m79:206; M8 m79:273). Every daemon beat, every SSE generator and every ink re-render then share one Deno event loop.
  - The redisplay analogue is real: the quest's turn loop sets `$live` on every soma delta (m79:2974), and the Dock re-renders through `useStore` (m79:3128-3138). That is Emacs's "redisplay whenever it waits for input" without Emacs's coalescing.
  - Bears on F7 (m79:225) and M12 (m79:277) — see §6 risk 2.
- **The extension language as unrestricted host code.**
  - Emacs trusts every package with the whole process ([Elisp 1 Introduction (L)][e-intro]).
  - Our invariant refuses that for clients: "nothing domain or mode specific can be loaded rendered or run on the client" (`.ikiro/world/codemap/invariants.md:17`).
  - §4 option (iii) is the place where this temptation returns.
- **Hooks as an unordered global bus.**
  - Emacs hooks are lists of functions run on occasions ([24.1 (L)][e-hooks]).
  - Ours are ordered Vectors whose middleware order is law (`.ikiro/world/codemap/ghost.md:10`; `mod.js:22-124`). Keep the order explicit. A `pre-command-hook` analogue is a `.use()` on the trajectory, not a list.

### 3.2 Neovim

**The architecture, in eleven bullets.**

1. **An API used by everyone.**
   - "Nvim exposes a powerful API that can be used by plugins and external processes via RPC, Lua and Vimscript."
   - "RPC is the main way to control Nvim programmatically."
   - "Nvim processes all messages … in the order they are received", and responses come back "in reverse order of requests".
   - Source: [api "API Usage"][n-api].
2. **The API describes itself.**
   - `nvim_get_api_info()` and `--api-info` return a metadata map: `version.api_level` ("API version integer"), `version.api_compatible` ("API is backwards-compatible with this level"), `version.api_prerelease`, `functions`, `ui_events`, `ui_options`, `{fn}.since`, `{fn}.deprecated_since`.
   - "External programs (clients) can use the metadata to discover the API."
   - Source: [api "API metadata"][n-meta].
3. **The contract.**
   - "New functions and events may be added. Any such extensions are OPTIONAL: old clients may ignore them."
   - "Function signatures will NOT CHANGE after release". Maps "may be EXTENDED"; "Deprecated functions will not be removed until Nvim 2.0".
   - "The idea is 'versionless evolution'."
   - Source: [api "API contract"][n-contract].
4. **The UI is a client.**
   - "UIs can be implemented as external client processes". `nvim_ui_attach()` is how a program asks to draw the grid, and a UI can "connect to a running Nvim instance and invoke nvim_ui_attach()".
   - Source: [api-ui-events "UI Events" · "ui-option"][n-ui].
5. **Redraw is batched and flushed.**
   - Nvim sends `redraw` notifications holding "an array (batch) of screen 'update events'".
   - "The user should only see the final state (when 'flush' is sent)".
   - Source: [api-ui-events "UI Events"][n-ui].
6. **Externalized widgets.**
   - `ext_cmdline` · `ext_messages` · `ext_popupmenu` · `ext_tabline` · `ext_multigrid` · `ext_hlstate` · `ext_linegrid` · `ext_termcolors` let a UI draw those elements itself. Nvim sends them "'semantically' as structured events instead of raw grid-lines".
   - "Specifying an unknown option is an error; UIs can check the api-metadata ui_options key."
   - With several UIs attached, "the active capabilities are the intersection of those requested".
   - Source: [api-ui-events "ui-ext-options"][n-ui].
7. **Forward compatibility of events.** "Future versions of Nvim may add new update kinds and may append new parameters … Clients must be prepared to ignore such extensions" ([api-ui-events "UI Events"][n-ui]).
8. **Embedded and headless.**
   - `--embed`: "Use stdin/stdout as a msgpack-RPC channel … Waits for a client to call nvim_ui_attach() before sourcing startup files"; "If the channel is closed … Nvim exits".
   - `--headless`: "Start without UI, and do not wait for nvim_ui_attach".
   - `--listen {addr}`: "Start RPC server on pipe or TCP address".
   - Source: [starting --embed · --headless · --listen][n-embed].
9. **Remote control.** `--server {addr}` connects for remote commands; `--remote-ui` will "Display the UI of the server in the terminal" ([remote "1. Common functionality"][n-remote]).
10. **Remote plugins.**
    - They are "coprocesses that have a direct communication channel (via RPC)".
    - `:UpdateRemotePlugins` "generates the remote plugin manifest … declarations for all Vimscript entities (commands/autocommands/functions) defined by all remote plugins", and a host is bootstrapped "as soon as the declared command … is used for the first time".
    - Source: [remote_plugin "1. Introduction" · "4. Remote plugin manifest"][n-rplugin].
11. **Health and commands.**
    - `:checkhealth` "Run all healthchecks". A plugin adds one by shipping a `health.lua` "that returns a table with a 'check()' function. Then :checkhealth will automatically find and invoke the function" ([health "health-commands" · "Create a healthcheck"][n-health]).
    - User commands "must start with an uppercase letter to distinguish it from builtin commands" ([lua-guide "Creating user commands"][n-luaguide]). Their opts carry `nargs`, `complete`, `desc` ([api "nvim_create_user_command()"][n-usercmd]).

**What ghost should steal.**

- **A version on the strip.**
  - Today `/metadata/aperture` returns `shape.strip(die.daemon.aperture)` (`systems/runtime/lifecycle/daemon/aperture/metadata.js:11`).
  - The strip's edge carries `input · output · yields · feeds · methods` and nothing else (`subsystems/typology/gestalten/shape/strip.js:3-11`):

```js
// subsystems/typology/gestalten/shape/strip.js:3
const edgeMeta = (pattern, effect) => {
  const meta = {};
  if (pattern?.input !== undefined) meta.input = pattern.input;
  if (pattern?.output !== undefined) meta.output = pattern.output;
  if (pattern?.yields !== undefined) meta.yields = pattern.yields;
  if (pattern?.feeds !== undefined) meta.feeds = pattern.feeds;
  if (effect?.methods) meta.methods = Object.keys(effect.methods);
  return meta;
};
```

  - No metadata route carries an API level.
    - `/metadata/manifest` returns the authored manifest (`metadata.js:7`). The `Manifest` schematic's `version` is optional (`subsystems/typology/schematics/primitives/manifest.js:9`), and where it is set it is a package version (`commons/instances/hello-world/instance.viva.js:26` `version: "0.0.1"`), not a wire level.
    - So a ghost **cannot know it is talking to an older daemon**. It can only find out at call time, by a 404 (`subsystems/typology/gestalten/shape/http.js:14`).
  - The Neovim shape would be one integer `level` on `/metadata/manifest` (or `/status`), plus `since` / `deprecated_since` on an edge (`edgeMeta` is where it goes).
  - Proposed snapshot, not a schematic:

```json
{ "type": "daemon", "slug": "hello", "level": 3, "compatible": 2 }
```

  - QUESTIONED: the noun (`level` joins no metaphor family yet). Bears on law m79:206 (the client speaks through a Connection) and M10 (m79:275).
- **Ignore what you don't know — already half true.**
  - The runtime silently skips an undeclared trait implementation (`systems/runtime/gestalten/belt/stagger.js:6`).
  - anima's client does the same (`systems/anima/src/typology/gestalten/belt/runner.js:5` `traitNamespace[trait]?.(…)`).
  - `shape.connection.wire` skips `*` / `(.*)` with a warning (`subsystems/typology/gestalten/shape/connection.js:7-9`).
  - That is Neovim's "Clients must be prepared to ignore such extensions" ([UI Events][n-ui]) and LSP's "Clients should ignore server capabilities they don't understand" ([LSP "Message Documentation"][lsp-msg]).
  - What is missing is the other half, "Function signatures will NOT CHANGE after release" ([API contract][n-contract]): nothing stops a trait's strip from changing shape under the same name. Written law owed. Bears on §4 (ii).
- **`ext_*` as the model for trait-gated rendering.**
  - The server sends structure and the client decides how to draw it ([ui-ext-options][n-ui]).
  - This is exactly STRIPWIRE: "one trait Vector stripped daemon-side … wired client-side" (`.ikiro/world/codemap/invariants.md:10`), where the strip "IS the contract" (`.ikiro/world/codemap/runtime.md:27`).
  - ghost rendering a harnessed mode as a Dock (m79:3128) is an `ext_messages`-style client choice. Keep it that way. Bears on M12.
- **`:checkhealth` discovered per extension.**
  - `instance/doctor` reads the recipe, the env and the lock (`systems/ghost/trajectories/instance/doctor.js:85-103`). It never asks a daemon or a mode.
  - A mode that knows how to be unhealthy (a blank mountpoint is "the doctor's fault", `.ikiro/world/codemap/runtime.md:19`) has no way to say so.
  - Neovim's `health.lua` + `check()` ([health-dev][n-health]) points at a mode export or a trait read by the runtime and stripped to `/metadata/<mode>/health`. That would be a new behaviour, so a sibling export (`.ikiro/ikiro.md:12`), and the closed set of twelve (`.ikiro/skills/mode/SKILL.md:27-40`) grows by one. QUESTIONED. Bears on M10 (`client.test.js` "every daemon `healthy`", m79:275).
- **`--embed` vs `--headless` as two words.**
  - Neovim separates "a UI will attach" from "no UI, stdio is a channel" ([starting][n-embed]).
  - m79's `launch: inline | embedded` (F7, m79:225) is a *hosting* word. `ctx.interactive` (`mod.js:90`) is the *UI* word. Keep the two orthogonal: an inline host with `--json` is Neovim's `--headless --embed`.
  - M11's gate "`--json` verbs byte-equal before/after" (m79:276) is the right test.
- **Namespace the contributed names.**
  - Neovim reserves lowercase for built-ins ([lua-guide][n-luaguide]).
  - The quest's references that collide with shell edges are now moved under their daemon by asking the trie (m79:1431-1432; the `VERBS` list was removed by probe 2, m79:3319). That is structural, as Neovim's rule is.
  - What Neovim adds is a namespace the operator can *see*: an uppercase name is never a built-in. A `<daemon>/<slug>` reference is visible too, but only after a collision. QUESTIONED: always namespaced, or only on collision. Bears on M4 (m79:269).

**What ghost must not copy.**

- **A second plugin process per extension.** Neovim's rplugins are coprocesses ([remote_plugin][n-rplugin]). Our modes already live in the daemon. The daemon *is* the plugin host, and its aperture *is* the RPC surface (m79:195). Don't invent a ghost-side host.
- **Three API layers.**
  - Neovim carries Vim's layer beside its own ([lua-guide "About the API"][n-luaguide]).
  - m79 deletes `ShellSignal` instead of keeping two grammars (M1, m79:266; m79:204). Keep deleting: `buffer.render · hijack · BufferControl` dissolve in M3 (m79:268).
  - The Neovim lesson is that a kept compatibility layer becomes permanent.

### 3.3 tmux

**The architecture, in ten bullets.**

1. **A multiplexer.** tmux lets "a number of terminals [be] created, accessed, and controlled from a single screen", and can be "detached from a screen and continue running in the background, then later reattached" ([DESCRIPTION][t-desc]).
2. **Session, window, pane.** "A session is a single collection of pseudo terminals"; a window "may be split into rectangular panes"; "Any number of tmux instances may connect to the same session" ([DESCRIPTION][t-desc]).
3. **One server, many clients.** "all sessions are managed by a single server. The server and each client are separate processes which communicate through a socket in /tmp" ([DESCRIPTION][t-desc]).
4. **Attach and detach.**
   - `attach-session`: "target-session must already exist"; `new-session -A` creates or attaches; `-d` detaches other clients.
   - `detach-client` leaves the session alive.
   - Source: [CLIENTS AND SESSIONS][t-clients].
5. **Target resolution has a precedence and an ambiguity error.**
   - target-session is tried as "1. A session ID … 2. An exact name … 3. The start of a session name … 4. A glob(7) pattern".
   - "multiple matches produce an error". A leading `=` forces exact match.
   - Source: [COMMANDS][t-cmds].
6. **Key tables and the prefix.**
   - `bind-key -T key-table`: keys bind into the prefix table by default; the root table works without the prefix ([KEY BINDINGS][t-keys]).
   - `prefix key` sets the prefix ([OPTIONS][t-options]).
7. **The status line.**
   - By default it shows "the name of the current session in square brackets; the window list; the title of the active pane …; and the time and date" ([STATUS LINE][t-status]).
   - `status-format[]` builds each line from `status-left` / `status-right` and the window list ([OPTIONS][t-options]).
   - `command-prompt` and `display-message` both use the status line ([STATUS LINE][t-status]).
8. **Formats.** `#{…}` variables and `#{?cond,a,b}` conditionals render state into text ([FORMATS][t-formats]).
9. **Hooks.** "Most tmux commands have an after hook", and `command-error` fires on failure ([HOOKS][t-hooks]).
10. **Control mode.**
    - "a client sends tmux commands … Each command will produce one block of output … %begin … %end or %error", and tmux sends asynchronous `%`-notifications ([CONTROL MODE][t-control]).
    - It was "designed and written by George Nachman" so that iTerm2 can "show tmux panes using the iTerm2 UI", and `-CC` "disables canonical mode … and is intended for applications" ([tmux wiki "Control mode" · "Entering control mode"][t-wiki]).
    - `pipe-pane` and `send-keys` move bytes in and out of a pane ([WINDOWS AND PANES][t-panes] · [KEY BINDINGS][t-keys]).

**What ghost should steal.**

- **Precedence plus a typed ambiguity error — the M2 shape.**
  - tmux ranks how a name matched (ID > exact > prefix > glob) and errors on more than one match ([COMMANDS][t-cmds]).
  - That is m79's ranked `feed` with `Ambiguous` (m79:747-758; law m79:203).
  - Steal the `=` escape too: a way for the operator to force exact-literal matching, so `viva =home` never falls into the remainder. QUESTIONED. Bears on M2 (m79:267) and M4 (m79:269).
- **The session outlives the client.**
  - In vivalence the persistent server-side object already exists: the Terminal row — `identity · daemon · thread · index · traits · trait`, kept in the lighthouse (`subsystems/typology/entities/lighthouse/Terminal.ts:19-26`, `index` counted per identity at `:12-16`).
  - F11's lean is "one per ghost SESSION (created, removed on exit)" (m79:229). That is the opposite of tmux: it throws away the very thing `attach` would re-join.
  - A tmux-shaped F11: esc *detaches* (the row stays, seated on its thread). `viva` with a terminal index (or `viva attach`) re-seats the row and the Dock replays `thread.$turns` (m79:3171).
  - anima already re-joins terminals that way (`terminals.create()` is never automatic, m79:118).
  - QUESTIONED. Bears on F11 · M11 (m79:276) · M13 (m79:278).
- **One command language for humans and machines.**
  - Control mode reuses the human commands "rather than duplicating a separate command set" ([tmux wiki][t-wiki]).
  - Ours: `--json` on every verb (`systems/ghost/trajectories/index.js:11`; `mod.js:116-117`), and the shell re-enters the same trajectory per line (`Session.more` → `ctx.call(Signal.tokens(line))`, m79:2984-2986).
  - Hold the law: no verb exists only inside the shell. Bears on law m79:202 and M11's gate (m79:276).
- **Formats for the chrome.**
  - The tmux status line is configuration over state variables ([FORMATS][t-formats]), not code.
  - A ghost status line could be a format string over the session's atoms. That is the declarative way a mode could add a segment without shipping code (§4 (ii), §5). QUESTIONED.
- **After-hooks and `command-error`.**
  - tmux fires a hook after each command and on failure ([HOOKS][t-hooks]).
  - Ours: the span middleware already marks subject · fault · close per verb (`mod.js:23-39`), but spans are in-memory only (`.ikiro/world/codemap/ghost.md:18`).
  - A shell that runs many verbs is where a persisted ghost span starts to pay. QUESTIONED.

**What ghost must not copy.**

- **A pty per pane.** tmux's content unit is a terminal byte stream ([DESCRIPTION][t-desc]). Ours is a typed buffer and typed turns (`systems/runtime/lifecycle/mode/traits/application.js:14-20`; soma folds, m79:121). `pipe-pane`-style byte piping would discard the types the wire already carries (`yields` on an edge, `strip.js:7`).
- **A text-only control protocol.** Control mode's `%begin/%end` framing ([CONTROL MODE][t-control]) is what you build when there is no structured wire. We have one: `Connection` with `call · stream · publish · converse` (`subsystems/typology/prototypes/connection.js:90,107,127,179`).
- **A server-wide prefix key.** tmux's prefix exists because tmux sits *in front of* another program's input ([KEY BINDINGS][t-keys]). ghost's shell owns its input (the Dock's `useInput`, m79:3140). A prefix would only be needed if a mode's ink component (§4 (iii)) took the keyboard.

### 3.4 the nods — one paragraph each

**Blender operators.**
- **Shape.** An operator is a class with `poll` ("Test if the operator can be called or not"), `invoke` ("used to initialize the operator from the context at the moment the operator is called … typically used to assign properties which are then used by execute()"), `execute` (returns `{'FINISHED'}` or `{'CANCELLED'}`) and `modal`, which "will keep being run to handle events until it returns {'FINISHED'} or {'CANCELLED'}". Operators "must be registered before accessing them" ([bpy.types.Operator "Basic Operator Example" · "Invoke Function" · "Modal Execution"][b-op]).
- **The sentence for ghost.** "Some operators don't have an execute() function, removing the ability to be repeated from a script or macro" ([Invoke Function][b-op]). That is our headless-parity rule in Blender's words:
  - `invoke` ≙ the interactive collection a picker does when `ctx.interactive` (`mod.js:90`);
  - `execute` ≙ the handler on full params;
  - `modal` ≙ a `view.render` that holds the head until it releases (`subsystems/sheets/mod.jsx:111-122`; M3, m79:268);
  - `poll` ≙ what we lack: a declared "can this verb run here" (an instance mounted, a TTY present) that `help` could show. QUESTIONED.

**Acme and the plumber (Plan 9).**
- **Acme.** A window is "a one-line tag above a multi-line body". The tag's first word is the window's name, "and the other words are commands available in that window", and "acme maintains a set of commands appropriate to the state of the window" ([acme(1) "Windows"][p9-acme1]). Acme serves its windows as files: it is "posted as the 9P service acme" ([acme(4) DESCRIPTION][p9-acme4]).
- **The plumber.** It "receives, examines, rewrites, and dispatches" messages by rules ([plumber(4)][p9-plumber]): "the rule sets are examined in order … If a rule set is triggered, the rest are ignored" ([plumb(7) "Plumbing rules"][p9-plumb]).
- **Two lessons.**
  - The **tag** is a chrome line whose words are the live commands of the content below it. A mode's verbs rendered as the status line's words is Acme's answer to "the viva chrome" (§5).
  - The **plumber** is a first-match router from free text to a destination port — m79's references + yap (m79:156-164), with first-match-in-order as precedence. That is today's insertion order (`subsystems/typology/gestalten/steer/match.js:3-7`), which m79 replaces with ranking (M2).

**LSP.**
- **Capabilities are negotiated, not assumed.** "Not every language server can support all features … A development tool and the language server announce their supported features using capabilities … exchanged between the client and server during the initialize request" ([LSP 3.17 "Capabilities"][lsp-caps]).
- **Ordering and unknowns.** "Until the server has responded to the initialize request … the client must not send any additional requests" ([LSP "Initialize Request"][lsp-init]). Clients "should ignore server capabilities they don't understand" ([LSP "Message Documentation"][lsp-msg]).
- **Method names namespace the surface by the object they act on.** `textDocument/didOpen` · `textDocument/didChange` · `textDocument/didClose` "is mandatory" and "a server must either implement all three of them or none" ([LSP "Text Document Synchronization"][lsp-sync]).
- **Ours.**
  - The daemon's handshake (`/userspace/handshake` then `/status` · `/metadata/*`, m79:115) *is* an initialize phase, but the client announces nothing.
  - A ghost could announce `{ client: "ghost", renders: ["dialogue"] }`, so that a daemon (or a mode trait) knows a terminal and not a browser is on the other end. QUESTIONED. Bears on M10 (m79:275).
  - Our paths already namespace by object (`/mode/<type>/<slug>/harness/dialogue/stream`, `systems/runtime/lifecycle/mode/traits/harnessed.js:204-209`), and the harness is "a FIXED functional lexicon" (`.ikiro/world/codemap/runtime.md:39`), the LSP `textDocument/*` discipline.

**VS Code `contributes`.**
- **Declarations, not code.** "Contribution Points are a set of JSON declarations that you make in the contributes field of the package.json Extension Manifest" ([Contribution Points][vs-cp]).
- **Commands are UI declarations.** `contributes.commands` declares "the UI for a command consisting of a title and (optionally) an icon, category, and enabled state. Enablement is expressed with when clauses". Invoking one makes VS Code "emit an activationEvent onCommand:${command}" ([contributes.commands][vs-cmds]). Keybindings, menus, views and viewsContainers are further contribution points of the same kind ([Contribution Points][vs-cp]).
- **The host draws everything.** The extension declares; the host draws.
- **Ours.** That is §4 option (ii) exactly, and it is how the domain-blind invariant (`.ikiro/world/codemap/invariants.md:17`) and "a new behavior is a sibling export, never a manifest key" (`.ikiro/skills/mode/SKILL.md:42`) can both hold: the declaration is an *export*, read by the runtime and stripped.

---

## 4. the two wirings of a mode into ghost

### 4.1 what a client learns today

**The runtime, not the client, publishes a mode's existence and its doors.**

```js
// systems/runtime/lifecycle/daemon/aperture/metadata.js:14
  root.open("/modes", () =>
    die.daemon.flatmodes().map((mode) => ({
      type: mode.manifest.type,
      slug: mode.manifest.slug,
      name: mode.manifest.name ?? mode.manifest.slug,
      traits: mode.manifest.traits,
      metadata: `${die.daemon.reference.nature}/mode/${mode.manifest.type}/${mode.manifest.slug}/metadata`,
    })),
  );
```

**Per mode, the doors are trait-conditional.** This is from `metadata.js:24-49`:

| route | read when | file:line |
|---|---|---|
| `/manifest` · `/aperture` | always | `metadata.js:27-28` |
| `/statics` · `/mountpoint` | the mode has them | `metadata.js:29-30` |
| `/application` | APPLICATION | `metadata.js:32-40` |
| `/emitter` | EMITTER | `metadata.js:42` |
| `/freight` | FRAUGHT or MOUNTED | `metadata.js:44` |
| `/harness` | HARNESSED | `metadata.js:46-48` |

- **The runtime composes every mode's path.** It branches `mode.aperture` under `mode.reference.nature` (`systems/runtime/lifecycle/daemon/resolution.js:26`).
- **The `metadata` row is published but unused.** `/metadata/modes` hands out the runtime-composed `metadata` path (`metadata.js:20`), and no client reads it:
  - `grep -rn "metadata/modes"` over `systems/anima/src systems/ghost subsystems` finds only a commented line at `subsystems/typology/specimen/snapshot.js:59`.
  - anima instead lists modes through the datamap (`daemon.entities.mode.find()`, m79:116).
  - anima **composes the mode path itself**:

```js
// systems/anima/src/typology/entities/mode/mode.js:62
      ctx.entity.reference = ctx.daemon.reference.branch(`/mode/${ctx.entity.type}/${ctx.entity.slug}`);
      ctx.entity.connection = ctx.daemon.connection.branch(`/mode/${ctx.entity.type}/${ctx.entity.slug}`);
```

  - That contradicts the quest's law, "the runtime composes every path, a client composes none" (m79:206). M6 moves exactly this file into `@vivalence/ghost/client` (m79:271; deliverable c, m79:245). The finding is listed as §6 risk 1.
- **Client-side wiring is by trait and by strip.**
  - anima runs a per-trait wire over the mode entity (`systems/anima/src/typology/entities/mode/mode.js:57` `applyTraits(traits)`; runner `systems/anima/src/typology/gestalten/belt/runner.js:1-9`).
  - EXPOSED reads `/metadata/aperture` and wires it (`systems/anima/src/typology/entities/mode/traits/exposed.js:3-6`).
  - APPLICATION reads `/metadata/application` → a `View` by url (`systems/anima/src/typology/entities/mode/traits/application.js:3-10`).
  - HARNESSED reads `/metadata/harness` (`systems/anima/src/typology/entities/mode/traits/harnessed.js:38`).
- **The client is domain-blind by invariant.** "nothing domain or mode specific can be loaded rendered or run on the client … mode UI only through the APPLICATION bundle seam (buffer views bundled server-side, loaded by id)" (`.ikiro/world/codemap/invariants.md:17`). The bundle is served by the runtime under `/attached/bundle/<daemon>/<mode>/…` with an integrity header (`systems/runtime/lifecycle/runtime/resolution.js:31-47`).
- **The trait set is open on both sides.**
  - runtime: `traits[trait]?.(mode, daemon)` (`systems/runtime/gestalten/belt/stagger.js:6`);
  - client: `traitNamespace[trait]?.(ctx.entity, ctx)` (`runner.js:5`).
  - A trait has three homes that drift: behaviour, `ModeTraitsEnum`, and the client's `implements(…)` (`.ikiro/world/codemap/runtime.md:51`; enum `systems/runtime/entities/kernel/Mode.ts:10-42`).
- **Two declared-interface vocabularies exist today.**
  - ghost verbs: `{ nature, valence, schema }` (`systems/ghost/trajectories/index.js:24-31`), read by `census` as `frame.signature.schema` and `.valence` (`systems/ghost/trajectories/help.js:9,18`).
  - daemon doors: `{ nature, input, output }` (`~/.viva/registry/education/modes/home/aprende/aperture/message.js:5-10`).
  - The wire strip carries `input · output · yields · feeds · methods`, and **neither `valence` nor `schema`** (`strip.js:3-11`). Yet `valence` is a known pattern key elsewhere: `shape.mcp` reads `pattern.valence` as a tool description (`subsystems/typology/gestalten/shape/mcp.js:11`).
  - So a ghost that renders a daemon's doors today can show a door's input shape, but **never a sentence about what it does**.

### 4.2 how the precedents let an extension add commands, keys and views

- **Emacs major mode.**
  - An extension adds commands by defining `interactive` functions in the same image ([22.2.1 (L)][e-interactive]). It adds keys by its mode keymap, which derivation chains to the parent ([24.2.4][e-derived]). It adds views by writing to buffers.
  - It can declare which modes a command belongs to ([22.2.4 (L)][e-cmdmodes]).
  - **All of it is code running in the host.** Lasting power: decades. The cost is the shared thread ([etc/TODO (L)][e-todo]).
- **Neovim rplugin.**
  - The plugin is a coprocess. Its host writes a manifest of commands · autocmds · functions, which Nvim reads at start so that "each host will only be loaded when required" ([remote_plugin "4. Remote plugin manifest"][n-rplugin]).
  - Views come through the API (buffers, windows) and the UI draws them ([UI Events][n-ui]).
  - **Code runs out of process. The command surface is declared.**
- **VS Code `contributes`.**
  - Commands, keybindings, menus and views are JSON in the manifest ([Contribution Points][vs-cp]). The host draws them; enablement is a `when` clause; activation is lazy (`onCommand`) ([contributes.commands][vs-cmds]).
  - **Declared, host-rendered.**

### 4.3 the options — laid out, not decided

**(i) Through the daemon only.**

*Shape.* The trajectory opens one literal per mode slug the recipe seats, plus `/home` and the root `(.*)` (M4, m79:1378-1445, `references.open` · `yap.open`). Everything a mode offers beyond its harness stays a door on its aperture (EXPOSED, `systems/runtime/lifecycle/mode/traits/index.js:24-34`), reached as `mode.call` from the wired strip (`exposed.js:3-6`). ghost renders a door's effect generically: `view.scroll.emit({ data: ctx.effect }, null, Effect)` (`systems/ghost/mod.js:118-119`) or `--json`.

- **Who composes the path:** the runtime (`resolution.js:26`; `/metadata/modes` row `metadata.js:20`). ghost composes none, provided M6 fixes `mode.js:62-63` (§6 risk 1).
- **What crosses the wire:** `/metadata/modes` + `/metadata/<mode>/aperture` strips — `{effect?, branches}` with `input · output · yields · feeds · methods` (`strip.js:3-21`).
- **Degrading.**
  - An older daemon simply lacks branches, and a call 404s (`http.js:14`).
  - A newer daemon's extra branches are extra properties on the wired object (`subsystems/typology/gestalten/shape/connection.js:5-12`), invisible to `help` (which folds ghost's own trie, `help.js:3-21`).
  - No version tells either side which case it is in (§3.2).
- **Precedent:** Neovim before plugins declare commands — everything goes through `nvim_*` calls ([API Usage][n-api]). Durable, but the operator cannot *discover* a mode's verbs at the prompt. Emacs's lesson is that discovery (`M-x`, `C-h x`) is what made commands usable without bindings ([11 (L)][e-mx]).
- **What it costs:**
  - No new export, no new trait, no change to the closed set (`.ikiro/skills/mode/SKILL.md:27-40`).
  - `help` can learn a `modes` group (M4, m79:269) by folding the strip, but it would print paths and input shapes only, because `valence` does not cross (`strip.js:3-11`). Making `valence` cross is one line in `edgeMeta`, in HOLY typology (`.ikiro/world/codemap/typology.md:5`). QUESTIONED.

**(ii) A declarative trait on the mode's manifest, stripped by the runtime, rendered generically by ghost.**

*Shape.* A mode declares a trait. The runtime reads an export (an existing one or a new sibling) and strips it to `/metadata/<mode>/<route>`. ghost (and anima, if it wants) folds the strip into:
- verbs under the mode's reference edge (`viva flashcards review` → a door);
- a text view (a door's `output` rendered by a generic `Effect` or `JsonTree`, `systems/ghost/mod.js:3,119`);
- completions (a parameter's enumerated values).

**Two sub-shapes:**

- **(ii-a) No new export.**
  - The trait says "this mode's aperture doors are operator verbs". The runtime strips the EXPOSED aperture *with* `valence` and the leaf's declared input. It is a richer `/aperture`, gated by the trait.
  - The trait only *selects* which doors are verbs (by a leaf key such as `verb: true` on the pattern — pattern valence keys ride the last segment, `subsystems/typology/prototypes/pattern.js:17-28`).
- **(ii-b) A sibling export.**
  - Something like `export const commands = new Vector()…` — a 13th member of the closed set. Per law a new behaviour is a sibling export (`.ikiro/ikiro.md:12`; `.ikiro/skills/mode/SKILL.md:42`).
  - Its doors are delegations to tools or emitter verbs, mirroring "Tool-first at the mode: … the aperture WRAPS it" (`.ikiro/skills/mode/SKILL.md:62`).

**Trait names.** House law: trait names are STATES, never capabilities (`.ikiro/world/codemap/runtime.md:39`: `AIMED`, `MASKED` yes, `AIMABLE` no). Candidates:

| candidate | reads as | for | against |
|---|---|---|---|
| `OPERATED` | the mode is operated by the operator | ghost's codemap names ghost "the operator" (`.ikiro/world/codemap/ghost.md:5`); a state like `EXPOSED` · `HARNESSED`; client-neutral — anima could render the same verbs | "operated" is weak about *what* is offered |
| `COMMANDED` | the mode takes commands | joins m79's own noun "commands" (m79:26 beef: /"commands. references."/); says exactly what crosses | "command" is ghost's word for a trajectory edge (m79:156) — a mode's verb would be a command by name but a door by mechanism, two meanings for one word, which the `name` skill exists to refuse |
| `HAUNTED` | the ghost haunts this mode | joins a metaphor family (ghost), as beef's lexicon asks (`.ikiro/world/codemap/ontology.md:48`) | names the CLIENT on the mode — a manifest that knows its client breaks the domain-blind direction in reverse; anima could not reuse it honestly |

All three are QUESTIONED.

- **Who composes the path:** the runtime — the stripped route sits under `mode.reference` (`metadata.js:25`), and the verbs' doors are the mode's own aperture paths.
- **What crosses the wire.** A strip. A JSON snapshot of one possible (ii-a) route `/metadata/<mode>/aperture` with `valence` carried — a proposal, not today's shape:

```json
{ "branches": { "review": { "branches": {}, "effect": { "valence": "the cards due today, oldest first", "input": { "type": "object", "properties": { "limit": { "type": "integer" } } }, "output": { "type": "object" } } } } }
```

- **Degrading.**
  - An older ghost meets a newer trait: skipped silently, on both sides already (`stagger.js:6` · `runner.js:5`). That is the LSP/Neovim "ignore what you don't understand" ([LSP "Message Documentation"][lsp-msg]; [UI Events][n-ui]).
  - A newer ghost meets an older daemon: the trait is absent, so the mode offers no verbs; the reference edge (M4) still opens its harness.
  - The gap is *shape* drift under one trait name: without a level on the strip (§3.2), a changed strip silently mis-renders. VS Code survives this because the manifest schema is versioned by the host (`engines`); that claim is **UNVERIFIED** here, since the `engines` field was not on the fetched page.
- **Precedent:** VS Code `contributes` ([Contribution Points][vs-cp]) and Neovim's rplugin manifest ([remote_plugin][n-rplugin]) — both declare the command surface and let the host draw. Both have lasted because the host owns rendering. That is our invariant (`.ikiro/world/codemap/invariants.md:17`), so (ii) is the option most aligned with what made those two last.
- **What it costs:** a trait's three homes (`.ikiro/world/codemap/runtime.md:51`) — behaviour in `systems/runtime/lifecycle/mode/traits/`, a member in `ModeTraitsEnum` (`Mode.ts:10-42`, or boot dies at flush), a client wire in ghost. (ii-b) also costs a 13th export.

**(iii) A mode ships terminal components that ghost loads by id.**

*Shape.* The APPLICATION analogue for ink.
- A mode exports, say, an ink entry. The runtime bundles it server-side through `paladin.bundler` (today `kind: "svelte"` only, `systems/runtime/lifecycle/mode/traits/application.js:25-29`) and serves it under `/attached/bundle/…` with `x-viva-integrity` (`systems/runtime/lifecycle/runtime/resolution.js:31-47`).
- ghost dynamically imports it and mounts it in the shell's slot (`view.shell`, M3/M11).

- **What it does to the domain-blind invariant.** It keeps the invariant's *letter*: "mode UI only through the APPLICATION bundle seam (buffer views bundled server-side, loaded by id)" (`.ikiro/world/codemap/invariants.md:17`). It changes the *risk*:
  - a browser runs the bundle in a sandbox;
  - ghost runs as `deno run -A` (the supervisor is spawned with `-A`, `systems/ghost/trajectories/instance/start.js:15`; the shell task is `deno run -A mod.js`, `.ikiro/world/codemap/ghost.md:34`).
  - A mode's component would run with the operator's full file and network rights, in the process that may also host the runtime inline (m79:206).
  - Emacs accepts that trust model ([Elisp 1 Introduction (L)][e-intro]); Neovim moved extensions out of process ([remote_plugin][n-rplugin]); VS Code made the UI surface declarative ([Contribution Points][vs-cp]).
- **What it does to "no leaving the mode".**
  - "a mode's files never import outside the mode's directory" (`.ikiro/skills/mode/SKILL.md:58-60`).
  - An ink component needs `ink` + `react`, and ink requires that the component share the *host's* React instance. Package imports are allowed (a mode imports `@vivalence/typology`, `~/.viva/registry/education/modes/home/aprende/aprende.viva.js:1`).
  - But the bundle must *externalize* `@vivalence/sheets` / `react` to ghost's copies. That couples the mode to ghost's sheets version: a version contract the Bundle does not carry today (`View`/`Bundle`, `.ikiro/world/codemap/typology.md:27`).
  - The kit precedent is to copy shared chrome per mode (`buffer/kit/`, `.ikiro/skills/mode/SKILL.md:60`), which does not work for a singleton runtime like React.
- **Who composes the path:** the runtime (`/attached/bundle/<daemon>/<mode>`, `resolution.js:34-38`).
- **What crosses the wire:** code.
- **Degrading.** An older ghost cannot run a newer bundle built against a newer sheets. It crashes at mount, in the operator's process. No level exists to refuse it early.
- **Precedent.** Emacs is the only one of the three where extension views are host-process code, and its project's open TODOs are about exactly the shared process ([etc/TODO (L)][e-todo]).

**Against the quest's own forks.** The live quest has since split this question in two:
- **F15**, a mode's doors on the trajectory (m79:233):
  - (a) never ≈ option (i) above;
  - (b) the strip rebuilt as edges under the mode's literal ≈ (ii-a) without a new trait.
- **F17**, a mode's own terminal face (m79:235):
  - (a) none;
  - (b) a declarative, data-only face the kit renders — a fourth shape not laid out above, closest to VS Code `contributes.views` ([Contribution Points][vs-cp]) and to Neovim's `ext_*` ([ui-ext-options][n-ui]);
  - (c) a bundled ink sheet ≈ option (iii).
- **Trait names.** F17 puts forward `SHEETED` and `CONSOLED` for the face's trait; the candidates above (`OPERATED` · `COMMANDED` · `HAUNTED`) name the *verbs* trait of (ii). Both pairs are STATE words. Whether one trait or two is QUESTIONED.
- **Degradation.** The quest's degradation table (m79:3306-3312) agrees with the analysis here row by row. The gap it does not show is shape drift under one trait name (§6 risk 3).

**Whichever option wins, the quest touches it at:**
- M4's references (m79:269) — the edge a mode's verbs hang under;
- the law "the runtime composes every path" (m79:206);
- F9's client move (m79:227) — where the client-side trait wires live;
- deliverable p's "help shows references" (m79:258).

---

## 5. the chrome question

beef: /"whats the viva chrome in the cli??"/.

### 5.1 what a terminal chrome has universally held

| surface | Emacs | Neovim | tmux |
|---|---|---|---|
| status / mode line | per window, bottom; `(MAJOR MINOR)` ([1.3 The Mode Line (L)][e-modeline-user]) | statusline; tabline externalizable `ext_tabline` ([ui-ext-options][n-ui]) | status line, bottom of each terminal: session · window list · pane title · time ([STATUS LINE][t-status]) |
| input line | minibuffer, bottom of the frame, read-only prompt first ([21.1 (L)][e-mini]) | cmdline, `ext_cmdline` ([ui-ext-options][n-ui]) | `command-prompt`, in the status line ([STATUS LINE][t-status]) |
| message / echo area | echo area, same place as the minibuffer, not the same object ([42.4 (L)][e-echo]) | messages, `ext_messages` ([ui-ext-options][n-ui]) | `display-message`, in the status line for `display-time` ms ([STATUS LINE][t-status]) |
| content region | windows tiling a frame ([29.1 (L)][e-windows]) | grids; `ext_multigrid` per window ([ui-ext-options][n-ui]) | panes tiling a window ([DESCRIPTION][t-desc]) |
| key-hint surface | `which-key` popup after a prefix ([12.2 (L)][e-keyhelp]) | — (popupmenu for completion, `ext_popupmenu`) ([ui-ext-options][n-ui]) | `list-keys`; `bind-key -N note` ([KEY BINDINGS][t-keys]) |

**What is universal across the three:**
- The status line **describes the content under it and is derived, not authored per frame**: recomputed on events ([24.4.1 (L)][e-modeline]); refreshed on change or `status-interval` ([STATUS LINE][t-status]).
- The input line and the message area **share one row and stay distinct objects** ([42.4 (L)][e-echo]; tmux puts both in the status line, [STATUS LINE][t-status]).
- Neovim's lesson is that **every one of these can be handed to the client** ([ui-ext-options][n-ui]). The chrome is the *client's* to draw from structured state.

### 5.2 what "the viva chrome" is today and in m79

- **Today.** `Chrome.jsx` is `<Background><Logo/>{children}</Background>` (`subsystems/sheets/components/Chrome.jsx:6-13`) — a padded frame with a logo.
  - It wraps `view.buffer.render` (`subsystems/sheets/mod.jsx:126-141`; no callers, m79:100) and `view.buffer.shell()` (`mod.jsx:144-168`; the only caller is `--buffer`, `systems/ghost/mod.js:97-100`).
  - The "alt-screen" comment at `mod.jsx:125` is false: there is no `?1049h` anywhere (m79:99).
- **In m79.**
  - M3: two render ways — `view.render(data, Component)`, where the Component owns inline or fullscreen and `<Fullscreen>` is the one escape pair; and `view.shell(data, Chrome, Body)` (m79:252, m79:268, m79:848).
  - M11: the shell is a session that holds the head; the trajectory is re-mounted as its stdin through `session.more(line)` = `ctx.call(Signal.tokens(line), { session, shell })`; a command paints into a slot (m79:2903, m79:2984-2986).
  - M12: the Dock streams turns (m79:3128-3179).
- **The Dock already carries four of the five chrome surfaces; `Chrome` itself carries none.**

| surface | where it lands in m79 | quest line |
|---|---|---|
| status line | the Dock's first line: `launch · origin · identity · seat` | m79:3169 |
| content | `<Static key={thread.id}>` transcript + the live `Turn` | m79:3171-3172 |
| message area | `error: …` from `$error` | m79:3174 |
| input line | `TextInput` "a sentence · a command · a mode" | m79:3176 |
| key hints | `⏎ send  ctrl-c stop · again to leave  esc leave` | m79:3177 |

- **The finding.** "the viva chrome" in m79 is split. `Chrome.jsx` frames; the body (Dock) draws the status, message, input and hint lines. So a second body — a buffer frame (deliverable n, m79:256), a mode's verbs, a terminals table (M13) — would have to redraw all four, or go without them.
- **The cut the three systems share.** The chrome owns the surfaces and the body owns the content region: Emacs's mode line and minibuffer belong to the frame/window, not to the major mode ([1.3 (L)][e-modeline-user]; [21.1 (L)][e-mini]); tmux's status line belongs to the client ([STATUS LINE][t-status]).

### 5.3 the proposal — our nouns on the five surfaces

| surface | holds (our nouns) | fed by | state |
|---|---|---|---|
| status line | instance · daemon · identity · terminal (index) · mode (type/slug) · thread | hosting (`launch`), lighthouse `$identity`, `terminal.$thread` — rare-changing atoms, never `$live` (§3.1) | QUESTIONED — which nouns, and whether a mode may add a segment (tmux `#{…}` formats [FORMATS][t-formats]; Emacs minor-mode lighter [1.3 (L)][e-modeline-user]) |
| input line | one line → `session.more` → the trajectory: command · reference · yap (m79:2984) | the Dock today (m79:3176) | QUESTIONED — Chrome-owned (one input for every body) or body-owned (Dock-only, today's tangle) |
| message area | a verb's one-line effect · `$error` · a reference's "reseated" | `session.more` return (m79:2984-2993) | QUESTIONED — a separate row (Emacs echo area) or the transcript (tmux `display-message` is transient) |
| content region | the body: Dock (turns) · a buffer in a frame (n) · a verb's `view.render` in the slot (M3) | `view.shell(data, Chrome, Body)` (m79:252) | QUESTIONED — one body at a time (Emacs on a text terminal: "each Emacs frame fills the entire terminal screen", [29.1 (L)][e-windows]) or tiled (tmux panes) |
| key hints | the keys live in the current body + chrome keys (esc · ctrl-c) | each body's `useInput` (m79:3140) | QUESTIONED — declared per body (VS Code `contributes.keybindings` [Contribution Points][vs-cp]) or a `which-key`-style hint after a prefix ([12.2 (L)][e-keyhelp]) |
| home | `identity.trait.home` → `/home` edge (F4 ruled, m79:222) | credentials row (M9) | ruled (where it lives); QUESTIONED whether the status line shows it |
| fullscreen vs inline | alt-screen `?1049h/l` vs transcript-as-scrollback | `<Fullscreen>` (M3) | F12 OWED (m79:230); lean inline for the chat |

**The quest's chrome section uses anima's bone nouns** — crown · stage · slot · shoulder · prompt · hints · pincer (m79:3285-3293, header row at 3285; the bones are `systems/anima/src/app/bones/{crown,spine,shoulder,pincer}`). Mapped onto that vocabulary:

| surface (this study) | quest slot |
|---|---|
| status line | crown |
| content region | stage + slot |
| message area | shoulder |
| input line | prompt |
| key hints | hints |
| — | pincer, the palette |

Two points from the comparison bear on it:
- **The crown should be fed by rare-changing atoms, never by `$live`.** Emacs recomputes the mode line on events ([24.4.1 (L)][e-modeline]); Neovim shows only the flushed state ([UI Events][n-ui]). See §6 risk 2.
- **The pincer is `M-x` and `which-key` in one key** ([11 (L)][e-mx]; [12.2 (L)][e-keyhelp]). Emacs keeps them as two surfaces: one runs by name, one hints after a prefix.

**Acme's tag is a sixth option worth naming.** The status line's words *are* the live commands of the body ([acme(1) "Windows"][p9-acme1]). Under §4 (ii) a seated mode's verbs could fill the right side of the status line, the way Acme "maintains a set of commands appropriate to the state of the window". QUESTIONED.

---

## 6. risks for ghost found by the comparison

| # | risk | evidence (our file:line) | precedent (system + citation) | proposal | bears on |
|---|---|---|---|---|---|
| 1 | the moved client composes mode paths | `systems/anima/src/typology/entities/mode/mode.js:62-63` composes `/mode/<type>/<slug>`; the runtime already publishes it (`systems/runtime/lifecycle/daemon/aperture/metadata.js:20`), unread | LSP: the server announces, the client does not assume ([Capabilities][lsp-caps]) | M6 reads the `metadata` row of `/metadata/modes` (or a sibling `reference` key on it) instead of branching | law m79:206 · M6 m79:271 · F9 m79:227 |
| 2 | redisplay on every delta in one event loop | `$live.set` per soma delta (m79:2974); Dock `useStore` (m79:3128-3138); inline host shares the process (m79:206) | Nvim batches and "flush"es, the user sees only the final state ([UI Events][n-ui]); Emacs TODO on redisplay granularity ([etc/TODO (L)][e-todo]) | coalesce `$live` to a frame tick in `Session.turn`; status line reads only rare atoms | M12 m79:277 · F7 m79:225 |
| 3 | no wire version | `strip.js:3-11` carries no level; `/metadata/manifest` = authored manifest (`metadata.js:7`); `version` optional and a package version (`manifest.js:9`) | Nvim `api_level` · `api_compatible` · `deprecated_since` ([API metadata][n-meta]); "versionless evolution" ([API contract][n-contract]) | one integer level on daemon `/metadata/manifest`; `since` on edges later; written law: a trait's strip never changes shape under its name | M10 m79:275 · §4 (ii) |
| 4 | precedence by kind, none by source | ranked `feed` (m79:747-758); collision → rename under the daemon by `trajectory.trie.has` (m79:1431-1432); the Dock's grammar is a separate fork (F16, m79:234) | Emacs keymaps rank by source, local over global ([23.7][e-keymaps]); Nvim reserves uppercase for user commands ([lua-guide][n-luaguide]); tmux `=` forces exact ([COMMANDS][t-cmds]) | write the source rule beside the kind rule, once, for the argv and the Dock | law m79:203 · M2 m79:267 · M4 m79:269 · F16 m79:234 |
| 5 | recursive entry inside the shell | `Session.more` → `ctx.call` (m79:2984-2986) re-enters the trajectory; a verb inside may `view.render` a picker while the Dock holds input; `walk` throws `Long` at 20 (`dispatch.js:102`) | recursive minibuffers are OFF by default in Emacs ([21.13 (L)][e-recmini]); a recursive level is a full command loop with its own error wall ([22.13 (L)][e-recursive]) | one law: inside a session a verb's `view.render` takes the slot and the Dock's input stands down (the tangle's `isActive: !holding`, m79:3140-3149) — no nested shell; a reference inside a session reseats, never opens a second session | M11 m79:276 · M3 m79:268 |
| 6 | the quest says `walk`, the tangle says `ctx.call` | law/terrain name `walk(trajectory, more)` (m79:168, m79:189, m79:249); M11 uses `ctx.call(Signal.tokens(line))` per line (m79:2986) | Emacs separates the command loop (per key sequence, [22.1 (L)][e-loop]) from argument collection (`interactive`, [22.2.1 (L)][e-interactive]) | name the split: the shell's loop is `ctx.call` per line; `walk` is argument/segment collection for an incomplete line — or drop `walk` from the design text | deliverable g m79:249 · law m79:202 |
| 7 | one server, many clients vs one instance per ghost | law "One instance per ghost process" (m79:207); lock is pid + token (`subsystems/paladin/prototypes/ledger/lock.js:9-19`); `instance/start` waits for ALIVE (`systems/ghost/trajectories/instance/start.js:31-37`) | tmux: many clients, one server per socket ([DESCRIPTION][t-desc]); Emacs `--alternate-editor=""` starts a daemon only if none runs ([41.3 (L)][e-client]) | keep one instance per *process*; make many ghosts per *instance* the embedded default (join ALIVE), inline only when nothing is ALIVE | F6 m79:224 · F7 m79:225 · M8 m79:273 |
| 8 | inline vs fullscreen chosen per shell, not per client | F12 (m79:230) | `emacsclient -c` vs `-t` choose the frame per invocation ([41.3 (L)][e-client]); Nvim `--remote-ui` vs `--embed` ([remote][n-remote]; [starting][n-embed]) | a flag on the reference (`viva home --fullscreen`) over a ledger default; the Component still owns its screen (M3) | F12 m79:230 · M3 m79:268 |
| 9 | `help` cannot document a mode's doors | `census` folds only ghost's trie (`systems/ghost/trajectories/help.js:3-21`); `valence` does not cross the strip (`strip.js:3-11`); `/metadata/modes` unread (§4.1) | Emacs: every command has a name and a doc ([11 (L)][e-mx]; [12.3 (L)][e-namehelp]); Nvim `api-metadata` "to discover the API" ([API metadata][n-meta]) | carry `valence` on `edgeMeta`; `help <reference>` folds the mode's strip | M4 m79:269 · deliverable p m79:258 · §4 (i)/(ii) |
| 10 | esc destroys what `attach` would need | F11 lean "per session … removed on exit" (m79:229); esc removes the row (m79:2995-2998) | tmux sessions "survive … intentional detaching" ([DESCRIPTION][t-desc]); `C-x C-c` in a client frame keeps the session ([41.3 (L)][e-client]) | esc detaches (the row stays seated), a separate verb removes; re-join by terminal index | F11 m79:229 · M11 m79:276 · M13 m79:278 |
| 11 | headless parity | non-interactive `render` throws naming the nature (`systems/ghost/mod.js:104-108`); `pick` in a pipe throws (`.ikiro/world/codemap/ghost.md:11`) | Blender: an operator without `execute` cannot "be repeated from a script" ([Invoke Function][b-op]); Nvim `--headless` ([starting][n-headless]); Emacs `-batch` exits non-zero ([43.17 (L)][e-batch]) | law: every reference and verb has a full-params path; the shell adds no verb (tmux wiki's "rather than duplicating", [tmux wiki][t-wiki]) | M11 gate m79:276 · M4 m79:269 |
| 12 | mode code in the operator's process | ghost runs `-A` (`systems/ghost/trajectories/instance/start.js:15`); option (iii) would import mode bundles | Nvim runs extensions as coprocesses ([remote_plugin][n-rplugin]); VS Code declares UI ([Contribution Points][vs-cp]) | if (iii) is ever taken: a separate Deno worker with narrowed permissions, and a level on the bundle | §4 (iii) · invariant `.ikiro/world/codemap/invariants.md:17` |
| 13 | no health contribution from modes | `instance/doctor` reads recipe · env · lock only (`systems/ghost/trajectories/instance/doctor.js:85-103`) | Nvim `health.lua` + `check()`, auto-discovered ([health-dev][n-health]) | a stripped per-mode health route (new behaviour → sibling export, `.ikiro/ikiro.md:12`) | M10 m79:275 |
| 14 | the client announces nothing | handshake = `/userspace/handshake` then reads (m79:115); no client capability crosses | LSP `initialize` exchanges both sides' capabilities ([Capabilities][lsp-caps]; [Initialize Request][lsp-init]) | an optional client card on handshake (`{ client, renders }`) so a trait can serve a terminal shape | M10 m79:275 · §4 (ii) |

**Against the quest's own critical pass** (m79:3215-3331, written while this study ran):

| # | standing |
|---|---|
| 1 | not in the quest's findings. Its "modes into ghost" says "the runtime composed every path the strip names" (m79:3304), while the moved `mode.js:62-63` composes the mode's own root. Open |
| 2 | not in the quest's findings. The chrome section leaves "how a streaming turn paints" undecided (m79:3298). Open |
| 3 | = finding 4 → F18 (m79:3233, m79:236). The quest proposes the manifest field. This study adds `since` on edges and the no-shape-drift law. Open, the noun is beef's |
| 4 | `VERBS` resolved by probe 2 (m79:3319). The source rule is still unwritten, and this study disagrees with "held" (m79:3326) — see §3.1 |
| 5 | partly = finding 11 (m79:3240, the `live` stand-down). Recursion depth is not addressed |
| 6 | = finding 12, LANDED by probe 3 (m79:3241) |
| 7 | not in the findings. F19 (m79:237) decides who starts an absent runtime, not whether several ghosts share one |
| 8 | F12 still OWED (m79:230) |
| 9 | = finding 8 (m79:3237) + F15 (m79:233) |
| 10 | = finding 16 (m79:3245), a note. F11 is still OWED (m79:229) |
| 11 | finding 15 (m79:3244), deferred |
| 12 | F17 (c) "never while (b) holds" (m79:235) |
| 13 | **disagrees with "held"** (m79:3328) "`instance/doctor` is `:checkhealth`". `:checkhealth` *discovers* a check per plugin ([health-dev][n-health]); the doctor reads no daemon and no mode (`doctor.js:85-103`) |
| 14 | not in the quest. Open |

**The three findings judged most consequential for the quest:**
- **Risk 1** — the client that M6 moves into ghost composes mode paths.
  - Evidence: `systems/anima/src/typology/entities/mode/mode.js:62-63`, against law m79:206.
  - The runtime already publishes the path (`systems/runtime/lifecycle/daemon/aperture/metadata.js:20`), and nobody reads it.
  - Not in the quest's critical pass.
- **Risk 4** — the quest ranks pattern kinds and renames on collision, but has no written rule for *contributors*.
  - F15 (mode doors as edges) and F16 (the Dock's grammar) both add contributors to one trie.
  - Emacs's keymap stack ([23.7][e-keymaps]) and Neovim's uppercase rule ([lua-guide][n-luaguide]) answer exactly that.
  - The quest's "held" treats it as already answered (m79:3326).
- **Risk 10** — F11's per-session row deletion throws away a tmux-style detach and re-attach. The Terminal row (`Terminal.ts:19-26`) already makes that almost free ([tmux DESCRIPTION][t-desc]; [emacsclient (L)][e-client]).

---

## 7. sources

### 7.1 external — fetched (or tried), with the section read

**Emacs.** G = fetched from gnu.org. L = gnu.org refused twice; read from the installed GNU Emacs 30.2 manual. Every L counts as UNVERIFIED-by-fetch.

- [e-keymaps]: Elisp 23.7 "Active Keymaps" — G (WebFetch)
- [e-major]: Elisp 24.2 "Major Modes" — G (curl)
- [e-minor]: Elisp 24.3 "Minor Modes" — G (curl)
- [e-derived]: Elisp 24.2.4 "Defining Derived Modes" — G (curl)
- [e-interactive]: Elisp 22.2.1 "Using ‘interactive’" — L
- [e-cmdmodes]: Elisp 22.2.4 "Specifying Modes For Commands" — L
- [e-loop]: Elisp 22.1 "Command Loop Overview" — L
- [e-recursive]: Elisp 22.13 "Recursive Editing" — L
- [e-recmini]: Elisp 21.13 "Recursive Minibuffers" — L
- [e-mini]: Elisp 21.1 "Introduction to Minibuffers" — L
- [e-modeline]: Elisp 24.4.1 "Mode Line Basics" — L
- [e-echo]: Elisp 42.4 "The Echo Area" — L
- [e-hooks]: Elisp 24.1 "Hooks" — L
- [e-buffer]: Elisp 28.1 "Buffer Basics" — L
- [e-procbuf]: Elisp 41.9.1 "Process Buffers" — L
- [e-windows]: Elisp 29.1 "Basic Concepts of Emacs Windows" — L
- [e-frames]: Elisp 30 "Frames" — L
- [e-terminals]: Elisp 30.2 "Multiple Terminals" — L
- [e-threads]: Elisp 40 "Threads" — L
- [e-redisplay]: Elisp 42.2 "Forcing Redisplay" — L
- [e-batch]: Elisp 43.17 "Batch Mode" — L
- [e-intro]: Elisp 1 "Introduction" — L
- [e-server]: Emacs 41 "Using Emacs as a Server" — L
- [e-client]: Emacs 41.3 "‘emacsclient’ Options" — L
- [e-help]: Emacs 12 "Help" — L
- [e-keyhelp]: Emacs 12.2 "Documentation for a Key" (holds `which-key`) — L
- [e-namehelp]: Emacs 12.3 "Help by Command or Variable Name" — L
- [e-apropos]: Emacs 12.4 "Apropos" — L
- [e-mx]: Emacs 11 "Running Commands by Name" — L
- [e-modeline-user]: Emacs 1.3 "The Mode Line" — L
- [e-todo]: GNU Emacs `etc/TODO`, "** Concurrency" and "** Make redisplay smarter about which parts to redraw" — L (read at `/opt/homebrew/share/emacs/30.2/etc/TODO:449-452,616-620`)

**Neovim.** All fetched from neovim.io; the `.html` URLs redirect to these.

- [n-api] · [n-meta] · [n-contract] · [n-usercmd]: `https://neovim.io/doc/user/api/` — "API Usage" (api-rpc), "API metadata" (api-metadata), "API contract" (api-contract), "nvim_create_user_command()"
- [n-ui]: `https://neovim.io/doc/user/api-ui-events/` — "UI Events" (ui-protocol), "ui-option", "ui-ext-options", "UI startup". `:help ui` now says "Document moved to: api-ui-events"
- [n-remote]: `https://neovim.io/doc/user/remote/` — "1. Common functionality" (clientserver)
- [n-embed] · [n-headless] · [n-listen]: `https://neovim.io/doc/user/starting/` — `--embed`, `--headless`, `--listen`
- [n-rplugin]: `https://neovim.io/doc/user/remote_plugin/` — "1. Introduction", "2. Plugin hosts", "4. Remote plugin manifest"
- [n-health]: `https://neovim.io/doc/user/health/` — "health-commands", "Create a healthcheck" (health-dev)
- [n-luaguide]: `https://neovim.io/doc/user/lua-guide/` — "About the API" (lua-guide-api), "Creating user commands" (lua-guide-commands-create)
- [n-vimdiff]: `https://neovim.io/doc/user/vim_diff/` — introduction; "Eval" (Vim9script not supported)

**tmux.** Fetched.

- [t-desc] · [t-cmds] · [t-clients] · [t-panes] · [t-keys] · [t-options] · [t-hooks] · [t-formats] · [t-status] · [t-control]: `https://man7.org/linux/man-pages/man1/tmux.1.html` — DESCRIPTION · COMMANDS · CLIENTS AND SESSIONS · WINDOWS AND PANES · KEY BINDINGS · OPTIONS · HOOKS · FORMATS · STATUS LINE · CONTROL MODE
- [t-wiki]: `https://github.com/tmux/tmux/wiki/Control-Mode` — "Control mode", "Entering control mode"

**The nods.** Fetched.

- [b-op]: `https://docs.blender.org/api/current/bpy.types.Operator.html` — "Basic Operator Example", "Invoke Function", "Modal Execution", `poll`
- [p9-acme1]: `https://9fans.github.io/plan9port/man/man1/acme.html` — acme(1) "Windows". `https://9p.io/magic/man2html/1/acme` was tried and reset, and `plan9.io` answered 520; the plan9port pages are the same manual
- [p9-acme4]: `https://9fans.github.io/plan9port/man/man4/acme.html` — acme(4) DESCRIPTION
- [p9-plumber]: `https://9fans.github.io/plan9port/man/man4/plumber.html` — plumber(4) DESCRIPTION
- [p9-plumb]: `https://9fans.github.io/plan9port/man/man7/plumb.html` — plumb(7) "Plumbing rules"
- [lsp-caps] · [lsp-msg] · [lsp-init] · [lsp-sync]: `https://microsoft.github.io/language-server-protocol/specifications/lsp/3.17/specification/` — "Capabilities", "Message Documentation", "Initialize Request", "Text Document Synchronization"
- [vs-cp] · [vs-cmds]: `https://code.visualstudio.com/api/references/contribution-points` — introduction, `contributes.commands` (headings `contributes.keybindings` · `menus` · `views` · `viewsContainers` read as present)

**UNVERIFIED, no primary source found:**
- that the Emacs community names concurrency/redisplay as *the* regret (§1);
- that the Neovim community names Vim compatibility as *the* regret (§1);
- that the tmux community names the missing API as a regret (§1);
- VS Code `engines` versioning of the manifest (§4 (ii)).

### 7.2 vivalence — read for this file (10-05)

**`.ikiro/`**
- `.ikiro/ikiro.md`
- `.ikiro/world/map.md`
- `.ikiro/world/codemap/{ghost,runtime,typology,invariants,ledger,ontology}.md`
- `.ikiro/skills/mode/SKILL.md`
- `.ikiro/quests/m79-terminal-ghost.org`: 1-275, 718-740, 1353-1420, 2852-2960, 3049-3140

**ghost**
- `systems/ghost/mod.js`
- `systems/ghost/trajectories/{index.js,help.js}`
- `systems/ghost/trajectories/instance/{doctor.js,start.js}`
- `systems/ghost/prototypes/shellsignal.js`

**typology**
- `subsystems/typology/prototypes/{vector,signal,pattern,signature,controller,status,connection}.js`
- `subsystems/typology/gestalten/steer/{dispatch,match}.js`
- `subsystems/typology/gestalten/shape/{object,strip,http,connection,mcp}.js`
- `subsystems/typology/schematics/primitives/manifest.js`
- `subsystems/typology/entities/lighthouse/{Terminal,Identity}.ts`

**runtime**
- `systems/runtime/run.js`
- `systems/runtime/lifecycle/runtime/{execution,integration,population,resolution}.js`
- `systems/runtime/lifecycle/daemon/{execution,population,resolution,integration}.js`
- `systems/runtime/lifecycle/daemon/aperture/{metadata,index,modes}.js`
- `systems/runtime/lifecycle/mode/{execution,population,resolution}.js`
- `systems/runtime/lifecycle/mode/traits/{index,tooling,booted,application,agentic,intented,emitter}.js`
- `systems/runtime/lifecycle/mode/traits/harnessed.js:195-228`
- `systems/runtime/gestalten/belt/stagger.js`
- `systems/runtime/prototypes/{daemon,runtime}.js`
- `systems/runtime/entities/kernel/Mode.ts:8-44`

**anima**
- `systems/anima/src/typology/entities/mode/{mode.js,traits/application.js,traits/exposed.js,traits/index.js}`
- `systems/anima/src/typology/gestalten/belt/runner.js`

**sheets**
- `subsystems/sheets/mod.jsx:60-195`
- `subsystems/sheets/components/Chrome.jsx`

**paladin**
- `subsystems/paladin/prototypes/ledger/lock.js`

**modes**
- `commons/instances/hello-world/{mode,instance}.viva.js`
- `~/.viva/registry/education/modes/home/aprende/{aprende.viva.js,aperture/index.js,aperture/message.js,tools/index.js}`

[e-keymaps]: https://www.gnu.org/software/emacs/manual/html_node/elisp/Active-Keymaps.html
[e-major]: https://www.gnu.org/software/emacs/manual/html_node/elisp/Major-Modes.html
[e-minor]: https://www.gnu.org/software/emacs/manual/html_node/elisp/Minor-Modes.html
[e-derived]: https://www.gnu.org/software/emacs/manual/html_node/elisp/Derived-Modes.html
[e-interactive]: https://www.gnu.org/software/emacs/manual/html_node/elisp/Using-Interactive.html
[e-cmdmodes]: https://www.gnu.org/software/emacs/manual/html_node/elisp/Command-Modes.html
[e-loop]: https://www.gnu.org/software/emacs/manual/html_node/elisp/Command-Overview.html
[e-recursive]: https://www.gnu.org/software/emacs/manual/html_node/elisp/Recursive-Editing.html
[e-recmini]: https://www.gnu.org/software/emacs/manual/html_node/elisp/Recursive-Mini.html
[e-mini]: https://www.gnu.org/software/emacs/manual/html_node/elisp/Intro-to-Minibuffers.html
[e-modeline]: https://www.gnu.org/software/emacs/manual/html_node/elisp/Mode-Line-Basics.html
[e-echo]: https://www.gnu.org/software/emacs/manual/html_node/elisp/The-Echo-Area.html
[e-hooks]: https://www.gnu.org/software/emacs/manual/html_node/elisp/Hooks.html
[e-buffer]: https://www.gnu.org/software/emacs/manual/html_node/elisp/Buffer-Basics.html
[e-procbuf]: https://www.gnu.org/software/emacs/manual/html_node/elisp/Process-Buffers.html
[e-windows]: https://www.gnu.org/software/emacs/manual/html_node/elisp/Basic-Windows.html
[e-frames]: https://www.gnu.org/software/emacs/manual/html_node/elisp/Frames.html
[e-terminals]: https://www.gnu.org/software/emacs/manual/html_node/elisp/Multiple-Terminals.html
[e-threads]: https://www.gnu.org/software/emacs/manual/html_node/elisp/Threads.html
[e-redisplay]: https://www.gnu.org/software/emacs/manual/html_node/elisp/Forcing-Redisplay.html
[e-batch]: https://www.gnu.org/software/emacs/manual/html_node/elisp/Batch-Mode.html
[e-intro]: https://www.gnu.org/software/emacs/manual/html_node/elisp/Introduction.html
[e-server]: https://www.gnu.org/software/emacs/manual/html_node/emacs/Emacs-Server.html
[e-client]: https://www.gnu.org/software/emacs/manual/html_node/emacs/emacsclient-Options.html
[e-help]: https://www.gnu.org/software/emacs/manual/html_node/emacs/Help.html
[e-keyhelp]: https://www.gnu.org/software/emacs/manual/html_node/emacs/Key-Help.html
[e-namehelp]: https://www.gnu.org/software/emacs/manual/html_node/emacs/Name-Help.html
[e-apropos]: https://www.gnu.org/software/emacs/manual/html_node/emacs/Apropos.html
[e-mx]: https://www.gnu.org/software/emacs/manual/html_node/emacs/M_002dx.html
[e-modeline-user]: https://www.gnu.org/software/emacs/manual/html_node/emacs/Mode-Line.html
[e-todo]: https://git.savannah.gnu.org/cgit/emacs.git/tree/etc/TODO
[n-api]: https://neovim.io/doc/user/api/#api-rpc
[n-meta]: https://neovim.io/doc/user/api/#api-metadata
[n-contract]: https://neovim.io/doc/user/api/#api-contract
[n-usercmd]: https://neovim.io/doc/user/api/#nvim_create_user_command()
[n-ui]: https://neovim.io/doc/user/api-ui-events/
[n-remote]: https://neovim.io/doc/user/remote/
[n-embed]: https://neovim.io/doc/user/starting/#--embed
[n-headless]: https://neovim.io/doc/user/starting/#--headless
[n-listen]: https://neovim.io/doc/user/starting/#--listen
[n-rplugin]: https://neovim.io/doc/user/remote_plugin/
[n-health]: https://neovim.io/doc/user/health/
[n-luaguide]: https://neovim.io/doc/user/lua-guide/
[n-vimdiff]: https://neovim.io/doc/user/vim_diff/
[t-desc]: https://man7.org/linux/man-pages/man1/tmux.1.html#DESCRIPTION
[t-cmds]: https://man7.org/linux/man-pages/man1/tmux.1.html#COMMANDS
[t-clients]: https://man7.org/linux/man-pages/man1/tmux.1.html#CLIENTS_AND_SESSIONS
[t-panes]: https://man7.org/linux/man-pages/man1/tmux.1.html#WINDOWS_AND_PANES
[t-keys]: https://man7.org/linux/man-pages/man1/tmux.1.html#KEY_BINDINGS
[t-options]: https://man7.org/linux/man-pages/man1/tmux.1.html#OPTIONS
[t-hooks]: https://man7.org/linux/man-pages/man1/tmux.1.html#HOOKS
[t-formats]: https://man7.org/linux/man-pages/man1/tmux.1.html#FORMATS
[t-status]: https://man7.org/linux/man-pages/man1/tmux.1.html#STATUS_LINE
[t-control]: https://man7.org/linux/man-pages/man1/tmux.1.html#CONTROL_MODE
[t-wiki]: https://github.com/tmux/tmux/wiki/Control-Mode
[b-op]: https://docs.blender.org/api/current/bpy.types.Operator.html
[p9-acme1]: https://9fans.github.io/plan9port/man/man1/acme.html
[p9-acme4]: https://9fans.github.io/plan9port/man/man4/acme.html
[p9-plumber]: https://9fans.github.io/plan9port/man/man4/plumber.html
[p9-plumb]: https://9fans.github.io/plan9port/man/man7/plumb.html
[lsp-caps]: https://microsoft.github.io/language-server-protocol/specifications/lsp/3.17/specification/#capabilities
[lsp-msg]: https://microsoft.github.io/language-server-protocol/specifications/lsp/3.17/specification/#messageDocumentation
[lsp-init]: https://microsoft.github.io/language-server-protocol/specifications/lsp/3.17/specification/#initialize
[lsp-sync]: https://microsoft.github.io/language-server-protocol/specifications/lsp/3.17/specification/#textDocument_synchronization
[vs-cp]: https://code.visualstudio.com/api/references/contribution-points
[vs-cmds]: https://code.visualstudio.com/api/references/contribution-points#contributes.commands
