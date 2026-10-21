import { from, Show } from "solid-js";
import { Bar } from "@vivalence/sheets";
import * as ambient from "../../ambient/index.js";
import { Popover } from "./popover.jsx";

export const GESTURES = {
  click: "/leader",
  double: "/leader/leader",
  hold: "/sidebar/toggle",
};

export function Modeline(props) {
  const terminal = ambient.terminal.consume();
  const popover = from(ambient.app.consume().bridge.$popover);
  const thread = from(terminal.$thread);
  const chord = from(terminal.legend.$chord);
  const terminals = from(terminal.client.runtime.entities.terminal.$entities);
  const dock = () => {
    terminals();
    return terminal.dock;
  };
  const faulted = (error) => terminal.controller.stdout.fault(error);
  return (
    <box style={{ flexDirection: "column", height: 1 }}>
      <Bar
        palette={props.palette}
        entity={{ label: thread() === null ? "no thread" : thread().word, mode: thread() === null || thread().mode === null ? "—" : `${thread().mode.type}/${thread().mode.slug}` }}
        harness={null}
        activity={{ signal: "off", text: "idle", tool: null }}
        display={{ view: dock().view, align: dock().align }}
        system={{ standing: "VERIFIED" }}
        chord={chord() !== null}
        open={popover() === null ? null : popover().held}
        onMark={(gesture) => terminal.repl.dispatch(GESTURES[gesture]).catch(faulted)}
        onPick={(segment, column) => terminal.repl.dispatch(`/popover ${segment} ${column}`).catch(faulted)}
      />
      <Show when={popover() !== null}>
        <Popover palette={props.palette} />
      </Show>
    </box>
  );
}
