import { shape, shard, specimen, v, Vector } from "@vivalence/typology";

const steps = (path) => path.split("/").filter(Boolean);
const covers = (rule, path) => steps(rule).every((step, index) => steps(path)[index] === step);
const load = (map, path) =>
  Object.entries(map)
    .filter(([rule]) => covers(rule, path))
    .sort(([a], [b]) => steps(b).length - steps(a).length)[0]?.[1] ?? "none";

const siblings = (ctx) => ctx.modes.filter((sibling) => sibling !== ctx.mode);
const arm = new Vector().open(
  { nature: "/thread/arm", valence: "Loads one listed mode into this thread.", input: v.object({ path: v.string() }) },
  () => null,
);
const read = new Vector().open({ nature: "/primer/read", input: v.object({ nature: v.string() }) }, () => null);
const listing = (modes) => modes.map((mode) => `/${mode.manifest.slug} — ${mode.manifest.description}`).join("\n");

const A = (ctx) => {
  const map = { ...ctx.mode.armed, ...ctx.thread.trait.ARMED };
  const state = (sibling) => load(map, `/${sibling.manifest.slug}`);
  const primer = new Vector().graft(ctx.mode.primer);
  const armed = new Vector().graft(ctx.mode.tools);
  for (const sibling of siblings(ctx).filter((sibling) => state(sibling) === "eager")) {
    primer.branch(sibling.manifest.slug).graft(sibling.primer);
    armed.branch(sibling.manifest.slug).graft(sibling.tools);
  }
  const listed = siblings(ctx).filter((sibling) => state(sibling) === "lazy");
  if (listed.length) {
    primer.open("available", () => `Load on demand with thread_arm { path }:\n${listing(listed)}`);
    armed.graft(arm);
  }
  return { primer, armed };
};

const B = (ctx) => {
  const map = { ...ctx.mode.armed, ...ctx.thread.trait.ARMED };
  const state = (sibling) => load(map, `/${sibling.manifest.slug}`);
  const primer = new Vector().graft(ctx.mode.primer);
  const armed = new Vector().graft(ctx.mode.tools);
  for (const sibling of siblings(ctx)) primer.branch({ nature: sibling.manifest.slug, load: "lazy" }).graft(sibling.primer);
  for (const sibling of siblings(ctx).filter((sibling) => state(sibling) === "eager"))
    armed.branch(sibling.manifest.slug).graft(sibling.tools);
  const listed = siblings(ctx).filter((sibling) => state(sibling) === "lazy");
  if (listed.length) {
    primer.open("available", () => `Load on demand with thread_arm { path }:\n${listing(listed)}`);
    armed.graft(arm);
  }
  if (shape.primer.lazy(primer).length) armed.graft(read);
  return { primer, armed };
};

const noop = () => null;
const mode = (slug, description, role, names, armed) => ({
  manifest: { slug, description },
  primer: new Vector().open("role", () => role),
  tools: names.reduce((tools, name) => tools.open(name, noop), new Vector()),
  armed,
});
const drill = mode("drill", "deals and grades drill cards", "You run a drill.", ["/deal", "/grade"], {
  "/research": "lazy",
  "/literal": "lazy",
});
const modes = [
  drill,
  mode("research", "searches and reads the web", "You research the web. Cite every source.", ["/search", "/fetch"]),
  mode("literal", "rewrites a literal", "You rewrite literals.", ["/rewrite"]),
  mode("shell", "runs shell commands", "You run commands.", ["/run"]),
];
const request = async (compose, ARMED) => {
  const { primer, armed } = compose({ mode: drill, modes, thread: { trait: { ARMED } } });
  return { system: await shape.primer.load(primer, {}), tools: shard.hallucinate.declarations(armed).map((tool) => tool.name) };
};
const print = (label, value) => console.log(`\n## ${label}\n${JSON.stringify(value, null, 2)}`);

specimen.describe("Q6B", () => {
  specimen.it("A: a pull brings a sibling's primer with its tools", async () => {
    const after = await request(A, { "/research": "eager" });
    print("A before", await request(A, {}));
    print("A after", after);
    specimen.expect(after.system["research/role"]).toBe("You research the web. Cite every source.");
    specimen.expect(after.tools).toEqual(["deal", "grade", "research_search", "research_fetch", "thread_arm"]);
  });
  specimen.it("B: a pull brings a sibling's tools; its primer stays a read away", async () => {
    const after = await request(B, { "/research": "eager" });
    print("B before", await request(B, {}));
    print("B after", after);
    specimen.expect(after.system["research/role"]).toBe(undefined);
    specimen.expect(after.system.primer.includes("shell/role")).toBe(true);
  });
});
