async function required({ context, ...issue }, ctx) {
  console.log("remedy ctx", ctx);
  throw new Error("Needs annotations,&{ metas }");
  let tag = null;
  if (context.ontology.branch !== "lemma") {
    const feat = annotations[context.ontology.branch];
    const enumVal = metas[context.ontology.branch].enums[context.ontology.leaf];
    tag = {
      name: `${feat.title}: ${enumVal.title}`,
      type: ["ONTOLOGICAL"],
      data: { ONTOLOGICAL: context.ontology },
    };
  } else {
    tag = {
      name: `Lemma: ${context.ontology.leaf}`,
      type: ["ONTOLOGICAL"],
      data: { ONTOLOGICAL: context.ontology },
    };
  }

  const result = await ctx.locals.supabase.from("Tag").insert(tag);
  return { resolved: !!result.error, tag, error: result.error };
}

export default {
  handlers: { required },
  path: ["tags"],
  children: [],
};
