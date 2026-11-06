import { traits as trait, v } from "@vivalence/typology";

export const stagger = trait.stagger;

const named = (name, Class) => Object.defineProperty(Class, "name", { value: name });
const capitalize = (word) => (word ?? "runtime").charAt(0).toUpperCase() + (word ?? "runtime").slice(1).replace(/-(\w)/g, (_, c) => c.toUpperCase());

export const presets = Object.fromEntries(
  Object.entries(v.traits).filter(([, table]) => table.type === "object").map(([entity, table]) => [entity, Object.entries(table.properties).map(([name, schematic]) => trait.define(name, { schematic }))]),
);

export const gather = (domain, modes, kind) =>
  trait.collide(
    [...presets[kind], ...(domain?.traits?.[kind] ?? []), ...modes.flatMap((mode) => mode.traits?.[kind] ?? [])].filter(
      (held, index, all) => all.findIndex((other) => other.name === held.name) === index,
    ),
  );

export const mint = ({ slug, kinds, traits }) =>
  Object.fromEntries(
    Object.entries(kinds).map(([kind, descriptor]) => {
      const held = traits[kind] ?? [];
      const schematics = Object.fromEntries(held.filter((each) => each.schematic).map((each) => [each.name, each.schematic]));
      const Repository = named(
        `${capitalize(slug)}${capitalize(kind)}Repository`,
        class extends descriptor.repository {
          claim(row, name) { return trait.claim(row, name, schematics); }
        },
      );
      trait.repository(Repository, held);
      Object.defineProperties(Repository.prototype, { schematics: { value: schematics } });
      return [kind, { repository: Repository, traits: held, schematics, daemon: slug }];
    }),
  );

export const strike = (minted, em, kinds) => {
  const struck = Object.fromEntries(Object.entries(minted).map(([kind, held]) => [kind, new held.repository(em, kinds[kind].entity.name)]));
  for (const [kind, held] of Object.entries(minted)) {
    trait.entity(kinds[kind].entity, held.traits, held.daemon);
    Object.defineProperty(struck[kind], "entities", { value: struck });
  }
  return struck;
};
