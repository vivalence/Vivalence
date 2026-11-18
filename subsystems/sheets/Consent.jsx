import { For } from "solid-js";
import { useKeyboard } from "@opentui/solid";
import { parts } from "@vivalence/dapper";

export const Consent = (props) => {
  useKeyboard((key) => {
    if (key.defaultPrevented) return;
    const hit = parts.consent.ACTS.find(([name]) => name === key.name);
    if (hit === undefined) return;
    key.stopPropagation();
    props[hit[2]]();
  });
  return (
    <box style={{ flexDirection: "row", height: 1, gap: 1, paddingLeft: 1, backgroundColor: props.palette.signalCautionTint }}>
      <text fg={props.palette.signalCautionInk}>
        <b>? approve</b>
      </text>
      <text fg={props.palette.textStrong}>{`${props.name} ${props.argument}`}</text>
      <For each={parts.consent.ACTS}>
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
