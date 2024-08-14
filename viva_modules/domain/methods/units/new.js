export default async function getNewUnits(inputs, ctx) {
  throw new Error("UNTESTED CLAUDE GARBAGE!");
  const { scope, blacklist, tagIds, take } = inputs;
  const { tactic, strategy, user } = scope;

  try {
    let query = ctx.runtime.locals.supabase.from("_TagToUnit").select("B").in("A", tagIds);

    // Apply tag blacklist
    if (blacklist.tags && blacklist.tags.length > 0) {
      query = query.not("A", "in", `(${blacklist.tags.join(",")})`);
    }

    const { data: matchedRelations, error: matchError } = await query;
    if (matchError) throw matchError;

    const unitIds = matchedRelations.map((r) => r.B);

    let unitsQuery = ctx.runtime.locals.supabase
      .from("Unit")
      .select(
        `
        *,
        tags:_TagToUnit(tag:A(*))
      `
      )
      .in("id", unitIds)
      .not(
        "id",
        "in",
        ctx.runtime.locals.supabase
          .from("Play")
          .select("unitId")
          .eq("gameId", strategy.id)
          .eq("tacticId", tactic.id)
          .eq("userId", user.id)
      )
      .not(
        "id",
        "in",
        ctx.runtime.locals.supabase
          .from("Memory")
          .select("unitId")
          .is("tagId", null)
          .eq("userId", user.id)
          .in("status", ["KNOWN", "GRADUATED"])
      );

    // Apply unit blacklist
    if (blacklist.units && blacklist.units.length > 0) {
      unitsQuery = unitsQuery.not("id", "in", `(${blacklist.units.join(",")})`);
    }

    // Apply take limit
    if (take !== undefined) {
      unitsQuery = unitsQuery.limit(take);
    }

    const { data: units, error: unitsError } = await unitsQuery;
    if (unitsError) throw unitsError;

    // Filter units that have all required tags
    const fullyMatchedUnits = units.filter((unit) => unit.tags.length === tagIds.length);

    // Format the tags for each unit
    const formattedUnits = fullyMatchedUnits.map((unit) => ({
      ...unit,
      tags: unit.tags.map(({ tag }) => tag),
    }));

    return formattedUnits;
  } catch (error) {
    console.error("Error fetching new units:", error);
    throw error;
  }
}
