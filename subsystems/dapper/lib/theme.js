import { v } from "@vivalence/typology";
import { blend, contrast, wash } from "./contrast.js";

const { Definition, Theme, STEPS, SIGNALS, ZONES, groups, ground, leaf } = v.primitives.theme;

const EMPHASIS = ["header", "strong", "ink", "light", "muted"];
const GROUPS = Object.keys(groups);
const GROUND = Object.keys(ground);

const plain = (held) => held !== null && typeof held === "object" && !Array.isArray(held);

const merge = (under, over) => {
  if (!plain(under) || !plain(over)) return over === undefined ? structuredClone(under) : structuredClone(over);
  const keys = [...new Set([...Object.keys(under), ...Object.keys(over)])];
  return Object.fromEntries(keys.map((key) => [key, merge(under[key], over[key])]));
};

const defaults = (shape) =>
  Object.fromEntries(
    Object.entries(shape)
      .map(([key, held]) => [key, leaf(held) ? (typeof held.default === "function" ? undefined : held.default) : defaults(held)])
      .filter(([, held]) => held !== undefined),
  );

const stated = (definition) => {
  const held = structuredClone(definition);
  if (typeof held.shape?.radius === "string") held.shape.radius = Object.fromEntries(STEPS.map((step) => [step, held.shape.radius]));
  for (const name of Object.keys(held.signal ?? {})) {
    if (typeof held.signal[name] === "string") held.signal[name] = { fill: held.signal[name] };
  }
  return held;
};

const expand = (definition) => {
  const held = stated(definition);
  for (const index of Object.keys(held.zones ?? {})) {
    held.zones[index] = typeof held.zones[index] === "string" ? { surface: held.zones[index] } : stated(held.zones[index]);
  }
  return held;
};

const nearest = (index, candidates) =>
  candidates
    .map(Number)
    .sort((first, second) => Math.abs(first - index) - Math.abs(second - index) || first - second)[0];

const floor = (definition) => {
  const zones = Object.values(definition.zones ?? {});
  const missing = [
    zones.some((zone) => zone.surface) ? null : "one zone surface",
    definition.text?.ink ? null : "text.ink",
    definition.signal?.primary?.fill ? null : "signal.primary fill",
  ].filter(Boolean);
  if (missing.length) throw new Error(`[theme] below the floor, the definition lacks: ${missing.join(" · ")}`);
};

const territories = (zones) => {
  const defined = Object.keys(zones);
  const whole = ZONES.map((index) => zones[index] ?? structuredClone(zones[nearest(Number(index), defined)]));
  const from = (key, index) => {
    const holders = defined.filter((held) => zones[held][key]);
    return holders.length ? zones[nearest(index, holders)][key] : undefined;
  };
  return whole.map((zone, index) => ({
    ...zone,
    surface: zone.surface ?? from("surface", index),
    boundary: zone.boundary ?? from("boundary", index),
  }));
};

const emphasis = (text) => {
  const held = EMPHASIS.filter((step) => text[step]);
  const take = (step) => {
    const at = EMPHASIS.indexOf(step);
    return held
      .map((other) => EMPHASIS.indexOf(other))
      .sort((first, second) => Math.abs(first - at) - Math.abs(second - at) || first - second)
      .map((index) => text[EMPHASIS[index]])[0];
  };
  return Object.fromEntries(EMPHASIS.map((step) => [step, text[step] ?? take(step)]));
};

const tones = (signal, header, bench) =>
  Object.fromEntries(
    SIGNALS.map((name) => {
      const held = signal[name] ?? {};
      const fill = held.fill ?? signal.primary.fill;
      const on = [header, bench].sort((first, second) => contrast(second, fill) - contrast(first, fill))[0];
      return [name, { fill, ink: held.ink ?? fill, tint: held.tint ?? wash(fill, 0.18), on: held.on ?? on }];
    }),
  );

const controls = (control, text, primary, earth) => {
  const contrastFill = control.contrast ?? earth.boundary;
  const pressed = control.contrastPressed ?? contrastFill;
  return {
    contrast: contrastFill,
    contrastHover: control.contrastHover ?? contrastFill,
    contrastPressed: pressed,
    on: control.on ?? text.strong,
    onMuted: control.onMuted ?? text.light,
    onPressed: control.onPressed ?? primary.ink,
    field: control.field ?? earth.surfaceSunk,
    fieldPlaceholder: control.fieldPlaceholder ?? text.muted,
    fieldCaret: control.fieldCaret ?? primary.fill,
    selected: control.selected ?? primary.tint,
    focus: control.focus ?? primary.ink,
    scrollbar: control.scrollbar ?? contrastFill,
    divider: control.divider ?? pressed,
  };
};

const earth = (zone, text) => {
  const fallback = defaults(ground);
  const boundary = zone.boundary ?? blend(zone.surface, text.ink, 0.25);
  const surfaceSunk = zone.surfaceSunk ?? zone.surface;
  return {
    surface: zone.surface,
    surfaceSunk,
    surfaceLift: zone.surfaceLift ?? zone.surface,
    boundary,
    boundaryStrong: zone.boundaryStrong ?? boundary,
    boundarySoft: zone.boundarySoft ?? wash(boundary, 0.5),
    divider: zone.divider ?? boundary,
    inverse: zone.inverse ?? text.strong,
    inverseOn: zone.inverseOn ?? zone.surface,
    shadow: zone.shadow ?? fallback.shadow,
    scrim: zone.scrim ?? wash(surfaceSunk, 0.6),
    dim: zone.dim ?? fallback.dim,
  };
};

const complete = (root, zone, bench) => {
  const held = merge(root, Object.fromEntries(GROUPS.filter((group) => zone[group]).map((group) => [group, zone[group]])));
  const steps = emphasis(held.text ?? {});
  const signal = tones(held.signal ?? {}, steps.header, bench);
  const text = {
    ...steps,
    link: held.text?.link ?? signal.primary.ink,
    code: held.text?.code ?? signal.caution.ink,
    disabled: held.text?.disabled ?? defaults(groups.text).disabled,
  };
  const laid = earth(zone, text);
  return {
    ...laid,
    shape: merge(defaults(groups.shape), held.shape ?? {}),
    size: merge(defaults(groups.size), held.size ?? {}),
    text,
    control: controls(held.control ?? {}, text, signal.primary, laid),
    signal,
    brand: { outline: signal.primary.fill, ...merge(defaults(groups.brand), held.brand ?? {}) },
    font: merge(defaults(groups.font), held.font ?? {}),
  };
};

const checked = (schematic, value, label) => {
  const [fault] = schematic.faults(value);
  if (fault) throw new Error(`[theme] ${label} ${fault.at}: ${fault.reason}`);
  return value;
};

export const theme = (...definitions) => {
  definitions.forEach((definition, index) => checked(Definition, definition, `definition ${index}`));
  const whole = definitions.map(expand).reduce(merge, {});
  floor(whole);

  const root = Object.fromEntries(GROUPS.filter((group) => whole[group]).map((group) => [group, whole[group]]));
  const laid = territories(whole.zones);
  const bench = laid[3].surface;
  const zones = laid.map((zone) => complete(root, zone, bench));
  const body = complete(root, Object.fromEntries(GROUND.filter((key) => laid[1][key]).map((key) => [key, laid[1][key]])), bench);

  return checked(Theme, { ...Object.fromEntries(GROUPS.map((group) => [group, body[group]])), zones }, "theme");
};

export default theme;
