import * as semver from "@std/semver";
import { Manifest } from "./manifest.js";

export class Pensieve extends Map {
  register(cake) {
    if (!cake || !cake.manifest) console.log("no manifest", cake);
    // owner is supplied by vip.mount (derived from scope, or locked) — never defaulted here.
    if (!cake.manifest.owner)
      throw new Error(`[Pensieve] register: no owner (mount must stamp) — undefined/${cake.manifest.type}/${cake.manifest.slug}`);
    cake.manifest = new Manifest(cake.manifest);
    const { owner, type, slug, version } = cake.manifest;

    if (!this.has(owner)) this.set(owner, new Map());
    const ownerMap = this.get(owner);

    if (!ownerMap.has(type)) ownerMap.set(type, new Map());
    const typeMap = ownerMap.get(type);

    if (!typeMap.has(slug)) typeMap.set(slug, new Map());
    const slugMap = typeMap.get(slug);

    slugMap.set(version, cake);
    return this;
  }

  async revelio({ owner, type, slug, version }) {
    const ownerMap = this.get(owner);
    if (!ownerMap) return null;
    const typeMap = ownerMap.get(type);
    if (!typeMap) return null;
    const slugMap = typeMap.get(slug);
    if (!slugMap) return null;
    if (!version) return this.latest(slugMap);
    const versions = Array.from(slugMap.keys());
    const matchingVersion = versions.find((v) => semver.satisfies(v, version));
    return matchingVersion ? slugMap.get(matchingVersion) : null;
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
