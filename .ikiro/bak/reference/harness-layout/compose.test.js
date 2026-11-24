import { shape, specimen, steer, v, Vector } from "@vivalence/typology";

const { Selector, Tier } = v.primitives.hallucination;
const Harnessed = v.object({
  ...Selector,
  tier: Tier.default("capable"),
  effort: v.enum(["none", "low", "medium", "high"]).default("low"),
  rounds: v.integer({ minimum: 1, maximum: 100 }).default(12),
  thinking: v.boolean().optional(),
});
const Armed = v.record(v.string(), v.enum(["eager", "lazy", "none"]));

const steps = (path) => path.split("/").filter(Boolean);
const covers = (rule, path) => steps(rule).every((step, index) => steps(path)[index] === step);
const load = (map, path) =>
  Object.entries(map)
    .filter(([rule]) => covers(rule, path))
    .sort(([a], [b]) => steps(b).length - steps(a).length)[0]?.[1] ?? "none";

const listing = (modes) =>
  modes.map((mode) => `/${mode.manifest.slug} — ${mode.manifest.description}`).join("\n");

const both = (ctx) => {
  const map = { ...ctx.mode.armed, ...ctx.thread.trait.ARMED };
  const primer = new Vector();
  const tools = new Vector();
  const state = (mode) => load(map, `/${mode.manifest.slug}`);
  for (const mode of ctx.modes.filter((mode) => state(mode) === "eager")) {
    primer.branch(mode.manifest.slug).graft(mode.primer);
    tools.branch(`/${mode.manifest.slug}`).graft(mode.tools);
  }
  const listed = ctx.modes.filter((mode) => state(mode) === "lazy");
  if (listed.length) primer.open("available", () => `Load on demand with thread_arm { path }:\n${listing(listed)}`);
  return { primer, tools };
};

const toolsOnly = (ctx) => {
  const map = { ...ctx.mode.armed, ...ctx.thread.trait.ARMED };
  const primer = new Vector().graft(ctx.mode.primer);
  const tools = new Vector();
  const state = (mode) => load(map, `/${mode.manifest.slug}`);
  for (const mode of ctx.modes.filter((mode) => mode !== ctx.mode))
    primer.branch({ nature: mode.manifest.slug, load: "lazy" }).graft(mode.primer);
  for (const mode of ctx.modes.filter((mode) => state(mode) === "eager"))
    tools.branch(`/${mode.manifest.slug}`).graft(mode.tools);
  const listed = ctx.modes.filter((mode) => state(mode) === "lazy");
  if (listed.length) primer.open("available", () => `Load on demand with thread_arm { path }:\n${listing(listed)}`);
  return { primer, tools };
};

const noop = () => null;
const mode = (slug, description, role, names, armed) => ({
  manifest: { slug, description },
  primer: new Vector().open("role", () => role),
  tools: names.reduce((tools, name) => tools.open(name, noop), new Vector()),
  armed,
});
const drill = mode("drill", "deals and grades drill cards", "You run a drill.", ["/deal", "/grade"], {
  "/drill": "eager",
  "/research": "lazy",
  "/literal": "lazy",
});
const research = mode("research", "searches and reads the web", "You research the web. Cite every source.", ["/search", "/fetch"]);
const literal = mode("literal", "rewrites a literal", "You rewrite literals.", ["/rewrite"]);
const shell = mode("shell", "runs shell commands", "You run commands.", ["/run"]);
const modes = [drill, research, literal, shell];

const thread = (ARMED) => ({
  id: "01a1b609-5607-741b-98df-9899bdc62e02",
  user: "01a1b1c0-d3b4-724a-9452-32d250140280",
  mode: "01a1b1c0-f0c1-7559-a38c-d59d34854a75",
  phase: "manual",
  traits: ["HARNESSED", "ARMED"],
  trait: { HARNESSED: Harnessed.cast({}), ARMED: Armed.cast(ARMED) },
  counter: 0,
  parent: null,
});
const names = (vector) => steer.trie.leaves(vector).map((leaf) => leaf.steps.map((pattern) => `/${pattern.nature}`).join(""));
const request = async (compose, held) => {
  const { primer, tools } = compose({ mode: drill, modes, thread: held });
  return { system: await shape.primer.load(primer, {}), tools: names(tools) };
};
const print = (label, value) => console.log(`\n## ${label}\n${JSON.stringify(value, null, 2)}`);

specimen.describe("the map covers both", () => {
  specimen.it("a pull brings a mode's tools and its primer together", async () => {
    const before = await request(both, thread({}));
    const pulled = thread({ "/research": "eager" });
    const after = await request(both, pulled);
    print("thread, pulled", pulled);
    print("both · before", before);
    print("both · after", after);

    specimen.expect(before.tools).toEqual(["/drill/deal", "/drill/grade"]);
    specimen.expect(Object.keys(before.system)).toEqual(["drill/role", "available"]);
    specimen.expect(after.tools).toEqual(["/drill/deal", "/drill/grade", "/research/search", "/research/fetch"]);
    specimen.expect(after.system["research/role"]).toBe("You research the web. Cite every source.");
    specimen.expect(after.system.available.includes("/shell")).toBe(false);
  });
});

specimen.describe("the map covers tools only", () => {
  specimen.it("a pull brings a mode's tools; its primer stays a read away", async () => {
    const before = await request(toolsOnly, thread({}));
    const after = await request(toolsOnly, thread({ "/research": "eager" }));
    print("tools only · before", before);
    print("tools only · after", after);

    specimen.expect(after.tools).toEqual(["/drill/deal", "/drill/grade", "/research/search", "/research/fetch"]);
    specimen.expect(after.system["research/role"]).toBe(undefined);
    specimen.expect(after.system.primer.includes("research/role")).toBe(true);
  });
});
