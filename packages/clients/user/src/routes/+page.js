import { handle } from "../hooks.client.js";
// import dependencies from "$lib/dependencies.js";

export const load = async (event) => {
  const { data, locals } = await handle(event);

  const { data: dependencies, error } = await locals.supabase
    .from("Dependency")
    .select(`*, runtime:Runtime (id, slug)`);

  if (error) console.error(error);

  for (const dependency of dependencies) {
    async function readCondition(type) {
      const { data, error } = await ctx.runtime.locals.supabase
        .from("Condition")
        .select()
        .eq(`runtimeId`, dependency.runtime.id)
        .eq(`${type}ForId`, dependency.id);
      if (error) throw error;
      return data;
    }
    const [conditions, preconditions] = await Promise.all([
      readCondition("condition"),
      readCondition("precondition"),
    ]);
    dependency.conditions = conditions;
    dependency.preconditions = preconditions;
  }
  console.log(dependencies);

  return { ...data, locals, dependencies };
};
