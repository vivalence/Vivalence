const select = "id, slug, name, installed";

export default async function ensure(Module, runtime) {
  let data;
  let query = runtime.locals.supabase
    .from(Module.manifest.type)
    .select(select)
    .eq("slug", Module.manifest.slug);
  if (runtime.manifest) query = query.eq("runtimeId", runtime.manifest.id);
  const result = await query.single();

  if (result.error && result.error.code !== "PGRST116") throw result.error;
  else if (result.data) data = result.data;
  else {
    const insert = {
      slug: Module.manifest.slug,
      name: Module.manifest.name,
      runtimeId: runtime.manifest.id,
    };

    if (Module.manifest.version) insert.version = Module.manifest.version;

    const update = await runtime.locals.supabase
      .from(Module.manifest.type)
      .insert(insert)
      .select(select)
      .single();

    if (update.error) throw update.error;
    else data = update.data;
  }
  return { manifest: { ...data, ...Module.manifest } };
}
