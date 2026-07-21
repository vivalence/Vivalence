import { specimen, v, shape, shard } from "@vivalence/typology";
import { Vector, Mode, Aperture, Path } from "@vivalence/typology";
import { TOOLED, HARNESSED } from "@vivalence/runtime/daemon/traits";
import { create } from "../scenarios/cortex.js";

function provision(mode, daemon) {
  mode.tools = new Vector();
  mode.tools.use(shard.context.bind("daemon", daemon));
  mode.tools.use(shard.context.bind("mode", mode));
  if (mode.module.tools) mode.tools.slurp(mode.module.tools);
}

function buildMode({ tools, harness, slug = "tooled-test", traits = [] } = {}) {
  const mode = new Mode({ manifest: { type: "teacher", slug, traits } });
  mode.aperture = new Aperture();
  mode.mount = new Path(`/mode/teacher/${slug}`);
  mode.module.harness = harness ?? new Vector();
  if (tools) mode.module.tools = tools;
  return mode;
}

specimen.describe("tool provisioning + TOOLED marker", () => {
  let scenario;

  specimen.beforeAll(async () => {
    scenario = await create();
  });

  specimen.afterAll(async () => {
    await scenario.orm.close();
  });

  specimen.describe("TOOLED marker", () => {
    specimen.it("is an inert marker trait", () => {
      const mode = buildMode({ slug: "marker", traits: ["TOOLED"] });
      specimen.expect(TOOLED(mode, scenario.daemon)).toBeUndefined();
    });
  });

  specimen.describe("provisioned tools", () => {
    specimen.it("mints mode.tools as a Vector, not on the aperture", () => {
      const tools = new Vector();
      tools.open({ nature: "ping" }, () => "pong");
      const mode = buildMode({ tools, slug: "pinger" });

      provision(mode, scenario.daemon);

      specimen.expect(mode.tools).toBeInstanceOf(Vector);
      const call = shape.object(mode.tools);
      specimen.expect(typeof call.ping).toBe("function");
      specimen.expect(mode.aperture.branch("/tool").effect).toBe(null);
    });

    specimen.it("tool execute receives ctx.daemon and ctx.mode", async () => {
      let captured = null;
      const tools = new Vector();
      tools.open({ nature: "probe", input: v.object({}) }, async (ctx) => {
        captured = { daemon: ctx.daemon, mode: ctx.mode };
        return { ok: true };
      });
      const mode = buildMode({ tools, slug: "prober" });

      provision(mode, scenario.daemon);

      const call = shape.object(mode.tools);
      const result = await call.probe({});

      specimen.expect(result).toEqual({ ok: true });
      specimen.expect(captured.daemon).toBe(scenario.daemon);
      specimen.expect(captured.mode).toBe(mode);
    });
  });

  specimen.describe("trait order independence", () => {
    async function applyTraits(mode, daemon, order) {
      const finalizers = [];
      const traitsByName = { TOOLED, HARNESSED };
      for (const name of order) {
        const result = await traitsByName[name](mode, daemon);
        if (typeof result === "function") finalizers.push(result);
      }
      for (const finalize of finalizers) await finalize();
    }

    specimen.it("['TOOLED', 'HARNESSED'] produces working harness", async () => {
      const tools = new Vector();
      tools.open({ nature: "ping" }, () => "pong");
      const mode = buildMode({ tools });
      provision(mode, scenario.daemon);

      await applyTraits(mode, scenario.daemon, ["TOOLED", "HARNESSED"]);

      specimen.expect(mode.harness).toBeDefined();
      specimen.expect(typeof mode.harness.dialogue.stream).toBe("function");
    });

    specimen.it("['HARNESSED', 'TOOLED'] produces working harness too", async () => {
      const tools = new Vector();
      tools.open({ nature: "ping" }, () => "pong");
      const mode = buildMode({ tools });
      provision(mode, scenario.daemon);

      await applyTraits(mode, scenario.daemon, ["HARNESSED", "TOOLED"]);

      specimen.expect(mode.harness).toBeDefined();
      specimen.expect(typeof mode.harness.dialogue.stream).toBe("function");
    });
  });
});
