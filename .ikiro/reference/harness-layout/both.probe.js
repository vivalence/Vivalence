import { shape, steer, Vector } from "@vivalence/typology";

const noop = () => null;
const modes = {
  drill: { tools: new Vector().open("/deal", noop).open("/grade", noop), primer: new Vector().open("role", () => "You run a drill.") },
  research: { tools: new Vector().open("/search", noop).open("/fetch", noop), primer: new Vector().open("role", () => "You research the web. Cite every source.") },
  literal: { tools: new Vector().open("/rewrite", noop), primer: new Vector().open("role", () => "You rewrite literals.") },
};
const names = (vector) => steer.trie.leaves(vector).map((leaf) => leaf.steps.map((pattern) => `/${pattern.nature}`).join(""));

const compose = async (map, covers) => {
  const tools = new Vector();
  const primer = new Vector();
  const listed = [];
  for (const [slug, mode] of Object.entries(modes)) {
    const load = map[`/${slug}`] ?? "none";
    if (load === "eager") tools.branch(`/${slug}`).graft(mode.tools);
    if (load === "lazy") listed.push(`/${slug}`);
    if (covers === "tools") primer.branch({ nature: slug, load: slug === "drill" ? undefined : "lazy" }).graft(mode.primer);
    else if (load === "eager") primer.branch(slug).graft(mode.primer);
  }
  return { system: await shape.primer.load(primer, {}), tools: names(tools), listed };
};

const before = { "/drill": "eager", "/research": "lazy", "/literal": "lazy" };
const after = { ...before, "/research": "eager" };
for (const covers of ["both", "tools"])
  for (const [moment, map] of [["before", before], ["after the pull", after]])
    console.log(covers, "·", moment, JSON.stringify(await compose(map, covers), null, 2));
