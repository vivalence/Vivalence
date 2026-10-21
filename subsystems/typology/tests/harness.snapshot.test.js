// snapshot · harness — the three static shapes of schematics/primitives/harness.js (m88 s3 · m96 Q1).
// Step 1: DRY — console.log the pojo + resolved path, eyeball it. Step 2: write + read back.
import { specimen, v } from "@vivalence/typology";

const { describe, it, expect, snapshot } = specimen;
const base = new URL("./snapshots", import.meta.url).pathname;
const DRY = false;

const pin = (name, schema) => {
  const { pojo, path } = snapshot(schema, { base, dry: DRY, locate: `harness-${name}.snapshot.json`, parse: (schema) => JSON.parse(JSON.stringify(schema)) });
  console.log(`\n===BEGIN harness-${name} → ${path}===\n${JSON.stringify(pojo, null, 2)}\n===END===\n`);
  return pojo;
};

const examples = (pojo) => Object.entries(pojo.properties).filter(([, property]) => property.description).map(([key, property]) => [key, /Example: /.test(property.description)]);

describe("snapshot: harness", () => {
  it("captures harness-call — body + flags, as a Signal carries them", () => {
    const pojo = pin("call", v.primitives.harness.Call);
    expect(pojo.type).toBe("object");
    expect(Object.keys(pojo.properties)).toEqual(["body", "flags"]);
    expect(pojo.required).toEqual(["body", "flags"]);
    expect(examples(pojo)).toEqual([["body", true], ["flags", true]]);
  });

  it("captures harness-signal — the /repl wire: nature + body + flags, every word required", () => {
    const pojo = pin("signal", v.primitives.harness.Signal);
    expect(Object.keys(pojo.properties)).toEqual(["nature", "body", "flags"]);
    expect(pojo.required).toEqual(["nature", "body", "flags"]);
    expect(examples(pojo)).toEqual([["nature", true], ["body", true], ["flags", true]]);
    expect(v.primitives.harness.Signal.check({ nature: "/mode/console/whoami", body: [], flags: {} })).toBe(true);
    expect(v.primitives.harness.Signal.check({ nature: "/mode/console/whoami" })).toBe(false);
  });

  it("captures harness-request — thread · terminal · turn · parts, thread and parts required", () => {
    const pojo = pin("request", v.primitives.harness.Request);
    expect(Object.keys(pojo.properties)).toEqual(["thread", "terminal", "turn", "parts", "tune", "config", "system", "output", "tools"]);
    expect(pojo.required).toEqual(["thread", "parts"]);
    expect(pojo.properties.parts.type).toBe("array");
    expect(examples(pojo).filter(([key]) => key !== "tune").every(([, exampled]) => exampled)).toBe(true);
    expect(v.primitives.harness.Request.check({ parts: [{ type: "text", text: "ciao" }] })).toBe(false);
    expect(v.primitives.harness.Request.check({ thread: "th3", parts: [{ type: "text", text: "ciao" }] })).toBe(true);
    expect(v.primitives.harness.Request.check({ thread: "th3", terminal: "t1", turn: "6f1c0d2e", parts: [{ type: "text", text: "ciao" }] })).toBe(true);
    expect(v.primitives.harness.Request.check({ thread: "th3" })).toBe(false);
  });
});
