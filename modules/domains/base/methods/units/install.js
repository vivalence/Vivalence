import { deepMerge } from "@vivalence/shared";

export default async function (body, ctx) {
  const unitSkeleton = {
    data: { index: null, example: { known: null, learning: null }, known: null, learning: null },
  };

  let unit = deepMerge(unitSkeleton, body.unit);
  let operation = null;
  let issues = [];
  let status = "success";

  if (!unit.slug) unit.slug = await ctx.runtime.call("/identity/unit", { unit });
  issues = await ctx.runtime.call("/diagnostics/validate/unit", { unit });
  if (issues[0]) {
    console.log("Unit validation issue /units/install", unit, issues);
    throw new Error("Invalid unit", issues);
  }

  const existingUnit = await getUnit(unit, ctx);

  if (existingUnit) {
    unit = await updateUnit({ new: unit, old: existingUnit }, ctx);
    operation = "update";
  } else {
    unit = await newUnit(unit, ctx);
    operation = "create";
  }

  unit.tags = unit.tags.map(({ tag }) => tag);

  const valid = await forceUnitValidity(unit, ctx);

  if (valid.status === "invalid") {
    status = "invalid";
    operation = "remedy";
    issues.push(valid.remedy);
    // delete unit
  }

  return { unit, operation, status, ...valid };
}

async function forceUnitValidity(unit, ctx) {
  let operation = null,
    status = null;
  const maxItterations = 3;
  let itteration = 0;

  while (itteration < maxItterations) {
    const issues = await ctx.runtime.call("/diagnostics/validate/unit", { unit: { ...unit } });

    if (!issues[0]) return { status: "success", unit };

    for (const issue of issues) {
      const remedy = await ctx.runtime.call("/remedy", { issue });
      if (!remedy.resolved) return { status: "invalid", operation: "remedy", issue, remedy };
    }

    unit = await getUnit(unit, ctx);
    itteration++;
  }

  return { status: "invalid", unit };
}

async function getUnit(unit, ctx) {
  let query = ctx.runtime.services.supabase
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

async function updateUnit(units, ctx) {
  const { data, error } = await ctx.runtime.services.supabase
    .from("Unit")
    .update({ ...units.new })
    .eq("id", units.old.id)
    .select("*, tags:_TagToUnit(tag:A(id,slug,data,traits))")
    .single();

  if (error) throw error;

  return data;
}

async function newUnit(unit, ctx) {
  const { data, error } = await ctx.runtime.services.supabase
    .from("Unit")
    .insert({ runtimeId: ctx.runtime.manifest.id, ...unit })
    .select("*, tags:_TagToUnit(tag:A(*))")
    .single();

  if (error) throw error;
  return data;
}
