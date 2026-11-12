import { contexts, shard, specimen, steer, ToolCall, Vector } from "@vivalence/typology";

const runtime = { reference: "/runtime/runtime", modes: {}, daemons: {} };
const daemonDie = { runtime, reference: "/daemon/education", modes: {}, entities: {} };
const francesca = { manifest: { type: "teacher", slug: "francesca" } };

const seen = new Vector().open({ nature: "/whoami" }, (ctx) => ({
  output: { runtime: ctx.runtime?.reference ?? null, reference: ctx.reference, mode: ctx.mode.manifest.slug },
}));

const tool = async (modeDie, contract, binds = [], carried = {}) => {
  const harness = { ...shard.context.lift(contract, modeDie), ...carried, user: { id: "u1" }, input: { thread: { id: "t1" } } };
  const armed = new Vector().graft(seen);
  armed.use(shard.context.spread(contract, harness));
  for (const tap of binds) armed.use(tap(harness));
  armed.use(shard.context.bind("thread", harness.input.thread));
  return (await steer.dispatch.invoke(armed, new ToolCall("whoami"), steer.strategy.guarded)({})).output;
};

specimen.describe("Q36A — what a tool's ctx holds of the runtime", () => {
  specimen.it("today · A · B", async () => {
    const lifted = { ...shard.context.lift(contexts.modeDie, daemonDie), mode: francesca };
    const answers = {
      today: await tool(lifted, contexts.modeDie),
      A: await tool(
        { ...shard.context.lift({ ...contexts.modeDie, ...contexts.runtime }, daemonDie), mode: francesca },
        { ...contexts.modeDie, ...contexts.runtime },
      ),
      B: await tool(
        { ...lifted, runtime: daemonDie.runtime },
        contexts.modeDie,
        [(harness) => shard.context.bind("runtime", harness.runtime)],
        { runtime: daemonDie.runtime },
      ),
      "B, the HARNESSED bind forgotten": await tool(
        { ...lifted, runtime: daemonDie.runtime },
        contexts.modeDie,
        [(harness) => shard.context.bind("runtime", harness.runtime)],
      ),
    };
    console.log(JSON.stringify(answers, null, 2));
    specimen.expect(answers.today.runtime).toBe(null);
    specimen.expect(answers.A.runtime).toBe("/runtime/runtime");
    specimen.expect(answers.B.runtime).toBe("/runtime/runtime");
    specimen.expect(answers["B, the HARNESSED bind forgotten"].runtime).toBe(null);
  });
});
