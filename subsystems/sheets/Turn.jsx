import { For, mergeProps, Show } from "solid-js";
import { parts } from "@vivalence/dapper";
import { Line } from "./Line.jsx";
import { Markdown } from "./Markdown.jsx";
import { lookup } from "./lookup.js";

export const REGISTERS = {
  you: { ...parts.turn.REGISTERS.you, ink: "textStrong", body: "textStrong", render: Line },
  agent: { ...parts.turn.REGISTERS.agent, ink: "textMuted", body: "textInk", render: Markdown },
  cmd: { ...parts.turn.REGISTERS.cmd, ink: "signalPrimaryInk", body: "textStrong", render: Line },
  msg: { ...parts.turn.REGISTERS.msg, ink: "textMuted", body: "textMuted", render: Line },
  fault: {
    ...parts.turn.REGISTERS.fault,
    ink: "signalNegativeInk",
    body: "signalNegativeInk",
    render: Line,
  },
  trace: { ...parts.turn.REGISTERS.trace, ink: "textMuted", body: "textMuted", render: Line },
};

export const register = (name) => lookup(REGISTERS, name, "register");

export const CALLS = {
  run: { glyph: parts.turn.CALLS.run, ink: "signalPrimaryInk", tail: "…" },
  ok: { glyph: parts.turn.CALLS.ok, ink: "signalPositiveInk", tail: "" },
  wait: { glyph: parts.turn.CALLS.wait, ink: "signalCautionInk", tail: "waiting" },
  skip: { glyph: parts.turn.CALLS.skip, ink: "textMuted", tail: "skipped" },
  err: { glyph: parts.turn.CALLS.err, ink: "signalNegativeInk", tail: "" },
};

export const call = (status) => lookup(CALLS, status, "call status");

const Call = (props) => {
  const held = mergeProps({ arg: "", duration: "", loop: false }, props.call);
  return (
    <box style={{ flexDirection: "row", height: 1, gap: 1, paddingLeft: 1, backgroundColor: props.palette.surfaceSunk }}>
      <text fg={props.palette[call(held.status).ink]}>{call(held.status).glyph}</text>
      <Show when={held.loop}>
        <text fg={props.palette.textMuted}>loop</text>
      </Show>
      <text fg={props.palette.textStrong}>{held.name}</text>
      <Show when={held.arg !== ""}>
        <text fg={props.palette.textMuted}>{held.arg}</text>
      </Show>
      <text fg={props.palette.textMuted}>{held.duration === "" ? call(held.status).tail : held.duration}</text>
    </box>
  );
};

export const Turn = (props) => {
  const held = mergeProps({ who: "", meta: "", text: "", answer: null, calls: [] }, props);
  const Body = () => register(held.register).render({ palette: held.palette, text: held.text, ink: register(held.register).body });
  return (
    <box style={{ flexDirection: "column", flexShrink: 0 }}>
      <Show
        when={register(held.register).headed}
        fallback={
          <box style={{ flexDirection: "row", gap: 1 }}>
            <text fg={held.palette[register(held.register).ink]}>
              <b>{register(held.register).glyph}</b>
            </text>
            <Body />
          </box>
        }
      >
        <box style={{ flexDirection: "row", height: 1, gap: 1 }}>
          <text fg={held.palette[register(held.register).ink]}>
            <b>{register(held.register).glyph}</b>
          </text>
          <Show when={held.who !== ""}>
            <text fg={held.palette.textStrong}>
              <b>{held.who}</b>
            </text>
          </Show>
          <text fg={held.palette.textMuted}>{held.meta}</text>
        </box>
        <box style={{ paddingLeft: 1 }}>
          <Body />
        </box>
      </Show>
      <Show when={held.answer !== null}>
        <box style={{ paddingLeft: 3 }}>
          <Line palette={held.palette} text={held.answer} />
        </box>
      </Show>
      <For each={held.calls}>{(entry) => <Call palette={held.palette} call={entry} />}</For>
      {held.children}
    </box>
  );
};
