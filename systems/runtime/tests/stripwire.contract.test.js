// stripwire · the aperture contract across vantages — reads the committed snapshot corpus
// (no live daemon): proves {effect?, branches} holds on both wire + instance, reports drift.
import { specimen } from "@vivalence/typology";

const { describe, it, expect } = specimen;
const dir = new URL("./snapshots", import.meta.url).pathname;
const read = (name) => JSON.parse(Deno.readTextFileSync(`${dir}/${name}`));

const isContract = (node) =>
  !!node &&
  (node.effect === undefined || (typeof node.effect === "object" && node.effect !== null)) &&
  !!node.branches &&
  typeof node.branches === "object" &&
  Object.values(node.branches).every(isContract);

describe("stripwire: aperture contract across vantages", () => {
  const files = [...Deno.readDirSync(dir)].map((entry) => entry.name);
  // MODE wire apertures only. `entity-*-aperture.snapshot.json` is a different sense of "aperture":
  // the HTTP find VANTAGE of an entity repo (topography/{literal,symbol}.snapshot.test.js), whose payload
  // is a find-result array, not a { manifest, aperture } wire contract. Same suffix, different register.
  const wire = files.filter(
    (name) =>
      name.endsWith("-aperture.snapshot.json") &&
      name !== "modes-aperture.snapshot.json" &&
      !name.startsWith("entity-"),
  );
  const pairs = wire
    .map((name) => {
      const stem = name.slice(0, -"-aperture.snapshot.json".length);
      const instance = `${stem}-brazilian.snapshot.json`;
      return files.includes(instance) ? { stem, wire: name, instance } : null;
    })
    .filter(Boolean);

  it("every wire aperture is a well-formed strip contract", () => {
    expect(wire.length).toBeGreaterThan(0);
    for (const name of wire) expect(isContract(read(name).aperture)).toBe(true);
  });

  it("every instance aperture is a well-formed strip contract", () => {
    expect(pairs.length).toBeGreaterThan(0);
    for (const { instance } of pairs) {
      const aperture = read(instance).aperture;
      if (aperture) expect(isContract(aperture)).toBe(true);
    }
  });

  it("reports wire↔instance drift (no equality assertion)", () => {
    let drifted = 0;
    for (const { stem, wire: wireName, instance } of pairs) {
      const wireAperture = read(wireName).aperture;
      const instanceAperture = read(instance).aperture;
      if (!instanceAperture) continue;
      const wireBranches = Object.keys(wireAperture.branches);
      const instanceBranches = Object.keys(instanceAperture.branches);
      const onlyWire = wireBranches.filter((branch) => !instanceBranches.includes(branch));
      const onlyInstance = instanceBranches.filter((branch) => !wireBranches.includes(branch));
      const match = !onlyWire.length && !onlyInstance.length;
      if (!match) drifted++;
      console.log(
        `[stripwire] ${stem} · branches wire ${wireBranches.length}/instance ${instanceBranches.length}` +
          (match ? " · MATCH" : ` · +wire[${onlyWire}] +instance[${onlyInstance}]`),
      );
    }
    console.log(`[stripwire] ${drifted}/${pairs.length} modes drift between vantages`);
    expect(pairs.length).toBeGreaterThan(0);
  });
});
