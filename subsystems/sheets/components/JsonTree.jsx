import React from "react";
import { Box, Text } from "ink";
import { useState } from "react";
import { useInput } from "ink";

// interactive tree walker over any json-shaped value.
// ↑↓ siblings · → / enter drill · ← back · esc / ← at root release.
export function JsonTree({ data, buffer }) {
  const [path, setPath] = useState([]);
  const [cursor, setCursor] = useState(0);

  const current = walk(data, path);
  const entries = entriesOf(current);

  useInput((_input, key) => {
    if (key.upArrow) return setCursor((c) => Math.max(0, c - 1));
    if (key.downArrow) return setCursor((c) => Math.min(entries.length - 1, c + 1));
    if (key.rightArrow || key.return) {
      const next = entries[cursor];
      if (!next || isLeaf(next[1])) return;
      setPath((p) => [...p, next[0]]);
      setCursor(0);
      return;
    }
    if (key.leftArrow) {
      if (path.length === 0) return buffer?.release?.();
      setPath((p) => p.slice(0, -1));
      setCursor(0);
      return;
    }
    if (key.escape) return buffer?.release?.();
  });

  return (
    <Box flexDirection="column">
      <Text bold color="cyan">/{path.join("/")}</Text>
      {entries.length === 0 && <Text color="gray">(empty)</Text>}
      {entries.map(([key, value], index) => (
        <Text key={key} color={index === cursor ? "cyan" : undefined}>
          {index === cursor ? "› " : "  "}
          {key}
          {isLeaf(value) ? <Text color="gray"> :: {preview(value)}</Text> : <Text color="gray"> ({entriesOf(value).length})</Text>}
        </Text>
      ))}
      <Box marginTop={1}>
        <Text color="gray">↑↓ move · → enter · ← back · esc exit</Text>
      </Box>
    </Box>
  );
}

function walk(data, path) {
  return path.reduce((acc, key) => acc?.[key], data);
}

function entriesOf(value) {
  if (Array.isArray(value)) return value.map((v, i) => [String(i), v]);
  if (value && typeof value === "object") return Object.entries(value);
  return [];
}

function isLeaf(value) {
  if (value === null || value === undefined) return true;
  if (typeof value !== "object") return true;
  if (Array.isArray(value) && value.length === 0) return true;
  if (Object.keys(value).length === 0) return true;
  return false;
}

function preview(value) {
  if (value === null) return "null";
  if (value === undefined) return "undefined";
  if (typeof value === "string") {
    return `"${value.length > 40 ? value.slice(0, 40) + "…" : value}"`;
  }
  return String(value);
}
