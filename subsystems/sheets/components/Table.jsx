import React from "react";
import { Box, Text } from "ink";

const show = (value) => (value === null || value === undefined ? "—" : String(value));
const MIN = 6;

const terminal = () => {
  try {
    return Deno.consoleSize().columns - 2;
  } catch {
    return 80; // ink's own default when there is no tty — matching it is what stops a wrap
  }
};

// columns are inferred from the rows, and a column empty in EVERY row is dropped: a table of
// nulls carries nothing and costs the width the real columns need. what remains is shrunk
// widest-first until it fits, so no row ever wraps.
export function Table({ rows, columns, width }) {
  const keys = columns ?? [...new Set(rows.flatMap((row) => Object.keys(row)))];
  const held = keys.filter((key) => rows.some((row) => row[key] !== null && row[key] !== undefined));
  const size = Object.fromEntries(
    held.map((key) => [key, Math.max(key.length, ...rows.map((row) => show(row[key]).length))]),
  );

  const room = width ?? terminal();
  const total = () => held.reduce((sum, key) => sum + size[key] + 2, 0);
  // one column, one character, per pass — take it all off the widest at once and every column
  // hits the floor together.
  while (total() > room) {
    const widest = held.reduce((a, b) => (size[a] >= size[b] ? a : b));
    if (size[widest] <= MIN) break;
    size[widest] -= 1;
  }
  // a path is distinguished by its TAIL, so an overflowing one keeps the end, not the start.
  const clip = (text, room) =>
    text.length <= room
      ? text
      : text.includes("/")
        ? `…${text.slice(-(room - 1))}`
        : text.slice(0, room);
  const cell = (key, value) => clip(show(value), size[key]).padEnd(size[key]);

  return (
    <Box flexDirection="column">
      <Text color="gray" dimColor>
        {held.map((key) => cell(key, key)).join("  ")}
      </Text>
      {rows.map((row, index) => (
        <Text key={index}>{held.map((key) => cell(key, row[key])).join("  ")}</Text>
      ))}
    </Box>
  );
}
