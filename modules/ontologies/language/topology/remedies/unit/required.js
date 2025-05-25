import { Type } from "@sinclair/typebox";
import { Agent } from "@vivalence/shared/agent";

function createSpanishUnitAgent(ctx) {
  const agent = new Agent("spanish-unit-generator", "Spanish Unit Generator")
    .withBrain(ctx.runtime.services.brain)
    .withContext(
      "terra",
      `### identity
	You are inside viva, the agentic symbolic intelligence operating system.
        be a helpful, concise and diligent agent. All output is used for input into other llms! So, there is no need for niceties. `,
    )
    .withContext(
      "identity",
      `You are a language education specialist creating learning units from linguistic annotations. 
      You provide clear, simple translations and examples suitable for language learners.`,
    )
    .withContext(
      "task",
      `### Task: Complete Language Unit
       You are given a Universal Dependencies annotation and must return a complete learning unit.
      `,
    );

  return agent;
}

async function required(issue, ctx) {
  const annotation = issue.data.context.annotation;
  const { config, ontology } = ctx.runtime;

  const agent = createSpanishUnitAgent(ctx)
    .withInput(
      Type.Object({
        annotation: ontology.schema.annotations[annotation.pos],
        language: ctx.runtime.schema.statics.language,
      }),
    )
    .withOutput(ontology.schema.units[annotation.pos])
    .withContext(
      "context",
      `# contextual information about the unit to be generated: ${JSON.stringify(issue.data.context)}`,
    );

  try {
    const unit = await agent.generate({
      annotation,
      language: config.statics.language,
    });
    unit.slug = await ctx.runtime.call("/unit/identity", unit);

    const issues = await ontology.assert.unit(unit, ["SCHEMATIC"]);
    if (issues.length > 0) {
      issue.markError({ message: "generated invalid unit", issues, unit });
    } else {
      const installation = await ctx.runtime.call("/unit/install", { unit });

      if (installation.status === "success") issue.resolve();
      else issue.markError({ message: "installation fail", unit });
    }
  } catch (error) {
    console.error("[REMEDY ERROR]@[/unit:required]", error);
    issue.markError({ message: error.message, error });
  }

  return issue;
}

export default {
  handler: required,
  violation: "required",
  path: ["unit"],
};
