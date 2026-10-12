import React from "react";
import { Box, Text } from "ink";
import { theme } from "../theme.js";

// the KEY is the label — it is what you are writing. the description is a hint under the ACTIVE
// row only, so a long one costs a line where you are and nothing where you are not.
export function Field({ label, hint, width = 0, active = false, children }) {
  const symbol = active ? theme.glyph.active : theme.glyph.gutter;
  return (
    <Box flexDirection="column">
      <Box gap={1}>
        <Text color={active ? theme.accent : theme.dim}>{symbol}</Text>
        <Text color={active ? theme.accent : theme.dim} bold={active}>
          {label.padEnd(width)}
        </Text>
        <Box>{children}</Box>
      </Box>
      {active && hint ? <Text color={theme.dim}>{"    "}{hint}</Text> : null}
    </Box>
  );
}
