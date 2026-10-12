import { createMemo, For, from, on, Show } from "solid-js";
import { Logo } from "../Logo.jsx";
import { Row } from "../Row.jsx";
import { usePalette } from "../palette.js";
import { BEARER, pip, STANDING } from "./pips.js";

const Bearer = (props) => {
  const status = from(props.bearer.$status);
  return (
    <Row state={pip(BEARER, status().code)} tone="ink" label={props.label} value={`${props.bearer.manifest.slug} ${status().code}`} />
  );
};

export function Boot(props) {
  const palette = usePalette();
  const client = props.client;
  const standing = from(client.$standing);
  const seat = from(client.$seat);
  const gathered = from(client.$modes);
  const bearers = createMemo(on(gathered, () => client.bearers));
  const runtime = () => bearers().find((bearer) => bearer === client.runtime);
  const daemons = () => bearers().filter((bearer) => bearer !== client.runtime);

  return (
    <box style={{ flexDirection: "column", alignItems: "center", justifyContent: "center", flexGrow: 1, gap: 1 }}>
      <Logo variant="banner" />
      <box style={{ flexDirection: "column", width: 40, backgroundColor: palette.surface }}>
        <Row state="on" tone="ink" label="instance" value={client.mask.manifest.slug} />
        <Row state={pip(STANDING, standing().code)} tone="ink" label="lighthouse" value={standing().code} />
        <Show when={runtime() !== undefined} fallback={<Row state="pending" tone="ink" label="runtime" value="pending" />}>
          <Bearer label="runtime" bearer={runtime()} />
        </Show>
        <For each={daemons()}>{(daemon) => <Bearer label="daemons" bearer={daemon} />}</For>
        <Row
          state={seat() === null ? "pending" : "on"}
          tone="ink"
          label="terminal"
          value={seat() === null ? "seating" : `#${seat().terminal.id}`}
        />
      </box>
    </box>
  );
}
