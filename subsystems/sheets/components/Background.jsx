import React from "react";
import { Box } from "ink";

export function Background({ padding = 1, children }) {
  return (
    <Box flexDirection="column" padding={padding}>
      {children}
    </Box>
  );
}
