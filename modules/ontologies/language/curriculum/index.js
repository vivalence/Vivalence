import { deepMerge } from "@vivalence/shared";

export default async function curriculum(runtime) {
  let tags = [];

  for (const [branch, leafs] of Object.entries(runtime.schema.annotations)) {
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

  const config = runtime.schema.meta[branch]?.config?.tags;
  if (config) tag = applyConfig({ config, tag }, runtime);

  if (!tag.name) tag.name = nameTag(tag, runtime);

  return tag;
}

function applyConfig({ config, tag }, runtime) {
  const { traits, data, name, description } = config?.[tag.slug] || {};

  if (traits) tag.traits = Array.from(new Set([...tag.traits, ...traits]));
  if (data) tag.data = deepMerge(tag.data, data);
  if (name) tag.name = name;
  if (description) tag.description = description;

  return tag;
}

function nameTag(tag, runtime) {
  const annotation = runtime.schema.annotations[tag.data.ONTOLOGICAL.branch];
  const meta = runtime.schema.meta[tag.data.ONTOLOGICAL.branch];

  if (meta?.config?.tags?.[tag.slug]?.name) return meta.config.tags[tag.slug].name;

  const leafTitle = meta?.enums?.[tag.data.ONTOLOGICAL.leaf]?.title;

  if (!leafTitle) return `Ontological Branch: ${annotation.title}`;

  return `${annotation.title}: ${leafTitle}`;
}
