import { createMemo, from, Index } from "solid-js";
import * as parts from "@vivalence/drapes/parts";
import { belt } from "@vivalence/typology";
import * as ambient from "../../ambient/index.js";
import { gathered, sideTags, sideView, UNCLAIMED } from "./sections.js";

export const SIDEBAR = { width: 272, floor: 220, ceiling: 480 };

const toggled = (list, item) => (list.includes(item) ? list.filter((held) => held !== item) : [...list, item]);
const patched = (app, delta) => app.bridge.$sections.set({ ...app.bridge.sections, ...delta });
const keyed = (app, field, word) => {
  const [kind, value] = word.split(" ");
  return patched(app, { [field]: { ...app.bridge.sections[field], [kind]: toggled(app.bridge.sections[field][kind], value) } });
};

export const SURFACE = {
  "/sidebar": (app) => (app.bridge.viewport.narrow ? app.bridge.$phonePane.set(app.bridge.phonePane === "sidebar" ? "dock" : "sidebar") : app.bridge.$sidebar.set({ ...app.bridge.sidebar, open: !app.bridge.sidebar.open })),
  "/sidebar/width": (app, terminal, word) => app.bridge.$sidebar.set({ ...app.bridge.sidebar, width: Math.max(SIDEBAR.floor, Math.min(SIDEBAR.ceiling, Number(word))) }),
  "/sidebar/show": (app, terminal, word) => app.bridge.$hidden.set(word === "all" ? [] : toggled(app.bridge.hidden, word)),
  "/filter/daemon": (app, terminal, word) => keyed(app, "hostsOff", word),
  "/filter/trait": (app, terminal, word) => keyed(app, "traits", word),
  "/telemetry": (app) => app.telemetry.$state.set({ ...app.telemetry.state, open: !app.telemetry.state.open }),
};

export const FNS = {
  palette: (app, terminal, prefill) => {
    app.bridge.$draft.set(prefill);
    terminal.legend.dispatch("leader");
    terminal.legend.dispatch("leader");
  },
  expand: (app, terminal, kind) => patched(app, { expand: kind in app.bridge.sections.expand ? Object.fromEntries(Object.entries(app.bridge.sections.expand).filter(([held]) => held !== kind)) : { ...app.bridge.sections.expand, [kind]: true } }),
  dpick: (app, terminal, kind) => patched(app, { pick: app.bridge.sections.pick === kind ? null : kind }),
  attach: (app, terminal) => terminal.controller.stdout.fault(new Error("attach: this client has no upload yet — the composer owns it")),
  none: () => undefined,
};

const nature = (signal) => signal.split(" ")[0];
const word = (signal) => signal.split(" ").slice(1).join(" ");

const ACTS = [
  [(entry) => "fn" in entry, (app, terminal, entry) => FNS[entry.fn](app, terminal, entry.arg)],
  [(entry) => Object.hasOwn(SURFACE, nature(entry.signal)), (app, terminal, entry) => SURFACE[nature(entry.signal)](app, terminal, word(entry.signal))],
  [() => true, (app, terminal, entry) => terminal.repl.dispatch(entry.signal).catch((error) => terminal.controller.stdout.fault(error))],
];

export const act = (app, terminal) => (entry) => ACTS.find(([test]) => test(entry))[1](app, terminal, entry);

export const filtered = (app) => (kind, typed) => patched(app, { filter: { ...app.bridge.sections.filter, [kind]: typed } });

export const watched = (app, terminal) => {
  const signals = [
    from(terminal.$thread),
    from(terminal.$buffer),
    from(belt.atom.chain(terminal.$thread, "$buffers")),
    from(app.client.runtime.entities.terminal.$entities),
    from(app.client.runtime.entities.thread.$entities),
    from(app.client.runtime.entities.mode.$entities),
    from(app.client.runtime.entities.daemon.$entities),
    from(app.client.runtime.entities.activity.$entities),
    from(app.client.runtime.$status),
    from(app.client.runtime.lighthouse.$user),
    from(app.client.runtime.lighthouse.$status),
    from(app.bridge.$sections),
    from(app.bridge.$hidden),
    from(app.bridge.$sidebar),
    from(app.bridge.$viewport),
    from(app.bridge.$theme),
    from(app.telemetry.$state),
  ];
  return createMemo(() => {
    for (const signal of signals) signal();
    return gathered(app, terminal);
  });
};

export const Section = (props) => {
  const app = ambient.app.consume();
  const terminal = ambient.terminal.consume();
  return <parts.Section section={props.section} pre={props.pre} onAct={act(app, terminal)} onFilter={filtered(app)} />;
};

export function Sidebar() {
  const app = ambient.app.consume();
  const terminal = ambient.terminal.consume();
  const world = watched(app, terminal);
  const focus = from(app.bridge.$focus);
  const sidebar = from(app.bridge.$sidebar);
  return (
    <aside class={focus() === "sidebar" ? "sidebar focus" : "sidebar"} data-zone="0" style={`--sb-w:${sidebar().width}px`} onClick={() => app.bridge.$focus.set("sidebar")}>
      <div class="sbhead">
        <span class="t">{world().thread === null ? UNCLAIMED : world().thread.word}</span>
        <button class="iconbtn" data-signal="/sidebar" aria-label="close the sidebar" title="close the sidebar · /sidebar" onClick={() => act(app, terminal)({ signal: "/sidebar" })}>
          <parts.Icon name="x" />
        </button>
      </div>
      <div class="sbbody">
        <Index each={sideView(world())}>{(section) => <Section section={section()} pre="sb" />}</Index>
        <div class="sbfoot">
          <parts.Srow row={sideTags(world())} pre="sb" onAct={act(app, terminal)} onFilter={filtered(app)} />
        </div>
      </div>
    </aside>
  );
}
