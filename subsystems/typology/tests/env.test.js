import { Env, specimen } from "@vivalence/typology";

specimen.describe("Env — stratified first-hit fold", () => {
  specimen.it("declared order wins over write order", () => {
    const env = new Env(["flag", "os", "ledger"]);
    env.set("KEY", "ledger-said", "ledger");
    env.set("KEY", "os-said", "os");
    specimen.expect(env.get("KEY")).toBe("os-said");
    env.set("KEY", "flag-said", "flag");
    specimen.expect(env.get("KEY")).toBe("flag-said");
  });

  specimen.it("a tagged assign ingests a bag into one stratum", () => {
    const env = new Env(["flag", "os"]);
    env.assign({ A: "1", B: "2" }, "os");
    specimen.expect(env.vars).toEqual({ A: "1", B: "2" });
    specimen.expect(env.provenance("A")).toBe("os");
  });

  specimen.it("an untagged set lands in the strongest stratum", () => {
    const env = new Env(["flag", "os"]);
    env.set("KEY", "low", "os");
    env.set("KEY", "override");
    specimen.expect(env.get("KEY")).toBe("override");
    specimen.expect(env.provenance("KEY")).toBe("flag");
  });

  specimen.it("vars folds to the effective view", () => {
    const env = new Env(["flag", "os"]);
    env.assign({ A: 1, B: 2 }, "os");
    env.assign({ B: 9 }, "flag");
    specimen.expect(env.vars).toEqual({ A: 1, B: 9 });
  });

  specimen.it("provenance names the winning stratum", () => {
    const env = new Env(["flag", "os"]);
    env.set("KEY", "value", "os");
    specimen.expect(env.provenance("KEY")).toBe("os");
    env.set("KEY", "override", "flag");
    specimen.expect(env.provenance("KEY")).toBe("flag");
    specimen.expect(env.provenance("ABSENT")).toBe(null);
  });

  specimen.it("the bare-Env call shape survives", () => {
    const env = new Env();
    env.set("KEY", "value");
    specimen.expect(env.get("KEY")).toBe("value");
    specimen.expect(env.KEY).toBe("value");
    specimen.expect(env.has("KEY")).toBe(true);
  });

  specimen.it("an unknown stratum throws, naming the declared ones", () => {
    const env = new Env(["os"]);
    specimen.expect(() => env.set("KEY", "value", "cwd")).toThrow("unknown stratum");
  });

  specimen.it("delete clears every stratum", () => {
    const env = new Env(["flag", "os"]);
    env.set("KEY", "low", "os");
    env.set("KEY", "high", "flag");
    env.delete("KEY");
    specimen.expect(env.has("KEY")).toBe(false);
  });

  specimen.it("the views agree — get, vars, provenance, strati are one structure", () => {
    const env = new Env(["flag", "os", "ledger"]);
    env.assign({ A: "os-a", B: "os-b" }, "os");
    env.assign({ B: "ledger-b", C: "ledger-c" }, "ledger");
    env.set("A", "flag-a", "flag");
    for (const key of ["A", "B", "C"]) {
      specimen.expect(env.vars[key]).toBe(env.get(key));
      specimen.expect(env.strati(key)[0]).toEqual({ stratum: env.provenance(key), value: env.get(key) });
    }
    specimen.expect(env.get("ABSENT", "fallback")).toBe("fallback");
    specimen.expect(env.provenance("ABSENT")).toBe(null);
    specimen.expect(env.strati("ABSENT")).toEqual([]);
    specimen.expect("ABSENT" in env.vars).toBe(false);
  });

  specimen.it("write order across strata never matters", () => {
    const writes = [["KEY", "from-ledger", "ledger"], ["KEY", "from-os", "os"], ["KEY", "from-flag", "flag"]];
    for (const order of [[0, 1, 2], [2, 1, 0], [1, 2, 0]]) {
      const env = new Env(["flag", "os", "ledger"]);
      for (const index of order) env.set(...writes[index]);
      specimen.expect(env.get("KEY")).toBe("from-flag");
      specimen.expect(env.provenance("KEY")).toBe("flag");
    }
  });

  specimen.it("within one stratum the later write wins", () => {
    const env = new Env(["os"]);
    env.assign({ KEY: "early" }, "os");
    env.assign({ KEY: "late" }, "os");
    specimen.expect(env.get("KEY")).toBe("late");
  });

  specimen.it("strati lists every voice, strongest first", () => {
    const env = new Env(["flag", "os", "ledger"]);
    env.set("KEY", "weak", "ledger");
    env.set("KEY", "strong", "flag");
    specimen.expect(env.strati("KEY")).toEqual([
      { stratum: "flag", value: "strong" },
      { stratum: "ledger", value: "weak" },
    ]);
  });
});
