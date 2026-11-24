import { shape, steer, v, Vector } from "@vivalence/typology";

const { Selector, Tier } = v.primitives.hallucination;
const Harnessed = v.object({
  ...Selector,
  tier: Tier.default("capable"),
  effort: v.enum(["none", "low", "medium", "high"]).default("low"),
  rounds: v.integer({ minimum: 1, maximum: 100 }).default(12),
  thinking: v.boolean().optional(),
});
console.log(JSON.stringify(Harnessed.cast({ provider: "anthropic" })), [...Harnessed.errors(Harnessed.cast({}))].length);

const noop = () => null;
const armory = new Vector();
armory.branch("/service/nlp").open("/lemma", noop).open("/parse", noop);
armory.branch("/memo").open("/deal", noop).open("/grade", noop);
armory.branch("/repl").open("/open", noop).open("/quit", noop);
armory.open("/speak", noop);

const natures = (path) => path.map((pattern) => `/${pattern.nature}`).join("");
const paths = (vector) => steer.trie.leaves(vector).map((leaf) => natures(leaf.steps));
console.log("whole ", paths(armory));

const Armed = v.object({ keep: v.array(v.string()).default([]) });
const armed = Armed.cast({ keep: ["/memo", "/repl/open", "/speak"] });
const within = (here, kept) => kept.startsWith(here) || here.startsWith(kept);
const pruned = steer.trie.sieve(armory, (pattern, path) => armed.keep.some((kept) => within(natures(path), kept)));
console.log("armed ", paths(pruned));
console.log("source", paths(armory).length);
