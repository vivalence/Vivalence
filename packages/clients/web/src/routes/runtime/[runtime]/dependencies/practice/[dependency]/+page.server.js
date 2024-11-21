export const load = async ({ params, locals, parent, ...event }) => {
  const { runtime } = await parent();

  const { data: dependency, error } = await locals.call("/api/user/dependencies/practice", {
    runtime: { id: runtime.id },
    dependency: { slug: params.dependency },
  });

  return { dependency, runtime };
};
