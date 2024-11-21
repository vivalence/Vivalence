export const load = async ({ locals, parent, ...event }) => {
  const { runtime } = await parent();

  const { data: dependencies, error } = await locals.call("/api/user/dependencies/view", {
    runtime: { id: runtime.id },
  });

  return { dependencies };
};
