export default async function (body, runtime) {
  const { unit } = body;

  const { data, error } = await runtime.locals.supabase
    .from("_TagToUnit")
    .select(`*, Tag: A (*)`)
    .eq("B", unit.id);

  if (error) throw error;

  const tags = data.map((tag) => tag.Tag);
  return tags;
}
