import { Agent } from "@vivalence/typology";
import { Type } from "@sinclair/typebox";

async function required(issue, ctx) {
  const { daemon } = ctx;
  console.json({ issue });
  const annotation = issue.context.literal.annotation;

  if (!annotation?.pos) {
    return issue.onError({ message: "Missing pos in annotation" });
  }

  const subjectSlug = annotation.pos;
  const literalSchema = daemon.schema.literals[subjectSlug];
  const annotationSchema = daemon.schema.annotations[subjectSlug];

  if (!literalSchema) {
    return issue.onError({ message: `No schema for subject: ${subjectSlug}` });
  }

  const agent = new Agent("literal-generator", "Literal Generator")
    .withBrain(daemon.hallucinator)
    .enhance(
      `### Identity
    You are inside viva, the agentic symbolic intelligence operating system.
    Be a helpful, concise and diligent agent.`,
    )
    .enhance(
      `### Task: Generate Literal
    Given a linguistic annotation, generate a complete literal entry with:
    - slug: unique identifier based on annotation
    - annotation: the provided annotation
    - data: containing translations, examples, and learning materials
    - traits: relevant traits for the literal`,
    )
    .enhance(`### Context ${JSON.stringify(issue.context, null, 2)}`)
    .withInput(daemon.schema.annotation)
    .withOutput(literalSchema);

  let literal;

  try {
    literal = await agent.generate({ annotation });

    literal.slug = generateSlug(annotation);
    literal.annotation = annotation;

    const issues = await daemon.validate.literal(literal, ["SCHEMATIC"]);

    if (issues.length > 0) {
      return issue.onError({
        message: "Generated invalid literal",
        issues,
        literal,
      });
    }

    const created = await daemon.entities.literal.create(literal);
    await daemon.entities.em.flush();

    if (created) return issue.resolve();

    return issue.onError({ message: "Failed to create literal", literal });
  } catch (error) {
    console.error("[REMEDY ERROR] literal:required");
    console.error(error);
    return issue.onError({
      message: error.message,
      error,
      literal,
      annotation,
    });
  }
}

function generateSlug(annotation) {
  const parts = [];

  for (const [branch, leaf] of Object.entries(annotation)) {
    parts.push(`${branch}:${leaf}`);
  }

  return parts.filter(Boolean).join("-").toLowerCase();
}

export default {
  handler: required,
  violation: "required",
  path: ["literal"],
};
