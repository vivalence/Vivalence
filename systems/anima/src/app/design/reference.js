export const ZONES = [
  { zone: "0", name: "chrome", what: "the application's own interface" },
  { zone: "1", name: "body", what: "content: what a thread, a buffer, a mode shows; the default" },
  { zone: "2", name: "island", what: "a thing that stands alone, outside the body" },
  { zone: "3", name: "bench", what: "instruments that look at the application" },
];

export const PLACES = [
  ["shoulder · crown · spine", "0", "surface · control"],
  ["pincer", "0", "surface · lift · control"],
  ["rail B (config · auth · box · dock)", "0", "surface · lift · control"],
  ["rail C (terminals · navigation) · panes D E G", "0", "surface · lift · control"],
  ["pane strips · tab rows", "0", "sunk · control"],
  ["panel A, the stage", "1", "surface"],
  ["dock · composer", "1", "sunk · lift · control"],
  ["chat turns · tool rows · pane F", "1", "sunk · lift"],
  ["buffers · mode applications", "1", "all"],
  ["a mode that declares itself an island", "2", "all"],
  ["inspector (panel H) · logger · debug", "3", "all"],
  ["a strip inside the bench", "0 inside 3", "surface · control"],
  ["menus · popovers · toasts", "the zone that opened them", "lift + shape.lift"],
];

export const AXES = [
  ["role", "surface · fill · ink · on · tint · boundary · shadow", "what a colour is for"],
  ["depth", "sunk · lift", "where a block sits against its ground"],
  ["state", "hover · pressed · focus · disabled", "what is happening to it"],
  ["emphasis", "strong · light · muted", "how loud it is; the plain step is the bare role"],
  ["entity", "key · field · card · pill · disc · row · icon · label", "which thing"],
  ["signal", "primary · positive · caution · negative", "which meaning"],
  ["step", "2xs … 3xl", "which size"],
  ["zone", "0 … 3", "which territory"],
];

export const STEPS = ["2xs", "xs", "sm", "md", "lg", "xl", "2xl", "3xl"];
export const SIGNALS = ["primary", "positive", "caution", "negative"];
export const PROSE = ["header", "strong", "ink", "light", "muted"];
