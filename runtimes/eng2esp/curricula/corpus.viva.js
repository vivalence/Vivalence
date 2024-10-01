import dependencies from "./installables/dependencies.js";
import nouns from "./installables/nouns.js";
import articles from "./installables/articles.js";

async function install(runtime, Corpus) {
  // const { data: tags } = await runtime.locals.supabase .from("Tag") .select("*, units: _TagToUnit(unit: B(*))") .eq("data->ONTOLOGICAL->>branch", "definite");
  // console.log(tags);
  // const units = tags .flatMap((tag) => tag.units) .map((unit) => unit.unit) .filter((unit) => unit.data.index) .sort((a, b) => a.data.index - b.data.index); .slice(0, 10);
  // console.log(JSON.stringify(units, null, 2));
  return true;

  for (const tag of dependencies) {
    tag.corpusId = Corpus.manifest.id;
    const installed = await runtime.call("/install/tag", { tag });
    console.log("corpus tag install:", installed);
  }

  for (const unit of [...articles, ...nouns]) {
    unit.corpusId = Corpus.manifest.id;
    const installed = await runtime.call("/install/unit", { unit });
  }
}

const manifest = {
  type: "Corpus",
  slug: "nounForm",
  name: "Noun Form",
  version: "0.0.4",
};

export { manifest, install };
