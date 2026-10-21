import { from, Show } from "solid-js";
import * as parts from "@vivalence/drapes/parts";
import * as ambient from "../../ambient/index.js";
import { dset, harness, loudness, reference, sections, standing, tool, UNCLAIMED } from "../sidebar/sections.js";
import { act, filtered, SURFACE, watched } from "../sidebar/sidebar.jsx";

export const TAP = 260;
export const HOLD = 420;
export const LIFT = 6;
export const ROOM = 16;

export const marked = (app, terminal) => {
  let tap = null;
  let held = false;
  const sided = () => (app.bridge.viewport.narrow ? app.bridge.phonePane === "sidebar" : app.bridge.sidebar.open);
  const opened = () => terminal.legend.chord !== null || terminal.repl.catalog !== null || app.bridge.widget !== null || app.bridge.popover !== null || sided();
  const drop = () => {
    if (terminal.legend.chord !== null || terminal.repl.catalog !== null) terminal.legend.dispatch("esc");
  };
  const palette = () => {
    if (terminal.repl.catalog !== null) terminal.legend.dispatch("esc");
    else {
      terminal.legend.dispatch("leader");
      terminal.legend.dispatch("leader");
    }
    app.bridge.$focus.set("composer");
  };
  const close = () => {
    app.bridge.$widget.set(null);
    app.bridge.$popover.set(null);
    drop();
    if (sided()) SURFACE["/sidebar"](app, terminal);
    app.bridge.$focus.set("composer");
  };
  return {
    pick: () => {
      if (held) {
        held = false;
        return;
      }
      if (tap !== null) {
        clearTimeout(tap);
        tap = null;
        return palette();
      }
      if (opened()) return close();
      tap = setTimeout(() => {
        tap = null;
        terminal.legend.dispatch("leader");
      }, TAP);
    },
    hold: () => {
      held = true;
      clearTimeout(tap);
      tap = null;
      drop();
      if (!sided()) SURFACE["/sidebar"](app, terminal);
    },
  };
};

const SEATED = [
  [(seated) => loudness(seated).tone !== "idle", (seated) => ({ tone: loudness(seated).tone, text: tool(seated) === null ? loudness(seated).text : `${tool(seated)} · ${loudness(seated).text}` })],
  [(seated) => seated.some((activity) => activity.status === "FAILED"), () => ({ tone: "negative", text: "fault" })],
  [() => true, () => ({ tone: "idle", text: "" })],
];
export const spoken = (seated) => SEATED.find(([test]) => test(seated))[1](seated);

const owned = (world) => world.activities.filter((activity) => world.thread !== null && activity.thread === world.thread);

export const placed = (event, viewport) => {
  const rect = event.currentTarget.getBoundingClientRect();
  return { x: rect.left, bottom: viewport.height - rect.top + LIFT, room: rect.top - ROOM };
};

export function Modeline() {
  const app = ambient.app.consume();
  const terminal = ambient.terminal.consume();
  const world = watched(app, terminal);
  const chord = from(terminal.legend.$chord);
  const crumbs = () => (chord() === null ? [] : terminal.legend.presses.backlog.map((signal) => signal.nature));
  const catalog = from(terminal.repl.$catalog);
  const widget = from(app.bridge.$widget);
  const viewport = from(app.bridge.$viewport);
  const phonePane = from(app.bridge.$phonePane);
  const sidebar = from(app.bridge.$sidebar);
  const mark = marked(app, terminal);
  const chorded = () => (crumbs().length > 1 ? parts.SUBJECTS.find((subject) => subject.k === crumbs()[1]) : undefined);
  const open = () => (widget() !== null ? widget().id : chorded() === undefined ? null : chorded().id);
  const sided = () => (viewport().narrow ? phonePane() === "sidebar" : sidebar().open);
  const keys = () => crumbs().length === 1 || catalog() !== null || sided();
  const pick = (subject, event) => {
    if (widget() !== null && widget().id === subject) return app.bridge.$widget.set(null);
    app.bridge.$popover.set(null);
    if (chord() !== null) terminal.legend.dispatch("esc");
    app.bridge.$widget.set({ id: subject, ...placed(event, app.bridge.viewport) });
  };
  const hold = (subject, event) => {
    app.bridge.$widget.set(null);
    if (chord() !== null) terminal.legend.dispatch("esc");
    app.bridge.$popover.set({ x: event.clientX, y: event.clientY });
  };
  const thread = () => world().thread;
  const held = () => harness(thread());
  return (
    <parts.Bar
      entity={{ label: thread() === null ? UNCLAIMED : thread().word, mode: thread() === null ? UNCLAIMED : reference(thread().mode) }}
      harness={{ tune: String(held().tune), effort: String(held().effort), pct: held().context }}
      activity={spoken(owned(world()))}
      display={{ view: world().terminal.dock.view, align: world().terminal.dock.align, lens: world().terminal.dock.lens, framed: world().terminal.buffer !== null }}
      box={{ mic: "off", voice: false }}
      system={{ standing: standing(world().runtime.lighthouse), health: world().runtime.status.code }}
      fault={world().activities.some((activity) => activity.status === "FAILED")}
      live={loudness(owned(world())).tone === "primary"}
      open={open()}
      keys={keys()}
      phone={viewport().narrow}
      delay={HOLD}
      onMark={mark.pick}
      onSidebar={mark.hold}
      onPick={pick}
      onHold={hold}
    />
  );
}

export function Widget() {
  const app = ambient.app.consume();
  const terminal = ambient.terminal.consume();
  const world = watched(app, terminal);
  const widget = from(app.bridge.$widget);
  const viewport = from(app.bridge.$viewport);
  const section = () => sections(world()).find((candidate) => candidate.id === widget().id);
  return (
    <Show when={widget() !== null && section() !== undefined}>
      <parts.Wid section={section()} at={widget()} viewport={{ width: viewport().width, height: viewport().height }} onClose={() => app.bridge.$widget.set(null)} onAct={act(app, terminal)} onFilter={filtered(app)} />
    </Show>
  );
}

export function Popover() {
  const app = ambient.app.consume();
  const terminal = ambient.terminal.consume();
  const world = watched(app, terminal);
  const popover = from(app.bridge.$popover);
  const viewport = from(app.bridge.$viewport);
  return (
    <Show when={popover() !== null && "x" in popover()}>
      <parts.Pop dset={dset(world().terminal.dock)} at={popover()} viewport={{ width: viewport().width, height: viewport().height }} onClose={() => app.bridge.$popover.set(null)} onAct={act(app, terminal)} />
    </Show>
  );
}
