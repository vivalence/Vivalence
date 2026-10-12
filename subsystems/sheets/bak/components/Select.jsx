import React, { useState } from "react";
import { Box, Text, useInput } from "ink";
import * as select from "../state/select.js";

function labelOf(option) {
  if (typeof option === "string") return option;
  return option.label ?? option.value ?? String(option);
}

export function Select({
  items,
  options,
  onSelect,
  onSubmit,
  done,
  isDisabled = false,
  focus,
  cursor = "› ",
  pad = "  ",
  color = "cyan",
}) {
  const list = options ?? items ?? [];
  const active = focus ?? !isDisabled;
  const [state, setState] = useState(() => select.init({ options: list }));

  useInput(
    (input, key) => {
      if (key.upArrow || input === "k") return setState((s) => select.move(s, -1));
      if (key.downArrow || input === "j") return setState((s) => select.move(s, 1));
      if (key.return) {
        const option = list[state.index];
        onSelect?.(option, state.index);
        (onSubmit ?? done)?.(option?.value ?? option);
      }
    },
    { isActive: active },
  );

  return (
    <Box flexDirection="column">
      {list.map((option, index) => {
        const on = index === state.index;
        return (
          <Text key={index} color={on ? color : undefined}>
            {on ? cursor : pad}
            {labelOf(option)}
          </Text>
        );
      })}
    </Box>
  );
}
