import React from "react";
import { Box, Text } from "ink";

const leaf = (value) => value === null || typeof value !== "object";

export function Effect({ data }) {
  return <Box flexDirection="column">{branch(data, 0)}</Box>;
}

function branch(value, depth) {
  const entries = Array.isArray(value)
    ? value.map((entry, index) => [String(index), entry])
    : Object.entries(value ?? {});
  if (!entries.length) return <Text color="gray">{"  ".repeat(depth)}—</Text>;
  return entries.map(([key, entry]) =>
    leaf(entry) ? (
      <Text key={key}>
        {"  ".repeat(depth)}
        <Text color="cyan">{key.padEnd(Math.max(2, 30 - depth * 2))}</Text>{" "}
        <Text color="gray">{String(entry)}</Text>
      </Text>
    ) : Array.isArray(entry) && entry.every(leaf) ? (
      <Text key={key}>
        {"  ".repeat(depth)}
        <Text color="cyan">{key.padEnd(Math.max(2, 30 - depth * 2))}</Text>{" "}
        <Text color="gray">{entry.length ? entry.join("  ") : "—"}</Text>
      </Text>
    ) : (
      <Box key={key} flexDirection="column" marginTop={depth === 0 ? 1 : 0}>
        <Text bold={depth === 0} color={depth === 0 ? "white" : "cyan"}>
          {"  ".repeat(depth)}
          {key}
        </Text>
        {branch(entry, depth + 1)}
      </Box>
    ),
  );
}
