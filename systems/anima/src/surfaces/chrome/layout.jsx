import { createSignal, from, onCleanup, Show } from "solid-js";
import * as parts from "@vivalence/drapes/parts";
import { belt } from "@vivalence/ghost";
import * as ambient from "./ambient/index.js";
import { Booting } from "./panels/booting/booting.jsx";
import { Headline } from "./panels/headline/headline.jsx";
import { SIDEBAR, Sidebar } from "./panels/sidebar/sidebar.jsx";
import { Legend } from "./panels/legend/legend.jsx";
import { Repl } from "./panels/repl/repl.jsx";
import { Modeline, Popover, Widget } from "./panels/modeline/modeline.jsx";
import { Telemetry } from "./panels/telemetry/telemetry.jsx";
import { lookup } from "./panels/sidebar/sections.js";
import { Frame } from "./panels/frame/frame.jsx";
import { Dock } from "./panels/dock/dock.jsx";

export const DIRECTIONS = { right: "row", left: "row-reverse", bottom: "column", top: "column-reverse" };

export const layout = ({ phone, pane, dock, framed }) => {
  const floating = !phone && dock.view === "messenger";
  const frame = phone ? pane === "frame" && framed : dock.view !== "full";
  const docked = phone ? pane === "dock" : dock.view !== "closed";
  return { floating, frame, dock: docked, both: !phone && frame && docked && dock.view === "docked", direction: phone ? "column" : lookup(DIRECTIONS, dock.align, "dock align") };
};

export const percent = (share) => `${Math.round(share * 1000) / 10}%`;

export function Split(props) {
  const terminal = ambient.terminal.consume();
  const [dragging, setDragging] = createSignal(null);
  const shape = () => layout({ phone: props.phone, pane: props.pane, dock: props.dock, framed: props.framed });
  const share = () => (dragging() === null ? props.dock.share : dragging());
  const basis = () => (shape().both ? { flex: `0 0 ${percent(share())}` } : { flex: "1 1 0" });
  const shared = (picked) => {
    setDragging(null);
    terminal.repl.dispatch(`/split ${picked.toFixed(2)}`).catch((error) => terminal.controller.stdout.fault(error));
  };
  return (
    <parts.Split direction={shape().direction}>
      <Show when={shape().frame}>
        <Frame dock={props.dock} phone={props.phone} />
      </Show>
      <Show when={shape().both}>
        <parts.Seam align={props.dock.align} onDrag={setDragging} onShare={shared} onReset={() => terminal.repl.dispatch(`/split ${belt.dock.DEFAULT_DOCK.share}`).catch((error) => terminal.controller.stdout.fault(error))} />
      </Show>
      <Show when={shape().dock}>
        <Dock dock={props.dock} phone={props.phone} floating={shape().floating} basis={basis()} />
      </Show>
    </parts.Split>
  );
}

export const widened = (event, body) => Math.max(SIDEBAR.floor, Math.min(SIDEBAR.ceiling, Math.round(event.clientX - body.left)));

export const Sbseam = () => {
  const app = ambient.app.consume();
  const [dragging, setDragging] = createSignal(false);
  let seam;
  const down = (event) => {
    event.preventDefault();
    const view = seam.ownerDocument.defaultView;
    const body = seam.parentElement.getBoundingClientRect();
    const move = (moved) => app.bridge.$sidebar.set({ ...app.bridge.sidebar, width: widened(moved, body) });
    const up = () => {
      view.removeEventListener("pointermove", move);
      view.removeEventListener("pointerup", up);
      setDragging(false);
    };
    setDragging(true);
    view.addEventListener("pointermove", move);
    view.addEventListener("pointerup", up);
  };
  return <div ref={seam} classList={{ sbseam: true, drag: dragging() }} data-sbseam="1" title="drag to resize · /sidebar/width" onPointerDown={down} />;
};

export const Panel = () => {
  const terminal = ambient.terminal.consume();
  const chord = from(terminal.legend.$chord);
  const catalog = from(terminal.repl.$catalog);
  return (
    <section class="panel" data-zone="0" data-r="panel" hidden={chord() === null && catalog() === null}>
      <Legend />
      <Repl />
    </section>
  );
};

const Seated = () => {
  const app = ambient.app.consume();
  const terminal = ambient.terminal.consume();
  const terminals = from(app.client.runtime.entities.terminal.$entities);
  const buffer = from(terminal.$buffer);
  const viewport = from(app.bridge.$viewport);
  const pane = from(app.bridge.$phonePane);
  const sidebar = from(app.bridge.$sidebar);
  const dock = () => {
    terminals();
    return terminal.dock;
  };
  const sided = () => (viewport().narrow ? pane() === "sidebar" : sidebar().open);
  return (
    <>
      <Show when={!viewport().narrow}>
        <Headline />
      </Show>
      <div class="body">
        <Show when={sided()}>
          <Sidebar />
          <Show when={!viewport().narrow}>
            <Sbseam />
          </Show>
        </Show>
        <Split dock={dock()} framed={buffer() !== null} phone={viewport().narrow} pane={pane()} />
      </div>
      <Panel />
      <Modeline />
      <div data-r="widget" style={{ display: "contents" }}>
        <Widget />
      </div>
      <div data-r="popover" style={{ display: "contents" }}>
        <Popover />
      </div>
      <div data-r="telemetry" style={{ display: "contents" }}>
        <Telemetry />
      </div>
    </>
  );
};

export function Layout() {
  const app = ambient.app.consume();
  const terminals = from(app.client.runtime.entities.terminal.$entities);
  const id = from(app.bridge.$terminal);
  const shown = () => terminals().find((terminal) => terminal.id === id()) ?? terminals()[0];
  return (
    <Show when={shown()} keyed fallback={<Booting />}>
      {(terminal) => {
        const pressed = (event) => terminal.legend.dispatch(event);
        globalThis.addEventListener("keydown", pressed);
        onCleanup(() => globalThis.removeEventListener("keydown", pressed));
        return (
          <ambient.terminal.Provider value={terminal}>
            <Seated />
          </ambient.terminal.Provider>
        );
      }}
    </Show>
  );
}
