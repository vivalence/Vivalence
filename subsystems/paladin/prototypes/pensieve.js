import * as semver from "@std/semver";
import { Manifest } from "./manifest.js";

export class Pensieve extends Map {
  register(module) {
    if (!module || !module.manifest) console.log("no manifest", module);
    // owner is supplied by vip.mount (derived from scope, or locked) — never defaulted here.
    if (!module.manifest.owner)
      throw new Error(`[Pensieve] register: no owner (mount must stamp) — undefined/${module.manifest.type}/${module.manifest.slug}`);
    module.manifest = new Manifest(module.manifest);
    const { owner, type, slug, version } = module.manifest;

    if (!this.has(owner)) this.set(owner, new Map());
    const ownerMap = this.get(owner);

    if (!ownerMap.has(type)) ownerMap.set(type, new Map());
    const typeMap = ownerMap.get(type);

    if (!typeMap.has(slug)) typeMap.set(slug, new Map());
    const slugMap = typeMap.get(slug);

    const held = slugMap.get(version);
    if (held && held.mount?.absolute !== module.mount?.absolute)
      throw new Error(
        `[Pensieve] register: ${owner}/${type}/${slug}@${version} already registered from ${held.mount?.absolute} — a second declaration at ${module.mount?.absolute} would shadow it`,
      );
    slugMap.set(version, module);
    return this;
  }

  async revelio({ owner, type, slug, version }) {
    const ownerMap = this.get(owner);
    if (!ownerMap) return null;
    const typeMap = ownerMap.get(type);
    if (!typeMap) return null;
    const slugMap = typeMap.get(slug);
    if (!slugMap) return null;
    if (!version) return own(this.latest(slugMap));
    const versions = Array.from(slugMap.keys());
    const matchingVersion = versions.find((v) => semver.satisfies(v, version));
    return matchingVersion ? own(slugMap.get(matchingVersion)) : null;
  }

  latest(slugMap) {
    const [top] = Array.from(slugMap.keys())
      .sort((a, b) => semver.compare(semver.parse(a), semver.parse(b)))
      .reverse();
    return slugMap.get(top);
  }

  byType(type) {
    const out = [];
    for (const ownerMap of this.values())
      for (const slugMap of ownerMap.get(type)?.values() ?? []) out.push(this.latest(slugMap));
    return out;
  }
}

function own(value, seen = new WeakMap()) {
  if (value === null || typeof value !== "object") return value;
  if ("~kind" in value) return value;
  if (seen.has(value)) return seen.get(value);
  if (value instanceof Map) {
    const copy = new Map();
    seen.set(value, copy);
    for (const [key, entry] of value) copy.set(key, own(entry, seen));
    return copy;
  }
  if (value instanceof Set) {
    const copy = new Set();
    seen.set(value, copy);
    for (const entry of value) copy.add(own(entry, seen));
    return copy;
  }
  if (Array.isArray(value)) {
    const copy = [];
    seen.set(value, copy);
    for (const entry of value) copy.push(own(entry, seen));
    return copy;
  }
  const copy = Object.create(Object.getPrototypeOf(value));
  seen.set(value, copy);
  for (const key of Reflect.ownKeys(value)) copy[key] = own(value[key], seen);
  return copy;
}
