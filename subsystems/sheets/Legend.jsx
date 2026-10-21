import { For } from "solid-js";
import { Segment } from "./Segment.jsx";

const LABELS = [
  [(node) => node.effect !== undefined && node.effect.valence !== undefined, (node) => node.effect.valence],
  [(node) => node.meta !== undefined, (node) => node.meta.valence],
  [() => true, (node, key) => key],
];

const label = (node, key) => LABELS.find(([test]) => test(node))[1](node, key);

export const Legend = (props) => (
  <box style={{ flexDirection: "column", backgroundColor: props.palette.surfaceLift }}>
    <text fg={props.palette.signalPrimaryInk}>{props.legend.presses.backlog.map((signal) => signal.nature).join(" ")}</text>
    <box style={{ flexDirection: "row", gap: 1 }}>
      <For each={Object.entries(props.legend.chord.branches)}>
        {([key, node]) => (
          <Segment palette={props.palette}>
            <text fg={props.palette.signalPrimaryInk}>
              <b>{` ${key}`}</b>
            </text>
            <text fg={props.palette.textStrong}>{` ${label(node, key)} `}</text>
          </Segment>
        )}
      </For>
    </box>
  </box>
);
