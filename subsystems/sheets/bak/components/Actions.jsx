import React, { useState } from "react";
import { Box, Text, useInput } from "ink";

export function Actions({ options, active = true, onAction }) {
  const [index, setIndex] = useState(0);

  useInput(
    (input, key) => {
      if (key.leftArrow) return setIndex((current) => Math.max(0, current - 1));
      if (key.rightArrow) return setIndex((current) => Math.min(options.length - 1, current + 1));
      if (key.return) return onAction(options[index]);
    },
    { isActive: active },
  );

  return (
    <Box gap={1}>
      {options.map((option, i) => (
        <Text key={option} inverse={active && i === index} color={active ? "cyan" : "gray"}>
          {" "}
          {option}{" "}
        </Text>
      ))}
    </Box>
  );
}
