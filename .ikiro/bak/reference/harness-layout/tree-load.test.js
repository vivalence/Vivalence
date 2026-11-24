import { shard, specimen, steer, Vector } from "@vivalence/typology";
import * as root from "../../../commons/harnesses/runtime/runtime-harness.viva.js";

const names = (tools) => shard.hallucinate.declarations(tools).map((tool) => tool.name);
const steps = (nature) => nature.split("/").filter(Boolean);
const load = (tools, modes, nature) => {
  const [type, slug, ...rest] = steps(nature);
  const found = steer.trie.at(modes[type][slug].tools, rest);
  if (!found) throw new Error(`no tools at ${nature}`);
  rest.reduce((tree, step) => tree.branch(`/${step}`), tools.branch(`/${type}/${slug}`)).graft(found);
};

specimen.describe("tool/load takes a tree or a leaf, one or many", () => {
  specimen.it("the runtime harness's real tools, addressed by type and slug", () => {
    const { type, slug } = root.manifest;
    const modes = { [type]: { [slug]: { tools: root.tools } } };
    const reference = `/${type}/${slug}`;
    for (const natures of [[`${reference}/fs`], [`${reference}/entity/count`, `${reference}/shell`], [reference]]) {
      const tools = new Vector();
      for (const nature of natures) load(tools, modes, nature);
      console.log(["", `load ${natures.join(" + ")}`, ...names(tools)].join("\n"));
    }
  });
});
