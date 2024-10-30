async function required({ context, ...issue }, ctx) {
  const { schema, locals } = ctx.runtime;
  const { ontology } = context;

  const { data: existingTags, error } = await locals.supabase
    .from("Tag")
    .select("*")
    .eq("runtimeId", ctx.runtime.manifest.id)
    .eq("data->ONTOLOGICAL->>branch", ontology.branch)
    .eq("data->ONTOLOGICAL->>leaf", ontology.leaf);

  if (error) {
    console.error("Error querying tags:", error);
    return { resolved: false, error };
  }

  if (existingTags.length !== 0) {
    return { resolved: true };
  }

  let tag = {
    slug: `${ontology.branch}:${ontology.leaf}`,
    traits: ["ONTOLOGICAL"],
    data: { ONTOLOGICAL: ontology },
    runtimeId: ctx.runtime.manifest.id,
  };

  if (ontology.branch === "lemma") {
    tag.name = `Lemma: ${ontology.leaf}`;
  } else if (!ontology.leaf) {
    const feat = schema.annotations[ontology.branch];
    tag.name = `Ontological Branch: ${feat.title}`;
    tag.slug = `${ontology.branch}:*`;
  } else {
    const feat = schema.annotations[ontology.branch];
    const enumVal = schema.meta[ontology.branch].enums[ontology.leaf];
    tag.name = `${feat.title}: ${enumVal.title}`;
  }

  const result = await locals.supabase.from("Tag").insert(tag).select("*").single();
  return { resolved: !result.error, tag, data: result.data, error: result.error };
}

export default {
  handlers: { required },
  path: ["tag"],
  children: [],
};
