import { shard, specimen, steer, ToolCall, Vector } from "@vivalence/typology";
import { accio } from "../../../systems/runtime/tests/scenarios/registry.js";
import { found, keyed, narrow, tool } from "./load.test.js";
import { tooled } from "./rounds.test.js";

const world = async () => {
  const harvest = await accio("@education/tactic/harvest");
  const francesca = {
    manifest: { type: "teacher", slug: "francesca" },
    tools: new Vector().open({ nature: "/tactic/harvest/drain", valence: "Francesca's own drain." }, () => ({ output: { who: "francesca" } })),
  };
  const education = { reference: "/daemon/education", modes: { tactic: { harvest }, teacher: { francesca } } };
  const runtime = { reference: "/runtime/runtime", modes: {}, daemons: { education } };
  return { runtime, reference: education.reference, mode: francesca, thread: { trait: { TOOLED: {} } }, entities: { em: { flush: async () => {} } } };
};

const REFERENCE = "/tactic/harvest/drain";
const OWN = "/daemon/education/mode/teacher/francesca/tactic/harvest/drain";
const names = (tools) => steer.trie.leaves(tools).map(({ steps }) => new ToolCall(steps).name);

specimen.describe("Q38 (R7) — one name, two tools: the nearest is loaded", () => {
  specimen.it("found · keyed · live · rebuilt · the nearest runs", async () => {
    const ctx = await world();
    const tools = new Vector().graft(tool);
    for (const [key, held] of Object.entries({ ...ctx, tools })) tools.use(shard.context.bind(key, held));
    await steer.dispatch.invoke(tools, new ToolCall("tool_load"), steer.strategy.guarded)({ references: [REFERENCE] });
    const ran = await steer.dispatch.invoke(tools, new ToolCall("tactic_harvest_drain"), steer.strategy.guarded)({});
    const answers = {
      found: found(ctx, REFERENCE).map((entry) => ({ reference: entry.reference, name: narrow(ctx, entry.reference) })),
      keyed: keyed(ctx, REFERENCE),
      TOOLED: ctx.thread.trait.TOOLED,
      live: names(tools).filter((name) => name.startsWith("tactic")),
      rebuilt: names(tooled(ctx)).filter((name) => name.startsWith("tactic")),
      ran: ran.output,
    };
    console.log(JSON.stringify(answers, null, 2));
    specimen.expect(answers.found.map((entry) => entry.reference)).toEqual([OWN]);
    specimen.expect(answers.TOOLED).toEqual({ [OWN]: "eager" });
    specimen.expect(answers.live).toEqual(answers.rebuilt);
    specimen.expect(answers.ran).toEqual({ who: "francesca" });
  });
});
