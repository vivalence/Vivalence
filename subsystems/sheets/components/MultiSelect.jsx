import React, { useState } from "react";
import { Box, Text, useInput } from "ink";
import * as multiselect from "../state/multiselect.js";

function labelOf(option) {
  if (typeof option === "string") return option;
  return option.label ?? option.value ?? String(option);
}

export function MultiSelect({
  options = [],
  defaultValue = [],
  onChange,
  onSubmit,
  done,
  isDisabled = false,
  focus,
  color = "cyan",
}) {
  const active = focus ?? !isDisabled;
  const [state, setState] = useState(() => multiselect.init({ options, selected: defaultValue }));

  useInput(
    (input, key) => {
      if (key.upArrow || input === "k") return setState((s) => multiselect.move(s, -1));
      if (key.downArrow || input === "j") return setState((s) => multiselect.move(s, 1));
      if (input === " ") {
        return setState((s) => {
          const next = multiselect.toggle(s);
          onChange?.(multiselect.values(next));
          return next;
        });
      }
      if (key.return) return (onSubmit ?? done)?.(multiselect.values(state));
    },
    { isActive: active },
  );

  return (
    <Box flexDirection="column">
      {options.map((option, index) => {
        const key = option?.value ?? option;
        const on = index === state.index;
        const checked = state.selected.has(key);
        return (
          <Text key={index} color={on ? color : undefined}>
            {on ? "› " : "  "}
            {checked ? "◉ " : "◯ "}
            {labelOf(option)}
          </Text>
        );
      })}
    </Box>
  );
}
