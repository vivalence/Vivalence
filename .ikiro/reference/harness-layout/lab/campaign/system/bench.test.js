import { fromm, Path, shard, specimen, steer, ToolCall, Vector } from "@vivalence/typology";
import { bench } from "/Users/finn/vivalence/code/vivalence/systems/runtime/tests/scenarios/bench.js";
import * as harness from "/Users/finn/vivalence/code/vivalence/commons/harnesses/runtime/runtime-harness.viva.js";
import { snapshot } from "../lib/fixture.js";
import { print } from "../lib/world.js";
import { tool } from "../lib/copied/load.js";
import { modes } from "../lib/copied/resolve.js";
import { primer } from "../lib/copied/primer-reference.js";

const SNAP = new URL("../snapshots/system", import.meta.url).pathname;
const IDS = ["@education/tactic/harvest", "@education/game/nyan", "@education/game/cloze", "@education/teacher/francesca"];

specimen.describe("L4 system — the design's tools over REAL daemon lifecycles (bench, in-process)", () => {
  let education;
  let runtime;
  specimen.beforeAll(async () => {
    education = await bench({ modes: IDS });
    education.daemon.mask.reference = new Path("/daemon/education");
    runtime = {
      reference: "/runtime/runtime",
      modes: { [harness.manifest.type]: { [harness.manifest.slug]: { manifest: harness.manifest, tools: harness.tools, primer: harness.primer } } },
      daemons: { education: education.daemon },
    };
  });
  specimen.afterAll(async () => {
    await education?.teardown();
  });

  specimen.it("the real modes after population: which carry tools · primer", () => {
    const table = fromm.modes(education.daemon.modes).flat.map((mode) => ({
      reference: `${education.daemon.reference}/mode/${mode.manifest.type}/${mode.manifest.slug}`,
      traits: mode.manifest.traits,
      tools: mode.tools ? steer.trie.leaves(mode.tools).length : null,
      primer: mode.primer ? steer.trie.leaves(mode.primer).length : null,
    }));
    print("real daemon modes", table);
    specimen.expect(table.length).toBe(IDS.length);
  });

  const mounted = (thread) => {
    const francesca = education.daemon.modes.teacher.francesca;
    const tools = new Vector().graft(modes, tool, primer);
    tools
      .use(shard.context.bind("tools", tools))
      .use(shard.context.bind("runtime", runtime))
      .use(shard.context.bind("daemon", education.daemon))
      .use(shard.context.bind("mode", francesca))
      .use(shard.context.bind("thread", thread))
      .use(shard.context.bind("entities", { em: { flush: async () => {} } }));
    return (name, input) => steer.dispatch.invoke(tools, new ToolCall(name), steer.strategy.guarded)(input);
  };

  const attempt = async (call, name, input) => {
    try {
      const result = await call(name, input);
      return { ok: true, result };
    } catch (error) {
      return { ok: false, fault: `${error.name}: ${error.message}` };
    }
  };

  specimen.it("modes_index · tool_load · primer_load on '/daemon/education' and '/teacher/francesca' (Q21 · Q24)", async () => {
    const thread = { trait: { TOOLED: {}, PRIMED: {} } };
    const call = mounted(thread);
    const runs = [];
    for (const [name, input] of [
      ["modes_index", { reference: "/daemon/education", detail: "outline" }],
      ["tool_load", { references: ["/teacher/francesca"] }],
      ["primer_load", { references: ["/teacher/francesca"] }],
      ["tool_load", { references: ["/daemon/education"] }],
      ["primer_load", { references: ["/daemon/education"] }],
    ]) {
      const outcome = await attempt(call, name, input);
      runs.push({ name, input, ok: outcome.ok, fault: outcome.fault ?? null, chars: outcome.ok ? JSON.stringify(outcome.result.output).length : 0, trait: structuredClone(thread.trait) });
      snapshot(SNAP, `bench ${name} ${JSON.stringify(input).replaceAll("/", "~")}`, outcome);
    }
    print("real daemon · five calls", runs);
    specimen.expect(runs.filter((run) => !run.ok)).toEqual([]);
  });
});
