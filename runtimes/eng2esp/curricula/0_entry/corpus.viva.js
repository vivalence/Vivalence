import dependencies from "./dependencies/index.js";
// import units from "./units/index.js";

const units = [];
// const dependencies = [];

async function install(runtime, Corpus) {
  return true;

  for (const unit of units) {
    unit.corpusId = Corpus.manifest.id;
    const installed = await runtime.call("/install/unit", { unit });
  }

  for (const dependency of dependencies) {
    dependency.corpusId = Corpus.manifest.id;
    const installed = await runtime.call("/dependencies/install", { dependency });
    console.log("corpus dependency installed:", installed);
  }
  return false;
}

const manifest = {
  type: "Corpus",
  slug: "eng2esp.entry",
  name: "English to Spanish - Entry",
  version: "0.0.1",
};

export { manifest, install };
