export default async function (body, ctx) {
  const { tagSlugs, blacklist, take } = body;

  // Step 0: Get tag ids
  const tags = await ctx.runtime.call("/tags/fromSlugs", { slugs: tagSlugs });
  const tagIds = tags.map((tag) => tag.id);

  // Step 1: Get units that have all the required tags
  let query = ctx.runtime.services.supabase.from("_TagToUnit").select("*").in("A", tagIds);
  if (blacklist?.units?.length > 0) query = query.not("B", "in", `(${blacklist.units.join(",")})`);
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
  const { rows: units, ...rest } = await ctx.runtime.services.db.sql(
    `SELECT unit.*
FROM "Unit" unit
WHERE unit.id = ANY($1::text[])
ORDER BY (data->>'index')::numeric
LIMIT CASE 
  WHEN $2::integer IS NULL THEN NULL 
  ELSE $2::integer 
END;`,
    [fullyMatchedUnitIds, take],
  );

  const { data: tagRelations, error: tagsError } = await ctx.runtime.services.supabase //
    .from("_TagToUnit")
    .select("*, Tag(*)")
    .in("B", fullyMatchedUnitIds);

  // // Step 5: Format the tags for each unit
  const formattedUnits = units.map((unit) => ({
    ...unit,
    tags: tagRelations
      .filter((tagRelation) => tagRelation.B === unit.id)
      .map((tagRelation) => tagRelation.Tag),
  }));

  return formattedUnits;
}
