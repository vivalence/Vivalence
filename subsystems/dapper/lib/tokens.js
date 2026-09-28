// import { boxShadow, dropShadow, border, container, spacing, animation } from "./tokens.js";

export const font = {
  size: {
    "2xs": "0.55rem",
    xs: "0.6rem",
    sm: "0.8rem",
    md: "0.875rem",
    base: "1rem",
    lg: "1.4rem",
    xl: "1.6rem",
    "2xl": "1.8rem",
    "3xl": "2.0rem",
    "4xl": "2.4rem",
    "5xl": "2.9rem",
    "6xl": "3.5rem",
    "7xl": "4.3rem",
    "8xl": "5.1rem",
  },
};
export const lineHeight = {
  "2xs": "0.8",
  xs: "0.8",
  sm: "1.0",
  md: "1.0",
  base: "1.0",
  lg: "1.1",
  xl: "1.1",
  "2xl": "1.1",
  "3xl": "1.2",
  "4xl": "1.25",
  "5xl": "1.3",
  "6xl": "1.3",
  "7xl": "1.3",
  "8xl": "1.3",
};

const textShadow = {
  // not used yet
  DEFAULT: "rgba(0, 0, 0, 0.2) 0px 2px 8px", // from octelium
};

const boxShadow = {
  sm: "0 1px 2px var(--shadow)",
  DEFAULT: "0 1px 3px var(--shadow)",
  md: "1px 4px 6px var(--shadow)",
  lg: "4px 4px 8px var(--shadow)",
  xl: "8px 8px 16px var(--shadow)",
};

const dropShadow = {
  sm: "0 1px 2px var(--shadow)",
  DEFAULT: "0 1px 3px var(--shadow)",
  md: "1px 4px 6px var(--shadow)",
  lg: "3px 3px 6px var(--shadow)",
  xl: "8px 8px 16px var(--shadow)",
  none: "0 0 #0000",
};

const container = {
  center: false,
  padding: {
    default: "1rem",
    sm: "2rem",
    lg: "4rem",
  },
};

const border = {
  radius: {
    none: "0",
    sm: "0.125rem",
    default: "0.425rem",
    lg: "0.75rem",
    full: "9999px",
  },
};

const animation = {
  "spin-slow": "spin 9s linear infinite",
};

const spacing = {
  0: "0",
  1: "0.25rem",
  2: "0.5rem",
  3: "0.75rem",
  4: "1rem",
  6: "1.5rem",
  8: "2rem",
};

export const TOKENS = {
  spacing,
  font,
  "line-height": lineHeight,
  "box-shadow": boxShadow,
  "drop-shadow": dropShadow,
  container,
  border,
  animation,
};

const flat = (held, prefix) =>
  Object.entries(held).flatMap(([key, value]) =>
    value !== null && typeof value === "object" && !Array.isArray(value)
      ? flat(value, `${prefix}-${key}`)
      : [[`${prefix}-${key}`.toLowerCase(), Array.isArray(value) ? value.join(", ") : value]],
  );

export const scales = () =>
  `:root {\n${flat(TOKENS, "-").map(([name, value]) => `  ${name}: ${value};`).join("\n")}\n}\n`;
