import { Agent } from "@vivalence/typology";

async function required(issue, ctx) {
  const { daemon } = ctx;
  const literal = issue.context.literal;
  const annotation = literal?.annotation;

  if (!annotation?.pos) {
    return issue.onError({ message: "Missing pos in annotation" });
  }

  if (!literal.slug) {
    literal.slug = generateSlug(annotation);
  }

  const diagnosis = await daemon.validate.literal(literal, ["SCHEMATIC"]);

  if (diagnosis.length === 0) {
    return await install(literal, issue, daemon);
  }

  const repaired = repair(literal, diagnosis);

  if (repaired) {
    const recheck = await daemon.validate.literal(repaired, ["SCHEMATIC"]);
    if (recheck.length === 0) {
      return await install(repaired, issue, daemon);
    }
  }

  return await generate(literal, annotation, issue, daemon);
}

async function install(literal, issue, daemon) {
  try {
    const created = await daemon.entities.literal.create(literal);
    await daemon.entities.em.flush();

    if (created) return issue.resolve();
    return issue.onError({ message: "Failed to create literal", literal });
  } catch (error) {
    return issue.onError({ message: error.message, error, literal });
  }
}

function repair(literal, issues) {
  const patched = structuredClone(literal);
  let touched = false;

  for (const issue of issues) {
    const path = issue.path?.join(".");

    if (path === "name" && !patched.name && patched.annotation?.lemma) {
      patched.name = patched.annotation.lemma;
      touched = true;
    }

    if (path === "slug" && !patched.slug) {
      patched.slug = generateSlug(patched.annotation);
      touched = true;
    }
  }

  return touched ? patched : null;
}

async function generate(literal, annotation, issue, daemon) {
  const subjectSlug = annotation.pos;
  const literalSchema = daemon.schema.literals[subjectSlug];

  if (!literalSchema) {
    return issue.onError({ message: `No schema for subject: ${subjectSlug}` });
  }

  const schema = structuredClone(literalSchema);
  if (schema.properties?.annotation?.allOf) {
    delete schema.properties.annotation.allOf;
  }

  const agent = new Agent("literal-generator", "Literal Generator")
    .withBrain(daemon.hallucinator)
    .withInput(daemon.schema.annotation)
    .withOutput(schema)
    .enhance(
      `### Identity
    You are inside viva, the agentic symbolic intelligence operating system.
    Be a helpful, concise and diligent agent.`,
    )
    .enhance(
      `### Task: Generate Literal
    Given a linguistic annotation, generate a complete literal entry.`,
    )
    .enhance(`### Context ${JSON.stringify(issue.context)}`)
    .enhance(`### Full Schema ${JSON.stringify(schema)}`);

  try {
    const generated = await agent.generate({ annotation });
    generated.slug = generateSlug(annotation);
    generated.annotation = annotation;

    const validation = await daemon.validate.literal(generated, ["SCHEMATIC"]);

    if (validation.length > 0) {
      return issue.onError({
        message: "Agent generated invalid literal",
        issues: validation,
        literal: generated,
      });
    }

    return await install(generated, issue, daemon);
  } catch (error) {
    return issue.onError({ message: error.message, error, annotation });
  }
}

function generateSlug(annotation) {
  return Object.entries(annotation)
    .map(([k, v]) => `${k}:${v}`)
    .filter(Boolean)
    .join("-")
    .toLowerCase();
}

export default {
  handler: required,
  violation: "required",
  path: ["literal"],
};
// import { Agent } from "@vivalence/typology";
// import { Type } from "@sinclair/typebox";

// async function required(issue, ctx) {
//   const { daemon } = ctx;
//   const annotation = issue.context.literal.annotation;

//   console.log("[literal/required] issue");
//   console.json(issue);

//   if (!annotation?.pos) {
//     return issue.onError({ message: "Missing pos in annotation" });
//   }

//   const subjectSlug = annotation.pos;
//   const literalSchema = daemon.schema.literals[subjectSlug];
//   const annotationSchema = daemon.schema.annotations[subjectSlug];

//   if (!literalSchema) {
//     return issue.onError({ message: `No schema for subject: ${subjectSlug}` });
//   }

//   const agent = new Agent("literal-generator", "Literal Generator")
//     .withBrain(daemon.hallucinator)
//     .withInput(daemon.schema.annotation)
//     .enhance(
//       `### Identity
//     You are inside viva, the agentic symbolic intelligence operating system.
//     Be a helpful, concise and diligent agent.`,
//     )
//     .enhance(
//       `### Task: Generate Literal
//     Given a linguistic annotation, generate a complete literal entry with:
//     - slug: unique identifier based on annotation
//     - annotation: the provided annotation
//     - data: containing translations, examples, and learning materials
//     - traits: relevant traits for the literal`,
//     )
//     .enhance(`### Context ${JSON.stringify(issue.context)}`)
//     .enhance(
//       `### Full Schema (including conditionals) ${JSON.stringify(literalSchema)}`,
//     );

//   if (literalSchema.properties.annotation.allOf)
//     delete literalSchema.properties.annotation.allOf;

//   agent.withOutput(literalSchema);

//   let literal;

//   try {
//     literal = await agent.generate({ annotation });

//     literal.slug = generateSlug(annotation);
//     literal.annotation = annotation;

//     const issues = await daemon.validate.literal(literal, ["SCHEMATIC"]);

//     if (issues.length > 0) {
//       return issue.onError({
//         message: "Generated invalid literal",
//         issues,
//         literal,
//       });
//     }

//     const created = await daemon.entities.literal.create(literal);
//     await daemon.entities.em.flush();

//     if (created) return issue.resolve();

//     return issue.onError({ message: "Failed to create literal", literal });
//   } catch (error) {
//     console.error("[REMEDY ERROR] literal:required");
//     console.error(error);
//     return issue.onError({
//       message: error.message,
//       error,
//       literal,
//       annotation,
//     });
//   }
// }

// function generateSlug(annotation) {
//   const parts = [];

//   for (const [branch, leaf] of Object.entries(annotation)) {
//     parts.push(`${branch}:${leaf}`);
//   }

//   return parts.filter(Boolean).join("-").toLowerCase();
// }

// export default {
//   handler: required,
//   violation: "required",
//   path: ["literal"],
// };
