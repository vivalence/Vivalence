export default async function (body, ctx) {
  let unit = { ...body.unit };
  let operation = null;

  if (!unit.slug) unit.slug = await ctx.runtime.call("/identity/unit", { unit });

  const issues = await ctx.runtime.call("/diagnostics/validate/unit", { unit });
  if (issues[0]) throw new Error("Invalid unit", issues);

  const existingUnit = await getUnit(unit, ctx);
  if (existingUnit) {
    const { data, error } = await ctx.runtime.locals.supabase
      .from("Unit")
      .update({ ...unit })
      .eq("id", existingUnit.id)
      .select("*, tags:_TagToUnit(tag:A(*))")
      .single();
    if (error) throw error;

    operation = "update";
    unit = data;
  } else {
    const { data, error } = await ctx.runtime.locals.supabase
      .from("Unit")
      .insert({ runtimeId: ctx.runtime.manifest.id, ...unit })
      .select("*, tags:_TagToUnit(tag:A(*))")
      .single();

    if (error) throw error;
    operation = "create";
    unit = data;
  }

  unit.tags = unit.tags.map(({ tag }) => tag);

  const valid = await forceUnitValidity(unit, ctx);

  return { unit, operation, status: "success", ...valid };
}

async function forceUnitValidity(unit, ctx) {
  const maxItterations = 3;
  let itteration = 0;

  while (itteration < maxItterations) {
    const issues = await ctx.runtime.call("/diagnostics/validate/unit", { unit: { ...unit } });

    if (!issues[0]) return { status: "success", unit };

    for (const issue of issues) {
      const remedy = await ctx.runtime.call("/remedy", { issue });
      if (!remedy.resolved) return { status: "invalid", remedy };
    }

    unit = await getUnit(unit, ctx);
    itteration++;
  }

  return { status: "invalid", unit };
}

async function getUnit(unit, ctx) {
  let query = ctx.runtime.locals.supabase
    .from("Unit")
    .select("*, tags: _TagToUnit(tag:A(*))")
    .eq("runtimeId", ctx.runtime.manifest.id);

  if (unit.id) query = query.eq("id", unit.id);
  else if (unit.slug) query = query.eq("slug", unit.slug);
  const { data, error } = await query.single();

  if (error && error.code !== "PGRST116") throw error;

  if (data && data.tags) data.tags = data.tags.map(({ tag }) => tag);
  return data;
}
