import validateSchema from "./lib/schema.js";
import validateTags from "./lib/tags.js";
import validatePos from "./lib/pos.js";
import validateNLP from "./lib/nlp.js";

export default async function validate(input, ctx) {
  const { data: unit } = await ctx.runtime.locals.supabase
    .from("Unit")
    .select(`*, _TagToUnit(*, Tag: A (*))`)
    .eq("id", input.unit.id)
    .single();

  const statement = buildStatement(unit, ctx);

  const issues = [];

  const validation = await validatePos(statement, ctx);
  if (!validation.isValid) issues.push(...validation.issues);

  if (!issues.length > 0) {
    const validation = await validateSchema(statement, ctx);
    if (!validation.isValid) issues.push(...validation.issues);
  }

  if (!issues.length > 0) {
    const validation = await validateNLP(statement, ctx);
    if (!validation.isValid) issues.push(...validation.issues);
  }

  if (!issues.length > 0) {
    const validation = await validateTags(statement, ctx);
    if (!validation.isValid) issues.push(...validation.issues);
  }

  issues.forEach((issue) => (issue.context.unit = unit));

  return { isValid: issues.length === 0, issues };
}

function buildStatement(unit, ctx) {
  const statement = {
    spanish: unit.data.spanish,
    english: unit.data.english,
  };

  if (unit.id) statement.id = unit.id;
  if (unit.data.usageInEnglish) statement.usageInEnglish = unit.data.usageInEnglish;
  if (unit.data.usageInSpanish) statement.usageInSpanish = unit.data.usageInSpanish;

  if (unit.data.annotation) {
    statement.annotation = unit.data.annotation;
  }
  statement.tags = unit._TagToUnit
    .map(({ Tag }) => Tag)
    .filter((tag) => !!tag.data.ONTOLOGICAL?.branch)
    .map((tag) => ({
      branch: tag.data.ONTOLOGICAL.branch,
      leaf: tag.data.ONTOLOGICAL.leaf,
    }));

  return statement;
}
