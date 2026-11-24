import { shape, shard, v, Vector } from "@vivalence/typology";
import { buildParams } from "../../../commons/hallucinators/anthropic/provider/translate.js";

const noop = () => null;
const primer = new Vector();
primer.branch("drill").open("role", () => "You run a drill.");
primer.branch("research").open("role", () => "You research the web. Cite every source.");
primer.open("available", () => "Load on demand with thread_arm { path }:\n/literal — rewrites a literal");

const tools = new Vector();
tools.branch("/drill").open({ nature: "/deal", valence: "Deals the next card. Returns { card }." }, noop);
tools.branch("/research").open(
  {
    nature: "/search",
    valence: 'Searches the web. Returns { results }. Example: { query: "congiuntivo" }',
    input: v.object({ query: v.string().desc('The search words. Example: "congiuntivo"') }),
  },
  noop,
);

const request = {
  system: await shape.primer.load(primer, {}),
  turns: [{ role: "user", parts: [{ type: "text", text: "find me three example sentences" }] }],
  tools: shard.hallucinate.declarations(tools),
  cache: { marks: ["available", "tools"] },
};
console.log("## typology Request\n" + JSON.stringify(request, null, 2));
console.log("## anthropic params\n" + JSON.stringify(buildParams({ id: "claude-sonnet-5-5" }, request, true), null, 2));
