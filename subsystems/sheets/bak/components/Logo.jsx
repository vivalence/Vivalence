import React from "react";
import { Box, Text } from "ink";
import { theme } from "../theme.js";

const Mark = () => (
  <Text color={theme.brand} bold>
    {theme.glyph.mark}
  </Text>
);

const Word = () => (
  <Text bold>
    <Text color={theme.brand}>viva</Text>
    <Text color={theme.accent}>lence</Text>
  </Text>
);

export function Logo({ variant = "word" }) {
  if (variant === "mark") return <Mark />;

  if (variant === "word") {
    return (
      <Box gap={1}>
        <Mark />
        <Word />
      </Box>
    );
  }

  if (variant === "banner") {
    return (
      <Box flexDirection="column">
        <Box gap={2}>
          <Text color={theme.brand} bold>
            {theme.glyph.mark} V I V A
          </Text>
          <Text color={theme.accent} bold>
            L E N C E
          </Text>
        </Box>
        <Text color={theme.dim}>{theme.tagline}</Text>
      </Box>
    );
  }

  return (
    <Box flexDirection="column">
      <Box gap={1}>
        <Mark />
        <Word />
      </Box>
      <Text color={theme.dim}>{theme.tagline}</Text>
    </Box>
  );
}
