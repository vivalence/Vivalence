import { from, Show } from "solid-js";
import { belt } from "@vivalence/typology";
import { Dock } from "./dock.jsx";
import { Frame } from "./frame.jsx";

export function Chrome(props) {
  const buffer = from(belt.atom.chain(props.client.$active, "$buffer"));
  return (
    <box style={{ flexDirection: "row", flexGrow: 1 }}>
      <Show when={buffer() !== null && buffer() !== undefined}>
        <box style={{ flexGrow: 1 }}>
          <Frame client={props.client} accept={props.accept} />
        </box>
      </Show>
      <box style={{ flexGrow: buffer() ? 0 : 1, width: buffer() ? 48 : "auto" }}>
        <Dock client={props.client} />
      </box>
    </box>
  );
}
