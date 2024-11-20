import dependencies from "./dependencies/index.js";
import units from "./units/index.js";

async function install(runtime, Corpus) {
  for (const unit of units) {
    unit.corpusId = Corpus.manifest.id;
    const installed = await runtime.call("/units/install", { unit });
  }

  for (const dependency of dependencies) {
    dependency.corpusId = Corpus.manifest.id;
    const installed = await runtime.call("/dependencies/install", { dependency });
  }

  return true;
}

const manifest = {
  type: "corpus",
  slug: "eng2esp.entry",
  name: "English to Spanish - Entry",
  icon: { emoji: "📚" },
  version: "0.0.4",
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
