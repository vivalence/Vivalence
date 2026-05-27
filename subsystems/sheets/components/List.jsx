import React from "react";
import { Box, Text } from "ink";

function labelOf(item) {
  if (typeof item === "string") return item;
  return item.label ?? item.value ?? String(item);
}

export function List({ items, bullet = "•", color }) {
  return (
    <Box flexDirection="column">
      {items.map((item, index) => (
        <Text key={index} color={color}>
          {bullet} {labelOf(item)}
        </Text>
      ))}
    </Box>
  );
}
