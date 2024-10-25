export default async function (body, ctx) {
  const { ontologies } = body;
  const issues = [];

  for (const ontology of ontologies) {
    const { data: tags, error } = await ctx.runtime.locals.supabase
      .from("Tag")
      .select("id")
      .eq("runtimeId", ctx.runtime.manifest.id)
      .eq("data->ONTOLOGICAL->>branch", ontology.branch)
      .eq("data->ONTOLOGICAL->>leaf", ontology.leaf);
    if (error) throw error;

    const issue = {
      path: ["tag"],
      context: { [ontology.branch]: ontology.leaf, tags, ontology },
    };
    if (tags.length === 0) {
      issues.push({
        ...issue,
        message: `Required tag with branch: '${ontology.branch}' and leaf: '${ontology.leaf}' missing.`,
        violation: "required",
      });
    } else if (tags.length > 1) {
      issues.push({
        ...issue,
        message: `Unique constraint violated on ontological tag ${ontology.branch}:${ontology.leaf}`,
        violation: "unique",
      });
    }
  }

  return issues;
}
