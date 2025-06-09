import required from "./required.js";

export default [required];

// async function required({ context, ...issue }, ctx) {
//   const { schema, locals } = ctx.runtime;
//   const { ontology } = context;

//   const { data: existingTags, error } = await locals.supabase
//     .from("Tag")
//     .select("*")
//     .eq("runtimeId", ctx.runtime.manifest.id)
//     .eq("data->ONTOLOGICAL->>branch", ontology.branch)
//     .eq("data->ONTOLOGICAL->>leaf", ontology.leaf);

//   if (error) {
//     console.error("Error querying tags:", error);
//     return { resolved: false, error };
//   }

//   if (existingTags.length !== 0) {
//     return { resolved: true };
//   }

//   let tag = {
//     slug: `${ontology.branch}:${ontology.leaf}`,
//     traits: ["ONTOLOGICAL"],
//     data: { ONTOLOGICAL: ontology },
//     runtimeId: ctx.runtime.manifest.id,
//   };

//   if (ontology.branch === "lemma") {
//     tag.name = `Lemma: ${ontology.leaf}`;
//   } else if (!ontology.leaf) {
//     const feat = schema.annotations[ontology.branch];
//     tag.name = `Ontological Branch: ${feat.title}`;
//     tag.slug = `${ontology.branch}:*`;
//   } else {
//     const feat = schema.annotations[ontology.branch];
//     const enumVal = schema.meta[ontology.branch].enums[ontology.leaf];
//     tag.name = `${feat.title}: ${enumVal.title}`;
//   }

//   const result = await locals.supabase.from("Tag").insert(tag).select("*").single();
//   return { resolved: !result.error, tag, data: result.data, error: result.error };
// }

// export default {
//   handlers: { required },
//   path: ["tag"],
//   children: [],
// };

// import { deepMerge } from "@vivalence/shared";

// export default async function curriculum(runtime) {
//   let tags = [];

//   for (const [branch, leafs] of Object.entries(runtime.schema.annotations)) {
//     if (branch === "lemma") continue;
//     tags.push(buildOntologicalTag({ branch }, runtime));

//     for (const leaf of leafs.enum) {
//       tags.push(buildOntologicalTag({ branch, leaf }, runtime));
//     }
//   }

//   tags = await Promise.all(tags);

//   return { tags };
// }

// async function buildOntologicalTag({ branch, leaf }, runtime) {
//   const ONTOLOGICAL = { branch };
//   if (leaf) ONTOLOGICAL.leaf = leaf;

//   let tag = { traits: ["ONTOLOGICAL"], data: { ONTOLOGICAL } };

//   const { error, slug } = await runtime.call("/identity/tag", { tag });
//   if (error || !slug) throw new Error(error || "Failed to create tag identity.");
//   tag.slug = slug;

//   const config = runtime.schema.meta[branch]?.config?.tags;
//   if (config) tag = applyConfig({ config, tag }, runtime);

//   if (!tag.name) tag.name = nameTag(tag, runtime);

//   return tag;
// }

// function applyConfig({ config, tag }, runtime) {
//   const { traits, data, name, description } = config?.[tag.slug] || {};

//   if (traits) tag.traits = Array.from(new Set([...tag.traits, ...traits]));
//   if (data) tag.data = deepMerge(tag.data, data);
//   if (name) tag.name = name;
//   if (description) tag.description = description;

//   return tag;
// }

// function nameTag(tag, runtime) {
//   const annotation = runtime.schema.annotations[tag.data.ONTOLOGICAL.branch];
//   const meta = runtime.schema.meta[tag.data.ONTOLOGICAL.branch];

//   if (meta?.config?.tags?.[tag.slug]?.name) return meta.config.tags[tag.slug].name;

//   const leafTitle = meta?.enums?.[tag.data.ONTOLOGICAL.leaf]?.title;

//   if (!leafTitle) return `Ontological Branch: ${annotation.title}`;

//   return `${annotation.title}: ${leafTitle}`;
// }
