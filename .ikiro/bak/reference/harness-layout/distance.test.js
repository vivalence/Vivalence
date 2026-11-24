import { shard, specimen, steer, ToolCall, Vector } from "@vivalence/typology";
import * as harness from "../../../commons/harnesses/runtime/runtime-harness.viva.js";
import { accio } from "../../../systems/runtime/tests/scenarios/registry.js";
import { found, narrow, tool } from "./load.test.js";

const REFERENCES = {
  "the same mode": null,
  "another mode, same owner": null,
  "the runtime": "/runtime/runtime/mode/harness/runtime/fs/read",
  "another daemon": "/daemon/chess/mode/teacher/coach/whoami",
};

specimen.describe("Q27 — a name's length is its distance from the thread's mode", () => {
  specimen.it("from a daemon mode and from a runtime mode (R15): narrow, then widen back", async () => {
    const harvest = await accio("@education/tactic/harvest");
    const whoami = new Vector().open({ nature: "/whoami" }, () => ({ output: {} }));
    const francesca = { manifest: { type: "teacher", slug: "francesca" }, tools: new Vector().open({ nature: "/drill/deal" }, () => ({ output: {} })) };
    const runtimeMode = { manifest: harness.manifest, tools: harness.tools };
    const editor = { manifest: { type: "guide", slug: "editor" }, tools: new Vector().open({ nature: "/open" }, () => ({ output: {} })) };
    const education = { reference: "/daemon/education", modes: { tactic: { harvest }, teacher: { francesca } } };
    const chess = { reference: "/daemon/chess", modes: { teacher: { coach: { manifest: { type: "teacher", slug: "coach" }, tools: whoami } } } };
    const runtime = { reference: "/runtime/runtime", modes: { harness: { runtime: runtimeMode }, guide: { editor } }, daemons: { education, chess } };
    const contexts = {
      "daemon mode · francesca": {
        ctx: { runtime, daemon: education, reference: education.reference, mode: francesca },
        own: "/daemon/education/mode/teacher/francesca/drill/deal",
        sibling: "/daemon/education/mode/tactic/harvest/drain",
      },
      "runtime mode · harness": {
        ctx: { runtime, reference: runtime.reference, mode: runtimeMode },
        own: "/runtime/runtime/mode/harness/runtime/fs/read",
        sibling: "/runtime/runtime/mode/guide/editor/open",
      },
    };
    const table = {};
    for (const [label, held] of Object.entries(contexts)) {
      const references = { ...REFERENCES, "the same mode": held.own, "another mode, same owner": held.sibling };
      table[label] = Object.fromEntries(
        Object.entries(references).map(([distance, reference]) => {
          const short = narrow(held.ctx, reference);
          const widened = found(held.ctx, short).map((entry) => entry.reference);
          return [distance, { name: new ToolCall(short).name, widened }];
        }),
      );
      for (const [distance, reference] of Object.entries(references))
        specimen.expect(table[label][distance].widened).toContain(reference);
    }
    console.log(JSON.stringify(table, null, 2));
  });

  specimen.it("R15 — tool_load from a runtime mode's ctx, no ctx.daemon", async () => {
    const harvest = await accio("@education/tactic/harvest");
    const runtimeMode = { manifest: harness.manifest, tools: harness.tools };
    const education = { reference: "/daemon/education", modes: { tactic: { harvest } } };
    const runtime = { reference: "/runtime/runtime", modes: { harness: { runtime: runtimeMode } }, daemons: { education } };
    const thread = { trait: { TOOLED: {} } };
    const tools = new Vector().graft(tool);
    const ctx = { tools, runtime, reference: runtime.reference, mode: runtimeMode, thread, entities: { em: { flush: async () => {} } } };
    for (const [key, held] of Object.entries(ctx)) tools.use(shard.context.bind(key, held));
    const answer = await steer.dispatch.invoke(tools, new ToolCall("tool_load"), steer.strategy.guarded)({
      references: ["/daemon/education/tactic/harvest/drain"],
    });
    console.log(JSON.stringify({ tools: answer.output.tools.map((held) => held.name), missed: answer.output.missed, TOOLED: thread.trait.TOOLED }, null, 2));
    specimen.expect(answer.output.tools.map((held) => held.name)).toEqual(["daemon_education_tactic_harvest_drain"]);
  });
});
