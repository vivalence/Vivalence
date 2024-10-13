import { deepMerge } from "@vivalence/shared";

export default async function installables(runtime) {
  const schema = runtime.schema;
  let tags = [];

  for (const [branch, leafs] of Object.entries(schema.annotations)) {
    if (branch === "lemma") continue;
    tags.push(buildOntologicalTag({ branch }, runtime));

    for (const leaf of leafs.enum) {
      tags.push(buildOntologicalTag({ branch, leaf }, runtime));
    }
  }

  tags = await Promise.all(tags);

  return { tags };
}

async function buildOntologicalTag({ branch, leaf }, runtime) {
  const ONTOLOGICAL = { branch };
  if (leaf) ONTOLOGICAL.leaf = leaf;

  let tag = { traits: ["ONTOLOGICAL"], data: { ONTOLOGICAL } };
  const { error, slug } = await runtime.call("/identity/tag", { tag });
  if (error || !slug) throw new Error(error || "Failed to create tag identity.");
  tag.slug = slug;

  const config = runtime.schema.meta[branch]?.config;
  if (config) tag = applyConfig({ config, tag }, runtime);

  return tag;
}

function applyConfig({ config, tag }, runtime) {
  const { traits, data } = config?.tags?.[tag.slug] || {};

  if (traits) tag.traits = Array.from(new Set([...tag.traits, ...traits]));
  if (data) tag.data = deepMerge(tag.data, data);

  return tag;
}
