import React, { useState, useEffect, useRef, createContext, useContext } from "npm:react@18";
import {
  render,
  Box,
  Text,
  Newline,
  Spacer,
  Static,
  Transform,
  useInput,
  useApp,
  useStdin,
  useStdout,
  useFocus,
  useFocusManager,
} from "npm:ink@5";

export {
  React,
  useState,
  useEffect,
  useRef,
  createContext,
  useContext,
  render,
  Box,
  Text,
  Newline,
  Spacer,
  Static,
  Transform,
  useInput,
  useApp,
  useStdin,
  useStdout,
  useFocus,
  useFocusManager,
};

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

export function Select({ items, onSelect, focus = true, cursor = "› ", pad = "  ", color = "cyan" }) {
  const [index, setIndex] = useState(0);

  useInput(
    (input, key) => {
      if (key.upArrow || input === "k") {
        setIndex((current) => Math.max(0, current - 1));
      } else if (key.downArrow || input === "j") {
        setIndex((current) => Math.min(items.length - 1, current + 1));
      } else if (key.return) {
        onSelect?.(items[index], index);
      }
    },
    { isActive: focus },
  );

  return (
    <Box flexDirection="column">
      {items.map((item, itemIndex) => {
        const isActive = itemIndex === index;
        return (
          <Text key={itemIndex} color={isActive ? color : undefined}>
            {isActive ? cursor : pad}
            {labelOf(item)}
          </Text>
        );
      })}
    </Box>
  );
}

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
      if (key.return && key.shift) {
        onChange?.((value ?? "") + "\n");
      } else if (key.return) {
        onSubmit?.(value ?? "");
      } else if (key.backspace || key.delete) {
        onChange?.((value ?? "").slice(0, -1));
      } else if (input && !key.ctrl && !key.meta && !key.escape) {
        onChange?.((value ?? "") + input);
      }
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

export function TextInput({ value, onChange, onSubmit, focus = true, placeholder = "", prompt = "› " }) {
  useInput(
    (input, key) => {
      if (key.return) {
        onSubmit?.(value ?? "");
      } else if (key.backspace || key.delete) {
        onChange?.((value ?? "").slice(0, -1));
      } else if (input && !key.ctrl && !key.meta && !key.escape) {
        onChange?.((value ?? "") + input);
      }
    },
    { isActive: focus },
  );

  const hasValue = (value ?? "").length > 0;
  const display = hasValue ? value : placeholder;
  const displayColor = hasValue ? undefined : "gray";

  return (
    <Box>
      <Text color="cyan">{prompt}</Text>
      <Text color={displayColor}>
        {display}
        {focus ? <Text color="cyan">▌</Text> : null}
      </Text>
    </Box>
  );
}
