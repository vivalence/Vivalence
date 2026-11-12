import { specimen, v } from "@vivalence/typology";

const Load = v.enum(["eager", "lazy", "none"]);
const loose = v.record(v.string(), Load);
const Absolute = v.string({ pattern: "^/(runtime|daemon)(/[^/]+)*$" });
const open = v.record(Absolute, Load);
const strict = { ...v.record(Absolute, Load), additionalProperties: false };

const keys = {
  "/runtime": "eager",
  "/daemon/education/mode/tactic/harvest": "eager",
  "/tactic/harvest": "eager",
  "": "eager",
  "/runtime/runtime/mode/harness/runtime/fs/": "none",
};

specimen.describe("R1 — a TOOLED key that is not absolute", () => {
  specimen.it("loose · strict, per key", () => {
    const verdicts = Object.fromEntries(
      Object.entries(keys).map(([key, load]) => [
        key,
        { loose: v.faults(loose, { [key]: load }).length, open: v.faults(open, { [key]: load }).length, strict: v.faults(strict, { [key]: load }).length },
      ]),
    );
    console.log(JSON.stringify({ schema: JSON.parse(JSON.stringify({ additionalProperties: strict.additionalProperties })), verdicts }, null, 2));
    specimen.expect(verdicts["/tactic/harvest"].strict > 0).toBe(true);
    specimen.expect(verdicts[""].strict > 0).toBe(true);
    specimen.expect(verdicts["/runtime"].strict).toBe(0);
  });
});
