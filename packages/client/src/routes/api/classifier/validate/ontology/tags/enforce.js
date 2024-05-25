import { annotations } from "$classifier/ontology";
// i want to check that every annotation has all its enum values, stored as ontological tags in supabase

export default async function (locals) {
    const issues = [];
    for (const [featKey, feat] of Object.entries(annotations)) {
        if (featKey === "lemma") continue;
        for (const option of feat.enum) {
            const ontology = {
                branch: featKey,
                leaf: option
            };
            const { data: tags, error } = await locals.supabase
                .from("Tag")
                .select("id")
                .eq("data->ONTOLOGICAL->>branch", ontology.branch)
                .eq("data->ONTOLOGICAL->>leaf", ontology.leaf);

            const issue = {
                path: ["ontology", "tags"],
                context: {
                    [featKey]: feat,
                    tags,
                    ontology
                }
            };
            if (tags.length === 0) {
                issues.push({
                    ...issue,
                    message: `Required tag with branch: '${featKey}' and leaf: '${option}' missing.`,
                    violation: "required"
                });
            } else if (tags.length > 1) {
                issues.push({
                    ...issue,
                    message: `Unique constraint violated on ontological tag ${featKey}:${option}`,
                    violation: "unique"
                });
            } else {
            }
        }
    }
    return {
        isValid: issues.length === 0,
        issues
    };
}
