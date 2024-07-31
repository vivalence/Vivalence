export default async function (body, ctx) {
  const { unitIds = [] } = body;
  let units;

  const { data, error } = await ctx.runtime.locals.supabase
    .from("Unit")
    .select("*")
    .in("id", unitIds);

  if (error) throw error;
  return data;
}
