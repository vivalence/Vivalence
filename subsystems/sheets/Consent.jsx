import { For } from "solid-js";
import { useKeyboard } from "@opentui/solid";

export const BINDINGS = [
  ["y", "approve", (props) => props.onApprove()],
  ["n", "skip", (props) => props.onSkip()],
  ["e", "edit", (props) => props.onEdit()],
];

export const Consent = (props) => {
  useKeyboard((key) => {
    if (key.defaultPrevented) return;
    const hit = BINDINGS.find(([name]) => name === key.name);
    if (hit === undefined) return;
    key.stopPropagation();
    hit[2](props);
  });
  return (
    <box style={{ flexDirection: "row", height: 1, gap: 1, paddingLeft: 1, backgroundColor: props.palette.signalCautionTint }}>
      <text fg={props.palette.signalCautionInk}>
        <b>? approve</b>
      </text>
      <text fg={props.palette.textStrong}>{`${props.name} ${props.argument}`}</text>
      <For each={BINDINGS}>
        {([name, label]) => (
          <text>
            <span style={{ fg: props.palette.signalPrimaryInk }}>
              <b>{` ${name}`}</b>
            </span>
            <span style={{ fg: props.palette.textInk }}>{` ${label}`}</span>
          </text>
        )}
      </For>
    </box>
  );
};
