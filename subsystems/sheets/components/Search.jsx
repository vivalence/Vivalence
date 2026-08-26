import React, { useMemo, useState } from "react";
import { Box, Text, useInput } from "ink";
import * as search from "../state/search.js";
import * as text from "../state/text.js";
import { theme } from "../theme.js";

// corpus-blind picker. rows are plain records; the caller declares which fields feed the
// haystack (keys), which of them a `key:value` token may narrow (facets), and how a row paints
// (columns). only a window of the match set renders — ink repaint, not the filter, is the ceiling.
export function Search({
  rows = [],
  keys,
  facets = [],
  columns,
  query = "",
  index = 0,
  height = 12,
  label = "search",
  placeholder = "type to narrow",
  onSubmit,
  onCancel,
  buffer,
}) {
  const [state, setState] = useState(() => search.init({ rows, keys, facets, text: query, index }));
  const [caret, setCaret] = useState(query.length);
  const layout = useMemo(() => measure(rows, columns ?? state.keys), [rows, columns, state.keys]);

  const release = (result) => (buffer ? buffer.release(result) : null);
  const edit = (producer) => {
    const next = producer({ value: state.text, cursor: Math.min(caret, state.text.length) });
    setState((held) => search.seek(held, next.value));
    setCaret(next.cursor);
  };

  useInput((input, key) => {
    if (key.escape) return (onCancel ?? release)?.({ aborted: true });
    if (key.upArrow || (key.ctrl && input === "p")) return setState((held) => search.move(held, -1));
    if (key.downArrow || (key.ctrl && input === "n")) return setState((held) => search.move(held, 1));
    if (key.pageUp) return setState((held) => search.move(held, -height));
    if (key.pageDown) return setState((held) => search.move(held, height));
    if (key.return) {
      const row = search.value(state);
      if (!row) return;
      onSubmit?.(row);
      return release(row);
    }
    if (key.leftArrow) return setCaret((at) => Math.max(0, at - 1));
    if (key.rightArrow) return setCaret((at) => Math.min(state.text.length, at + 1));
    if (key.backspace || key.delete) return edit((held) => text.backspace(held));
    if (input && !key.ctrl && !key.meta) return edit((held) => text.insert(held, input));
  });

  const { start, rows: shown } = search.slice(state, height);
  const has = state.text.length > 0;

  return (
    <Box flexDirection="column">
      <Box>
        <Text color={theme.accent}>{label} › </Text>
        <Text color={has ? undefined : theme.dim}>{has ? state.text : placeholder}</Text>
        <Text color={theme.accent}>▌</Text>
      </Box>
      {shown.length === 0
        ? <Text color={theme.dim}>{"  no match"}</Text>
        : shown.map((row, offset) => {
          const on = start + offset === state.index;
          return (
            <Text key={start + offset} color={on ? theme.accent : undefined}>
              {on ? "› " : "  "}
              {layout.map(({ key, width, color }, at) => (
                <Text key={key} color={on ? undefined : color}>
                  {pad(row[key], width)}
                  {at < layout.length - 1 ? "  " : ""}
                </Text>
              ))}
            </Text>
          );
        })}
      <Text color={theme.dim}>
        {state.matches.length}/{state.rows.length}
        {facets.length ? `  ·  ${facets.map((facet) => `${facet}:`).join(" ")}` : ""}
        {"  ·  ↑↓ move  ⏎ pick  esc cancel"}
      </Text>
    </Box>
  );
}

function measure(rows, columns) {
  return columns.map((column) => {
    const spec = typeof column === "string" ? { key: column } : column;
    const width = spec.width ??
      rows.reduce((widest, row) => Math.max(widest, String(row[spec.key] ?? "").length), spec.key.length);
    return { color: theme.dim, ...spec, width };
  });
}

function pad(cell, width) {
  const shown = String(cell ?? "");
  return shown.length > width ? shown.slice(0, width) : shown.padEnd(width);
}
