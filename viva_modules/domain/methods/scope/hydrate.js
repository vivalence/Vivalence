export default async function (body, ctx) {
  const { scope } = body;

  const hydrateToken = async (token) => {
    const tokenIds = token.tags.map(({ id }) => id);
    const [{ data: unit, error: unitError }, { data: tags, error: tagsError }] = await Promise.all([
      ctx.runtime.locals.supabase.from("Unit").select("id, data").eq("id", token.id).single(),
      ctx.runtime.locals.supabase.from("Tag").select("id, data, type, name").in("id", tokenIds),
    ]);
    if (unitError || tagsError) throw unitError || tagsError;
    return { ...token, ...unit, tags };
  };

  const results = await Promise.all(scope.units.map(hydrateToken));

  return results;
}
