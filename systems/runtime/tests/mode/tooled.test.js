import { specimen, v, shape } from "@vivalence/typology";
import { Vector, Mode, Aperture, Path } from "@vivalence/typology";
import { TOOLED, HARNESSED } from "@vivalence/runtime/daemon/traits";
import { create } from "../scenarios/cortex.js";

function buildMode({ tools, harness, slug = "tooled-test" } = {}) {
  const mode = new Mode({ manifest: { type: "teacher", slug, traits: [] } });
  mode.aperture = new Aperture();
  mode.mount = new Path(`/mode/teacher/${slug}`);
  mode.module.harness = harness ?? new Vector();
  if (tools) mode.module.tools = tools;
  return mode;
}

const branchNatures = (vector) => [...vector.trajectories.keys()].map((pattern) => pattern.nature);

specimen.describe("TOOLED trait", () => {
  let scenario;

  specimen.beforeAll(async () => {
    scenario = await create();
  });

  specimen.afterAll(async () => {
    await scenario.orm.close();
  });

  // TOOLED registers the mode's tool vector under cortex.tools.<slug>, with the
  // daemon + mode bound onto ctx — cortex synthesises them into tool-calls later.
  specimen.describe("registration", () => {
    specimen.it("no-ops silently when mode.module.tools is missing", () => {
      const mode = buildMode({ slug: "no-tools" });
      TOOLED(mode, scenario.daemon);
      specimen.expect(branchNatures(scenario.daemon.cortex.tools)).not.toContain("no-tools");
    });

    specimen.it("mounts the mode's tools under cortex.tools.<slug>", () => {
      const tools = new Vector();
      tools.open({ nature: "ping" }, () => "pong");
      const mode = buildMode({ tools, slug: "pinger" });

      TOOLED(mode, scenario.daemon);

      specimen.expect(branchNatures(scenario.daemon.cortex.tools)).toContain("pinger");
    });
  });

  specimen.describe("execution", () => {
    specimen.it("tool execute receives ctx.daemon and ctx.mode", async () => {
      let captured = null;
      const tools = new Vector();
      tools.open(
        { nature: "probe", input: v.object({}) },
        async (ctx) => {
          captured = { daemon: ctx.daemon, mode: ctx.mode };
          return { ok: true };
        },
      );
      const mode = buildMode({ tools, slug: "prober" });

      TOOLED(mode, scenario.daemon);

      const call = shape.object(scenario.daemon.cortex.tools);
      const result = await call.prober.probe({});

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

      await applyTraits(mode, scenario.daemon, ["TOOLED", "HARNESSED"]);

      specimen.expect(mode.harness).toBeDefined();
      specimen.expect(typeof mode.harness.dialogue.stream).toBe("function");
    });

    specimen.it("['HARNESSED', 'TOOLED'] produces working harness too", async () => {
      const tools = new Vector();
      tools.open({ nature: "ping" }, () => "pong");
      const mode = buildMode({ tools });

      await applyTraits(mode, scenario.daemon, ["HARNESSED", "TOOLED"]);

      specimen.expect(mode.harness).toBeDefined();
      specimen.expect(typeof mode.harness.dialogue.stream).toBe("function");
    });
  });
});
