import { handleValidationError, registerHandlers } from "./registry.js";

import annotation from "./annotation/index.js";
import unit from "./unit/index.js";
import tags from "./tags/index.js";

[annotation, unit, tags].map((h) => registerHandlers(h));

export default async function remedy({ issue }, ctx) {
  // if (false && issue.context.unit) {const { data: unit } = await ctx.locals.supabase .from("Unit") .select(`*, _TagToUnit(*, Tag: A (*))`) .eq("id", issue.context.unit.id) .single(); issue.context.unit = unit; issue.context.unit.tags = unit._TagToUnit.map((r) => r.Tag); delete issue.context.unit._TagToUnit;}
  const result = await handleValidationError(issue, ctx);

  return result;
}
