export const load = async ({ params, aperture, parent, ...event }) => {
  const { runtime } = await parent();

  // slug?
  const { data: dependency, error } = await aperture.call(
    `/runtime/${runtime.slug}/dependency/${params.dependency}`,
  );

  return { dependency, runtime };
};
