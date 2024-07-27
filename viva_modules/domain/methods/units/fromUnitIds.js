export default async function (body, runtime) {
  const { unitIds = [] } = body;

  const { data: units, error } = await runtime.locals.supabase
    .from("Unit")
    .select("*")
    .in("id", unitIds);

  if (error) throw error;
  return units;
}
