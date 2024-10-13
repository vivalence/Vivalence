import schema from "./schema/index.js";

import predictables from "./schema/predictables/index.js";

async function install(runtime) {
  // let { units, tags } = predictables(runtime);
  // console.log("installing", tags);
  return true;

  const [annotations, unitRest] = units.reduce(
    (acc, unit) => (unit.annotation ? acc[0].push(unit.annotation) : acc[1].push(unit), acc),
    [[], []],
  );
  const [ontologies, tagRest] = tags.reduce(
    (acc, tag) => (tag.ontology ? acc[0].push(tag.ontology) : acc[1].push(tag), acc),
    [[], []],
  );

  const issues = (
    await Promise.all([
      runtime.call("/diagnostics/predict/tags", { ontologies }),
      runtime.call("/diagnostics/predict/units", { annotations }),
    ])
  ).flat();

  const remedies = [];
  for (const issue of issues) {
    const remedy = await runtime.call("/remedy", { issue });
    remedies.push(remedy);
  }

  return remedies.every((remedy) => remedy.resolved) && [...tagRest, ...unitRest].length === 0;
}

const manifest = {
  type: "Corpus",
  slug: "eng-to-esp",
  name: "English to Spanish",
  version: "0.0.0",
};

export { manifest, schema, install };
