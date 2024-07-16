import validateSchema from "./schema.js";
import validateTags from "./tags.js";
import validatePos from "./pos.js";
import validateNLP from "./nlp.js";

export default async function validate(input, locals) {
  const { data: unit } = await locals.supabase
    .from("Unit")
    .select(`*, _TagToUnit(*, Tag: A (*))`)
    .eq("id", input.unit.id)
    .single();

  const statement = buildStatement(unit, locals);

  const issues = [];

  const validation = await validatePos(statement, locals);
  if (!validation.isValid) issues.push(...validation.issues);

  if (!issues.length > 0) {
    const validation = await validateSchema(statement, locals);
    if (!validation.isValid) issues.push(...validation.issues);
  }

  if (!issues.length > 0) {
    const validation = await validateNLP(statement, locals);
    if (!validation.isValid) issues.push(...validation.issues);
  }

  if (!issues.length > 0) {
    const validation = await validateTags(statement, locals);
    if (!validation.isValid) issues.push(...validation.issues);
  }

  issues.forEach((issue) => (issue.context.unit = unit));

  return { isValid: issues.length === 0, issues };
}

function buildStatement(unit, locals) {
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
