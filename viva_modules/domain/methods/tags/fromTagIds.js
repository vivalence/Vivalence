export default async function (body, runtime) {
  const { tagIds = [], blacklist = [] } = body;

  const { data: tags, error } = await runtime.locals.supabase
    .from("Tag")
    .select("*")
    .in("id", tagIds)
    .not("id", "in", `(${blacklist.join(",")})`);

  if (error) throw error;
  return tags;
}
