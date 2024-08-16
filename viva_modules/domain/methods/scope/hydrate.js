export default async function ({ scope }, ctx) {
  const hydrateToken = async (token) => {
    const tokenIds = token.tags.map(({ id }) => id);
    const [{ data: unit, error: unitError }, { data: tags, error: tagsError }] = await Promise.all([
      ctx.runtime.locals.supabase
        .from("Unit")
        .select("id, slug, data, annotation")
        .eq("id", token.id)
        .single(),
      ctx.runtime.locals.supabase
        .from("Tag")
        .select("id, slug, data, traits, name")
        .in("id", tokenIds),
    ]);
    if (unitError || tagsError) throw unitError || tagsError;
    return { ...token, ...unit, tags };
  };

  const units = await Promise.all(scope.units.map(hydrateToken));

  return { units };
}
