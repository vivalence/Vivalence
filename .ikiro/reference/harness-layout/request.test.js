import { Mode, shape, shard, specimen, steer, v, Vector } from "@vivalence/typology";
import { traits } from "@vivalence/runtime";
import { create } from "../../../systems/runtime/tests/scenarios/cortex.js";
const { PRIMER } = traits.mode;

const loading = (steps) => steps.findLast((step) => step.load)?.load ?? "eager";
const eager = (vector) => steer.trie.sieve(vector, (pattern, path) => loading(path) === "eager");
const request = async (primer, tools, turns) => ({
  system: await shape.primer.load(primer),
  turns: turns.map((turn) => ({ role: turn.role, parts: turn.parts })),
  tools: shard.hallucinate.declarations(eager(tools)),
});
const print = (label, value) => console.log(`\n## ${label}\n${JSON.stringify(value, null, 2)}`);

specimen.describe("the Request a provider receives, on the cortex rig", () => {
  specimen.it("before the pull · after the pull", async () => {
    let captured;
    const scenario = await create({ harness: new Vector().use(async (ctx, next) => { captured = ctx.hallucination; await next(); }) });
    try {
      const { daemon, dewey } = scenario;
      dewey.module.primer = new Vector().open("dewey", "You are Dewey.");
      PRIMER(dewey);
      const harvest = new Mode({ manifest: { type: "tactics", slug: "harvest", traits: ["PRIMER", "TOOLING"] } });
      harvest.module.primer = new Vector().open({ nature: "archivist", valence: "the harvest persona" }, "ARCHIVIST");
      PRIMER(harvest);
      harvest.tools = new Vector().open(
        { nature: "/collect", valence: "Collects pages from the web. Example: { query: \"congiuntivo\" }", input: v.object({ query: v.string() }) },
        () => null,
      );
      daemon.modes.tactics = { harvest };
      const thread = await scenario.createThread();
      await dewey.harness.dialogue.render({ thread: thread.id, parts: [{ type: "text", text: "find me three example sentences" }] });

      const compose = (ARMED) => {
        const primer = new Vector().graft(dewey.primer);
        const tools = new Vector().graft(captured.tools);
        primer.branch({ nature: "harvest", load: "lazy" }).graft(harvest.primer);
        tools.branch({ nature: "harvest", load: "lazy" }).graft(harvest.tools);
        for (const [path, load] of Object.entries(ARMED)) {
          primer.branch({ nature: path.slice(1), load });
          tools.branch({ nature: path, load });
        }
        return request(primer, tools, captured.turns);
      };
      print("before the pull", await compose({}));
      print("after the pull", await compose({ "/harvest": "eager" }));
    } finally {
      await scenario.orm.close();
    }
  });
});
