export default async function (body, ctx) {
  const { unitIds = [] } = body;
  let units;

  const { data, error } = await ctx.runtime.services.supabase
    .from("Unit")
    .select("*")
    .eq("runtimeId", ctx.runtime.manifest.id)
    .in("id", unitIds)
    .order("data->>index", { ascending: true });
  if (error) throw error;
  units = data.sort((a, b) => (a.data.index ?? Infinity) - (b.data.index ?? Infinity));
  return units;
}
