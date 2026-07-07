import { assertEquals } from "@std/assert";
import { Path } from "@vivalence/typology";
import paladin from "@vivalence/paladin";
import { init } from "../trajectories/instance/init.js";

Deno.test("init: GATHER collects admin + config, ACT boots and sets effect", async () => {
  paladin.scopes([
    ["variant", () => true, () => new Path("/tmp/alpha")],
    ["repository", () => true, () => new Path("/repo")],
  ]);
  paladin.vip.mount = async () => {};
  paladin.vip.list = async () => [{ manifest: { slug: "alpha" } }];

  let booted = null;
  paladin.ledger.boot = async (specs) => {
    booted = specs;
    return specs.map((spec) => ({
      spec,
      pid: 4000 + spec.type.length,
      status: Promise.resolve({ success: true, code: 0 }),
    }));
  };

  const results = [
    { values: { username: "beef", password: "x" }, action: "commit" },
    ["env", "daemons"],
  ];
  let call = 0;
  const ctx = {
    signal: { params: ["all"] },
    view: { form: async () => results[call++] },
    span: null,
    effect: null,
  };

  await init(ctx);

  assertEquals(booted.length, 2); // runtime + kajuit from specs("all")
  assertEquals(ctx.effect.config, ["env", "daemons"]);
  assertEquals(ctx.effect.daemons.length, 2);
});
