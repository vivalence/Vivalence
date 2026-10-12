import React from "react";
import { Box, Text, useInput } from "ink";

export function TextArea({
  value,
  onChange,
  onSubmit,
  focus = true,
  placeholder = "",
  cursorChar = "▌",
  cursorColor = "cyan",
  borderStyle = "round",
  borderColor,
}) {
  useInput(
    (input, key) => {
      if (key.return && key.shift) onChange?.((value ?? "") + "\n");
      else if (key.return) onSubmit?.(value ?? "");
      else if (key.backspace || key.delete) onChange?.((value ?? "").slice(0, -1));
      else if (input && !key.ctrl && !key.meta && !key.escape) onChange?.((value ?? "") + input);
    },
    { isActive: focus },
  );

  const hasValue = (value ?? "").length > 0;
  const display = hasValue ? value : placeholder;
  const displayColor = hasValue ? undefined : "gray";

  return (
    <Box borderStyle={borderStyle} borderColor={borderColor} paddingX={1}>
      <Text color={displayColor}>
        {display}
        {focus ? <Text color={cursorColor}>{cursorChar}</Text> : null}
      </Text>
    </Box>
  );
}
