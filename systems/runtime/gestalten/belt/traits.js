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
          scope(options = {}) {
            return { ...options, filters: { ...(options.filters ?? {}), daemon: { daemon: slug } } };
          }
          find(where, options) { return super.find(where, this.scope(options)); }
          findOne(where, options) { return super.findOne(where, this.scope(options)); }
          findOneOrFail(where, options) { return super.findOneOrFail(where, this.scope(options)); }
          findAll(options) { return super.findAll(this.scope(options)); }
          findAndCount(where, options) { return super.findAndCount(where, this.scope(options)); }
          findByCursor(where, options) { return super.findByCursor(where, this.scope(options)); }
          count(where, options) { return super.count(where, this.scope(options)); }
          nativeUpdate(where, data, options) { return super.nativeUpdate(where, data, this.scope(options)); }
          nativeDelete(where, options) { return super.nativeDelete(where, this.scope(options)); }
          create(data, options) { return super.create({ ...data, daemon: slug }, options); }
          upsert(data, options) { return super.upsert({ ...data, daemon: slug }, options); }
          unique(query) { return { ...super.unique(query), daemon: slug }; }
          claim(row, name) { return trait.claim(row, name, schematics); }
        },
      );
      trait.repository(Repository, held);
      Object.defineProperties(Repository.prototype, { daemon: { value: slug }, schematics: { value: schematics } });
      return [kind, { repository: Repository, traits: held, schematics }];
    }),
  );

export const strike = (minted, em, kinds) => {
  const struck = Object.fromEntries(Object.entries(minted).map(([kind, held]) => [kind, new held.repository(em, kinds[kind].entity.name)]));
  for (const [kind, held] of Object.entries(minted)) {
    trait.entity(kinds[kind].entity, held.traits, struck[kind].daemon);
    Object.defineProperty(struck[kind], "entities", { value: struck });
  }
  return struck;
};
