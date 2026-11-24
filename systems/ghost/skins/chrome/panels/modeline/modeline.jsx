import { from, Show } from "solid-js";
import { Bar, Meter, Segment } from "@vivalence/sheets";
import * as belt from "../../../../gestalten/belt/index.js";
import * as ambient from "../../ambient/index.js";
import { Lasted } from "../dock/textarea.jsx";
import { Popover } from "./popover.jsx";

export const GESTURES = {
  click: "/leader",
  double: "/leader/leader",
  hold: "/sidebar/toggle",
};

export const harnessed = (thread) =>
  belt.harness.mounted(thread) ? { tier: thread.trait.HARNESSED.tier, context: 0, ...belt.harness.tallied(thread) } : null;

export const PROCESSES = [
  [
    (voice) => voice.dictation !== null,
    () => ({
      word: "dictate",
      ink: "signalNegative",
      device: "microphone",
      end: "/dictate/stop",
    }),
  ],
  [
    (voice) => voice.call !== null && voice.call.state === "speaking",
    (voice) => ({
      word: voice.call.state,
      ink: "signalPrimary",
      device: "speaker",
      end: "/call/end",
    }),
  ],
  [
    (voice) => voice.call !== null,
    (voice) => ({
      word: voice.call.state,
      ink: "signalNegative",
      device: "microphone",
      end: "/call/end",
    }),
  ],
  [() => true, () => null],
];

export const processed = (voice) => PROCESSES.find(([test]) => test(voice))[1](voice);

function Process(props) {
  const app = ambient.app.consume();
  const terminal = ambient.terminal.consume();
  const dictation = from(app.bridge.$dictation);
  const call = from(app.bridge.$call);
  const level = from(app.box.device.microphone.$level);
  const playing = from(app.box.device.speaker.$playing);
  const levels = { microphone: () => level(), speaker: () => (playing() ? 1 : 0) };
  const faulted = (error) => terminal.controller.stdout.fault(error);
  return (
    <box
      style={{
        flexDirection: "row",
        height: 1,
        paddingLeft: 1,
        backgroundColor: props.palette.plane,
      }}
    >
      <Show
        when={processed({ dictation: dictation(), call: call() })}
        fallback={<text fg={props.palette.textMuted}>○ idle</text>}
      >
        {(process) => (
          <Segment
            palette={props.palette}
            id="segment-process"
            onPick={() => terminal.repl.dispatch(process().end).catch(faulted)}
          >
            <text fg={props.palette[process().ink]}>● </text>
            <Meter palette={props.palette} value={levels[process().device]()} />
            <text fg={props.palette.textInk}>{` ${process().word} `}</text>
            <Show when={call()}>
              {(held) => <Lasted palette={props.palette} ink="textInk" since={held().since} />}
            </Show>
          </Segment>
        )}
      </Show>
    </box>
  );
}

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
    <>
    <box style={{ flexDirection: "column", height: 1 }}>
      <Bar
        palette={props.palette}
        entity={{ label: thread() === null ? "no thread" : thread().word, mode: thread() === null || thread().mode === null ? "—" : `${thread().mode.type}/${thread().mode.slug}` }}
        harness={harnessed(thread())}
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
    <Process palette={props.palette} />
    </>
  );
}
