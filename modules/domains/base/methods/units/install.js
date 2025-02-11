import { deepMerge } from "@vivalence/shared";
import { wrap } from "@mikro-orm/core";

export default async function installUnit(input, ctx) {
  let operation = "",
    status = "";

  if (!input.unit.slug) throw new Error("Slug missing");

  // We'll look for an existing unit using the same pattern as tag installation
  let unit = await ctx.runtime.entities.unit.findOne({
    slug: input.unit.slug,
    runtime: ctx.runtime.entity.id,
  });

  if (!unit) {
    unit = await ctx.runtime.entities.unit.create(input.unit);
    operation = "create";
  } else {
    unit = wrap(unit).assign(input.unit);
    operation = "update";
  }

  unit.data = unit.data || {};
  unit.data.index = unit.data.index || null;
  unit.data.known = unit.data.known || null;
  unit.data.learning = unit.data.learning || null;
  unit.data.example = deepMerge(unit.data.example, { known: null, learning: null });

  const issues = await ctx.runtime.call("/diagnostics/validate/unit", { unit });
  if (issues[0]) {
    console.log("Unit validation issue /units/install", unit, issues);
    throw new Error("Invalid unit", issues);
  }

  await ctx.runtime.entities.em.flush();

  return {
    unit,
    operation,
    status: "success",
  };
}

// async function forceUnitValidity(unit, ctx) {
//   let operation = null,
//     status = null;
//   const maxItterations = 3;
//   let itteration = 0;

//   while (itteration < maxItterations) {
//     const issues = await ctx.runtime.call("/diagnostics/validate/unit", { unit: { ...unit } });

//     if (!issues[0]) return { status: "success", unit };

//     for (const issue of issues) {
//       const remedy = await ctx.runtime.call("/remedy", { issue });
//       if (!remedy.resolved) return { status: "invalid", operation: "remedy", issue, remedy };
//     }

//     unit = await getUnit(unit, ctx);
//     itteration++;
//   }

//   return { status: "invalid", unit };
// }
