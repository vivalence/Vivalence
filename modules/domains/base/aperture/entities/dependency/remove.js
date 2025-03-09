export default async function ({ id }, ctx) {
  const { data, error } = await ctx.runtime.locals.supabase
    .from("Dependency")
    .delete()
    .eq("id", id);
  if (error) throw error;
  return { remove: data, id };
}
