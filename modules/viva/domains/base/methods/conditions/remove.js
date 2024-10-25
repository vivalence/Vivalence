export default async function ({ id }, ctx) {
  const { data, error } = await ctx.runtime.locals.supabase.from("Condition").delete().eq("id", id);
  if (error) throw error;
  return { remove: data, id };
}
