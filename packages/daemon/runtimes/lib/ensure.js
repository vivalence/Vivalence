export default async function ensure(Module, { locals }) {
  let data;
  const select = "id, slug, name, installed";
  const query = await locals.supabase
    .from(Module.manifest.type)
    .select(select)
    .eq("slug", Module.manifest.slug)
    .single();

  if (query.error && query.error.code !== "PGRST116") throw query.error;
  else if (query.data) data = query.data;
  else if (!query.data) {
    let insert = { slug: Module.manifest.slug, name: Module.manifest.name };
    if (Module.manifest.version) insert.version = Module.manifest.version;
    insert = await locals.supabase
      .from(Module.manifest.type)
      .insert(insert)
      .select(select)
      .single();
    if (insert.error) throw insert.error;
    if (data) data = insert.data;
  }
  return { manifest: { ...data, ...Module.manifest } };
}
