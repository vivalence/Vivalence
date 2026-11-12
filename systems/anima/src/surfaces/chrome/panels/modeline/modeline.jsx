import { createMemo, from, Show } from "solid-js";
import * as parts from "@vivalence/drapes/parts";
import * as ambient from "../../ambient/index.js";
import { belt } from "@vivalence/ghost";
import {
  contexted,
  dset,
  elapsed,
  harness,
  loudness,
  miked,
  percent,
  playback,
  reference,
  sections,
  standing,
  tool,
  UNCLAIMED,
  voiced,
} from "../sidebar/sections.js";
import { act, filtered, SURFACE, watched } from "../sidebar/sidebar.jsx";
import { SECOND, ticking } from "../dock/textarea.jsx";

export const TAP = 260;
export const HOLD = 420;
export const LIFT = 6;
export const ROOM = 16;

export const marked = (app, terminal) => {
  let tap = null;
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
  };
  const close = () => {
    app.bridge.$widget.set(null);
    app.bridge.$popover.set(null);
    drop();
    if (sided()) SURFACE["/sidebar"](app, terminal);
  };
  return {
    pick: () => {
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

export const VOICES = [
  [
    (call, dictation, paused) => call !== null && call.state === "listening" && paused,
    () => "muted",
  ],
  [(call) => call !== null, (call) => call.state],
  [(call, dictation) => dictation !== null, () => "dictate"],
  [() => true, () => "idle"],
];

export const stated = (call, dictation, paused) =>
  VOICES.find(([test]) => test(call, dictation, paused))[1](call, dictation, paused);

export const LEVELS = {
  idle: () => 0,
  dictate: (level) => percent(level),
  listening: (level) => percent(level),
  muted: (level) => percent(level),
  thinking: () => 0,
  speaking: (level, playing) => playback(playing),
};

const SAID = [
  [(state) => state === "idle" || state === "dictate", (state) => state],
  [() => true, (state, call, now) => `${state} · ${elapsed((now - call.since) / SECOND)}`],
];

export const said = (state, call, now) => SAID.find(([test]) => test(state))[1](state, call, now);

export const ENDS = [
  [(call) => call !== null, "/call/end"],
  [(call, dictation) => dictation !== null, "/dictate/stop"],
];

export const placed = (event) => {
  const room = event.currentTarget.closest(".client").getBoundingClientRect();
  const rect = event.currentTarget.getBoundingClientRect();
  return { x: rect.left - room.left, bottom: room.bottom - rect.top + LIFT, room: rect.top - room.top - ROOM };
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
  const call = from(app.bridge.$call);
  const dictation = from(app.bridge.$dictation);
  const level = from(app.box.device.microphone.$level);
  const claimed = from(app.box.device.microphone.$claimed);
  const paused = from(app.box.device.microphone.$paused);
  const playing = from(app.box.device.speaker.$playing);
  const now = ticking(() => call() !== null);
  const state = createMemo(() => stated(call(), dictation(), paused()));
  const voice = {
    get state() {
      return state();
    },
    get level() {
      return LEVELS[state()](level(), playing());
    },
    get text() {
      return said(state(), call(), now());
    },
  };
  const ended = () => ENDS.find(([test]) => test(call(), dictation()));
  const mark = marked(app, terminal);
  const chorded = () => (crumbs().length > 1 ? parts.SUBJECTS.find((subject) => subject.k === crumbs()[1]) : undefined);
  const open = () => (widget() !== null ? widget().id : chorded() === undefined ? null : chorded().id);
  const sided = () => (viewport().narrow ? phonePane() === "sidebar" : sidebar().open);
  const keys = () => crumbs().length === 1 || catalog() !== null || sided();
  const pick = (subject, event) => {
    if (subject === "activity" && ended() !== undefined)
      return terminal.repl
        .dispatch(ended()[1])
        .catch((error) => terminal.controller.stdout.fault(error));
    if (widget() !== null && widget().id === subject) return app.bridge.$widget.set(null);
    app.bridge.$popover.set(null);
    if (chord() !== null) terminal.legend.dispatch("esc");
    app.bridge.$widget.set({ id: subject, ...placed(event) });
  };
  const hold = (subject, event) => {
    app.bridge.$widget.set(null);
    if (chord() !== null) terminal.legend.dispatch("esc");
    const room = event.currentTarget.closest(".client").getBoundingClientRect();
    app.bridge.$popover.set({
      set: "display",
      x: event.clientX - room.left,
      y: event.clientY - room.top,
    });
  };
  const thread = () => world().thread;
  const held = createMemo(() => harness(world().runtime, thread()));
  return (
    <parts.Bar
      entity={{ label: thread() === null ? UNCLAIMED : thread().word, mode: thread() === null ? UNCLAIMED : reference(thread().mode) }}
      harness={{ tier: String(held().tier), effort: String(held().effort), pct: contexted(world().turns, held().model).pct, ...belt.harness.tallied(thread()) }}
      activity={spoken(owned(world()))}
      voice={voice}
      display={{ view: world().terminal.dock.view, align: world().terminal.dock.align, lens: world().terminal.dock.lens.join(" · ") }}
      box={{ mic: miked(claimed(), paused()).word, voice: playing() }}
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
  const heard = voiced(app).map((store) => from(store));
  const section = createMemo(() => {
    if (widget() === null) return undefined;
    for (const read of heard) read();
    return sections(world()).find((candidate) => candidate.id === widget().id);
  });
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
      <parts.Pop
        set={popover().set}
        dset={dset(world().terminal.dock)}
        at={popover()}
        viewport={{ width: viewport().width, height: viewport().height }}
        onClose={() => app.bridge.$popover.set(null)}
        onAct={(entry) => {
          const set = popover().set;
          act(app, terminal)(entry);
          if (!["display", "lens"].includes(set)) app.bridge.$popover.set(null);
        }}
      />
    </Show>
  );
}
