import { createSignal, For, from, Show, Switch, Match } from "solid-js";
import { Input } from "../views/Input.jsx";
import { JsonTree } from "../views/JsonTree.jsx";
import { Markdown } from "../views/Markdown.jsx";
import { tone, usePalette } from "../palette.js";

const ROLES = {
  user: { glyph: "›", tone: "primary" },
  assistant: { glyph: "✦", tone: "link" },
};

const role = (name) => {
  if (!Object.hasOwn(ROLES, name)) throw new Error(`[dock] not a turn role: ${JSON.stringify(name)} · ${Object.keys(ROLES).join(" · ")}`);
  return ROLES[name];
};

const Part = (props) => {
  const palette = usePalette();
  return (
    <Show when={props.part.type === "text"} fallback={<text fg={palette.textMuted}>{`[${props.part.type}]`}</text>}>
      <Markdown text={props.part.text} />
    </Show>
  );
};

export const Turn = (props) => {
  const palette = usePalette();
  return (
    <box style={{ flexDirection: "row", gap: 1 }}>
      <text fg={tone(palette, role(props.turn.role).tone)}>{role(props.turn.role).glyph}</text>
      <box style={{ flexDirection: "column", flexGrow: 1 }}>
        <For each={props.turn.parts}>{(part) => <Part part={part} />}</For>
      </box>
    </box>
  );
};

export const Message = (props) => {
  const palette = usePalette();
  return (
    <box style={{ flexDirection: "row", gap: 1 }}>
      <text fg={palette.textMuted}>{props.record.path.split("/").at(-1)}</text>
      <Show when={typeof props.record.data === "string"} fallback={<JsonTree data={props.record.data} />}>
        <text fg={palette.textInk}>{props.record.data}</text>
      </Show>
    </box>
  );
};

export const Fault = (props) => {
  const palette = usePalette();
  return <text fg={palette.signalNegative}>{`✕ ${props.record.data.message}`}</text>;
};

export function Dock(props) {
  const rows = from(props.client.controller.stdout.tail("message", "fault", "turn"));
  const streams = from(props.client.controller.stdout.tail("stream"));
  const live = () => (streams() === undefined || streams().length === 0 ? null : streams().at(-1).data.open);
  const [draft, setDraft] = createSignal("");

  const send = (line) => {
    if (line.trim() === "") return;
    setDraft("");
    props.client.dispatch(line);
  };

  return (
    <box style={{ flexDirection: "column", flexGrow: 1, paddingLeft: 1, paddingRight: 1 }}>
      <scrollbox style={{ flexGrow: 1 }} stickyScroll stickyStart="bottom">
        <For each={rows()}>
          {(record) => (
            <Switch>
              <Match when={record.verb === "turn"}><Turn turn={record.data} /></Match>
              <Match when={record.verb === "fault"}><Fault record={record} /></Match>
              <Match when={record.verb === "message"}><Message record={record} /></Match>
            </Switch>
          )}
        </For>
        <Show when={live() !== null}>
          <Turn turn={live()} />
        </Show>
      </scrollbox>
      <Input prompt="<<" value={draft()} onInput={setDraft} onSubmit={send} />
    </box>
  );
}
