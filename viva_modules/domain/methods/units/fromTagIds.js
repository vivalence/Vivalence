export default async function (body, ctx) {
  const { tagIds, blacklist, take } = body;

  // Step 1: Get units that have all the required tags
  let query = ctx.runtime.locals.supabase.from("_TagToUnit").select("*").in("A", tagIds);

  if (blacklist.units && blacklist.units.length > 0) {
    query = query.not("B", "in", `(${blacklist.units.join(",")})`);
  }

  if (take !== null) {
    query = query.limit(take);
  }

  const { data: matchedRelations, error: matchError } = await query;
  if (matchError) throw matchError;

  // Step 2: Aggregate tags per unit
  const unitTagCounts = matchedRelations.reduce((acc, { B, A }) => {
    if (!acc[B]) acc[B] = new Set();
    acc[B].add(A);
    return acc;
  }, {});

  // Step 3: Filter units that have all required tags
  const fullyMatchedUnitIds = Object.entries(unitTagCounts)
    .filter(([_, tags]) => tags.size === tagIds.length)
    .map(([unitId, _]) => unitId);

  // Step 4: Fetch full data for fully matched units
  const { data: units, error: unitsError } = await ctx.runtime.locals.supabase
    .from("Unit")
    .select(`*, tags:_TagToUnit(tag:A(*)) `)
    .in("id", fullyMatchedUnitIds);

  if (unitsError) throw unitsError;

  // Step 5: Format the tags for each unit
  const formattedUnits = units.map((unit) => ({
    ...unit,
    tags: unit.tags.map(({ tag }) => tag),
  }));

  return formattedUnits;
}
