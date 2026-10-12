import { For } from "solid-js";
import { usePalette } from "../palette.js";

const FENCE = /^\s*```/;

const fold = (lines) =>
  lines.reduce(
    (folded, line) =>
      FENCE.test(line)
        ? { fenced: !folded.fenced, rows: folded.rows }
        : { fenced: folded.fenced, rows: [...folded.rows, { line, fenced: folded.fenced }] },
    { fenced: false, rows: [] },
  ).rows;

const HEADING = /^#{1,6}\s/;
const ITEM = /^(\s*)[-*+]\s/;
const QUOTE = /^>\s?/;

const BLOCKS = [
  [(row) => row.fenced, (row, palette) => <text fg={palette.textLink} bg={palette.surfaceSunk}>{row.line}</text>],
  [(row) => HEADING.test(row.line), (row, palette) => <text fg={palette.textStrong}><b>{row.line.replace(HEADING, "")}</b></text>],
  [(row) => ITEM.test(row.line), (row, palette) => <text fg={palette.textInk}>{row.line.replace(ITEM, "$1• ")}</text>],
  [(row) => QUOTE.test(row.line), (row, palette) => <text fg={palette.textMuted}>{row.line.replace(QUOTE, "│ ")}</text>],
  [() => true, (row, palette) => <text fg={palette.textInk}>{row.line}</text>],
];

export function Markdown(props) {
  const palette = usePalette();
  return (
    <box style={{ flexDirection: "column" }}>
      <For each={fold(props.text.split("\n"))}>{(row) => BLOCKS.find(([test]) => test(row))[1](row, palette)}</For>
    </box>
  );
}
