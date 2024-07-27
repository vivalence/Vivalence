export default async function (body, runtime) {
  const { tagIds, blacklist = [], take } = body;

  const params = {
    tag_ids: tagIds,
    blacklist: blacklist.length > 0 ? blacklist : null,
  };
  if (take) params.take_limit = take;

  const { data, error: unitsError } = await runtime.locals.supabase.rpc(
    "get_units_from_tag_ids",
    params
  );
  if (unitsError) throw unitsError;

  const units = await Promise.all(
    data.map(async (unit) => {
      const { data, error } = await runtime.locals.supabase
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
