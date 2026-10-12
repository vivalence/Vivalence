import { from, Show } from "solid-js";
import { belt } from "@vivalence/typology";
import { usePalette } from "@vivalence/sheets";

export function Crown(props) {
  const palette = usePalette();
  const client = props.client;
  const terminal = from(client.terminals.$active);
  const thread = from(belt.atom.chain(client.terminals.$active, "$thread"));
  const live = from(belt.atom.chain(client.terminals.$active, "$thread", "$live"));
  const user = from(client.runtime.lighthouse.$user);
  const status = from(client.runtime.lighthouse.$status);

  const mode = () => (thread() === null || thread() === undefined ? null : thread().mode);
  const trail = () =>
    [
      client.mask.manifest.slug,
      ...(user() === null || user().username === undefined ? [] : [user().username]),
      ...(terminal() === null || terminal() === undefined ? [] : [`#${terminal().id}`]),
      ...(mode() === null ? [] : [mode().host.slug]),
    ].join(" · ");

  return (
    <box style={{ flexDirection: "row", height: 1, backgroundColor: palette.inverse }}>
      <text fg={palette.inverseOn} wrapMode="none" truncate>
        {`✦ ${trail()}`}
        {mode() === null ? "" : ` › ${mode().slug}`}
        {live() === null || live() === undefined ? "" : " · ● streaming"}
      </text>
      <Show when={status().code === "OFFLINE"}>
        <text fg={palette.signalNegative} bg={palette.inverse}>{" · offline"}</text>
      </Show>
    </box>
  );
}
