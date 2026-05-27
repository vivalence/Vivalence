import React from "react";
import { Box, Text } from "ink";
import { theme } from "../theme.js";

export function Field({ label, active = false, children }) {
  const symbol = active ? theme.glyph.active : theme.glyph.gutter;
  return (
    <Box gap={1}>
      <Text color={active ? theme.accent : theme.dim}>{symbol}</Text>
      <Text color={active ? undefined : theme.dim} bold={active}>{label}</Text>
      <Box>{children}</Box>
    </Box>
  );
}
