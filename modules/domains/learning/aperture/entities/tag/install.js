import { deepEquals, deepMerge, array } from "@vivalence/shared";
import { wrap } from "@mikro-orm/core";

export default async function installTag(input, ctx) {
  let operation = "",
    status = "success";

  if (!input.tag.slug) throw new Error("Slug missing");
  // if (!input.tag.slug) input.tag.slug = await ctx.runtime.call("/tag/identity", input.tag);

  let tag = await ctx.runtime.entities.tag.findOne({ slug: input.tag.slug });

  if (!tag) {
    tag = await ctx.runtime.entities.tag.create(input.tag);
    // await ctx.runtime.entities.em.flush();
    operation = "create";
  } else {
    tag = wrap(tag).assign(
      { ...input.tag, traits: array.merge(tag.traits, input.tag.traits) },
      { mergeObjectProperties: true },
    );
    operation = "update";
  }

  if (!tag.data) tag.data = {};
  for (const trait of tag.traits) {
    tag.data[trait] = tag.data[trait] || {};
  }

  if (
    tag.traits.includes("STRUCTURAL") &&
    input.tag.data.STRUCTURAL?.relations?.units?.length
  ) {
    console.log("TODO implement structural relations.");
    // would violate guaranteed order of installations and
    // will fail on first install.

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
    console.log("[TAG INSTALL] traits invalid", tag);
    const deleted = ctx.runtime.entities.em.remove(tag);
    // await ctx.runtime.entities.em.flush();
    return { operation: "trait validation", status: "failure" };
  }

  if (tag.traits.includes("LEARNABLE")) {
    // TODO: move defaults to domain.Module.statics
    tag.data.LEARNABLE.type = tag.data.LEARNABLE.type || "BAYESIAN";
    tag.data.LEARNABLE.flavor = tag.data.LEARNABLE.flavor || "INDIVIDUAL";
  } else if (tag.traits.includes("COMPLETABLE")) {
    tag.data.COMPLETABLE.flavor = tag.data.COMPLETABLE.flavor || "INDIVIDUAL";
  }

  const issues = await ctx.runtime.validate.tag(tag, ["SCHEMATIC"]);
  if (issues.length > 0) {
    console.log("[TAG INSTALL] ISSUES NOT RESOLVED. issues:", issues);
    ctx.runtime.entities.em.remove(tag);
    return { operation: "validation", status: "failure", issues };
  }

  await ctx.runtime.entities.em.flush();

  return {
    tag,
    operation,
    status: "success",
  };
}
