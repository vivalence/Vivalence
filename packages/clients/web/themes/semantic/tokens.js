const font = {
  family: {
    brand: ["K2D", "sans"],
    "serif-head": ["Sabon", "serif"],
    "serif-text": ["Sabon", "serif"],
    "sans-head": ["Space Grotesk", "sans"],
    "sans-text": ["Space Grotesk", "sans"],
    code: ["Source Code Pro", "monospace"],
  },
  size: {
    xs: "0.6rem",
    sm: "0.8rem",
    base: "1.2rem",
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
const lineHeight = {
  xs: "0.8",
  sm: "1.0",
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

const boxShadow = {
  sm: "0 1px 2px rgb(0, 0, 0, 0.05)",
  DEFAULT: "1 1px 3px rgb(0, 0, 0, 0.1)",
  md: "1px 4px 6px  rgb(0, 0, 0, 0.4)",
  lg: "4px 4px 8px rgb(0, 0, 0, 0.9)",
  xl: "8px 8px 16px rgb(0, 0, 0, 0.99)",
};

const dropShadow = {
  sm: "0 1px 2px rgb(0, 0, 0, 0.05)",
  DEFAULT: "1 1px 3px rgb(0, 0, 0, 0.1)",
  md: "1px 4px 6px rgb(0, 0, 0, 0.4)",
  lg: "3px 3px 6px rgb(0, 0, 0, 0.9)",
  xl: "8px 8px 16px rgb(0, 0, 0, 0.99)",
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

export default async function tokens(ds) {
  ds.tokens = {
    spacing,
    font,
    "line-height": lineHeight,
    "box-shadow": boxShadow,
    "drop-shadow": dropShadow,
    container,
    border,
    animation,
  };

  return ds;
}
