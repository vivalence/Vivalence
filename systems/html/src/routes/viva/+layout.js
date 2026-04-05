export const load = async () => {
  const { discover } = await import("$client");
  await discover();
};
