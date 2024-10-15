// import {validator, deepEquals, deepMerge } from "@vivalence/shared";

export default async function (body, ctx) {
  const dependency = await readDependency(body.dependency, ctx);

  const [conditions, preconditions] = await Promise.all([
    readCondition({ dependency, type: "condition" }, ctx),
    readCondition({ dependency, type: "precondition" }, ctx),
  ]);

  dependency.conditions = conditions;
  dependency.preconditions = preconditions;

  dependency.available = dependency.preconditions.every((c) => c.met);
  dependency.satisfied = dependency.conditions.every((c) => c.met);

  await ctx.runtime.locals.supabase
    .from("Dependency")
    .update({
      available: dependency.available,
      satisfied: dependency.satisfied,
      updatedAt: new Date().toISOString(),
    })
    .eq("id", dependency.id);

  return dependency;
}

async function readDependency(dependency, ctx) {
  if (!dependency?.id && !dependency.slug) throw new Error("dependency id or slug required");

  let query = ctx.runtime.locals.supabase
    .from("Dependency")
    .select("*")
    .eq("runtimeId", ctx.runtime.manifest.id);

  if (dependency.id) query = query.eq("id", dependency.id);
  if (dependency.slug) query = query.eq("slug", dependency.slug);

  const { data, error } = await query.maybeSingle();

  if (error && error.code !== "PGRST116") throw error;

  if (!data) throw new Error("dependency not found");
  return data;
}

async function readCondition({ type, dependency }, ctx) {
  const { data, error } = await ctx.runtime.locals.supabase
    .from("Condition")
    .select()
    .eq(`runtimeId`, ctx.runtime.manifest.id)
    .eq(`${type}ForId`, dependency.id);

  if (error) throw error;
  if (!data) throw new Error("condition not found");

  return await Promise.all(
    data.map((condition) => ctx.runtime.call("/conditions/compute", { condition })),
  );
}
