async function required({ context, ...issue }, ctx) {
  const { schema, locals } = ctx.runtime;
  const { ontology } = context;

  const { data: existingTags, error } = await locals.supabase
    .from("Tag")
    .select("*")
    .eq("data->ONTOLOGICAL->>branch", ontology.branch)
    .eq("data->ONTOLOGICAL->>leaf", ontology.leaf);

  if (error) {
    console.error("Error querying tags:", error);
    return { resolved: false, error };
  }

  if (existingTags.length !== 0) {
    return { resolved: true };
  }

  let tag = null;
  if (ontology.branch !== "lemma") {
    const feat = schema.annotations[ontology.branch];
    const enumVal = schema.meta[ontology.branch].enums[ontology.leaf];
    tag = {
      name: `${feat.title}: ${enumVal.title}`,
      type: ["ONTOLOGICAL"],
      data: { ONTOLOGICAL: ontology },
    };
  } else {
    tag = {
      name: `Lemma: ${ontology.leaf}`,
      type: ["ONTOLOGICAL"],
      data: { ONTOLOGICAL: ontology },
    };
  }

  const result = await locals.supabase.from("Tag").insert(tag);
  return { resolved: !result.error, tag, error: result.error };
}

export default {
  handlers: { required },
  path: ["tag"],
  children: [],
};
