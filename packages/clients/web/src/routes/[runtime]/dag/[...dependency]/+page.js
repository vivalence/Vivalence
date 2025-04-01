import context from "@client/context";

export const load = async (event) => {
  const ctx = await context(event);

  const dependencies = await ctx.runtime("/entities/dependency/find", {
    options: { populate: ["conditions", "preconditions", "runtime"] },
  });

  dependencies.forEach((d) => (d.available = true));

  return { dependencies };
};
