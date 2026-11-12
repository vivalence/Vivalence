import { belt, Controller, Mode, shape, shard, Span, specimen, steer, traits as trait, v, Vector } from "@vivalence/typology";
import { traits } from "@vivalence/runtime";
import { create } from "../../../systems/runtime/tests/scenarios/cortex.js";
import { textTurn, toolUseTurn } from "../../../commons/fixtures/testing/data/faculties.js";
const { PRIMER } = traits.mode;

const loading = (steps) => steps.findLast((step) => step.load)?.load ?? "eager";
const eager = (vector) => steer.trie.sieve(vector, (pattern, path) => loading(path) === "eager");

const load = new Vector().open(
  {
    nature: "/load",
    valence: 'Loads one listed mode: its primer and its tools arrive with your next round. Example: { path: "/harvest" }',
    input: v.object({ path: v.string().desc('A listed path. Example: "/harvest"') }),
  },
  async (ctx) => {
    Object.assign(ctx.thread, trait.patch(ctx.thread, { ARMED: { [ctx.input.path]: "eager" } }));
    return { condition: "ARMED", output: { message: `${ctx.input.path} loaded` } };
  },
);

const respond = async (faculty, compose, policy) => {
  let request = await compose();
  let turns = request.turns;
  while (true) {
    const turn = await faculty.via.render({ ...request, turns });
    if (belt.hallucinate.state(turn) !== "tools") return [...turns, turn];
    const settled = await belt.hallucinate.dispatch(policy, turn.parts);
    const parts = settled.map(({ call, result }) => ({ type: "tool_result", id: call.id, condition: result.condition, output: result.output }));
    turns = [...turns, turn, { role: "user", parts }];
    if (settled.some(({ result }) => result.condition === "ARMED")) request = await compose();
  }
};

specimen.describe("a load lands on the next round", () => {
  specimen.it("round 1 loads /harvest, round 2 calls its tool, round 3 answers", async () => {
    const scenario = await create();
    try {
      const { dewey } = scenario;
      dewey.module.primer = new Vector().open("dewey", "You are Dewey.");
      PRIMER(dewey);
      const harvest = new Mode({ manifest: { type: "tactics", slug: "harvest", description: "collects pages from the web", traits: ["PRIMER", "TOOLING"] } });
      harvest.module.primer = new Vector().open("archivist", "Cite every page you collect.");
      PRIMER(harvest);
      harvest.tools = new Vector().open(
        { nature: "/collect", valence: 'Collects pages. Example: { query: "congiuntivo" }', input: v.object({ query: v.string() }) },
        () => ({ output: { message: "3 pages" } }),
      );
      const thread = await scenario.createThread();
      const asked = [{ role: "user", parts: [{ type: "text", text: "find me three example sentences" }] }];

      const tools = () => {
        const armed = new Vector().use(shard.context.bind("thread", thread)).graft(load);
        armed.branch({ nature: "harvest", load: "lazy" }).graft(harvest.tools);
        for (const [path, state] of Object.entries(thread.trait.ARMED ?? {})) armed.branch({ nature: path, load: state });
        return armed;
      };
      const primer = () => {
        const held = new Vector().graft(dewey.primer);
        held.branch({ nature: "harvest", load: "lazy" }).graft(harvest.primer);
        for (const [path, state] of Object.entries(thread.trait.ARMED ?? {})) held.branch({ nature: path.slice(1), load: state });
        return held;
      };
      const policy = { controller: new Controller({ stdout: new Span("probe") }) };
      const compose = async () => {
        policy.tools = tools();
        return { system: await shape.primer.load(primer()), turns: asked, tools: shard.hallucinate.declarations(eager(policy.tools)) };
      };

      const received = [];
      const scripted = [
        () => toolUseTurn("t1", "load", { path: "/harvest" }),
        () => toolUseTurn("t2", "harvest_collect", { query: "congiuntivo" }),
        () => textTurn("Here are three sentences."),
      ];
      const faculty = { via: { render: (request) => { received.push(request); return scripted[received.length - 1](); } } };
      policy.controller.start();
      const turns = await respond(faculty, compose, policy);
      policy.controller.stop();

      received.forEach((request, index) => console.log(`\n## round ${index + 1}: system · tools\n${JSON.stringify({ system: request.system, tools: request.tools.map((tool) => tool.name) }, null, 2)}`));
      console.log(`\n## round 3: the Request, whole\n${JSON.stringify(received[2], null, 2)}`);
      console.log(`\n## thread.traits · thread.trait\n${JSON.stringify({ traits: thread.traits, trait: thread.trait }, null, 2)}`);
      specimen.expect(received[0].tools.map((tool) => tool.name)).toEqual(["load"]);
      specimen.expect(received[1].tools.map((tool) => tool.name)).toEqual(["load", "harvest_collect"]);
      specimen.expect(received[1].system["harvest/archivist"]).toBe("Cite every page you collect.");
      specimen.expect(received[2].system).toEqual(received[1].system);
      specimen.expect(turns.at(-1).parts[0].text).toBe("Here are three sentences.");
    } finally {
      await scenario.orm.close();
    }
  });
});
