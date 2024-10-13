import { deepEquals, deepMerge } from "@vivalence/shared";

export default async function (body, ctx) {
  let { tag } = body;
  let operation = null;

  if (!tag.slug) throw new Error("Bounce: Tag slug is required", tag);

  // const issues = await ctx.runtime.call("/diagnostics/validate/tag", { tag: { ...tag } });
  // if (issues[0]) throw new Error("Invalid unit", issues);

  const existingTag = await read(tag, ctx);
  if (existingTag) {
    tag = await update({ new: tag, old: existingTag }, ctx);
    operation = "update";
  } else {
    tag = await create(tag, ctx);
    operation = "create";
  }

  // const valid = await forceTagValidity(tag, ctx);
  return { tag, operation };
}

function ensureTraits(tag) {
  tag.data = tag.data || {};
  for (const trait of tag.traits) {
    tag.data[trait] = tag.data[trait] || {};
  }
  return tag;
}

function ensureMemory(tag) {
  if (tag.traits.includes("LEARNABLE") && tag.traits.includes("COMPLETABLE")) {
    throw new Error("Tag cannot be both LEARNABLE and COMPLETABLE");
  }

  if (tag.traits.includes("LEARNABLE")) {
    tag.data.LEARNABLE.type = tag.data.LEARNABLE.type || "BAYESIAN";
    tag.data.LEARNABLE.flavor = tag.data.LEARNABLE.flavor || "INDIVIDUAL";
  } else if (tag.traits.includes("COMPLETABLE")) {
    tag.data.COMPLETABLE.type = tag.data.COMPLETABLE.type || "BAYESIAN";
    tag.data.COMPLETABLE.flavor = tag.data.COMPLETABLE.flavor || "INDIVIDUAL";
  }

  return tag;
}

async function read(tag, ctx) {
  let query = ctx.runtime.locals.supabase
    .from("Tag")
    .select("id, corpusId, name, slug, description, traits, data")
    .eq("runtimeId", ctx.runtime.manifest.id);

  if (tag.id) query = query.eq("id", tag.id);
  else if (tag.slug) query = query.eq("slug", tag.slug);

  const { data, error } = await query.single();

  if (error && error.code !== "PGRST116") throw error;
  return data;
}

async function update(tags, ctx) {
  // this whole logic is flawed, it will allways update.

  let tag = {
    id: tags.old.id,
    corpusId: tags.old.corpusId,
    name: tags.old.name,
    slug: tags.old.slug,
    description: tags.old.description,
    traits: tags.old.traits,
    data: tags.old.data,
  };
  delete tag.data.test;

  let mergedTag = deepMerge(tag, tags.new);
  mergedTag.traits = [...new Set(mergedTag.traits)];
  if (deepEquals(mergedTag, tags.new)) return existingTag;

  mergedTag = ensureTraits(mergedTag);
  mergedTag = ensureMemory(mergedTag);

  const { data, error } = await ctx.runtime.locals.supabase
    .from("Tag")
    .update({ ...mergedTag, updatedAt: new Date().toISOString() })
    .eq("id", tag.id)
    .select("*")
    .single();

  if (error) throw error;

  return data;
}

async function create(tag, ctx) {
  tag = ensureTraits(tag);
  tag = ensureMemory(tag);

  const { data, error } = await ctx.runtime.locals.supabase
    .from("Tag")
    .insert({ runtimeId: ctx.runtime.manifest.id, ...tag })
    .select("*")
    .single();

  if (error) throw error;
  return data;
}

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
