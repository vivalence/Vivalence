import { createMemo, from, on, Show } from "solid-js";
import { Dynamic, useRenderer, useTerminalDimensions } from "@opentui/solid";
import { Choice, Meter, Panel, Row } from "@vivalence/sheets";
import * as belt from "../../../../gestalten/belt/index.js";
import * as ambient from "../../ambient/index.js";
import * as widgets from "../../widgets/index.js";

export const WIDTH = 48;

export const CLEARANCE = 4;

const placeholder = (props) => <widgets.swatch.Swatch name={props.held} fill={props.palette.surfaceLift} ink={props.palette.textStrong} style={{ height: 8 }} />;

export const SELECTED = [
  [(words) => words.length === 0, () => "default"],
  [() => true, (words) => words.join(" · ")],
];

export const selected = (selector) => {
  const words = ["provider", "id", "tier"]
    .filter((key) => key in selector)
    .map((key) => selector[key]);
  return SELECTED.find(([test]) => test(words))[1](words);
};

export const VOICES = [
  ["dictate", "/dictate"],
  ["call", "/call"],
];

export const voiced = (commands) =>
  VOICES.filter(([, nature]) => belt.dictation.offered(commands, nature)).map(([word]) => word);

export const ENGAGED = [
  [(engaged) => engaged, "on"],
  [() => true, "off"],
];

export const engaged = (polish) => ENGAGED.find(([test]) => test(polish.engaged))[1];

export const MICROPHONE = [
  [(device) => device.error !== null, (device) => device.error],
  [(device) => !device.claimed, () => "idle"],
  [(device) => device.paused, () => "muted"],
  [() => true, () => "live"],
];

export const SPEAKER = [
  [(device) => device.error !== null, (device) => device.error],
  [(device) => device.playing, () => "playing"],
  [(device) => device.claimed, () => "live"],
  [() => true, () => "idle"],
];

export const RECORDER = [
  [(device) => device.claimed, (device) => `${device.recorder.command} · spawned`],
  [() => true, (device) => device.recorder.command],
];

export const stated = (table, device) => table.find(([test]) => test(device))[1](device);

function Label(props) {
  return (
    <box style={{ flexDirection: "row", height: 1, paddingLeft: 1 }}>
      <text wrapMode="none" truncate fg={props.palette.textMuted}>{props.label}</text>
    </box>
  );
}

function Value(props) {
  return (
    <text
      wrapMode="none"
      truncate
      fg={props.palette.textMuted}
      style={{ flexGrow: 1, flexBasis: 0, minWidth: 0 }}
    >
      {props.value}
    </text>
  );
}

export function Thread(props) {
  const terminal = ambient.terminal.consume();
  const thread = from(terminal.$thread);
  const threads = from(terminal.client.runtime.entities.thread.$entities);
  const hosted = createMemo(() =>
    thread() === null || thread().mode === null
      ? () => null
      : from((thread().mode.daemon === null ? terminal.client.runtime : thread().mode.daemon).$status),
  );
  const commands = createMemo(on([thread, () => hosted()()], () => terminal.repl.commands));
  const offered = (nature) => belt.dictation.offered(commands(), nature);
  const conversational = () => {
    threads();
    return thread().trait.CONVERSATIONAL;
  };
  const sent = (signal) =>
    terminal.repl.dispatch(signal).catch((error) => terminal.controller.stdout.fault(error));
  return (
    <Show when={thread()}>
      <Panel palette={props.palette} tag="thread" crumbs={thread().word}>
        <Label palette={props.palette} label="conversational" />
        <Show when={offered("/dictate")}>
          <Row palette={props.palette} key="" label="hear">
            <Value palette={props.palette} value={selected(conversational().hear)} />
          </Row>
        </Show>
        <Row palette={props.palette} key="" label="speak">
          <Value palette={props.palette} value={selected(conversational().speak)} />
        </Row>
        <Show when={offered("/call")}>
          <Row palette={props.palette} key="" label="call">
            <Value palette={props.palette} value={selected(conversational().call)} />
          </Row>
        </Show>
        <Show when={offered("/polish/engaged")}>
          <Row palette={props.palette} key="" label="polish">
            <Value palette={props.palette} value={selected(conversational().polish)} />
          </Row>
          <Row palette={props.palette} key="" label="engaged">
            <Choice
              palette={props.palette}
              options={["on", "off"]}
              value={engaged(conversational().polish)}
              onPick={(option) => sent(`/polish/engaged ${option}`)}
            />
          </Row>
        </Show>
        <Show
          when={voiced(commands()).length > 0}
          fallback={
            <Label palette={props.palette} label="no ear · hear, call, polish stay absent" />
          }
        >
          <Label palette={props.palette} label={`mode · ${widgets.entity.moded(thread())}`} />
          <Row palette={props.palette} key="" label="voice">
            <Value palette={props.palette} value={voiced(commands()).join(" · ")} />
          </Row>
        </Show>
      </Panel>
    </Show>
  );
}

export function Box(props) {
  const terminal = ambient.terminal.consume();
  const device = ambient.app.consume().box.device;
  const thread = from(terminal.$thread);
  const hosted = createMemo(() =>
    thread() === null || thread().mode === null
      ? () => null
      : from((thread().mode.daemon === null ? terminal.client.runtime : thread().mode.daemon).$status),
  );
  const commands = createMemo(on([thread, () => hosted()()], () => terminal.repl.commands));
  const microphone = {
    claimed: from(device.microphone.$claimed),
    paused: from(device.microphone.$paused),
    level: from(device.microphone.$level),
    error: from(device.microphone.$error),
  };
  const speaker = {
    claimed: from(device.speaker.$claimed),
    playing: from(device.speaker.$playing),
    error: from(device.speaker.$error),
  };
  const sent = (signal) =>
    terminal.repl.dispatch(signal).catch((error) => terminal.controller.stdout.fault(error));
  return (
    <Panel palette={props.palette} tag="box" crumbs="this machine">
      <Row palette={props.palette} key="" label="microphone">
        <Meter palette={props.palette} value={microphone.level()} />
        <Value
          palette={props.palette}
          value={` ${stated(MICROPHONE, {
            error: microphone.error(),
            claimed: microphone.claimed(),
            paused: microphone.paused(),
          })}`}
        />
      </Row>
      <Show when={belt.dictation.offered(commands(), "/mic")}>
        <Row palette={props.palette} key="" label="">
          <Choice
            palette={props.palette}
            options={["on", "mute"]}
            value={microphone.paused() ? "mute" : "on"}
            onPick={(option) => sent(`/mic ${option}`)}
          />
        </Row>
      </Show>
      <Row palette={props.palette} key="" label="speaker">
        <Meter palette={props.palette} value={speaker.playing() ? 1 : 0} />
        <Value
          palette={props.palette}
          value={` ${stated(SPEAKER, {
            error: speaker.error(),
            claimed: speaker.claimed(),
            playing: speaker.playing(),
          })}`}
        />
      </Row>
      <Row palette={props.palette} key="" label="recorder">
        <Value
          palette={props.palette}
          value={stated(RECORDER, {
            claimed: microphone.claimed(),
            recorder: device.microphone.recorder,
          })}
        />
      </Row>
    </Panel>
  );
}

const entity = (props) => (
  <box style={{ flexDirection: "column" }}>
    <Thread palette={props.palette} />
    <widgets.entity.Entity palette={props.palette} held={props.held} />
  </box>
);

const system = (props) => (
  <box style={{ flexDirection: "column" }}>
    <Box palette={props.palette} />
    <widgets.system.System palette={props.palette} held={props.held} />
  </box>
);

export const WIDGETS = {
  entity,
  activity: placeholder,
  harness: widgets.harness.Harness,
  display: widgets.display.Display,
  system,
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
