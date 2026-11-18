import { createMemo, createSignal, For, from, on, onCleanup, Show } from "solid-js";
import { useKeyboard } from "@opentui/solid";
import { Meter, Row } from "@vivalence/sheets";
import * as ambient from "../../ambient/index.js";
import * as belt from "../../../../gestalten/belt/index.js";

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

export const CONTROLS = [
  [() => true, "a", "attach", "", "/file/upload"],
  [
    (voice) => voice.dictation === null && belt.dictation.offered(voice.commands, "/dictate"),
    "d",
    "dictate",
    "",
    "/dictate",
  ],
  [(voice) => voice.dictation !== null, "d", "stop dictation", "live", "/dictate/stop"],
  [
    (voice) => voice.call === null && belt.dictation.offered(voice.commands, "/call"),
    "l",
    "call",
    "",
    "/call",
  ],
  [(voice) => voice.call !== null, "l", "end the call", "live", "/call/end"],
  [() => true, "p", "paste", "", "/paste"],
];

export const controls = (voice) => CONTROLS.filter(([test]) => test(voice));

export const LEADS = [
  [(voice) => voice.dictation !== null || voice.call !== null, "signalNegativeInk"],
  [(voice) => voice.open || voice.catalog !== null, "signalPrimaryInk"],
  [() => true, "textMuted"],
];

export const lead = (voice) => LEADS.find(([test]) => test(voice))[1];

export const MICS = [
  [(dictation) => dictation === null, { ink: "textLight", signal: "/dictate" }],
  [() => true, { ink: "signalNegativeInk", signal: "/dictate/stop" }],
];

export const mic = (dictation) => MICS.find(([test]) => test(dictation))[1];

export const SPLICES = [
  [(settled, tail) => settled === "" || tail === "", (settled, tail) => [settled, tail]],
  [() => true, (settled, tail) => [settled, ` ${tail}`]],
];

export const spliced = (settled, tail) =>
  SPLICES.find(([test]) => test(settled, tail))[1](settled, tail);

export const HEARD = [
  [(spoken, tail) => spoken === "" && tail === "", () => ["", "listening"]],
  [() => true, (spoken, tail) => spliced(spoken, tail)],
];

export const heard = (dictation) => {
  const spoken = belt.dictation.spoken(dictation);
  const tail = belt.dictation.tail(dictation).trim();
  return HEARD.find(([test]) => test(spoken, tail))[1](spoken, tail);
};

export const HEARING = [
  [(paused) => paused, { glyph: "○", ink: "textMuted" }],
  [() => true, { glyph: "●", ink: "signalNegative" }],
];

export const hearing = (paused) => HEARING.find(([test]) => test(paused))[1];

export const clocked = (seconds) =>
  `${Math.floor(seconds / 60)}:${String(Math.floor(seconds % 60)).padStart(2, "0")}`;

export const elapsed = (since) => {
  const [now, tick] = createSignal(Date.now());
  const timer = setInterval(() => tick(Date.now()), 1000);
  onCleanup(() => clearInterval(timer));
  return () => clocked((now() - since) / 1000);
};

export const PRESSES = [
  [(event) => event.ctrl || event.meta || event.option, () => undefined],
  [
    (event) => event.name === "escape",
    (event, menu) => {
      event.preventDefault();
      menu.onClose();
    },
  ],
  [
    (event, menu) => menu.rows.some(([, key]) => key === event.name),
    (event, menu) => {
      event.preventDefault();
      menu.onRun(menu.rows.find(([, key]) => key === event.name)[4]);
    },
  ],
  [() => true, (event, menu) => menu.onClose()],
];

export function Lasted(props) {
  const lasted = elapsed(props.since);
  return <text fg={props.palette[props.ink]} style={{ flexShrink: 0 }}>{lasted()}</text>;
}

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

function Lead(props) {
  return (
    <text
      cursor="pointer"
      fg={props.palette[props.ink]}
      style={{ flexShrink: 0 }}
      onMouseUp={props.onPick}
    >
      <b>{"<<"}</b>
    </text>
  );
}

function Controls(props) {
  useKeyboard((event) => PRESSES.find(([test]) => test(event, props))[1](event, props));
  return (
    <box
      style={{
        flexDirection: "column",
        flexShrink: 0,
        alignSelf: "flex-start",
        paddingRight: 1,
        backgroundColor: props.palette.surfaceLift,
      }}
    >
      <For each={props.rows}>
        {([, key, name, value, signal]) => (
          <Row
            palette={props.palette}
            key={key}
            label={name}
            value={value}
            selected={value !== ""}
            onPick={() => props.onRun(signal)}
          />
        )}
      </For>
    </box>
  );
}

function Dictline(props) {
  const terminal = ambient.terminal.consume();
  const sent = (signal) =>
    terminal.repl.dispatch(signal).catch((error) => terminal.controller.stdout.fault(error));
  return (
    <box
      style={{
        flexDirection: "row",
        flexShrink: 0,
        gap: 1,
        paddingLeft: 1,
        paddingRight: 1,
        backgroundColor: props.palette.surfaceSunk,
      }}
    >
      <text fg={props.palette.textStrong} style={{ flexGrow: 1, flexShrink: 1, minWidth: 0 }}>
        <b>{heard(props.dictation)[0]}</b>
        <span style={{ fg: props.palette.textMuted }}>{heard(props.dictation)[1]}</span>
        <span style={{ fg: props.palette.signalNegative }}>▍</span>
      </text>
      <text
        cursor="pointer"
        fg={props.palette.textStrong}
        style={{ flexShrink: 0 }}
        onMouseUp={() => sent("/dictate/stop")}
      >
        ■
      </text>
      <text
        cursor="pointer"
        fg={props.palette.textLight}
        style={{ flexShrink: 0 }}
        onMouseUp={() => sent("/dictate/trash")}
      >
        ✕
      </text>
    </box>
  );
}

function Callline(props) {
  const app = ambient.app.consume();
  const terminal = ambient.terminal.consume();
  const sent = (signal) =>
    terminal.repl.dispatch(signal).catch((error) => terminal.controller.stdout.fault(error));
  const level = from(app.box.device.microphone.$level);
  const paused = from(app.box.device.microphone.$paused);
  const playing = from(app.box.device.speaker.$playing);
  return (
    <box
      style={{
        flexDirection: "row",
        height: 1,
        flexShrink: 0,
        paddingLeft: 1,
        paddingRight: 1,
        gap: 1,
        backgroundColor: props.palette.controlField,
      }}
    >
      <Lead palette={props.palette} ink={props.lead} onPick={props.onLead} />
      <text fg={props.palette[hearing(paused()).ink]} style={{ flexShrink: 0 }}>
        {hearing(paused()).glyph}
      </text>
      <Meter palette={props.palette} value={level()} />
      <text fg={props.palette.textStrong} style={{ flexShrink: 0 }}>{props.call().state}</text>
      <box style={{ flexGrow: 1 }} />
      <text
        fg={playing() ? props.palette.signalPrimaryInk : props.palette.textMuted}
        style={{ flexShrink: 0 }}
      >
        ◁
      </text>
      <Meter palette={props.palette} value={playing() ? 1 : 0} />
      <Lasted palette={props.palette} ink="textMuted" since={props.call().since} />
      <text
        cursor="pointer"
        fg={props.palette.signalNegativeInk}
        style={{ flexShrink: 0 }}
        onMouseUp={() => sent("/call/end")}
      >
        ■ end
      </text>
    </box>
  );
}

export function Textarea(props) {
  const terminal = ambient.terminal.consume();
  const app = ambient.app.consume();
  const draft = from(app.bridge.$draft);
  const focus = from(app.bridge.$focus);
  const dictation = from(app.bridge.$dictation);
  const call = from(app.bridge.$call);
  const thread = from(terminal.$thread);
  const catalog = from(terminal.repl.$catalog);
  const activities = from(props.thread.$activities);
  const hosted = createMemo(() =>
    thread() === null || thread().mode === null
      ? () => null
      : from((thread().mode.daemon === null ? terminal.client.runtime : thread().mode.daemon).$status),
  );
  const commands = createMemo(on([thread, () => hosted()()], () => terminal.repl.commands));
  const [open, opened] = createSignal(false);
  const faulted = (error) => terminal.controller.stdout.fault(error);
  const sent = (signal) => terminal.repl.dispatch(signal).catch(faulted);
  const voice = () => ({
    dictation: dictation(),
    call: call(),
    catalog: catalog(),
    open: open(),
    commands: commands(),
  });
  const run = (signal) => {
    opened(false);
    return sent(signal);
  };
  const waiting = () => activities().find((activity) => activity.status === "PAUSED");
  const running = () => activities().some((activity) => LIVE.includes(activity.status));
  const drafted = (typed) => {
    app.bridge.$draft.set(typed);
    app.bridge.$selected.set(0);
    return DRAFTS.find(([test]) => test(typed, catalog()))[1](terminal).catch(faulted);
  };
  const submitted = (signal) => {
    if (dictation() !== null) return sent("/dictate/send");
    app.bridge.$draft.set("");
    app.bridge.$selected.set(0);
    return terminal.repl.dispatch(signal).catch(faulted);
  };
  return (
    <Show when={waiting() === undefined} fallback={<Consent palette={props.palette} activity={waiting()} />}>
      <box style={{ flexDirection: "column", flexShrink: 0 }}>
        <Show when={dictation()}>
          {(held) => <Dictline palette={props.palette} dictation={held()} />}
        </Show>
        <Show when={open()}>
          <Controls
            palette={props.palette}
            rows={controls(voice())}
            onRun={run}
            onClose={() => opened(false)}
          />
        </Show>
        <Show
          when={call() === null}
          fallback={
            <Callline
              palette={props.palette}
              call={call}
              lead={lead(voice())}
              onLead={() => opened(!open())}
            />
          }
        >
          <box style={{ flexDirection: "row", height: 1, flexShrink: 0, paddingLeft: 1, paddingRight: 1, gap: 1, backgroundColor: props.palette.controlField }}>
            <Lead palette={props.palette} ink={lead(voice())} onPick={() => opened(!open())} />
            <Show when={catalog() === null} fallback={<text wrapMode="none" fg={props.palette.textStrong} style={{ flexGrow: 1, flexShrink: 1, minWidth: 0 }}>{draft()}</text>}>
              <input
                focused={focus() === "dock.input"}
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
            <Show when={belt.dictation.offered(commands(), "/dictate")}>
              <text
                cursor="pointer"
                fg={props.palette[mic(dictation()).ink]}
                style={{ flexShrink: 0 }}
                onMouseUp={() => sent(mic(dictation()).signal)}
              >
                mic
              </text>
            </Show>
            <Show when={running()} fallback={<text fg={props.palette.textMuted} style={{ flexShrink: 0 }}>{KEYS.idle}</text>}>
              <text cursor="pointer" fg={props.palette.signalNegativeInk} style={{ flexShrink: 0 }} onMouseUp={() => terminal.repl.dispatch("/stop").catch(faulted)}>
                {KEYS.running}
              </text>
            </Show>
          </box>
        </Show>
      </box>
    </Show>
  );
}
