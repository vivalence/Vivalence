import { createSignal, ErrorBoundary, from, onCleanup, Show } from "solid-js";
import { useKeyboard, useRenderer, useTerminalDimensions } from "@opentui/solid";
import { is } from "@vivalence/typology";
import * as ambient from "./ambient/index.js";
import * as panels from "./panels/index.js";

export const SHARES = {
  docked: (dock) => ({ frame: 1 - dock.share, dock: dock.share }),
  messenger: (dock) => ({ frame: 1 - dock.share, dock: dock.share }),
  full: () => ({ frame: 0, dock: 1 }),
  closed: () => ({ frame: 1, dock: 0 }),
};

export const shares = (dock) => SHARES[dock.view](dock);

export const DIRECTIONS = { right: "row", left: "row-reverse", bottom: "column", top: "column-reverse" };

export const ERRORS = [
  [(value) => value instanceof Error, (value) => value],
  [(value) => is.array(value) && value[0] instanceof Error, (value) => value[0]],
  [(value) => is.array(value), (value) => new Error(value.map((each) => (is.string(each) ? each : JSON.stringify(each))).join(" "))],
  [() => true, (value) => new Error(String(value))],
];

export const errored = (value) => ERRORS.find(([test]) => test(value))[1](value);

export function Guarded(props) {
  const terminal = ambient.terminal.consume();
  return (
    <ErrorBoundary
      fallback={(thrown, reset) => {
        const error = errored(thrown);
        terminal.controller.stdout.fault(error);
        return (
          <text cursor="pointer" wrapMode="none" fg={props.palette.signalNegativeInk} bg={props.palette.surface} style={{ flexShrink: 0 }} onMouseUp={reset}>
            {`✕ ${props.panel}: ${error.message} · click retries`}
          </text>
        );
      }}
    >
      {props.children}
    </ErrorBoundary>
  );
}

export const SPANS = {
  right: (event, body) => (body.x + body.width - event.x) / body.width,
  left: (event, body) => (event.x - body.x + 1) / body.width,
  bottom: (event, body) => (body.y + body.height - event.y) / body.height,
  top: (event, body) => (event.y - body.y + 1) / body.height,
};

export const shared = (event, body, align) => Math.round(Math.min(0.9, Math.max(0.1, SPANS[align](event, body))) * 100) / 100;

export const SEAMS = {
  right: { cursor: "ew-resize", style: { width: 1, border: ["left"] } },
  left: { cursor: "ew-resize", style: { width: 1, border: ["left"] } },
  bottom: { cursor: "ns-resize", style: { height: 1, border: ["top"] } },
  top: { cursor: "ns-resize", style: { height: 1, border: ["top"] } },
};

export function Seam(props) {
  const terminal = ambient.terminal.consume();
  const faulted = (error) => terminal.controller.stdout.fault(error);
  const renderer = useRenderer();
  const dimensions = useTerminalDimensions();
  const [held, setHeld] = createSignal(false);
  const released = () => {
    setHeld(false);
    renderer.root.onMouseDrag = undefined;
    renderer.root.onMouseUp = undefined;
  };
  onCleanup(released);
  return (
    <>
      <box
        cursor={SEAMS[props.dock.align].cursor}
        style={{ ...SEAMS[props.dock.align].style, flexShrink: 0, borderColor: props.palette.boundary, backgroundColor: props.palette.surface }}
        onMouseDown={() => {
          setHeld(true);
          renderer.root.onMouseDrag = (event) => {
            const share = shared(event, props.body(), props.dock.align);
            if (share !== props.dock.share) terminal.repl.dispatch(`/split ${share}`).catch(faulted);
          };
          renderer.root.onMouseUp = released;
        }}
      />
      <Show when={held()}>
        <box position="absolute" left={-props.body().x} top={-props.body().y} zIndex={100} cursor={SEAMS[props.dock.align].cursor} style={{ width: dimensions().width, height: dimensions().height }} />
      </Show>
    </>
  );
}

export function Layout(props) {
  const app = ambient.app.consume();
  const terminals = from(app.client.runtime.entities.terminal.$entities);
  const id = from(app.bridge.$terminal);
  const sidebar = from(app.bridge.$sidebar);
  const telemetry = from(app.telemetry.$state);
  const terminal = () => terminals().find((terminal) => terminal.id === id()) ?? terminals()[0];

  return (
    <Show when={terminal()} keyed>
      {(terminal) => {
        useKeyboard((event) => terminal.legend.dispatch(event));
        const chord = from(terminal.legend.$chord);
        const catalog = from(terminal.repl.$catalog);
        const dock = () => {
          terminals();
          return terminal.dock;
        };
        let body;
        return (
          <ambient.terminal.Provider value={terminal}>
            <box style={{ flexDirection: "column", width: "100%", height: "100%" }}>
              <Guarded panel="headline" palette={props.palettes.chrome}><panels.headline.Headline palette={props.palettes.chrome} /></Guarded>
              <box style={{ flexDirection: "row", flexGrow: 1 }}>
                <Show when={sidebar().open}>
                  <Guarded panel="sidebar" palette={props.palettes.chrome}><panels.sidebar.Sidebar palette={props.palettes.chrome} /></Guarded>
                </Show>
                <box ref={body} style={{ flexDirection: DIRECTIONS[dock().align], flexGrow: 1 }}>
                  <Show when={shares(dock()).frame > 0}>
                    <box style={{ flexGrow: shares(dock()).frame, flexBasis: 0 }}>
                      <Guarded panel="frame" palette={props.palettes.body}><panels.frame.Frame palette={props.palettes.body} /></Guarded>
                    </box>
                  </Show>
                  <Show when={shares(dock()).frame > 0 && shares(dock()).dock > 0}>
                    <Seam palette={props.palettes.body} dock={dock()} body={() => body} />
                  </Show>
                  <Show when={shares(dock()).dock > 0}>
                    <box style={{ flexGrow: shares(dock()).dock, flexBasis: 0 }}>
                      <Guarded panel="dock" palette={props.palettes.body}><panels.dock.Dock palette={props.palettes.body} /></Guarded>
                    </box>
                  </Show>
                </box>
              </box>
              <Show when={chord() !== null} fallback={<Show when={catalog() !== null}><Guarded panel="repl" palette={props.palettes.chrome}><panels.repl.Repl palette={props.palettes.chrome} /></Guarded></Show>}>
                <Guarded panel="legend" palette={props.palettes.chrome}><panels.legend.Legend palette={props.palettes.chrome} /></Guarded>
              </Show>
              <Guarded panel="modeline" palette={props.palettes.chrome}><panels.modeline.Modeline palette={props.palettes.chrome} /></Guarded>
              <Show when={telemetry().open}>
                <Guarded panel="telemetry" palette={props.palettes.telemetry}><panels.telemetry.Telemetry palette={props.palettes.telemetry} /></Guarded>
              </Show>
            </box>
          </ambient.terminal.Provider>
        );
      }}
    </Show>
  );
}
