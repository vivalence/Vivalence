const SIGNALS = ["primary", "positive", "caution", "negative"];

const slots = {
  transparent: "transparent",
  current: "currentColor",
  surface: { DEFAULT: "var(--surface)", sunk: "var(--surface-sunk)", lift: "var(--surface-lift)" },
  boundary: { DEFAULT: "var(--boundary)", strong: "var(--boundary-strong)", soft: "var(--boundary-soft)" },
  divider: "var(--divider)",
  inverse: { DEFAULT: "var(--inverse)", on: "var(--inverse-on)" },
  scrim: "var(--scrim)",
  header: "var(--text-header)",
  strong: "var(--text-strong)",
  ink: "var(--text-ink)",
  light: "var(--text-light)",
  muted: "var(--text-muted)",
  link: "var(--text-link)",
  code: "var(--text-code)",
  control: {
    contrast: { DEFAULT: "var(--control-contrast)", hover: "var(--control-contrast-hover)", pressed: "var(--control-contrast-pressed)" },
    on: { DEFAULT: "var(--control-on)", muted: "var(--control-on-muted)", pressed: "var(--control-on-pressed)" },
    field: { DEFAULT: "var(--control-field)", placeholder: "var(--control-field-placeholder)", caret: "var(--control-field-caret)" },
    selected: "var(--control-selected)",
    focus: "var(--control-focus)",
    scrollbar: "var(--control-scrollbar)",
    divider: "var(--control-divider)",
  },
  signal: Object.fromEntries(SIGNALS.map((name) => [name, {
    DEFAULT: `var(--signal-${name})`,
    ink: `var(--signal-${name}-ink)`,
    tint: `var(--signal-${name}-tint)`,
    on: `var(--signal-${name}-on)`,
  }])),
};

export const tailwindClasses = {
  colors: slots,

  // For now only family and size, needs to be expanded
  fontFamily: {
    brand: "var(--font-family-brand)",
    "serif-heading": "var(--font-family-serif-heading)",
    "serif-text": "var(--font-family-serif-text)",
    "sans-heading": "var(--font-family-sans-heading)",
    "sans-text": "var(--font-family-sans-text)",
    code: "var(--font-family-code)",
  },
  fontSize: {
    "2xs": ["var(--font-size-2xs)", "var(--line-height-2xs)"],
    xs: ["var(--font-size-xs)", "var(--line-height-xs)"],
    sm: ["var(--font-size-sm)", "var(--line-height-sm)"],
    md: ["var(--font-size-md)", "var(--line-height-md)"],
    base: ["var(--font-size-base)", "var(--line-height-base)"],
    lg: ["var(--font-size-lg)", "var(--line-height-lg)"],
    xl: ["var(--font-size-xl)", "var(--line-height-xl)"],
    "2xl": ["var(--font-size-2xl)", "var(--line-height-2xl)"],
    "3xl": ["var(--font-size-3xl)", "var(--line-height-3xl)"],
    "4xl": ["var(--font-size-4xl)", "var(--line-height-4xl)"],
    "5xl": ["var(--font-size-5xl)", "var(--line-height-5xl)"],
    "6xl": ["var(--font-size-6xl)", "var(--line-height-6xl)"],
    "7xl": ["var(--font-size-7xl)", "var(--line-height-7xl)"],
    "8xl": ["var(--font-size-8xl)", "var(--line-height-8xl)"],
  },
  // tokens
  boxShadow: {
    sm: "var(--box-shadow-sm)",
    DEFAULT: "var(--box-shadow-default)",
    md: "var(--box-shadow-md)",
    lg: "var(--box-shadow-lg)",
    xl: "var(--box-shadow-xl)",
  },
  dropShadow: {
    sm: "var(--drop-shadow-sm)",
    DEFAULT: "var(--drop-shadow-default)",
    md: "var(--drop-shadow-md)",
    lg: "var(--drop-shadow-lg)",
    xl: "var(--drop-shadow-xl)",
    none: "var(--drop-shadow-none)",
  },
  borderRadius: {
    none: "var(--border-radius-none)",
    sm: "var(--border-radius-sm)",
    DEFAULT: "var(--border-radius-default)",
    lg: "var(--border-radius-lg)",
    full: "var(--border-radius-full)",
  },
  extend: {
    spacing: {
      0: "var(--spacing-0)",
      1: "var(--spacing-1)",
      2: "var(--spacing-2)",
      3: "var(--spacing-3)",
      4: "var(--spacing-4)",
      6: "var(--spacing-6)",
      8: "var(--spacing-8)",
    },
    animation: {
      "spin-slow": "var(--animation-spin-slow)",
    },
    container: {
      center: false,
      padding: {
        DEFAULT: "var(--container-padding-default)",
        sm: "var(--container-padding-sm)",
        lg: "var(--container-padding-lg)",
      },
    },
    screens: {
      xs: "320px",
      sm: "640px",
      md: "768px",
      lg: "1024px",
      xl: "1280px",
      "2xl": "1536px",
    },
    // prose typography — bound to skeleton 1 (the main work area).
    // brand color = AQUA[300] = primary-base on skeleton 1.
    typography: {
      DEFAULT: {
        css: {
          "--tw-prose-body": "var(--text-ink)",
          "--tw-prose-bold": "var(--text-strong)",
          "--tw-prose-headings": "var(--text-header)",
          "--tw-prose-bullets": "var(--text-light)",
          "--tw-prose-lead": "var(--text-ink)",
          "--tw-prose-links": "var(--text-link)",
          "--tw-prose-captions": "var(--text-light)",
          "--tw-prose-code": "var(--text-code)",
          "--tw-prose-pre-code": "var(--text-strong)",
          "--tw-prose-quotes": "var(--text-ink)",
          "--tw-prose-counters": "var(--text-light)",
          "--tw-prose-hr": "var(--boundary)",
          "--tw-prose-quote-borders": "var(--boundary)",
          "--tw-prose-pre-bg": "var(--surface-sunk)",
          "--tw-prose-th-borders": "var(--boundary)",
          "--tw-prose-td-borders": "var(--boundary)",
          "--tw-prose-invert-body": "var(--text-ink)",
          "--tw-prose-invert-headings": "var(--text-header)",
          "--tw-prose-invert-lead": "var(--text-ink)",
          "--tw-prose-invert-links": "var(--text-link)",
          "--tw-prose-invert-bold": "var(--text-strong)",
          "--tw-prose-invert-counters": "var(--text-light)",
          "--tw-prose-invert-bullets": "var(--text-light)",
          "--tw-prose-invert-hr": "var(--boundary)",
          "--tw-prose-invert-quotes": "var(--text-ink)",
          "--tw-prose-invert-quote-borders":
            "var(--boundary)",
          "--tw-prose-invert-captions": "var(--text-light)",
          "--tw-prose-invert-code": "var(--text-code)",
          "--tw-prose-invert-pre-code": "var(--text-strong)",
          "--tw-prose-invert-pre-bg": "var(--surface-sunk)",
          "--tw-prose-invert-th-borders": "var(--boundary)",
          "--tw-prose-invert-td-borders": "var(--boundary)",
        },
      },
    },
  },
};

export default tailwindClasses;
