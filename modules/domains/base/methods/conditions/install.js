import { deepEquals, deepMerge, strings } from "@vivalence/shared";

export default async function (body, ctx) {
  let { condition, type } = body;
  let operation = null;

  const existingCondition = await read(condition, ctx);

  let data;
  if (existingCondition) {
    data = await update({ conditions: { old: existingCondition, new: condition } }, ctx);
  } else {
    data = await create(body, ctx);
  }
  condition = data.condition;
  operation = data.operation;

  return { condition, operation, type };
}

async function update({ conditions }, ctx) {
  let operation = null;

  let condition = {
    id: conditions.old.id,
    scope: conditions.old.scope,
    corpusId: conditions.old.corpusId,
    assertion: conditions.old.assertion,
  };

  const mergedCondition = deepMerge(condition, {
    scope: conditions.new.scope,
    corpusId: conditions.new.corpusId,
    assertion: conditions.new.assertion,
  });

  if (!deepEquals(mergedCondition, condition)) {
    const { data, error } = await ctx.runtime.locals.supabase
      .from("Condition")
      .update({
        ...mergedCondition,
        udpatedAt: new Date().toISOString(),
      })
      .eq("id", condition.id)
      .select("*")
      .single();

    if (error) throw error;
    condition = data;
    operation = "update";
  }

  return { condition, operation };
}

async function create({ condition, type }, ctx) {
  let operation = "create";
  const { data, error } = await ctx.runtime.locals.supabase
    .from("Condition")
    .insert({ runtimeId: ctx.runtime.manifest.id, ...condition })
    .select()
    .single();

  if (error) throw error;

  return { condition: data, operation };
}

async function read(condition, ctx) {
  if (!condition?.id) return null;

  let query = ctx.runtime.locals.supabase
    .from("Condition")
    .select("*")
    .eq("runtimeId", ctx.runtime.manifest.id)
    .eq("id", condition.id);

  const { data, error } = await query.maybeSingle();

  if (error && error.code !== "PGRST116") throw error;
  return data;
}
