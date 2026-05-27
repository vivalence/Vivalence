import React, { useState } from "react";
import { Box, Text, useInput } from "ink";
import * as text from "../state/text.js";

export function TextInput({
  value,
  defaultValue = "",
  onChange,
  onSubmit,
  done,
  isDisabled = false,
  focus,
  placeholder = "",
  prompt = "› ",
  mask = false,
}) {
  const active = focus ?? !isDisabled;
  const controlled = value !== undefined;
  const [state, setState] = useState(() => text.init({ value: controlled ? value : defaultValue }));
  const current = controlled ? value : state.value;

  const edit = (producer) => {
    const next = producer({ value: current, cursor: Math.min(state.cursor, current.length) });
    if (controlled) setState((s) => ({ ...s, cursor: next.cursor }));
    else setState(next);
    onChange?.(next.value);
  };

  useInput(
    (input, key) => {
      if (key.return) return (onSubmit ?? done)?.(current);
      if (key.leftArrow) return setState((s) => text.move({ value: current, cursor: s.cursor }, -1));
      if (key.rightArrow) return setState((s) => text.move({ value: current, cursor: s.cursor }, 1));
      if (key.backspace || key.delete) return edit((s) => text.backspace(s));
      if (input && !key.ctrl && !key.meta && !key.escape) return edit((s) => text.insert(s, input));
    },
    { isActive: active },
  );

  const has = current.length > 0;
  const shown = mask ? "•".repeat(current.length) : has ? current : placeholder;
  return (
    <Box>
      <Text color="cyan">{prompt}</Text>
      <Text color={has ? undefined : "gray"}>
        {shown}
        {active ? <Text color="cyan">▌</Text> : null}
      </Text>
    </Box>
  );
}
