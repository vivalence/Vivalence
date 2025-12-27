// import {once, fn:{once}} from "@vivalence/belt";
// import {once, fn:{once}} from "@vivalence/typology/belt";
import * as semver from "@std/semver";
// // vectorizable af.

export class Pensieve extends Map {
  register(cake) {
    //todo: cast module
    if (!cake || !cake.manifest) console.log("no manifest", cake);

    const { owner = "@vivalence", type, slug, version } = cake.manifest;

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

    if (!version) {
      const versions = Array.from(slugMap.keys());
      const highestVersion = versions
        .sort((a, b) => semver.compare(semver.parse(a), semver.parse(b)))
        .reverse()[0];

      return slugMap.get(highestVersion);
    }

    const versions = Array.from(slugMap.keys());
    const matchingVersion = versions.find((v) => semver.satisfies(v, version));
    return matchingVersion ? slugMap.get(matchingVersion) : null;
  }
}
