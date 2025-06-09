import { Type } from "@sinclair/typebox";
import { Agent } from "@vivalence/shared/agent";

async function required(issue, ctx) {
  const annotation = issue.context.unit.annotation;
  const { config, schema, validate } = ctx.runtime;

  const agent = new Agent("spanish-unit-generator", "Spanish Unit Generator")
    .withBrain(ctx.runtime.services.brain)
    .enhance(
      `### identity
	You are inside viva, the agentic symbolic intelligence operating system.
        be a helpful, concise and diligent agent. All output is used for input into other llms! So, there is no need for niceties. `,
    )
    .enhance(
      `You are a language education specialist creating learning units from linguistic annotations. 
      You provide clear, simple translations and examples suitable for language learners.`,
    )
    .enhance(
      `### Task: Complete Language Unit
       You are given a Universal Dependencies annotation and must return a complete learning unit. 
      `,
    )
    .enhance(
      `# contextual information about the unit to be generated:
	${JSON.stringify(issue.context)}
    `,
    )
    .withInput(
      Type.Object({
        annotation: schema.annotations[annotation.pos],
        language: schema.statics.language,
      }),
    )
    .withOutput(schema.units[annotation.pos]);

  let unit;

  try {
    unit = await agent.generate({
      annotation,
      language: config.statics.language,
    });

    // console.log("@remedy/unit/required.js [GENERADED UNIT]", unit);

    unit.slug = await ctx.runtime.call("/unit/identity", { ...unit });

    // console.log("@remedy/unit/required.js [GENERADED slug]", unit.slug);

    const issues = await validate.unit(unit, ["SCHEMATIC"]);
    if (issues.length > 0) {
      return issue.onError({ message: "generated invalid unit", issues, unit });
    }

    const installation = await ctx.runtime.call("/unit/install", { unit });

    if (installation.status === "success") return await issue.resolve();

    return issue.onError({ message: "installation fail", unit });
  } catch (error) {
    console.error("");
    console.error("[REMEDY ERROR]@[/unit:required]");
    console.error(error);
    console.log({ unit, annotation });
    console.error("/[REMEDY ERROR]@[/unit:required]");
    console.error("");
    issue.onError({ ...error, message: error.message, unit, annotation });
  }

  return issue;
}

export default {
  handler: required,
  violation: "required",
  path: ["unit"],
};
