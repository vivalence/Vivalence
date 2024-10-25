export default async function ({ unit }, ctx) {
  let statement = ctx.runtime.locals.supabase
    .from("Unit")
    .delete()
    .eq("runtimeId", ctx.runtime.manifest.id);

  if (unit.id) statement = statement.eq("id", unit.id);
  else if (unit.slug) statement = statement.eq("slug", unit.slug);

  const { error, data } = await statement.select("*").single();

  if (error) throw error;
  return { success: true, data };
}
