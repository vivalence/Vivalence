import { For } from "solid-js";
import { useKeyboard } from "@opentui/solid";
import { indent, padded, shape } from "./plain.js";
import { Table } from "./Table.jsx";
import { tone, usePalette } from "./palette.js";

const ACKNOWLEDGES = ["return", "linefeed", "enter", "escape"];

const PAINTERS = {
  heading: (block, palette, index) => (
    <box style={{ flexDirection: "column", marginTop: index === 0 ? 0 : 1 }}>
      <text fg={palette.textStrong}>
        <b>{block.heading}</b>
        <span fg={palette.textMuted}>{Object.hasOwn(block, "note") ? ` ${block.note}` : ""}</span>
      </text>
    </box>
  ),
  table: (block, palette, index, width) => <Table rows={block.table} depth={block.depth} width={width} />,
  spans: (block, palette) => (
    <text>
      {indent(block.depth)}
      <For each={block.spans}>
        {(span, at) => <span fg={tone(palette, span.tone)}>{(at() === 0 ? "" : " ") + padded(span)}</span>}
      </For>
    </text>
  ),
};

export function Report(props) {
  const palette = usePalette();
  if (Object.hasOwn(props, "release")) {
    useKeyboard((key) => {
      if (ACKNOWLEDGES.includes(key.name)) props.release(true);
    });
  }
  return (
    <box style={{ flexDirection: "column" }}>
      <For each={props.blocks}>{(block, index) => PAINTERS[shape(block)](block, palette, index(), props.width)}</For>
    </box>
  );
}
