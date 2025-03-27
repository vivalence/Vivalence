export const load = async ({ aperture, parent, ...event }) => {
  const { runtime } = await parent();

  const { data: dependencies, error } = await aperture.call(
    `/runtime/${runtime.slug}/dependencies`,
  );

  return { dependencies };
};
