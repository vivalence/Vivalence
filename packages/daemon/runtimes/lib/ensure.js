const select = "id, slug, name, installed";

//  make sure the module is installed in the runtime
export default async function ensure(Module, runtime) {
  if (["Strategy"].includes(Module.manifest.type)) {
    // Strategies are per user, not per runtime, and joinded manually
    return { manifest: { ...Module.manifest } };
  }

  // Find module in runtime by slug.
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
    // insert, because not found.
    let insert = {
      slug: Module.manifest.slug,
      name: Module.manifest.name,
      runtimeId: runtime.manifest.id,
    };

    if (Module.manifest.description) insert.description = Module.manifest.description;
    if (Module.manifest.version) insert.version = Module.manifest.version;

    if (["Tactic"].includes(Module.manifest.type)) {
      insert = { ...insert, ...Module.tactic };
    }

    const update = await runtime.locals.supabase
      .from(Module.manifest.type)
      .insert(insert)
      .select(select)
      .single();

    if (["Tactic"].includes(Module.manifest.type)) {
    }

    if (update.error) throw update.error;
    else data = update.data;
  }
  return { manifest: { ...data, ...Module.manifest } };
}
