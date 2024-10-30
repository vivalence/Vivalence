import { deepEquals, deepMerge } from "@vivalence/shared";

export default async function (body, ctx) {
  let { condition, type, dependencyId } = body;
  let operation = null;

  const existingCondition = await read(condition, ctx);

  if (existingCondition) {
    operation = "update";
    condition = await update(
      { conditions: { old: existingCondition, new: condition }, dependencyId },
      ctx,
    );
  } else {
    operation = "create";
    condition = await create(body, ctx);
  }

  return { condition, operation };
}

async function update({ conditions }, ctx) {
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
  }

  return condition;
}

async function create({ condition, dependencyId, type }, ctx) {
  const { data, error } = await ctx.runtime.locals.supabase
    .from("Condition")
    .insert({
      runtimeId: ctx.runtime.manifest.id,
      [`${type}ForId`]: dependencyId,
      ...condition,
    })
    .select()
    .single();

  if (error) throw error;
  return data;
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
