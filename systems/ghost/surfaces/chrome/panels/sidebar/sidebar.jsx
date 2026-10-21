import { createSignal, from, onCleanup, Show } from "solid-js";
import { useRenderer, useTerminalDimensions } from "@opentui/solid";
import * as ambient from "../../ambient/index.js";
import * as widgets from "../../widgets/index.js";

export const NARROWEST = 24;
export const WIDEST = 96;

export const gripped = (column) => Math.min(WIDEST, Math.max(NARROWEST, column + 1));

export function Sidebar(props) {
  const shown = from(ambient.app.consume().bridge.$sidebar);
  const terminal = ambient.terminal.consume();
  const faulted = (error) => terminal.controller.stdout.fault(error);
  const renderer = useRenderer();
  const dimensions = useTerminalDimensions();
  const [held, setHeld] = createSignal(false);
  let sidebar;
  const released = () => {
    setHeld(false);
    renderer.root.onMouseDrag = undefined;
    renderer.root.onMouseUp = undefined;
  };
  onCleanup(released);
  return (
    <box ref={sidebar} style={{ flexDirection: "row", width: shown().width, flexShrink: 0, overflow: "hidden", backgroundColor: props.palette.surfaceSunk }}>
      <box style={{ flexDirection: "column", flexGrow: 1, minWidth: 0 }}>
        <box style={{ flexDirection: "row", height: 1, justifyContent: "flex-end" }}>
          <text cursor="pointer" fg={props.palette.textStrong} bg={props.palette.surfaceLift} onMouseUp={() => terminal.repl.dispatch("/sidebar/toggle").catch(faulted)}>
            {" ✕ "}
          </text>
        </box>
        <scrollbox style={{ flexGrow: 1 }}>
          <widgets.entity.Entity palette={props.palette} />
          <widgets.display.Display palette={props.palette} />
          <widgets.system.System palette={props.palette} />
        </scrollbox>
      </box>
      <box
        cursor="ew-resize"
        style={{ width: 1, flexShrink: 0, backgroundColor: props.palette.boundary }}
        onMouseDown={() => {
          setHeld(true);
          renderer.root.onMouseDrag = (event) => terminal.repl.dispatch(`/sidebar/width ${gripped(event.x)}`).catch(faulted);
          renderer.root.onMouseUp = released;
        }}
      />
      <Show when={held()}>
        <box position="absolute" left={-sidebar.x} top={-sidebar.y} zIndex={100} cursor="ew-resize" style={{ width: dimensions().width, height: dimensions().height }} />
      </Show>
    </box>
  );
}
