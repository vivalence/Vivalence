// import dependencies from "./dependencies/index.js";
import units from "./units/index.js";

async function install(runtime, Corpus) {
  console.log("installing eng2esp.entry");
  return true;

  for (const unit of units) {
    unit.corpusId = Corpus.manifest.id;
    const installed = await runtime.call("/install/unit", { unit });
  }

  for (const tag of dependencies) {
    tag.corpusId = Corpus.manifest.id;
    const installed = await runtime.call("/install/tag", { tag });
    console.log("corpus tag install:", installed);
  }
}

const manifest = {
  type: "Corpus",
  slug: "eng2esp.entry",
  name: "English to Spanish - Entry",
  version: "0.0.0",
};

export { manifest, install };
