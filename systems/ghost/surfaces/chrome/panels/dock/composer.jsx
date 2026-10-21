import { from, Show } from "solid-js";
import * as ambient from "../../ambient/index.js";

export const CONSENT = [
  ["y", "approve", "/resume"],
  ["n", "skip", "/stop"],
  ["e", "edit", "/abort"],
];

export const KEYS = { running: "■ stop", idle: "⏎" };

export const LIVE = ["RUNNING", "PAUSED", "STOPPING"];

export const DRAFTS = [
  [(draft, catalog) => draft.startsWith("/") && catalog === null, (terminal) => terminal.repl.dispatch("/repl")],
  [() => true, () => Promise.resolve()],
];

function Consent(props) {
  const terminal = ambient.terminal.consume();
  return (
    <box style={{ flexDirection: "row", height: 1, gap: 1, paddingLeft: 1, flexShrink: 0, backgroundColor: props.palette.signalCautionTint }}>
      <text fg={props.palette.signalCautionInk} style={{ flexShrink: 0 }}>
        <b>? approve</b>
      </text>
      <text fg={props.palette.textStrong} style={{ flexShrink: 0 }}>{`${props.activity.type.toLowerCase()} #${props.activity.id.slice(0, 8)}`}</text>
      {CONSENT.map(([key, label, signal]) => (
        <text cursor="pointer" style={{ flexShrink: 0 }} fg={props.palette.textInk} onMouseUp={() => terminal.repl.dispatch(signal).catch((error) => terminal.controller.stdout.fault(error))}>
          <span style={{ fg: props.palette.signalPrimaryInk }}>
            <b>{` ${key}`}</b>
          </span>
          {` ${label}`}
        </text>
      ))}
    </box>
  );
}

export function Composer(props) {
  const terminal = ambient.terminal.consume();
  const app = ambient.app.consume();
  const draft = from(app.bridge.$draft);
  const focus = from(app.bridge.$focus);
  const catalog = from(terminal.repl.$catalog);
  const activities = from(props.thread.$activities);
  const faulted = (error) => terminal.controller.stdout.fault(error);
  const waiting = () => activities().find((activity) => activity.status === "PAUSED");
  const running = () => activities().some((activity) => LIVE.includes(activity.status));
  const drafted = (typed) => {
    app.bridge.$draft.set(typed);
    app.bridge.$selected.set(0);
    return DRAFTS.find(([test]) => test(typed, catalog()))[1](terminal).catch(faulted);
  };
  const submitted = (signal) => {
    app.bridge.$draft.set("");
    app.bridge.$selected.set(0);
    return terminal.repl.dispatch(signal).catch(faulted);
  };
  return (
    <Show when={waiting() === undefined} fallback={<Consent palette={props.palette} activity={waiting()} />}>
      <box style={{ flexDirection: "row", height: 1, flexShrink: 0, paddingLeft: 1, paddingRight: 1, gap: 1, backgroundColor: props.palette.controlField }}>
        <Show when={catalog() === null} fallback={<text fg={props.palette.signalPrimaryInk} style={{ flexShrink: 0 }}><b>{"<<"}</b></text>}>
          <text fg={props.palette.textMuted} style={{ flexShrink: 0 }}>›</text>
        </Show>
        <Show when={catalog() === null} fallback={<text wrapMode="none" fg={props.palette.textStrong} style={{ flexGrow: 1, flexShrink: 1, minWidth: 0 }}>{draft()}</text>}>
          <input
            focused={focus() === "composer"}
            value={draft()}
            cursorColor={props.palette.controlFieldCaret}
            textColor={props.palette.textStrong}
            focusedTextColor={props.palette.textStrong}
            backgroundColor={props.palette.controlField}
            focusedBackgroundColor={props.palette.controlField}
            style={{ flexGrow: 1 }}
            onInput={drafted}
            onSubmit={submitted}
          />
        </Show>
        <Show when={running()} fallback={<text fg={props.palette.textMuted} style={{ flexShrink: 0 }}>{KEYS.idle}</text>}>
          <text cursor="pointer" fg={props.palette.signalNegativeInk} style={{ flexShrink: 0 }} onMouseUp={() => terminal.repl.dispatch("/stop").catch(faulted)}>
            {KEYS.running}
          </text>
        </Show>
      </box>
    </Show>
  );
}
