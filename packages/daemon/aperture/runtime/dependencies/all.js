export default async function (input, ctx) {
  const { data: dependencies, error } = await ctx.runtime.services.supabase
    .from("Dependency")
    .select(
      `id,slug,name,description,satisfied,available,
	    preconditions:_Precondition(condition:Condition(id,name,met,scope)),
	    conditions:_Condition(condition:Condition(id,name,met,scope))`,
    )
    .eq("runtimeId", ctx.runtime.manifest.id);

  if (error) throw error;

  dependencies.forEach((dependency) => {
    dependency.conditions = dependency.conditions
      .map(({ condition }) => condition)
      .sort((a, b) => b.met - a.met);
    dependency.preconditions = dependency.preconditions
      .map(({ condition }) => condition)
      .sort((a, b) => b.met - a.met);
  });

  return dependencies;
}
