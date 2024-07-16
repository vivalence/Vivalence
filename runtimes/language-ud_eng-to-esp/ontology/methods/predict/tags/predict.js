// import { annotations } from "$classifier/ontology";
// i want to check that every annotation has all its enum values, stored as ontological tags in supabase

export default async function (input, locals) {
  const { ontologies } = input;
  const issues = [];

  for (const ontology of ontologies) {
    const { data: tags, error } = await locals.supabase
      .from("Tag")
      .select("id")
      .eq("data->ONTOLOGICAL->>branch", ontology.branch)
      .eq("data->ONTOLOGICAL->>leaf", ontology.leaf);

    const issue = {
      path: ["ontology", "tags"],
      context: {
        [ontology.branch]: ontology.leaf,
        tags,
        ontology: ontology,
      },
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
    } else {
    }
  }
  return {
    isValid: issues.length === 0,
    issues,
  };
}
