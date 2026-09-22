import { v } from "@vivalence/typology";

// a rule is [applies(module), apply(module, span) → module]: a fault goes to the span and the fold goes on,
// a throw stops the mount of that file. two kinds: a type validates against its schematic, a trait names
// the export it travels with (null: a marker, nothing to carry).
export const TRAITS = {
  EXPOSED: "aperture",
  ATTACHED: "aperture",
  BOOTED: "boot",
  DATASET: "dataset",
  INTENTED: "dataset",
  DATASINK: "datasink",
  EMITTER: "emitter",
  APPLICATION: "application",
  TOOLING: "tools",
  FRAUGHT: "freight",
  HARNESSED: null,
  GENERATIVE: null,
  MOUNTED: null,
  AGENTIC: null,
  SELFEVIDENT: null,
  CONVERSATIONAL: null,
  STANDALONE: null,
};

const SCHEMATICS = { domain: v.primitives.kernel.Domain };

const traits = (module) => module.manifest.traits ?? [];
// a copy is filled first — the schematic's defaults are not the module's fault (settle judges the same way)
const validate = (schematic, pick = (module) => module) => (module, span) => {
  for (const { at, reason } of schematic.faults(schematic.fill({ ...pick(module) }))) span.fault(new Error(`${at} ${reason}`));
  return module;
};
const fault = (sentence) => (module, span) => (span.fault(new Error(sentence(module))), module);

export const RULES = [
  [(module) => !module.manifest?.slug, () => { throw new Error("no manifest.slug — unfit to register"); }],
  [() => true, validate(v.primitives.Manifest, (module) => module.manifest)],
  ...Object.entries(SCHEMATICS).map(([type, schematic]) => [(module) => module.manifest.type === type, validate(schematic)]),
  ...Object.entries(TRAITS)
    .filter(([, prototype]) => prototype)
    .map(([name, prototype]) => [(module) => traits(module).includes(name) && module[prototype] === undefined, fault(() => `${name}: no ${prototype} export`)]),
];

export const probe = (rules) => (module, span) =>
  rules.reduce((held, [applies, apply]) => (applies(held) ? apply(held, span) : held), module);
