import dependencies from "./dependencies/index.js";
import units from "./units/index.js";

async function install(runtime, Corpus) {
  for (const unit of units) {
    unit.corpusId = Corpus.manifest.id;
    const installed = await runtime.call("/install/unit", { unit });
  }

  for (const dependency of dependencies) {
    dependency.corpusId = Corpus.manifest.id;
    const installed = await runtime.call("/dependencies/install", { dependency });
    console.log("corpus dependency installed:", installed);
  }
  return true;
}

const manifest = {
  type: "corpus",
  slug: "eng2esp.entry",
  name: "English to Spanish - Entry",
  version: "0.0.2",
};

const curriculum = {
  units: [],
  tags: [],
  dependencies: [],
};

const modules = {
  games: [],
  tactics: [await import("./tactics/ontological-branch-introduction/tactic.viva.js")],
  strategies: [],
};

export { manifest, modules, curriculum, install };
