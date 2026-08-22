// stripwire · the aperture contract across vantages — reads the committed snapshot corpus
// (no live daemon): proves the LEAN route projection holds on both wire + instance, reports drift.
import { specimen } from "@vivalence/typology";

const { describe, it, expect } = specimen;
const dir = new URL("./snapshots", import.meta.url).pathname;
const read = (name) => JSON.parse(Deno.readTextFileSync(`${dir}/${name}`));

const DECLARABLE = ["input", "output", "yields", "feeds"];

// `yields` is the streaming marker: a declared packet type, or bare `true` when the edge
// streams without one. `input`/`output` are always the io type NAME.
const declared = (route, key) =>
  route[key] === undefined ||
  typeof route[key] === "string" ||
  (key === "yields" && route[key] === true);

const isContract = (routes) =>
  Array.isArray(routes) &&
  routes.length > 0 &&
  routes.every(
    (route) =>
      !!route &&
      typeof route.path === "string" &&
      route.path.startsWith("/") &&
      DECLARABLE.every((key) => declared(route, key)),
  );

const paths = (snapshot) => snapshot.routes.map((route) => route.path).sort();

describe("stripwire: aperture contract across vantages", () => {
  const files = [...Deno.readDirSync(dir)].map((entry) => entry.name);
  // MODE wire apertures only. `entity-*-aperture.snapshot.json` is a different sense of "aperture":
  // the HTTP find VANTAGE of an entity repo (topography/{literal,symbol}.snapshot.test.js), whose payload
  // is a find-result array, not a { manifest, routes } wire contract. Same suffix, different register.
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

  it("every wire aperture is a well-formed route contract", () => {
    expect(wire.length).toBeGreaterThan(0);
    for (const name of wire) {
      const snapshot = read(name);
      expect(typeof snapshot.manifest?.slug).toBe("string");
      expect(isContract(snapshot.routes)).toBe(true);
    }
  });

  it("declares an io type only from the strip vocabulary", () => {
    for (const name of wire)
      for (const route of read(name).routes)
        for (const key of Object.keys(route)) expect(["path", ...DECLARABLE]).toContain(key);
  });

  it("every instance aperture is a well-formed route contract", () => {
    if (!pairs.length) {
      console.log(
        `[stripwire] 0/${wire.length} modes have an instance vantage — ` +
          `*-brazilian.snapshot.json comes from the live-DB topography run; ` +
          `regenerate with SNAPSHOT_HOT=1 against a booted daemon to cover it`,
      );
      return;
    }
    for (const { instance } of pairs) expect(isContract(read(instance).routes)).toBe(true);
  });

  it("reports wire↔instance drift (no equality assertion)", () => {
    let drifted = 0;
    for (const { stem, wire: wireName, instance } of pairs) {
      const onWire = paths(read(wireName));
      const onInstance = paths(read(instance));
      const onlyWire = onWire.filter((path) => !onInstance.includes(path));
      const onlyInstance = onInstance.filter((path) => !onWire.includes(path));
      if (!onlyWire.length && !onlyInstance.length) continue;
      drifted++;
      console.log(`[stripwire] ${stem} drift · wire-only ${onlyWire} · instance-only ${onlyInstance}`);
    }
    console.log(`[stripwire] ${drifted}/${pairs.length} modes drift between vantages`);
  });
});
