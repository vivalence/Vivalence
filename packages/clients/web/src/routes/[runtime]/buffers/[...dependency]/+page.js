import context from "@client/context";

export const load = async (event) => {
  const ctx = await context(event);
  console.log("event", event);

  // const dependencies = await ctx.runtime("/entities/dependency/findOne", {
  //   // where:{slug:}
  //   // options: { populate: ["conditions", "preconditions"] },
  // });

  const runtime = {};

  return { ctx, data: { runtime } };
};
