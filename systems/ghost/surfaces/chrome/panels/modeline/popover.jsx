import { from } from "solid-js";
import { Dynamic, useRenderer, useTerminalDimensions } from "@opentui/solid";
import * as ambient from "../../ambient/index.js";
import * as widgets from "../../widgets/index.js";

export const WIDTH = 48;

export const CLEARANCE = 3;

const placeholder = (props) => <widgets.swatch.Swatch name={props.held} fill={props.palette.surfaceLift} ink={props.palette.textStrong} style={{ height: 8 }} />;

export const WIDGETS = {
  entity: widgets.entity.Entity,
  activity: placeholder,
  harness: placeholder,
  display: widgets.display.Display,
  system: widgets.system.System,
};

export const ANCHORS = [
  [(popover) => popover.anchor !== undefined, (popover) => popover.anchor],
  [(popover, renderer) => renderer.root.findDescendantById(`segment-${popover.held}`) !== undefined, (popover, renderer) => renderer.root.findDescendantById(`segment-${popover.held}`).x],
  [() => true, () => 0],
];

export const anchored = (popover, renderer) => ANCHORS.find(([test]) => test(popover, renderer))[1](popover, renderer);

export function Popover(props) {
  const popover = from(ambient.app.consume().bridge.$popover);
  const terminal = ambient.terminal.consume();
  const dimensions = useTerminalDimensions();
  const renderer = useRenderer();
  return (
    <box
      position="absolute"
      bottom={1}
      left={Math.max(0, Math.min(anchored(popover(), renderer) - 1, dimensions().width - WIDTH))}
      zIndex={10}
      style={{ flexDirection: "column", width: WIDTH, paddingLeft: 1, backgroundColor: props.palette.boundary }}
    >
      <box style={{ flexDirection: "row", height: 1, justifyContent: "flex-end" }}>
        <text cursor="pointer" fg={props.palette.textStrong} bg={props.palette.surfaceLift} onMouseUp={() => terminal.repl.dispatch("/popover/close").catch((error) => terminal.controller.stdout.fault(error))}>
          {" ✕ "}
        </text>
      </box>
      <scrollbox verticalScrollbarOptions={{ visible: false }} contentOptions={{ minHeight: 0 }} style={{ maxHeight: dimensions().height - CLEARANCE }}>
        <Dynamic component={WIDGETS[popover().held]} palette={props.palette} held={popover().held} />
      </scrollbox>
      <box position="absolute" top={1} bottom={0} right={0} zIndex={1} style={{ width: 1, backgroundColor: props.palette.boundary }} />
    </box>
  );
}
