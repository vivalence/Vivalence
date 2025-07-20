export default async function (input, ctx) {
  const user = await ctx.runtime.services.identity.getUser();
  const session = ctx.runtime.entities.session.create({
    strategy: "eva",
    user: user.id,
    traits: ["AGENTIC"],
  });
  await ctx.runtime.entities.em.flush();
  return session;
}
