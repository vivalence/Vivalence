import { v } from "@vivalence/typology";

const { STEPS, SIGNALS, ZONES, ground } = v.primitives.theme;

const NAME = /^[a-z][a-z0-9-]*$/;

const kebab = (key) => key.replace(/[A-Z]/g, (letter) => `-${letter.toLowerCase()}`);
const bare = (number) => String(number).replace(/^0\./, ".");
const times = (factor) => `calc(var(--size-unit) * ${bare(factor)})`;
const space = (step) => `var(--size-space-${step})`;
const corner = (step) => `var(--shape-radius-${step})`;

const earth = (zone) =>
  Object.keys(ground).map((key) => [`--${kebab(key)}`, typeof zone[key] === "number" ? bare(zone[key]) : zone[key]]);

const shape = ({ shape: held, shadow }) => [
  ["--shape-relief", held.relief],
  ...[...STEPS, "full"].map((step) => [`--shape-radius-${step}`, held.radius[step]]),
  ...["key", "field", "card", "pill", "disc"].map((entity) => [`--shape-radius-${entity}`, corner(held.radius[entity])]),
  ["--shape-label-case", held.label.case],
  ["--shape-label-track", held.label.track],
  ["--shape-lift", `${held.lift} ${shadow}`],
  ["--shape-sunk", `${held.sunk} ${shadow}`],
];

const size = ({ size: held }) => [
  ["--size-unit", held.unit],
  ...STEPS.map((step) => [`--size-space-${step}`, times(held.space[step])]),
  ...STEPS.map((step) => [`--size-type-${step}`, held.type[step]]),
  ["--size-gap", space(held.gap)],
  ...Object.keys(held.pad).map((side) => [`--size-pad-${side}`, space(held.pad[side])]),
  ...["icon", "field"].map((role) => [`--size-${role}`, space(held[role])]),
  ["--size-row", times(held.row)],
  ["--size-key", times(held.key)],
  ["--size-leading-tight", bare(held.leading.tight)],
  ["--size-leading-loose", bare(held.leading.loose)],
  ["--size-ring", held.ring],
  ["--size-depth", held.depth],
];

const text = ({ text: held }) =>
  Object.keys(held).map((key) => [`--text-${kebab(key)}`, typeof held[key] === "number" ? bare(held[key]) : held[key]]);

const control = ({ control: held }) => Object.keys(held).map((key) => [`--control-${kebab(key)}`, held[key]]);

const signal = ({ signal: held }) =>
  SIGNALS.flatMap((name) => [
    [`--signal-${name}`, held[name].fill],
    [`--signal-${name}-ink`, held[name].ink],
    [`--signal-${name}-tint`, held[name].tint],
    [`--signal-${name}-on`, held[name].on],
  ]);

const brand = ({ brand: held }) => Object.keys(held).map((key) => [`--brand-${key}`, held[key]]);

const font = ({ font: held }) => Object.keys(held.family).map((key) => [`--font-family-${kebab(key)}`, held.family[key]]);

export const declarations = (zone) => [...earth(zone), ...shape(zone), ...size(zone), ...text(zone), ...control(zone), ...signal(zone), ...brand(zone), ...font(zone)];

const block = (selector, zone) =>
  `${selector} {\n${declarations(zone).map(([name, value]) => `  ${name}: ${value};`).join("\n")}\n}\n`;

export const emit = (name, held) => {
  if (typeof name !== "string" || !NAME.test(name)) throw new Error(`[emit] not a theme name: ${JSON.stringify(name)}`);
  const root = `:root[data-theme="${name}"]`;
  return [block(root, held.zones[1]), ...ZONES.map((index) => block(`${root} [data-zone="${index}"]`, held.zones[Number(index)]))].join("\n");
};

export default emit;
