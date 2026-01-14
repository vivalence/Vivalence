import { Agent } from "@vivalence/typology";
import { Type } from "@sinclair/typebox";

async function required(issue, ctx) {
  const { daemon } = ctx;
  const annotation = issue.context.annotation;

  if (!annotation?.pos) {
    return issue.onError({ message: "Missing pos in annotation" });
  }

  const subjectSlug = annotation.pos;
  const literalSchema = daemon.schema.literals[subjectSlug];

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
    .withInput(Type.Object({ annotation: Type.Object({}) }))
    .withOutput(
      Type.Object({
        slug: Type.String(),
        annotation: Type.Object({}),
        data: Type.Object({
          translation: Type.Optional(Type.String()),
          example: Type.Optional(
            Type.Object({
              source: Type.Optional(Type.String()),
              target: Type.Optional(Type.String()),
            }),
          ),
        }),
        traits: Type.Array(Type.String()),
      }),
    );

  let literal;

  try {
    literal = await agent.generate({ annotation });

    // Generate slug if not provided
    if (!literal.slug) {
      literal.slug = generateSlug(annotation);
    }

    // Ensure annotation is set
    literal.annotation = annotation;

    // Validate generated literal
    const issues = await daemon.validate.literal(literal, ["SCHEMATIC"]);
    if (issues.length > 0) {
      return issue.onError({
        message: "Generated invalid literal",
        issues,
        literal,
      });
    }

    // Install the literal
    const created = await daemon.entities.literal.create(literal);
    await daemon.entities.em.flush();

    if (created) {
      return issue.resolve();
    }

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
  const parts = [annotation.lemma, annotation.pos];

  // Add other significant dimensions
  const significantDims = ["gender", "number", "tense", "mood", "person"];
  for (const dim of significantDims) {
    if (annotation[dim]) {
      parts.push(annotation[dim]);
    }
  }

  return parts.filter(Boolean).join("-").toLowerCase();
}

export default {
  handler: required,
  violation: "required",
  path: ["literal"],
};
