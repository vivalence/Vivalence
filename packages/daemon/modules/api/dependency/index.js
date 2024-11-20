export default async function user(api) {
  api.router.route("/user/dependencies/practice", async (input, ctx) => {
    const user = await ctx.api.locals.getUser();
    if (!user) return null;

    const { data: dependency, error } = await ctx.api.locals.supabase
      .from("Dependency")
      .select(`*`)
      .eq("slug", input.dependency.slug)
      .eq("runtimeId", input.runtime.id)
      .maybeSingle();
    if (error) throw error;

    return dependency;
  });
  api.router.route("/user/dependencies/view", async (input, ctx) => {
    const user = await ctx.api.locals.getUser();
    if (!user) return null;

    const { data: dependencies, error } = await ctx.api.locals.supabase
      .from("Dependency")
      .select(
        `id,slug,name,description,satisfied,available,
	    preconditions:_Precondition(condition:Condition(id,name,met,scope)),
	    conditions:_Condition(condition:Condition(id,name,met,scope))`,
      )
      .eq("runtimeId", input.runtime.id);

    if (error) throw error;

    dependencies.forEach((dependency) => {
      dependency.conditions = dependency.conditions
        .map(({ condition }) => condition)
        .sort((c) => c.met);
      dependency.preconditions = dependency.preconditions
        .map(({ condition }) => condition)
        .sort((c) => c.met);
    });
    return dependencies;
  });

  return api;
}
