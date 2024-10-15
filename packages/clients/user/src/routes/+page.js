import { handle } from "../hooks.client.js";
// import dependencies from "$lib/dependencies.js";

export const load = async (event) => {
  const { locals } = await handle(event);

  const { data, error } = await locals.supabase
    .from("Dependency")
    .select(`id, runtime:Runtime (id, slug)`);

  if (error) console.error(error);

  let dependencies = [];
  for (const { id, runtime } of data) {
    // async function readCondition(type) {const { data, error } = await locals.supabase .from("Condition") .select() .eq(`runtimeId`, dependency.runtime.id) .eq(`${type}ForId`, dependency.id); if (error) throw error; return data;} const [conditions, preconditions] = await Promise.all([readCondition("condition"), readCondition("precondition"),]); dependency.conditions = conditions; dependency.preconditions = preconditions;
    const { data: dependency, error } = await event.locals.call(
      `/r/${runtime.slug}/dependencies/compute`,
      { dependency: { id } },
    );
    if (error) console.error(error);
    dependencies.push(dependency);
  }

  console.log(dependencies);
  return { ...data, locals, dependencies };
};
