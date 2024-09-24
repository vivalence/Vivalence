export default async function (body, ctx) {
  let { unit } = body;

  const issues = await ctx.runtime.call("/diagnostics/validate/unit", { unit });
  if (issues[0]) throw new Error("Invalid unit", issues);

  const existingUnit = await getUnit(unit, ctx);
  if (existingUnit) return existingUnit;

  const { data, error } = await ctx.runtime.locals.supabase
    .from("Unit")
    .insert({ runtimeId: ctx.runtime.manifest.id, ...unit })
    .select("*, tags:_TagToUnit(tag:Tag(*))")
    .single();

  if (error) throw error;
  unit = data;
  unit.tags = unit.tags.map(({ tag }) => tag);

  const valid = await forceUnitValidity(unit, ctx);

  console.log("unit, valid", unit, valid);

  return { ...valid, unit };
}

async function forceUnitValidity(unit, ctx) {
  const maxItterations = 2;
  let itteration = 0;

  while (itteration < maxItterations) {
    const issues = await ctx.runtime.call("/diagnostics/validate/unit", { unit });

    if (!issues[0]) return { success: true, status: "valid" };

    for (const issue of issues) {
      const remedy = await ctx.runtime.call("/remedy", { issue });
      console.log("remedy", remedy);
      if (!remedy.resolved) return { success: false, status: "invalid", remedy };
      await new Promise((resolve) => setTimeout(resolve, 1000));
    }

    unit = await getUnit(unit, ctx);
    itteration++;
  }

  return { success: false, status: "invalid" };
}

async function getUnit(unit, ctx) {
  let query = ctx.runtime.locals.supabase
    .from("Unit")
    .select("*, tags: _TagToUnit(tag:Tag(*))")
    .eq("runtimeId", ctx.runtime.manifest.id);
  if (unit.id) query = query.eq("id", unit.id);
  else if (unit.slug) query = query.eq("slug", unit.slug);
  const { data, error } = await query.single();

  if (error && error.code !== "PGRST116") throw error;

  if (data && data.tags) data.tags = data.tags.map(({ tag }) => tag);
  return data;
}
