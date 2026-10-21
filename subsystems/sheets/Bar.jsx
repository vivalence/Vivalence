import { mergeProps, Show } from "solid-js";
import { Dot, dot } from "./Dot.jsx";
import { gesture } from "./gesture.js";
import { Meter } from "./Meter.jsx";
import { Segment } from "./Segment.jsx";
import { lookup } from "./lookup.js";

export const DISPLAYS = {
  closed: () => "closed",
  full: () => "full",
  messenger: () => "messenger",
  docked: (align) => lookup({ left: "left", right: "right", top: "top", bottom: "bottom" }, align, "dock align"),
};

export const display = (held) => lookup(DISPLAYS, held.view, "display view")(held.align);

export const CONTEXT = 0.85;

const ATTENTIONS = ["caution", "negative"];

export const SEGMENTS = ["mark", "entity", "harness", "activity", "display", "system"];

export const Bar = (props) => {
  const held = mergeProps({ open: null, chord: false, onMark: () => {}, onPick: () => {} }, props);
  const opened = (name) => held.open === name;
  const pick = (name) => (column) => held.onPick(name, column);
  const mark = gesture((name) => held.onMark(name));
  return (
    <box style={{ flexDirection: "row", height: 1, gap: 2, justifyContent: "space-between", backgroundColor: held.palette.surface }}>
      <box style={{ flexDirection: "row", gap: 2 }}>
        <Segment palette={held.palette} open={held.chord} onPress={mark.down} onPick={mark.up}>
          <text fg={held.palette.signalPrimaryInk}>
            <b> {"<<"}</b>
          </text>
        </Segment>
        <Segment palette={held.palette} id="segment-entity" open={opened("entity")} onPick={pick("entity")}>
          <text fg={held.palette.textStrong}>
            <b>{`[${held.entity.label} ‹${held.entity.mode}›]`}</b>
          </text>
        </Segment>
        <Show when={held.harness !== null}>
          <Segment palette={held.palette} id="segment-harness" open={opened("harness")} onPick={pick("harness")}>
            <text fg={held.harness.context >= CONTEXT ? held.palette.signalCautionInk : held.palette.textInk}>{`{${held.harness.tune} `}</text>
            <Meter palette={held.palette} value={held.harness.context} />
            <text fg={held.harness.context >= CONTEXT ? held.palette.signalCautionInk : held.palette.textInk}>{"}"}</text>
          </Segment>
        </Show>
        <Show when={held.activity.signal !== "off"}>
          <Segment
            palette={held.palette}
            id="segment-activity" open={opened("activity")}
            attention={ATTENTIONS.includes(held.activity.signal) ? held.activity.signal : null}
            onPick={pick("activity")}
          >
            <Dot palette={held.palette} signal={held.activity.signal} />
            <text fg={held.palette[dot(held.activity.signal).ink]}>{`▰▱ ${held.activity.text}`}</text>
          </Segment>
        </Show>
      </box>
      <box style={{ flexDirection: "row", gap: 1 }}>
        <Segment palette={held.palette} id="segment-display" open={opened("display")} onPick={pick("display")}>
          <text fg={held.palette.textLight}>{`[${display(held.display)}]`}</text>
        </Segment>
        <Segment palette={held.palette} id="segment-system" open={opened("system")} onPick={pick("system")}>
          <text fg={held.system.standing === "VERIFIED" ? held.palette.signalPositive : held.palette.signalCaution}>{" ● "}</text>
        </Segment>
      </box>
    </box>
  );
};
