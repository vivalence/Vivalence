import { specimen, v } from "@vivalence/typology";
import { print } from "../lib/world.js";

const Load = v.enum(["eager", "lazy", "none"]);
const Tooled = v.record(v.string(), Load);
const Primed = v.record(v.string(), Load);
const { Tool, Request } = v.primitives.hallucination;

const errs = (schema, value) => [...schema.errors(value)].map((error) => `${error.path || "/"} ${error.message}`);

specimen.describe("L1 schemas — Load · Tooled · Primed (quest Q3A · Q10 sketch)", () => {
  specimen.it("Load: the three states pass, every other value fails", () => {
    const good = ["eager", "lazy", "none"];
    const bad = ["soon", "", "EAGER", "Eager", null, undefined, 0, 1, true, [], {}, "eager "];
    const table = [...good, ...bad].map((value) => ({ value: value === undefined ? "<undefined>" : value, errors: errs(Load, value) }));
    print("Load verdicts", table);
    for (const value of good) specimen.expect(errs(Load, value)).toEqual([]);
    for (const value of bad) specimen.expect(errs(Load, value).length > 0).toBe(true);
    print("denominator", `${good.length} good · ${bad.length} bad`);
  });

  specimen.it("Tooled · Primed: a bad state rejected, a good map whole", () => {
    const thread = {
      TOOLED: {
        "/runtime/runtime/mode/harness/runtime/fs": "eager",
        "/runtime/runtime/mode/harness/runtime/fs/delete": "none",
        "/daemon/education/mode/tactic/harvest": "lazy",
      },
      PRIMED: { "/daemon/education/mode/tactic/harvest/archivist": "eager" },
    };
    print("thread trait, whole", thread);
    specimen.expect(errs(Tooled, thread.TOOLED)).toEqual([]);
    specimen.expect(errs(Primed, thread.PRIMED)).toEqual([]);
    for (const bad of [{ "/x": "soon" }, { "/x": null }, { "/x": 1 }, ["/x"], "eager", null])
      specimen.expect(errs(Tooled, bad).length > 0).toBe(true);
  });

  specimen.it("Q24A — a key must be the full ABSOLUTE reference: does the schema enforce it?", () => {
    const keys = ["/tactic/harvest", "tactic/harvest", "", "not a path", "/runtime/harness/runtime/fs", "/daemon/education/mode/tactic"];
    const table = keys.map((key) => ({ key, errors: errs(Tooled, { [key]: "eager" }) }));
    print("relative / non-absolute keys", table);
    specimen.expect(table.filter((row) => row.errors.length > 0).length).toBe(keys.length);
  });

  specimen.it("Q15 — the live Tool carries input AND output, both optional", () => {
    const declaration = {
      name: "tool_load",
      valence: "Loads tools.",
      input: { type: "object", properties: { references: { type: "array" } } },
      output: { type: "object", properties: { tools: { type: "array" } } },
    };
    const cast = Tool.cast(structuredClone(declaration));
    print("Tool.cast(declaration with output)", cast);
    print("Tool.errors", errs(Tool, declaration));
    print("Tool schema keys", Object.keys(Tool.properties));
    specimen.expect(Object.keys(Tool.properties)).toContain("output");
  });

  specimen.it("Q27 · provider grammar — does Tool.name constrain ≤64 chars / [a-zA-Z0-9_-]?", () => {
    const names = ["a".repeat(65), "daemon_education:x", "a.b", "", "tool load"];
    const table = names.map((name) => ({ name, errors: errs(Tool, { name }) }));
    print("Tool.name verdicts", table);
    print("Request.tools item schema", Request.properties.tools);
    specimen.expect(table.every((row) => row.errors.length > 0)).toBe(true);
  });
});
