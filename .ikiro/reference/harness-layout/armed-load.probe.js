import { steer, v, Vector } from "@vivalence/typology";

const noop = () => null;
const system = new Vector();
system.branch("/drill").open("/deal", noop).open("/grade", noop);
system.branch("/literal").open("/rewrite", noop);
system.branch("/research").open("/search", noop).open("/fetch", noop);
system.branch("/repl").open("/open", noop).open("/quit", noop);
system.branch("/shell").open("/run", noop);

const Load = v.enum(["eager", "lazy", "none"]);
const Armed = v.record(v.string(), Load);

const steps = (path) => path.split("/").filter(Boolean);
const covers = (rule, tool) => steps(rule).every((step, index) => steps(tool)[index] === step);
const load = (armed, tool) =>
  Object.entries(armed)
    .filter(([rule]) => covers(rule, tool))
    .sort(([a], [b]) => steps(b).length - steps(a).length)[0]?.[1] ?? "none";

const natures = (path) => path.map((pattern) => `/${pattern.nature}`).join("");
const tools = steer.trie.leaves(system).map((leaf) => natures(leaf.steps));
const view = (armed) => ({
  eager: tools.filter((tool) => load(armed, tool) === "eager"),
  lazy: tools.filter((tool) => load(armed, tool) === "lazy"),
});

const mode = Armed.cast({ "/drill": "eager", "/literal": "lazy", "/research": "lazy", "/repl": "lazy" });
console.log("errors", [...Armed.errors(mode)].length, [...Armed.errors({ "/x": "soon" })].length);
console.log("mode default      ", JSON.stringify(view(mode)));
const thread = { "/research": "eager", "/repl/quit": "none" };
console.log("thread pulled     ", JSON.stringify(view({ ...mode, ...thread })));
const pruned = steer.trie.sieve(system, (pattern, path) =>
  tools.some((tool) => covers(natures(path), tool) && load({ ...mode, ...thread }, tool) === "eager"),
);
console.log("sieved, eager only", steer.trie.leaves(pruned).map((leaf) => natures(leaf.steps)));
