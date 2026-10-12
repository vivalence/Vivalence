import { createSignal, For, from, Show } from "solid-js";
import { belt } from "@vivalence/typology";
import { Input, JsonTree, Key, Listing, Markdown, Report, Spinner, tone, usePalette } from "@vivalence/sheets";

const ROLES = {
  user: { glyph: "›", tone: "primary" },
  assistant: { glyph: "✦", tone: "link" },
  system: { glyph: "·", tone: "muted" },
};

const role = (name) => {
  if (!Object.hasOwn(ROLES, name)) throw new Error(`[tty] not a turn role: ${JSON.stringify(name)} · ${Object.keys(ROLES).join(" · ")}`);
  return ROLES[name];
};

const tag = (part) => (part.type === "tool_use" ? `[tool_use ${part.name}]` : `[${part.type}]`);

const Part = (props) => {
  const palette = usePalette();
  return (
    <Show when={props.part.type === "text"} fallback={<text fg={palette.textMuted}>{tag(props.part)}</text>}>
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

const Value = (props) => {
  const palette = usePalette();
  return (
    <Show when={typeof props.value === "string"} fallback={<JsonTree data={props.value} />}>
      <text fg={palette.textInk}>{props.value}</text>
    </Show>
  );
};

const Flagged = (props) => {
  const palette = usePalette();
  return (
    <box style={{ flexDirection: "column" }}>
      <text fg={tone(palette, props.tone)}>{props.label}</text>
      <Value value={props.value} />
    </box>
  );
};

const OUTPUTS = [
  [(props) => Object.hasOwn(props, "fault"), (props) => <Flagged tone="negative" label="✕ fault" value={props.fault} />],
  [(props) => Object.hasOwn(props, "refused"), (props) => <Flagged tone="caution" label="⊘ refused" value={props.refused} />],
  [() => true, (props) => <JsonTree data={props} />],
];

const KINDS = {
  output: (props) => OUTPUTS.find(([test]) => test(props))[1](props),
  listing: (props) => <Listing {...props} />,
  report: (props) => <Report {...props} />,
};

export const painted = (held) => {
  if (held === null || held === undefined) return null;
  if (!Object.hasOwn(KINDS, held.kind)) throw new Error(`[dock] no kind ${JSON.stringify(held.kind)} · ${Object.keys(KINDS).join(" · ")}`);
  return KINDS[held.kind](held.props);
};

const unfolded = (live) => [...live.turns, ...(live.open === null ? [] : [live.open])];

export function Dock(props) {
  const client = props.client;
  const turns = from(belt.atom.chain(client.terminals.$active, "$thread", "$turns"));
  const live = from(belt.atom.chain(client.terminals.$active, "$thread", "$live"));
  const echo = from(belt.atom.chain(client.terminals.$active, "$thread", "$echo"));
  const output = from(props.$output);
  const [draft, setDraft] = createSignal("");

  const send = (line) => {
    if (line.trim() === "") return;
    setDraft("");
    client.dispatch(line);
  };

  return (
    <box style={{ flexDirection: "column", flexGrow: 1, paddingLeft: 1, paddingRight: 1 }}>
      <scrollbox style={{ flexGrow: 1 }} stickyScroll stickyStart="bottom">
        <For each={turns() === null || turns() === undefined ? [] : turns()}>{(turn) => <Turn turn={turn} />}</For>
        <Show when={live() !== null && live() !== undefined}>
          <For each={unfolded(live())}>{(turn) => <Turn turn={turn} />}</For>
          <Spinner tone="primary" label="streaming" />
        </Show>
        <Show when={echo() !== null && echo() !== undefined}>
          <Turn turn={echo()} />
        </Show>
      </scrollbox>
      <Input prompt="<<" placeholder="" value={draft()} onInput={setDraft} onSubmit={send} focused />
      <box style={{ flexDirection: "row", columnGap: 2, flexWrap: "wrap", flexShrink: 0 }}>
        <Key name="enter" action="send" />
        <Key name="/" action="command" />
        <Key name="ctrl-f" action="full" />
        <Key name="ctrl-n" action="collapse" />
        <Key name="ctrl-p" action="mode" />
      </box>
      <box style={{ flexDirection: "column", flexShrink: 0 }}>{painted(output())}</box>
    </box>
  );
}
