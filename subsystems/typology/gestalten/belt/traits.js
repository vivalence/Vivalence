import { v } from "../../schematics/index.js";
import * as is from "../is/scalars.js";

const INSTALLED = new WeakMap();

export async function stagger(module, context, traits) {
  const finalizers = [];
  for (const name of module.manifest.traits) {
    const result = await traits[name]?.(module, context);
    if (is.fn(result)) finalizers.push(result);
    else if (is.object(result)) {
      if (is.fn(result.finalize)) finalizers.push(result.finalize);
      if (is.fn(result.terminate)) {
        (module.terminators ??= []).push(result.terminate);
      }
    }
  }
  return finalizers;
}

export function define(name, { schematic = null, repository = {}, entity = {} } = {}) {
  return { name, schematic, repository, entity };
}

export function claim(row, name, vocabulary) {
  const schema = vocabulary[name];
  if (!schema)
    throw new Error(
      `[traits] no trait ${name} in a vocabulary of ${Object.keys(vocabulary).join(" · ") || "nothing"}`,
    );
  const held = row?.traits?.includes(name) ? row.trait?.[name] : undefined;
  if (!held) return {};
  const filled = schema.fill(held);
  return [...schema.errors(filled)][0] ? {} : filled;
}

export function repository(Repository, traits) {
  for (const held of traits)
    for (const [key, descriptor] of Object.entries(
      Object.getOwnPropertyDescriptors(held.repository),
    ))
      Object.defineProperty(Repository.prototype, key, { ...descriptor, configurable: true });
  return Repository;
}

const daemonOf = (row) => row.daemon?.slug ?? row.daemon ?? null;

export function entity(Entity, traits, daemon = null) {
  const installed =
    INSTALLED.get(Entity) ??
    INSTALLED.set(Entity, { owners: new Map(), vocabularies: new Map() }).get(Entity);
  const vocabulary =
    installed.vocabularies.get(daemon) ?? installed.vocabularies.set(daemon, {}).get(daemon);
  for (const held of traits) {
    vocabulary[held.name] = held.schematic ?? v.object({}, { additionalProperties: true });
    for (const [key, method] of Object.entries(held.entity)) {
      const owner = installed.owners.get(key);
      if (owner && owner !== held.name)
        throw new Error(
          `trait ${held.name}.entity.${key} collides with ${owner}.entity.${key} on ${Entity.name}`,
        );
      installed.owners.set(key, held.name);
      Object.defineProperty(Entity.prototype, key, {
        value(...args) {
          const spoken = installed.vocabularies.get(daemonOf(this)) ?? {};
          if (!spoken[held.name]) {
            throw new Error(
              `[traits] ${held.name}.${key}: ${Entity.name} ${this.slug ?? this.id} claims no ${held.name} — daemon ${daemonOf(this)} speaks ${Object.keys(spoken).join(" · ") || "nothing"}`,
            );
          }
          return method.call(this, ...args);
        },
        writable: true,
        configurable: true,
      });
    }
  }
  return Entity;
}

export function collide(traits) {
  const seen = new Map();
  for (const held of traits)
    for (const half of ["repository", "entity"])
      for (const key of Object.keys(held[half])) {
        const at = `${half}.${key}`;
        if (seen.has(at))
          throw new Error(`trait ${held.name}.${at} collides with ${seen.get(at)}.${at}`);
        seen.set(at, held.name);
      }
  return traits;
}
