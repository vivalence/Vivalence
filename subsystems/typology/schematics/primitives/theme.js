import { v } from "../v.js";

export const STEPS   = ["2xs", "xs", "sm", "md", "lg", "xl", "2xl", "3xl"];
export const SIGNALS = ["primary", "positive", "caution", "negative"];
export const ZONES   = ["0", "1", "2", "3"];
export const TERRITORIES = { 0: "chrome", 1: "body", 2: "island", 3: "bench" };

export const Hex     = v.string({ pattern: "^#[0-9A-Fa-f]{6}$" }).desc('Opaque colour. Example: "#1A2A38"');
export const Alpha   = v.string({ pattern: "^rgba\\(\\d{1,3}, ?\\d{1,3}, ?\\d{1,3}, ?(0|1|0?\\.\\d+)\\)$" }).desc('Colour with alpha. Example: "rgba(30, 188, 181, 0.18)"');
export const Color   = v.union([Hex, Alpha]);
export const Px      = v.string({ pattern: "^\\d+(\\.\\d+)?px$" }).desc('Never scaled. Example: "1px"');
export const Percent = v.string({ pattern: "^\\d+(\\.\\d+)?%$" }).desc('Example: "50%"');
export const Rem     = v.string({ pattern: "^\\d*\\.?\\d+rem$" }).desc('Scales with the root font size. Example: ".25rem"');
export const Em      = v.string({ pattern: "^\\d*\\.?\\d+em$" }).desc('Example: ".14em"');
export const Factor  = v.number({ minimum: 0 }).desc("Multiplier of size.unit. Example: 6.5");
export const Ratio   = v.number({ minimum: 0, maximum: 1 }).desc("Opacity. Example: 0.55");
export const Leading = v.number({ minimum: 0.8, maximum: 2 }).desc("Unitless line height. Example: 1.45");
export const Shadow  = v.string({ minLength: 1 }).desc('Geometry only; the zone\'s shadow gives the tone. Example: "0 12px 30px"');
export const Family  = v.string({ minLength: 1 }).desc('A CSS font-family list, first choice to fallback. Example: "Inter, sans-serif"');
export const Glow    = v.string({ minLength: 1 }).desc('A whole box-shadow, its colour inside; "0 0 0 transparent" is none. Example: "inset 0 0 12px rgba(30, 188, 181, 0.2)"');
export const Filter  = v.string({ minLength: 1 }).desc('A CSS filter list, or "none". Example: "drop-shadow(0 0 4px #1EBCB5)"');
export const Step    = v.enum(STEPS).desc('Names a step of a scale. Example: "sm"');
export const Round   = v.enum([...STEPS, "full"]).desc('Names a step of shape.radius. Example: "xs"');
export const Relief  = v.enum(["sunk", "lift"]);
export const Case    = v.enum(["uppercase", "lowercase", "capitalize", "none"]);
export const SignalName = v.enum(SIGNALS);
export const ZoneIndex  = v.enum(ZONES);

const CLOSED = { additionalProperties: false };

export const leaf = (held) => typeof held.check === "function";
const each  = (shape, wrap) => Object.fromEntries(Object.entries(shape).map(([key, held]) => [key, wrap(held)]));
const whole = (shape) => v.object(each(shape, (held) => (leaf(held) ? held : whole(held))), CLOSED);
const loose = (shape) => v.object(each(shape, (held) => (leaf(held) ? held : loose(held)).optional()), CLOSED);
const scale = (held, values) => Object.fromEntries(STEPS.map((step, index) => [step, held.default(values[index])]));

export const shape = {
  relief: Relief.default("lift"),
  radius: {
    ...scale(Px, ["1px", "2px", "3px", "4px", "6px", "8px", "12px", "16px"]),
    full: v.union([Px, Percent]).default("999px"),
    key: Round.default("2xs"), field: Round.default("2xs"), card: Round.default("xs"), pill: Round.default("2xs"), disc: Round.default("2xs"),
  },
  label:  { case: Case.default("uppercase"), track: Em.default(".14em") },
  lift:   Shadow.default("0 12px 30px"),
  sunk:   Shadow.default("inset 0 2px 3px"),
};

export const size = {
  unit:    Rem.default(".25rem"),
  space:   scale(Factor, [1, 2, 3, 4, 6, 8, 12, 16]),
  type:    scale(Rem, [".6875rem", ".75rem", ".875rem", "1rem", "1.125rem", "1.25rem", "1.5rem", "1.75rem"]),
  gap:     Step.default("xs"),
  pad:     { box: Step.default("sm"), x: Step.default("sm"), y: Step.default("2xs") },
  icon:    Step.default("md"),
  field:   Step.default("xl"),
  row:     Factor.default(6.5),
  key:     Factor.default(7),
  leading: { tight: Leading.default(1.1), loose: Leading.default(1.45) },
  ring:    Px.default("1px"),
  depth:   Px.default("2px"),
};

export const text = {
  header: Color, strong: Color, ink: Color, light: Color, muted: Color,
  link: Color, code: Color,
  disabled: Ratio.default(0.45),
};

export const control = {
  contrast: Color, contrastHover: Color, contrastPressed: Color,
  on: Color, onMuted: Color, onPressed: Color,
  field: Color, fieldPlaceholder: Color, fieldCaret: Color,
  selected: Color, focus: Color, scrollbar: Color, divider: Color,
};

export const tone   = { fill: Color, ink: Color, tint: Color, on: Color };
export const signal = Object.fromEntries(SIGNALS.map((name) => [name, tone]));

export const ground = {
  surface: Color, surfaceSunk: Color, surfaceLift: Color,
  boundary: Color, boundaryStrong: Color, boundarySoft: Color,
  divider: Color,
  inverse: Color, inverseOn: Color,
  shadow: Color.default("rgba(0, 0, 0, 0.45)"), scrim: Color,
  dim: Ratio.default(0.55),
};

export const brand = {
  outline: Color,
  glow:    Glow.default("0 0 0 transparent"),
  filter:  Filter.default("none"),
};

export const font = {
  family: {
    sansHeading:  Family.default("Poppins, sans-serif"),
    sansText:     Family.default("Inter, sans-serif"),
    serifHeading: Family.default("Poppins, serif"),
    serifText:    Family.default("Inter, Sabon, serif"),
    brand:        Family.default("K2D, sans-serif"),
    code:         Family.default("Victor Mono, monospace"),
  },
};

export const groups = { shape, size, text, control, signal, brand, font };

export const Shape   = whole(shape);
export const Size    = whole(size);
export const Text    = whole(text);
export const Control = whole(control);
export const Tone    = whole(tone);
export const Signal  = whole(signal);
export const Brand   = whole(brand);
export const Font    = whole(font);
export const Ground  = whole(ground);
export const Zone    = whole({ ...ground, ...groups });

const stated = {
  shape:   loose({ ...shape, radius: v.union([Px, loose(shape.radius)]) }),
  size:    loose(size),
  text:    loose(text),
  control: loose(control),
  signal:  v.object(Object.fromEntries(SIGNALS.map((name) => [name, v.union([Color, loose(tone)]).optional()])), CLOSED),
  brand:   loose(brand),
  font:    loose(font),
};

const territory = v.object({ ...each(ground, (held) => held.optional()), ...each(stated, (held) => held.optional()) }, CLOSED);

export const Definition = v.object({
  ...each(stated, (held) => held.optional()),
  zones: v.object(Object.fromEntries(ZONES.map((index) => [index, v.union([Color, territory]).optional()])), CLOSED).optional(),
}, CLOSED).desc("What a theme declares: any subset of the token space, in any of its forms.");

export const Theme = v.object({
  ...each(groups, whole),
  zones: v.array(Zone, { minItems: 4, maxItems: 4 }),
}, CLOSED).desc("What theme() returns: seven groups, four zones, every zone its ground and the groups merged.");
