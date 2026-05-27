import React, { useState } from "react";
import { Box, Text, useInput } from "ink";

export function Confirm({ label = "confirm?", defaultChoice = true, onSubmit, done, isDisabled = false, focus }) {
  const active = focus ?? !isDisabled;
  const [choice, setChoice] = useState(defaultChoice);

  useInput(
    (input, key) => {
      if (key.leftArrow || key.rightArrow) return setChoice((current) => !current);
      if (input === "y") return (onSubmit ?? done)?.(true);
      if (input === "n") return (onSubmit ?? done)?.(false);
      if (key.return) return (onSubmit ?? done)?.(choice);
    },
    { isActive: active },
  );

  return (
    <Box gap={1}>
      <Text>{label}</Text>
      <Text inverse={choice}> yes </Text>
      <Text inverse={!choice}> no </Text>
    </Box>
  );
}
