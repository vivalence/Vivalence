import { belt, specimen, v } from "@vivalence/typology";

specimen.describe("v.traits — one schema per carrier at v.traits.<entity>; its properties are the names, the descriptors read it", () => {
  specimen.it("Docked is field-wise: a carrier states only what it overrides; an unknown field or a share off the chrome is a fault", () => {
    specimen.expect(v.traits.terminal.properties.DOCKED.cast({ align: "left" })).toEqual({ align: "left" });
    specimen.expect(v.traits.terminal.properties.DOCKED.cast({ align: "right", share: 0.38, view: "docked", lens: "repl" })).toEqual({ align: "right", share: 0.38, view: "docked", lens: "repl" });
    specimen.expect([...v.traits.Docked.errors({ side: "left" })].length).toBeGreaterThan(0);
    specimen.expect([...v.traits.Docked.errors({ share: 1.2 })].length).toBeGreaterThan(0);
    specimen.expect([...v.traits.Docked.errors({ view: "wide" })].length).toBeGreaterThan(0);
  });

  specimen.it("Themed is a theme name", () => {
    specimen.expect(v.traits.user.properties.THEMED.check("northsea")).toBe(true);
    specimen.expect(v.traits.user.properties.THEMED.check({ theme: "northsea" })).toBe(false);
  });

  specimen.it("one schema per carrier; a carrier needs no entity (terminal · client own one)", () => {
    specimen.expect(Object.keys(v.traits.terminal.properties)).toEqual(["LABELED", "DOCKED"]);
    specimen.expect(Object.keys(v.traits.user.properties)).toEqual(["HOME", "DOCKED", "THEMED"]);
    specimen.expect(Object.keys(v.traits.client.properties)).toEqual(["HOME", "DOCKED", "THEMED"]);
    specimen.expect(Object.keys(v.traits.thread.properties)).toEqual(["LABELED", "INTELLIGENT", "VOCAL", "AIMED", "MASKED", "QUEUEING"]);
    specimen.expect(Object.keys(v.traits.buffer.properties)).toEqual(["LABELED", "RENDERED"]);
    specimen.expect(Object.keys(v.traits.view.properties)).toEqual(["FRAME", "CELL"]);
    specimen.expect(Object.keys(v.traits.mode.properties)).toContain("PRIMER");
  });

  specimen.it("an entity's vocabulary IS its carrier's schema, and the thread's trait field is it", () => {
    specimen.expect(v.buffer.traits).toBe(v.traits.buffer);
    specimen.expect(v.thread.traits).toBe(v.traits.thread);
    specimen.expect(v.user.traits).toBe(v.traits.user);
    specimen.expect(v.mode.traits).toBe(v.traits.mode);
    specimen.expect(v.thread().check({ user: "u", mode: "m", traits: ["QUEUEING"], trait: { QUEUEING: { depth: 2 } } })).toBe(true);
    specimen.expect(v.thread().check({ user: "u", mode: "m", traits: ["RATED"] })).toBe(false);
  });

  specimen.it("the client mask's vocabulary is the client's names, every field optional, nothing else admitted", () => {
    const { ClientTrait } = v.primitives.instance;
    specimen.expect(Object.keys(ClientTrait.properties)).toEqual(["HOME", "DOCKED", "THEMED"]);
    specimen.expect(ClientTrait.check({})).toBe(true);
    specimen.expect(ClientTrait.check({ DOCKED: { align: "left" }, THEMED: "porcelain" })).toBe(true);
    specimen.expect(ClientTrait.check({ KEYMAPPED: {} })).toBe(false);
  });
});

specimen.describe("belt.traits.cast — the door: every name filled, the claimed validated, loud", () => {
  specimen.it("a claimed name is filled from its defaults and kept", () => {
    const thread = { id: "th-1", traits: ["QUEUEING", "INTELLIGENT"], trait: { QUEUEING: {}, INTELLIGENT: { tune: "fast" } } };
    const trait = belt.traits.cast(thread, v.thread.traits);
    specimen.expect(trait.QUEUEING).toEqual({ depth: 1 });
    specimen.expect(trait.INTELLIGENT).toEqual({ tune: "fast", effort: "low", rounds: 12 });
  });

  specimen.it("an unclaimed name is filled, never validated — a toggled-off trait keeps its data", () => {
    const thread = { id: "th-1", traits: [], trait: { QUEUEING: { depth: 0 } } };
    const trait = belt.traits.cast(thread, v.thread.traits);
    specimen.expect(trait.QUEUEING).toEqual({ depth: 0 });
    specimen.expect(trait.AIMED).toEqual({});
    specimen.expect(trait.LABELED).toEqual({});
    specimen.expect(Object.keys(trait)).toEqual(["QUEUEING", "LABELED", "INTELLIGENT", "VOCAL", "AIMED", "MASKED"]);
  });

  specimen.it("a claimed invalid value throws, the name in the message", () => {
    specimen.expect(() => belt.traits.cast({ id: "th-1", traits: ["QUEUEING"], trait: { QUEUEING: { depth: 0 } } }, v.thread.traits)).toThrow("[traits] th-1: /QUEUEING/depth");
    specimen.expect(() => belt.traits.cast({ id: "th-1", traits: ["AIMED"], trait: {} }, v.thread.traits)).toThrow("/AIMED must have required properties mount");
    specimen.expect(() => belt.traits.cast({ id: "th-1", traits: ["INTELLIGENT"], trait: { INTELLIGENT: { rounds: 99 } } }, v.thread.traits)).toThrow("/INTELLIGENT/rounds");
  });

  specimen.it("an undeclared claimed name throws, the vocabulary named", () => {
    specimen.expect(() => belt.traits.cast({ id: "th-1", traits: ["RATED"], trait: {} }, v.thread.traits)).toThrow("[traits] th-1: no trait RATED in a vocabulary of LABELED · INTELLIGENT · VOCAL · AIMED · MASKED · QUEUEING");
  });

  specimen.it("source is not mutated", () => {
    const thread = { id: "th-1", traits: ["QUEUEING"], trait: { QUEUEING: {} } };
    const before = JSON.stringify(thread);
    const trait = belt.traits.cast(thread, v.thread.traits);
    specimen.expect(JSON.stringify(thread)).toBe(before);
    specimen.expect(trait.QUEUEING).not.toBe(thread.trait.QUEUEING);
  });
});
