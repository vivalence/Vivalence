export default async function (body, ctx) {
  const { strategy, user } = body;

  const { data: newStrategy, error } = await ctx.runtime.locals.supabase
    .from("Strategy")
    .insert({
      runtimeId: ctx.runtime.manifest.id,
      userId: user.id,
      ...strategy,
    })
    .select("*");

  if (error) throw error;
  return newStrategy;
}
