import React from "react";
import { Box, Text } from "ink";

const mark = {
  pending: ["○", "gray"],
  running: ["◐", "cyan"],
  done: ["●", "green"],
  failed: ["✕", "red"],
};

export function Tasks({ items = [] }) {
  return (
    <Box flexDirection="column">
      {items.map((item, index) => {
        const [glyph, color] = mark[item.status] ?? mark.pending;
        return (
          <Box key={index} gap={1}>
            <Text color={color}>{glyph}</Text>
            <Text>{item.label}</Text>
            {item.detail ? <Text color="gray">{item.detail}</Text> : null}
          </Box>
        );
      })}
    </Box>
  );
}
