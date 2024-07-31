export default async function (body, ctx) {
  const { tagIds, blacklist = [], take } = body;

  const params = {
    tag_ids: tagIds,
    blacklist: blacklist.length > 0 ? blacklist : null,
  };
  if (take) params.take_limit = take;

  const { data, error: unitsError } = await ctx.runtime.locals.supabase.rpc(
    "get_units_from_tag_ids",
    params
  );
  if (unitsError) throw unitsError;

  const units = await Promise.all(
    data.map(async (unit) => {
      const { data, error } = await ctx.runtime.locals.supabase
        .from("_TagToUnit")
        .select("*, Tag: Tag (*)")
        .eq("B", unit.id);
      if (error) throw error;
      unit.tags = data.map(({ Tag }) => Tag);
      return unit;
    })
  );

  return units;
}
