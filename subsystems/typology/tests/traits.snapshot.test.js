import { specimen, v } from "@vivalence/typology";

const { describe, it, expect, snapshot } = specimen;
const base = new URL("./snapshots", import.meta.url).pathname;

describe("snapshot: thread traits", () => {
  it("captures Aimed — a mount, required", () => {
    const { pojo } = snapshot(v.traits.Aimed, { base, locate: "trait-aimed.snapshot.json", parse: (schema) => schema });
    expect(pojo.required).toEqual(["mount"]);
  });

  it("captures Masked — open, any field", () => {
    const { pojo } = snapshot(v.traits.Masked, { base, locate: "trait-masked.snapshot.json", parse: (schema) => schema });
    expect(pojo.additionalProperties).toBe(true);
  });

  it("captures Queueing — depth defaults to 1", () => {
    const { pojo } = snapshot(v.traits.Queueing, { base, locate: "trait-queueing.snapshot.json", parse: (schema) => schema });
    expect(pojo.properties.depth.default).toBe(1);
  });

  it("captures the thread vocabulary — six names, each defaulted", () => {
    const { pojo } = snapshot(v.traits.thread, { base, locate: "trait-thread.snapshot.json", parse: (schema) => schema });
    expect(Object.keys(pojo.properties)).toEqual(["LABELED", "INTELLIGENT", "VOCAL", "AIMED", "MASKED", "QUEUEING"]);
    expect(pojo.properties.INTELLIGENT.properties.rounds.default).toBe(12);
  });
});

describe("snapshot: buffer · view traits", () => {
  it("captures Rendered — frame · cell, two optional slugs, closed", () => {
    const { pojo } = snapshot(v.traits.Rendered, { base, locate: "trait-rendered.snapshot.json", parse: (schema) => schema });
    expect(Object.keys(pojo.properties)).toEqual(["frame", "cell"]);
    expect(pojo.additionalProperties).toBe(false);
    expect(pojo.required).toBe(undefined);
  });

  it("captures the view vocabulary — FRAME · CELL", () => {
    const { pojo } = snapshot(v.traits.view, { base, locate: "trait-view.snapshot.json", parse: (schema) => schema });
    expect(Object.keys(pojo.properties)).toEqual(["FRAME", "CELL"]);
  });
});
