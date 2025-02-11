import { deepEquals, deepMerge, array } from "@vivalence/shared";
import { wrap } from "@mikro-orm/core";

export default async function installTag(input, ctx) {
  let operation = "",
    status = "";

  if (!input.tag.slug) throw new Error("Slug missing");

  let tag = await ctx.runtime.entities.tag.findOne({
    slug: input.tag.slug,
    runtime: ctx.runtime.entity.id,
  });

  if (!tag) {
    tag = await ctx.runtime.entities.tag.create(input.tag);
    operation = "create";
  } else {
    // TODO: only run when key:vals differ
    tag = wrap(tag).assign(input.tag);
    tag.traits = [...new Set(tag.traits)];
    operation = "update";
  }

  for (const trait of tag.traits) {
    tag.data[trait] = tag.data[trait] || {};
  }

  if (tag.traits.includes("STRUCTURAL") && input.tag.data.STRUCTURAL?.relations?.units?.length) {
    console.log("TODO implement structural relations.");

    //   const units = await ctx.runtime.entities.unit.find({
    //     where: {
    //       slug: { $in: resultTag.data.STRUCTURAL.relations.units.map(unit => unit.slug) }
    //     }
    //   });

    //   for (const chunk of array.chunk(units, config.env.get("INSTALL_CHUNK_SIZE"))) {
    //     await Promise.all(chunk.map(unit =>
    //       ctx.runtime.entities.tagToUnit.create({ tag: resultTag, unit })
    //     ));
    //   }
  }

  if (tag.traits.includes("LEARNABLE") && tag.traits.includes("COMPLETABLE")) {
    throw new Error("Tag cannot be both LEARNABLE and COMPLETABLE");
  }

  if (tag.traits.includes("LEARNABLE")) {
    // TODO: move defaults to domain.Module.statics
    tag.data.LEARNABLE.type = tag.data.LEARNABLE.type || "BAYESIAN";
    tag.data.LEARNABLE.flavor = tag.data.LEARNABLE.flavor || "INDIVIDUAL";
  } else if (tag.traits.includes("COMPLETABLE")) {
    tag.data.COMPLETABLE.flavor = tag.data.COMPLETABLE.flavor || "INDIVIDUAL";
  }

  await ctx.runtime.entities.em.flush();

  return {
    tag,
    operation,
    status: "success",
  };
}

// TODO:
async function forceTagValidity(tag, ctx) {
  const maxItterations = 3;
  let itteration = 0;

  while (itteration < maxItterations) {
    const issues = await ctx.runtime.call("/diagnostics/validate/tag", { tag: { ...tag } });

    if (!issues[0]) return { success: true, status: "valid", tag };

    for (const issue of issues) {
      const remedy = await ctx.runtime.call("/remedy", { issue });
      if (!remedy.resolved) return { success: false, status: "invalid", remedy };
    }

    unit = await getUnit(tag, ctx);
    itteration++;
  }

  return { success: false, status: "invalid", unit };
}
async function connectStructuralTagToUnits(tag, ctx) {
  if (!tag.data.STRUCTURAL?.relations?.units?.length) return;

  const { rows: data, error } = await ctx.runtime.services.db.sql(
    `SELECT id, slug 
     FROM "Unit" 
     WHERE "runtimeId" = $1 
     AND slug IN (SELECT unnest($2::text[])); `,
    [ctx.runtime.manifest.id, tag.data.STRUCTURAL.relations.units.map((unit) => unit.slug)],
  );

  if (error) throw error;

  const created = [];
  for (const units of array.chunk(data, config.env.get("INSTALL_CHUNK_SIZE"))) {
    for (const unit of units) {
      const create = ctx.runtime.services.supabase //
        .from("_TagToUnit")
        .insert({ A: tag.id, B: unit.id });
      created.push(create);
    }
    await Promise.all(created);
    console.log("tag install - structural relations created:", created.length, "/", data.length);
  }
}
