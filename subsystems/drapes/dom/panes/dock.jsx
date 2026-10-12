import { createEffect, For, Show } from "solid-js";
import { Dynamic } from "solid-js/web";
import { Empty } from "../Empty.jsx";
import { JsonTree } from "../JsonTree.jsx";
import { Markdown } from "../Markdown.jsx";
import { Row } from "../Row.jsx";
import { watch } from "../watch.js";

const Part = (props) => (
  <Show when={props.part.type === "text"} fallback={<JsonTree value={props.part} openDepth={0} />}>
    <Show when={props.role === "assistant"} fallback={<p class="dock-text">{props.part.text}</p>}>
      <Markdown text={props.part.text} />
    </Show>
  </Show>
);

const Turn = (props) => (
  <article class="dock-turn" data-role={props.turn.role} data-phase={props.phase}>
    <span class="dock-role">{props.turn.role}</span>
    <div class="dock-body">
      <For each={props.turn.parts}>{(part) => <Part part={part} role={props.turn.role} />}</For>
    </div>
  </article>
);

const building = (live) => (live.open === null ? live.turns : [...live.turns, live.open]);

const text = (fault) => (typeof fault === "string" ? fault : JSON.stringify(fault));

const Which = (props) => (
  <div class="dock-which">
    <For each={props.slot.which}>
      {(entry) => (
        <Row>
          <span class="dock-which-key">{entry.key}</span>
          <span class="dock-which-valence">{text(entry.valence)}</span>
        </Row>
      )}
    </For>
  </div>
);

const Pick = (props) => (
  <div class="dock-pick">
    <For each={props.slot.pick}>{(line) => <Row onClick={() => props.dispatch(line)}>{line}</Row>}</For>
  </div>
);

const SLOTS = [
  [(slot) => typeof slot !== "object", (props) => <JsonTree value={props.slot} />],
  [(slot) => Array.isArray(slot.which), Which],
  [(slot) => "fault" in slot, (props) => <Empty tone="negative" verb="fault" trace={text(props.slot.fault)} />],
  [(slot) => "refused" in slot, (props) => <Empty tone="warning" verb="refused" trace={text(props.slot.refused)} />],
  [(slot) => Array.isArray(slot.pick), Pick],
  [() => true, (props) => <JsonTree value={props.slot} openDepth={1} />],
];

const Slot = (props) => (
  <section class="dock-slot" data-kind={props.output.kind}>
    <Dynamic component={SLOTS.find(([test]) => test(props.output.props))[1]} slot={props.output.props} dispatch={props.dispatch} />
  </section>
);

export const Dock = (props) => {
  const thread = watch(props.client.terminals.$active, "$thread");
  const turns = watch(props.client.terminals.$active, "$thread", "$turns");
  const live = watch(props.client.terminals.$active, "$thread", "$live");
  const echo = watch(props.client.terminals.$active, "$thread", "$echo");
  const output = watch(props.$output);
  const held = (value) => value !== null && value !== undefined;
  let transcript = null;

  createEffect(() => {
    turns();
    live();
    echo();
    transcript.scrollTop = transcript.scrollHeight;
  });

  const send = (event) => {
    if (event.key !== "Enter" || event.shiftKey || event.isComposing) return;
    event.preventDefault();
    const line = event.currentTarget.value;
    if (line.trim() === "") return;
    event.currentTarget.value = "";
    props.dispatch(line);
  };

  return (
    <section class="dock-pane">
      <div class="dock-transcript" ref={(element) => (transcript = element)}>
        <Show
          when={held(thread()) || held(echo())}
          fallback={<Empty verb="no thread" trace="pick a mode in navigation · or a thread" />}>
          <For each={held(turns()) ? turns() : []}>{(turn) => <Turn turn={turn} phase="kept" />}</For>
          <Show when={echo()}>{(kept) => <Turn turn={kept()} phase="echo" />}</Show>
          <Show when={live()}>
            {(running) => <For each={building(running())}>{(turn) => <Turn turn={turn} phase="live" />}</For>}
          </Show>
        </Show>
      </div>
      <Show when={output()}>{(painted) => <Slot output={painted()} dispatch={props.dispatch} />}</Show>
      <div class="dock-composer">
        <span class="dock-prompt">›</span>
        <textarea class="dock-field" rows="1" placeholder="message · /command" spellcheck={false} onKeyDown={send} />
      </div>
    </section>
  );
};

export const style = `
.dock-pane {
  flex: 1;
  display: flex;
  flex-direction: column;
  min-width: 0;
  min-height: 0;
  background: var(--surface);
  color: var(--text-ink);
}
.dock-transcript {
  flex: 1;
  display: flex;
  flex-direction: column;
  gap: var(--size-space-md);
  min-height: 0;
  overflow-y: auto;
  padding: var(--size-space-lg);
  font-size: var(--size-type-sm);
  line-height: 1.5;
}
.dock-transcript > .kit-empty {
  flex: 1;
}
.dock-turn {
  display: flex;
  flex-direction: column;
  gap: 4px;
  min-width: 0;
}
.dock-turn[data-role="user"] {
  align-self: flex-end;
  max-width: 85%;
  padding: 8px 12px;
  border-radius: var(--shape-radius-card);
  background: var(--surface-sunk);
  color: var(--text-strong);
}
.dock-turn[data-phase="echo"],
.dock-turn[data-phase="live"] {
  opacity: 0.8;
}
.dock-role {
  font-family: var(--font-family-code);
  font-size: var(--size-type-2xs);
  letter-spacing: var(--shape-label-track);
  text-transform: var(--shape-label-case);
  color: var(--text-muted);
}
.dock-turn[data-role="assistant"] .dock-role {
  color: var(--signal-primary-ink);
}
.dock-body {
  min-width: 0;
}
.dock-text {
  margin: 0;
  white-space: pre-wrap;
  word-break: break-word;
}
.dock-slot {
  flex: none;
  max-height: 40%;
  overflow: auto;
  padding: var(--size-space-sm) var(--size-space-lg);
  background: var(--surface-sunk);
  box-shadow: 0 calc(var(--size-ring) * -1) 0 var(--boundary);
}
.dock-which-key {
  min-width: 80px;
  color: var(--text-strong);
  font-weight: 600;
}
.dock-which-valence {
  color: var(--text-light);
}
.dock-composer {
  flex: none;
  display: flex;
  align-items: flex-start;
  gap: 8px;
  padding: var(--size-space-sm) var(--size-space-lg) var(--size-space-md);
  box-shadow: 0 calc(var(--size-ring) * -1) 0 var(--boundary);
}
.dock-prompt {
  padding-top: 8px;
  font-family: var(--font-family-code);
  color: var(--signal-primary-ink);
}
.dock-field {
  flex: 1;
  min-width: 0;
  min-height: var(--size-field);
  max-height: 12em;
  box-sizing: border-box;
  padding: 8px 10px;
  border: none;
  border-radius: var(--shape-radius-field);
  background: var(--control-field);
  color: var(--text-strong);
  box-shadow: inset 0 0 0 var(--size-ring) var(--boundary);
  outline: none;
  resize: none;
  field-sizing: content;
  font: inherit;
  font-family: var(--font-family-sans-text);
  font-size: var(--size-type-sm);
  caret-color: var(--control-field-caret);
}
.dock-field::placeholder {
  color: var(--control-field-placeholder);
}
.dock-field:focus {
  box-shadow: inset 0 0 0 calc(var(--size-ring) * 1.5) var(--control-focus);
}
`;
