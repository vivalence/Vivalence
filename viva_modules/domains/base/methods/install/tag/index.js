export default async function (body, ctx) {
  let { tag } = body;

  if (!tag.slug) throw new Error("Tag slug is required");

  // const issues = await ctx.runtime.call("/diagnostics/validate/tag", { tag: { ...tag } });
  // if (issues[0]) throw new Error("Invalid unit", issues);

  const existingTag = await getTag(tag, ctx);
  if (existingTag) {
    const { data, error } = await ctx.runtime.locals.supabase
      .from("Tag")
      .update({ ...tag })
      .eq("id", existingTag.id)
      .select("*")
      .single();

    if (error) throw error;
    tag = data;
  } else {
    const { data, error } = await ctx.runtime.locals.supabase
      .from("Tag")
      .insert({ runtimeId: ctx.runtime.manifest.id, ...tag })
      .select("*")
      .single();

    if (error) throw error;
    tag = data;
  }

  // const valid = await forceTagValidity(tag, ctx);
  return { tag };
}

async function getTag(tag, ctx) {
  let query = ctx.runtime.locals.supabase
    .from("Tag")
    .select("*")
    .eq("runtimeId", ctx.runtime.manifest.id);

  if (tag.id) query = query.eq("id", tag.id);
  else if (tag.slug) query = query.eq("slug", tag.slug);

  const { data, error } = await query.single();

  if (error && error.code !== "PGRST116") throw error;
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
