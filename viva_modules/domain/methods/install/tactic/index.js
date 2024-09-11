export default async function (body, ctx) {
  const { tactic } = body;

  const { data: existingTactic, error: existingError } = await ctx.runtime.locals.supabase
    .from("Tactic")
    .select("*")
    .eq("slug", tactic.slug)
    .eq("runtimeId", ctx.runtime.manifest.id)
    .single();

  if (existingError && existingError.code !== "PGRST116") throw existingError;
  if (existingTactic) return existingTactic;

  const { data: newTactic, error } = await ctx.runtime.locals.supabase
    .from("Tactic")
    .insert({
      runtimeId: ctx.runtime.manifest.id,
      ...tactic,
    })
    .eq("runtimeId", ctx.runtime.manifest.id)
    .select("*");

  if (error) throw error;
  return newTactic;
}
