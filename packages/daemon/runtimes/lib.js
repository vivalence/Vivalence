import createSupabaseAdminClient from "../lib/supabase/admin.js";

export async function createRuntimeLocals() {
  const supabase = createSupabaseAdminClient();

  const locals = {
    supabase,
  };

  return locals;
}

export async function ensure(manifest, locals) {
  let data;
  const select = "id, slug, name";
  const query = await locals.supabase
    .from(manifest.type).select(select)
    .eq("slug", manifest.slug).single();

  if (query.error && query.error.code !== "PGRST116") throw query.error;
  else if (query.data) data = query.data;
  else if (!query.data) {
    let insert = { slug: manifest.slug, name: manifest.name };
    if (manifest.version) insert.version = manifest.version;
    insert = await locals.supabase.from(manifest.type).insert(insert).select(select).single();
    if (insert.error) throw insert.error;
    if (data) data = insert.data;
  }
  return data;
}

export async function connect({ runtime, ontology, corpus }, locals) {
  // maybe gate this?! @lj
  await locals.supabase
    .from("Runtime")
    .update({ ontologyId: ontology.id, corpusId: corpus.id })
    .eq("id", runtime.id)
    .select("*")
    .single();
}
