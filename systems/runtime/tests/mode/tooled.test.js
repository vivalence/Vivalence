import { specimen, v } from "@vivalence/typology";
import { Vector, Mode, Aperture, Path } from "@vivalence/typology";
import { TOOLED, HARNESSED } from "@vivalence/runtime/daemon/traits";
import { create } from "../scenarios/cortex.js";

function buildMode({ tools, harness } = {}) {
  const mode = new Mode({ manifest: { type: "teacher", slug: "tooled-test", traits: [] } });
  mode.aperture = new Aperture();
  mode.mount = new Path("/mode/teacher/tooled-test");
  mode.cake.harness = harness ?? new Vector();
  if (tools) mode.cake.tools = tools;
  return mode;
}

specimen.describe("TOOLED trait", () => {
  let scenario;

  specimen.beforeAll(async () => {
    scenario = await create();
  });

  specimen.afterAll(async () => {
    await scenario.orm.close();
  });

  specimen.describe("compilation", () => {
    specimen.it("no-ops silently when mode.cake.tools is missing", () => {
      const mode = buildMode();
      TOOLED(mode, scenario.daemon);
      specimen.expect(mode.cake.harness.trajectories.size).toBe(0);
    });

    specimen.it("mounts a /dialogue middleware when tools declared", () => {
      const tools = new Vector();
      tools.open({ nature: "ping" }, () => "pong");
      const mode = buildMode({ tools });

      TOOLED(mode, scenario.daemon);

      const dialogue = [...mode.cake.harness.trajectories.entries()]
        .find(([pattern]) => pattern.nature === "dialogue");
      specimen.expect(dialogue).toBeDefined();
    });

    specimen.it("does NOT mount on /speech or /verbatim", () => {
      const tools = new Vector();
      tools.open({ nature: "ping" }, () => "pong");
      const mode = buildMode({ tools });

      TOOLED(mode, scenario.daemon);

      const branchNatures = [...mode.cake.harness.trajectories.keys()].map((p) => p.nature);
      specimen.expect(branchNatures).toContain("dialogue");
      specimen.expect(branchNatures).not.toContain("speech");
      specimen.expect(branchNatures).not.toContain("verbatim");
    });
  });

  specimen.describe("absorb on hallucination", () => {
    specimen.it("merges compiled bundle into ctx.hallucination per call", async () => {
      const tools = new Vector();
      tools.open(
        { nature: "lookup", valence: "Look up a word.", input: v.object({ query: v.string() }) },
        async (ctx) => ({ definition: `${ctx.input.query} means thing` }),
      );
      const mode = buildMode({ tools });
      TOOLED(mode, scenario.daemon);

      const dialogue = [...mode.cake.harness.trajectories.entries()]
        .find(([pattern]) => pattern.nature === "dialogue")[1];
      const middleware = dialogue.carry[0];

      const absorbed = [];
      const ctx = {
        hallucination: {
          absorb(bundle) { absorbed.push(bundle); return this; },
        },
      };
      await middleware(ctx, async () => {});

      specimen.expect(absorbed.length).toBe(1);
      specimen.expect(absorbed[0].llmstxt).toContain("### Tools");
      specimen.expect(absorbed[0].llmstxt).toContain('"lookup":');
      specimen.expect(typeof absorbed[0].tools.lookup.execute).toBe("function");
      specimen.expect(absorbed[0].tools.lookup.valence).toBe("Look up a word.");
    });

    specimen.it("tool execute receives ctx.daemon and ctx.mode", async () => {
      let captured = null;
      const tools = new Vector();
      tools.open(
        { nature: "probe", input: v.object({}) },
        async (ctx) => { captured = { daemon: ctx.daemon, mode: ctx.mode }; return {}; },
      );
      const mode = buildMode({ tools });
      TOOLED(mode, scenario.daemon);

      const dialogue = [...mode.cake.harness.trajectories.entries()]
        .find(([pattern]) => pattern.nature === "dialogue")[1];
      const middleware = dialogue.carry[0];

      let bundle = null;
      const ctx = {
        hallucination: {
          absorb(b) { bundle = b; return this; },
        },
      };
      await middleware(ctx, async () => {});
      await bundle.tools.probe.execute({});

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
