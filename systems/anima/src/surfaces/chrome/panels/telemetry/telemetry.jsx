import { createEffect, createMemo, from, on, Show, untrack } from "solid-js";
import { computed } from "nanostores";
import { Dynamic } from "solid-js/web";
import * as parts from "@vivalence/drapes/parts";
import { belt as typology } from "@vivalence/typology";
import * as ambient from "../../ambient/index.js";
import { lookup } from "../sidebar/sections.js";
import * as entities from "./entities.js";
import * as spans from "./spans.js";

export const WINDOW = { x: 0, y: 48, width: 960, height: 640 };

export const SEED = { window: WINDOW, point: "app", lens: "tree", query: "", folds: { app: true, client: true }, trace: null, only: "all", stack: false, json: false };

const ENTITIES = ["daemon", "mode", "terminal", "thread", "turn", "buffer", "activity"];

const watched = (app, terminal) => [
  ...Object.keys(app.bridge).filter((key) => key.startsWith("$")).map((key) => from(app.bridge[key])),
  ...ENTITIES.map((kind) => from(app.client.runtime.entities[kind].$entities)),
  from(app.client.runtime.$status),
  from(app.client.runtime.lighthouse.$status),
  from(app.client.runtime.lighthouse.$user),
  from(app.telemetry.$logger),
  from(terminal.$thread),
  from(terminal.$buffer),
  from(typology.atom.chain(terminal.$thread, "$turns")),
  from(typology.atom.chain(terminal.$thread, "$buffers")),
  from(typology.atom.chain(terminal.$thread, "$activities")),
];

const seen = (app, terminal) => {
  const thread = terminal.$thread.get();
  return {
    app,
    terminal,
    terminals: app.client.runtime.entities.terminal.$entities.get(),
    thread,
    seated: terminal.$buffer.get(),
    turns: thread === null ? [] : thread.$turns.get(),
    buffers: thread === null ? [] : thread.$buffers.get(),
    activities: thread === null ? [] : thread.$activities.get(),
    modes: app.client.runtime.entities.mode.$entities.get(),
    daemons: app.client.runtime.entities.daemon.$entities.get(),
  };
};

export function Telemetry() {
  const app = ambient.app.consume();
  const terminal = ambient.terminal.consume();
  const telemetry = from(app.telemetry.$state);
  const viewport = from(app.bridge.$viewport);
  const records = from(computed(app.telemetry.$logger, (held) => held.filter((record) => spans.TRACKS.includes(record.track))));
  const activities = from(app.client.runtime.entities.activity.$entities);
  const stores = watched(app, terminal);

  const held = (key) => createMemo(() => telemetry()[key]);
  const open = held("open");
  const [view, point, lens, query, folds, trace, only, stack, json, filter, selection, since, peeks] = [
    "view",
    "point",
    "lens",
    "query",
    "folds",
    "trace",
    "only",
    "stack",
    "json",
    "filter",
    "selection",
    "since",
    "peeks",
  ].map(held);

  const index = createMemo((previous) => {
    if (!open()) return previous;
    for (const store of stores) store();
    return entities.indexed(entities.tree(seen(app, terminal)));
  }, null);
  const list = createMemo(
    (previous) =>
      open()
        ? spans.spans({ records: parts.listing(records), activities: parts.listing(activities), since: since(), now: performance.timeOrigin + performance.now() })
        : previous,
    [],
  );
  const logged = createMemo(() => spans.logger({ list: list(), filter: filter(), selection: selection() }));
  const shown = () => parts.listing(records).filter((record) => record.at > since()).length;

  const patch = (delta) => app.telemetry.$state.set({ ...app.telemetry.state, ...delta });
  const sent = (signal) => terminal.repl.dispatch(signal).catch((error) => terminal.controller.stdout.fault(error));

  const Logger = () => (
    <parts.Logger
      filters={logged().filters}
      rows={logged().rows}
      detail={logged().detail}
      stack={stack()}
      onFilter={(id) => patch({ filter: id })}
      onSelect={(id) => patch({ selection: selection() === id ? null : id, stack: false })}
      onStack={(open) => patch({ stack: open })}
      onLine={sent}
    />
  );

  const Inspector = () => {
    const node = createMemo(() => entities.picked(index(), point()));
    const typed = () => query().trim().toLowerCase();
    const nodes = createMemo(() =>
      lens() === "tree" ? entities.treed(index(), folds(), typed(), node().id) : entities.lensed(index(), lens(), typed(), node().id),
    );
    const traced = createMemo(() => spans.traced({ list: list(), node: node(), only: only(), selection: trace() }));
    const opened = (id) => {
      const entry = index().by.get(id);
      return entry === undefined ? {} : Object.fromEntries(entry.lineage.map((above) => [above.id, true]));
    };
    createEffect(
      on(point, (id) => {
        const lineage = untrack(() => opened(id));
        if (Object.keys(lineage).some((above) => folds()[above] !== true)) patch({ folds: { ...untrack(folds), ...lineage } });
      }),
    );
    const pick = (id) => patch({ point: id, json: false, folds: { ...folds(), ...opened(id) } });
    const moded = () => {
      const owner = node().lineage.findLast((id) => index().by.get(id).node.kind === "mode");
      return app.client.runtime.entities.mode.$entities.get().find((mode) => mode.reference.absolute === owner);
    };
    const read = (act) => {
      const id = node().id;
      if (Object.hasOwn(peeks(), id)) return patch({ peeks: Object.fromEntries(Object.entries(peeks()).filter(([key]) => key !== id)) });
      const thread = terminal.$thread.get();
      return moded()
        .connection.call(`/metadata/harness/primer/${act.path}`, thread === null ? {} : { thread: thread.id })
        .catch((error) => error.message)
        .then((text) => patch({ peeks: { ...app.telemetry.state.peeks, [id]: text } }));
    };
    const ACTS = {
      signal: (act) => sent(act.signal),
      copy: (act) => globalThis.navigator.clipboard.writeText(act.text),
      read,
    };
    return (
      <parts.Inspector
        lenses={entities.lenses(index(), lens())}
        query={query()}
        nodes={nodes()}
        node={{ ...node(), peek: Object.hasOwn(peeks(), node().id) ? peeks()[node().id] : null }}
        trace={traced()}
        json={json()}
        stack={stack()}
        onQuery={(text) => patch({ query: text })}
        onLens={(id) => patch({ lens: id })}
        onPick={pick}
        onFold={(id) => patch({ folds: { ...folds(), [id]: folds()[id] !== true } })}
        onAct={(act) => lookup(ACTS, act.kind, "inspector act")(act)}
        onJson={(open) => patch({ json: open })}
        onOnly={(id) => patch({ only: id })}
        onSpan={(id) => patch({ trace: trace() === id ? null : id, stack: false })}
        onStack={(open) => patch({ stack: open })}
        onLine={sent}
      />
    );
  };

  const TABS = { logger: Logger, inspector: Inspector };
  const faulted = () => (view() === "logger" ? patch({ filter: "faults" }) : patch({ only: "faults" }));

  return (
    <Show when={telemetry().open}>
      <parts.Tele
        frame={{ x: telemetry().window.x, y: telemetry().window.y, w: telemetry().window.width, h: telemetry().window.height }}
        bounds={{ width: viewport().width, height: viewport().height }}
        tab={view()}
        count={shown()}
        faults={logged().faults}
        onTab={(tab) => patch({ view: tab })}
        onFaults={faulted}
        onClose={() => sent("/telemetry off")}
        onPlace={(frame) => patch({ window: { x: frame.x, y: frame.y, width: frame.w, height: frame.h } })}>
        <Dynamic component={lookup(TABS, view(), "telemetry tab")} />
      </parts.Tele>
    </Show>
  );
}
