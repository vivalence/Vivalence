<!-- writer: agent · reference · limit: 22000 chars · written 2026-10-12 against the restored tree (`subsystems/drapes/tty/*`), the m82 snapshot and opentui 0.5.17 source · every claim cites file:line · LIVE vs PROPOSED marked -->
# tty render — how a Solid component reaches the terminal from the shell · the repl · the chrome

Abbreviations: `vk` = `testament/m82-clients-20261012/systems/ghost/` (the snapshot, gitignored) · `otui` = `node_modules/.deno/@opentui+core@0.5.17/node_modules/@opentui/core/` · `osolid` = `node_modules/@opentui/solid/`. Paths will move: the m86 tangle puts `subsystems/drapes/tty/` under `systems/ghost/chrome/`, and beef's marks (10-12) pull the kit back into `subsystems/sheets` (/"sheets is the interface/surface between dapper and ghost"/). This file cites where the code sits TODAY.

## 0 · the rule

A component never knows which vector called it. It is a Solid function of DATA props plus `release`. The vector names a KIND (`ctx.view.hold("form", props)`); the surface maps the kind to a component and picks the BOX it lands in. LIVE: the shell. Refused by design: the repl. Would hang: the chrome (§6b).

## 1 · the component

```jsx
// subsystems/drapes/tty/Confirm.jsx
export function Confirm(props) {
  const palette = usePalette();
  const [held, setHeld] = createSignal(props.initial);
  const KEYS = [
    [(key) => TOGGLES.includes(key.name), () => setHeld((current) => !current)],
    [(key) => key.name === "y", () => props.release(true)],
    [(key) => key.name === "n" || key.name === "escape", () => props.release(false)],
    [(key) => ENTERS.includes(key.name), () => props.release(held())],
  ];
  useKeyboard((key) => {
    const hit = KEYS.find(([test]) => test(key));
    if (hit !== undefined) hit[1]();
  });
  return (
    <box style={{ flexDirection: "row", gap: 1 }}>
      <text fg={palette.textStrong}>{props.label}</text>
      {choice(palette, held(), "yes")}
      {choice(palette, !held(), "no")}
    </box>
  );
}
```

The contract, the same in all three places:

- **props**: the DATA the verb built, plus `width` (added by the view, `vk belt/view.js:73`) and `release` (held only, `subsystems/drapes/tty/captured.js:16`).
- **palette**: from context, never a prop. `provide` wraps every render in `RendererContext` and `Palette.Provider` (`subsystems/drapes/tty/paint.js:4-15`). `usePalette()` throws outside it (`palette.js:7`).
- **keys**: opentui's `useKeyboard`, read straight off `renderer.keyInput` (`osolid index.js:136-150`), never through the vector.
- **exit**: `props.release(value)`, once (`fn.once`, `captured.js:9`); the verb's `await` gets that value back.

| kind | props | `release(value)` |
|---|---|---|
| form | `title` · `pages[{title, fields[{name, label, kind, initial, options?, hint?, check?}]}]` · `actions` | `{values, action}` · `{aborted: true}` |
| picker | `rows` · `keys` · `facets` · `columns` · `query` · `label` · `index` | `row` · `{aborted: true}` |
| confirm | `label` · `initial` | `true` · `false` |
| pending | `label` · `work` (a Promise) | `{status, value}` · `{status, reason}` |
| report | `blocks` · `width` · `release?` | `true` when held · nothing when emitted |
| listing | `title` · `groups` · `notes` | emit only |

The kinds table is `kinds` (`subsystems/drapes/tty/views.js:24`). Field kinds are `text · password · confirm · select` (`Form.jsx:11`); a field missing `name · label · kind · initial` throws (`Form.jsx:15-23`). The props `instance/init` hands the admin form (`vk lifecycle/client/trajectories/instance/init.js:49-55` · `:190`), as received:

```json
{ "title": "create admin", "actions": ["commit", "skip"], "width": 120,
  "pages": [{ "title": "admin", "fields": [
    { "name": "username", "label": "username", "kind": "text", "initial": "" },
    { "name": "password", "label": "password", "kind": "password", "initial": "" } ] }] }
```

`pending.work` is a Promise and `field.check` is a function: neither crosses a pipe or a wire. A held kind is local to a tty.

## 2 · the kit — three placement primitives over one `provide`

| primitive | file | lands in | lives until | needs |
|---|---|---|---|---|
| `paint` | `paint.js:17` | a chassis slot box | `destroy()` | any screen mode |
| `captured` | `captured.js:6` | a new box on `renderer.root` | `release()` → scrollback | split-footer |
| `cut` | `cut.js:4` | scrollback, one frame | — | split-footer |

```js
// subsystems/drapes/tty/captured.js
export const captured = (renderer, props, Component, palette) => {
  const slot = new BoxRenderable(renderer, { id: `captured-${crypto.randomUUID()}`, flexDirection: "column", width: "100%" });
  const released = Promise.withResolvers();
  const release = fn.once((opts) => {
    renderer.root.remove(slot);
    renderer.writeToScrollback(() => ({ root: slot, teardown: dispose }));
    released.resolve(opts);
    return opts;
  });
  renderer.root.add(slot);
  const dispose = _render(provide(renderer, palette, Component, { ...props, release }), slot);
  return { release, released: released.promise };
};
```

```js
// subsystems/drapes/tty/paint.js
export const paint = (slot, renderer, palette, Component, props) => {
  const dispose = _render(provide(renderer, palette, Component, props), slot);
  return () => {
    dispose();
    for (const child of slot.getChildren()) child.destroyRecursively();
  };
};
```

The surface bag exposes them: `emit` → `cut`, `hold` → `captured`, `mount[pane]` → `paint` (`subsystems/drapes/tty/surface.js:16-38`). `cut` has no live caller in the snapshot's ghost: a grep for `surface.emit` outside `bak/` and `tests/` → 0. It is proven only in `subsystems/drapes/tests/tty/surface.test.js:128`.

JSX never enters ghost. `bundle.js:16` compiles every `.jsx` with babel-preset-solid `generate: "universal"` → `@opentui/solid` into the gitignored `out/views.mjs`. Ghost reaches a component only as `kit.kinds[kind]` behind a dynamic import (`vk belt/view.js:16`). `solid-js` is pinned to `npm:solid-js@1.9.12/dist/solid.js` (`import_map.json:105`), because the bare specifier resolves the SERVER build under Deno and freezes reactivity.

## 3 · the shell — LIVE

```text
viva instance/init                                        vk …/instance/init.js:175
└─ ctx.view.hold("form", props)                           vk belt/view.js:66
   ├─ open(): createCliRenderer split-footer, footer 1    view.js:17-22   once per process
   ├─ renderer.footerHeight = 16                          view.js:72
   └─ surface.hold(props + width, kit.kinds.form)         drapes/tty/surface.js:30 · views.js:24
      └─ captured(renderer, props, Form, palette)         captured.js:6
         ├─ new box → renderer.root.add                   :7 · :15
         ├─ _render(provide(…, { ...props, release }))    :16 → paint.js:4
         └─ Form: props.release({ values, action })       Form.jsx:67
            ├─ root.remove(box) · writeToScrollback(box)  :10-11   ← the filled form stays as history
            └─ released.resolve(value) → the verb continues
   └─ footerHeight = 1                                    view.js:74
```

```js
// testament/m82-clients-20261012/systems/ghost/belt/view.js
  hold: async (kind, props) => {
    if (!ctx.interactive) {
      throw new Error(`${nature}: needs a terminal — run it in one, or pass its inputs as parameters (viva help ${nature})`);
    }
    ctx.rendered = true;
    const { kit, renderer, surface } = await open();
    renderer.footerHeight = FOOTER.hold;
    const released = await surface.hold({ ...props, width: surface.viewport().width }, known(kit.kinds, kind, "the terminal")).released;
    renderer.footerHeight = FOOTER.emit;
    return released;
  },
```

- `emit` in the shell writes `plain.js` text, never Solid (`view.js:64`): no renderer is needed, so it works in a pipe.
- The renderer opens lazily on the first `hold`, once per process, and is destroyed before every exit (`view.js:32-42`).
- ctrl-c is tapped off the surface's keys → exit 130 (`view.js:24-28`).
- Live `hold` callers (snapshot):

| caller | kind |
|---|---|
| `belt/pick.js:30` | picker |
| `…/ledger/index.js:59` | form |
| `…/instance/init.js:175` · `:190` | form |
| `…/instance/init.js:180` · `:192` | pending |
| `…/instance/init.js:195` | report |
| `…/instance/cleanup.js:15` · `…/instance/delete.js:53` | confirm |

In split-footer mode, scrollback IS the shell's transcript: releasing a held box writes its last frame there, so a filled-in form stays as history.

## 4 · the chrome — panes painted into a chassis

The chrome holds nothing. It PAINTS panes into fixed chassis boxes and toggles their visibility.

```js
// subsystems/drapes/tty/surface.js
  const pane = (name, extra) => (props) => {
    const slot = SLOTS[name];
    const erase = paint(chassis().slots[slot], renderer, chassis().palettes[slot], panes[name], { ...props, ...extra });
    return { place: chassis().place, destroy: erase };
  };
```

```js
// subsystems/drapes/tty/chassis.js
  const place = (layout) => {
    const shown = (pane) => layout.panes.includes(pane);
    const covered = shown("signin") || shown("boot");
    const framed = !covered && shown("frame") && layout.buffer;
    const docked = !covered && shown("dock") && !(framed && layout.dock.full);
    const [axis, across] = AXES[layout.dock.vertical];
    slots.crown.visible = shown("crown");
    slots.navigation.visible = shown("navigation");
    slots.cover.visible = covered;
    slots.frame.visible = framed;
    slots.dock.visible = docked;
    stage.flexDirection = layout.dock.direction;
    slots.dock[across] = "auto";
    slots.dock.flexGrow = framed ? 0 : 1;
    slots.dock[axis] = framed ? layout.dock.size : "auto";
  };
```

- **Boxes**: `crown · navigation · frame · dock · cover` (`chassis.js:18-30`), with the zone per box in `TERRITORY` (`:4`). Pane → box goes through `SLOTS` (`:6`): `signin` and `boot` share `cover`.
- **Which panes show**: `shown(client, seat, buffer)` (`vk lifecycle/client/integration.js:3-7`). Unauthorized → crown · signin. No seat → crown · navigation · boot. Seated → crown · navigation · dock, plus frame when a buffer is open.
- **What a pane receives**: in the snapshot, `{ client, root, dispatch }` (`vk lifecycle/client/integration.js:14`). In the m86 tangle, `{ client, $layout, $output }`, and the frame also gets `accept`.
- **How a pane reads and writes**: it reads atoms through Solid's `from(…)` and writes lines through `client.dispatch(line)`. The dock's composer sends a line straight to dispatch, never through the key feed.
- **Screen mode**: the tangle's chrome renderer is `createCliRenderer({ exitOnCtrlC: false })`, so it runs on opentui's default `alternate-screen` (`otui chunk-node-kc1sqq2a.js:6893`). That mode has no scrollback.

## 5 · opentui facts the design rests on (0.5.17 source)

**The keyboard is one flat list in mount order; the first `stopPropagation` ends it.**

```js
// node_modules/.deno/@opentui+core@0.5.17/node_modules/@opentui/core/chunk-node-tfvyz31s.js
      for (const listener of globalListeners) {
        try {
          listener(...args);
        } catch (error) {
          console.error(`[KeyHandler] Error in global ${event} handler:`, error);
        }
        if (event === "keypress" || event === "keyrelease" || event === "paste") {
          const keyEvent = args[0];
          if (keyEvent.propagationStopped) {
            return hasGlobalListeners;
          }
```

`useKeyboard` subscribes on mount and unsubscribes on cleanup (`osolid index.js:136-150`), so the OLDEST listener sees a key first. A modal mounted later is last in line: focus must be a VALUE every older listener reads, not a z-order. Renderable handlers (`onInternal`) run only after every global listener (`chunk-node-tfvyz31s.js:1575`, `onInternal` `:1603`).

**Scrollback exists only in split-footer + capture-stdout.**

```js
// node_modules/.deno/@opentui+core@0.5.17/node_modules/@opentui/core/chunk-node-kc1sqq2a.js
  writeToScrollback(write) {
    if (this._screenMode !== "split-footer" || this._externalOutputMode !== "capture-stdout") {
      throw new Error('writeToScrollback requires screenMode "split-footer" and externalOutputMode "capture-stdout"');
    }
```

- `screenMode` defaults to `alternate-screen` (`:6893`). `capture-stdout` requires `split-footer` and throws at construction otherwise (`:6903-6904`).
- `screenMode` and `footerHeight` are live setters (`:7937` · `:7953`): a running renderer can switch.

## 6 · faults today

**a · The repl refuses `hold` by design.** `vk gestalten/command.js:11-13` and the tangle's `lifecycle/repl/integration.js` `painting` both throw:

```js
// testament/m82-clients-20261012/systems/ghost/gestalten/command.js
    hold: async (kind) => {
      throw new Error(`${kind}: the client's slot cannot hold a prompt — run it in a shell`);
    },
```

**b · `captured` in the chrome hangs its verb.** The renderer is `alternate-screen` (§4), so on release:

1. `captured.js:10` removes the box: the form vanishes on Enter.
2. `:11` `writeToScrollback` throws (§5) before `:12` resolves, so the line never answers.
3. opentui swallows the throw as a `console.error` (`chunk-node-tfvyz31s.js:1563-1566`).

Before release, the box sits on `renderer.root` after `whole`, which already takes 100%×100% (`chassis.js:15` · `:38`). `place()` never sizes it.

**c · Keys go to the oldest listener.**

- **The form loses typing.** `keypresses` registers when the surface is built (`keys.js:21`). The dock's `Input focused` mounts next and calls `stopPropagation` on typing and Enter (`Input.jsx:22-29`). A form held later never sees those keys.
- **Keys pile up and replay as lines.** A repl line awaiting a hold blocks `integration.keys` at `await die.client.dispatch(input)`. Presses pile up in the `Queue` and are dispatched as `/key/<c>` lines after release.
- **Typing paints "refused".** The `PRINTABLE` row (`keys.js:12`) turns plain typing in the dock into `/key/c` → `NotFound` → painted refused. Latent: nobody has typed in a real terminal yet (`world/codemap/design.md`, "prove on the headless renderers").

**d · Emit in the chrome is a JSON tree.** The tangle's chrome `emit` sets `$output` to `{ report: … }`, and the dock paints it through `JsonTree` (the last `OUTPUTS` row). `Report` never renders there.

| perspective | `emit(kind)` | `hold(kind)` |
|---|---|---|
| shell | `plain.js` text | `captured`, works |
| repl · pipes | json line | throws |
| repl · chrome | `$output` → `JsonTree` | throws |
| chrome (`captured` reached directly) | — | hangs (§6b) |

## 7 · PROPOSED — one contract, three boxes (nothing built; each needs beef's go)

The vector speaks KINDS only; `ctx.view` is the surface's view (beef's mark: /"ctx.view ={...view}"/). The kit (components · `paint` · `captured` · `cut` · reducers · the opentui loader) lives in sheets; ghost keeps the surfaces: geometry plus key ownership.

```diff
// systems/ghost/lifecycle/repl/integration.js
-    hold: async (kind) => {
-      throw new Error(`${kind}: the repl cannot hold a prompt — run it in a shell`);
-    },
+    hold: async (kind, props) => {
+      ctx.view.painted = true;
+      return surface.hold(kind, props);
+    },
```

`captured` takes its parent box and records only where scrollback exists:

```js
// subsystems/sheets/captured.js
export const captured = (renderer, parent, props, Component, palette) => {
  const slot = new BoxRenderable(renderer, { id: `captured-${crypto.randomUUID()}`, flexDirection: "column", width: "100%" });
  const released = Promise.withResolvers();
  const RECORDS = {
    "split-footer": () => renderer.writeToScrollback(() => ({ root: slot, teardown: dispose })),
    "alternate-screen": () => (dispose(), slot.destroyRecursively()),
  };
  const release = fn.once((value) => {
    parent.remove(slot);
    RECORDS[renderer.screenMode]();
    released.resolve(value);
    return value;
  });
  parent.add(slot);
  const dispose = _render(provide(renderer, palette, Component, { ...props, release }), slot);
  return { release, released: released.promise };
};
```

The chrome's `hold`: kind → component in the kit, a chassis box, `$held` owning the keyboard:

```js
// systems/ghost/chrome/surface.js
    hold: async (kind, props) => {
      $held.set(kind);
      const held = captured(renderer, frame().slots.held, { ...props, width: renderer.width }, known(kinds, kind), frame().palettes.held);
      const value = await held.released;
      $held.set(null);
      return value;
    },
```

Every listener older than the hold reads `$held`:

- the key queue drops presses at ENQUEUE (`keys.js:20`), with ctrl-c → SIGINT passing first. Reading the latch inside the drain generator would be too late (§6c pile-up).
- the dock uses `Input focused={held() === null}`.
- navigation's `useKeyboard` returns early.

| perspective | renderer | screen mode | `emit(kind)` | `hold(kind)` box | after release |
|---|---|---|---|---|---|
| shell | lazy · per process | split-footer | `plain.js` | `root` · footer 1→16 | frame → scrollback |
| repl · tty inline | per client | split-footer | `cut` | `root` · prompt hidden | frame → scrollback · prompt back |
| repl · pipes | none | — | json line | throws naming the kind | — |
| chrome | per client | alternate-screen | `$output` → `kinds[kind]` | `slots.held` | box destroyed · value → `$output` |

The shell and an inline repl are ONE geometry; only the lifetime differs. The chrome is the only second geometry.

## 8 · open — beef's calls (10-12)

1. **Where a held component sits in the chrome** (a new slot in `chassis.js:18-30`):
   - a strip at the foot of `whole`, the shell's geometry (lean);
   - `slots.cover`, over the stage like signin;
   - under the composer, inside `slots.dock`.
2. **Key ownership**: the `$held` latch at `keys.js:20` (lean), or opentui's renderable/focus handlers (§5).
3. **A tty repl without the chrome**: `viva client/repl` in a terminal gets the split-footer surface with the dock's `Input` alone as its prompt. Today `upgrade.repl()` always builds the pipes surface, and the shell's `.do` sends a terminal to the chrome (m86 tangle, `lifecycle/shell/{execution,resolution}.js`). So "same components, session not ending" exists only inside the chrome until this lands.
4. **kind → component moves into the surface (sheets)**: `ctx.view` passes kinds only; the pipes surface's `hold` throws in place of `vk belt/view.js:67-69`.
5. **Typing leaves the key feed**: drop the `PRINTABLE` row (`keys.js:12`); typing belongs to the focused `Input`, the feed carries chords and esc.

## 9 · sources

- `subsystems/drapes/tty/{Confirm,Form,Picker,Pending,Report,Input}.jsx` · `{captured,cut,paint,surface,chassis,keys,palette,views,bundle}.js`
- `vk belt/view.js` · `vk belt/pick.js` · `vk gestalten/command.js` · `vk lifecycle/client/integration.js` · `vk lifecycle/client/trajectories/instance/init.js`
- `osolid index.js:136-150` · `otui chunk-node-tfvyz31s.js:1551-1610` · `otui chunk-node-kc1sqq2a.js:6893-6908` · `:7937-7960` · `:8400-8402`
- the m86 tangle: `.ikiro/quests/done/m86-repl-loop-clients.org` `* the tangle` (`chrome/surface.js` · `lifecycle/repl/integration.js` · `lifecycle/shell/resolution.js` blocks)
- superseded: `reference/tui.md` §4 (the ink-era `view.scroll` / `view.buffer`, `subsystems/sheets/mod.jsx`, now in `sheets/bak/`)
