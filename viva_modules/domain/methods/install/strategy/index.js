export default async function (body, ctx) {
  const { strategy, user } = body;
  for (const session of strategy.session) {
    const { data, error } = await ctx.runtime.locals.supabase
      .from("Tactic")
      .select("id, slug")
      .eq("slug", session.tactic.slug)
      .eq("runtimeId", ctx.runtime.manifest.id)
      .single();

    if (error) throw error;
    if (!data) throw new Error("Tactic not found: " + slug);
    session.tactic.id = data.id;
  }

  const { data, error } = await ctx.runtime.locals.supabase
    .from("Strategy")
    .insert({
      runtimeId: ctx.runtime.manifest.id,
      userId: user.id,
      ...strategy,
    })
    .select("*")
    .single();

  if (error) throw error;
  return data;
}
