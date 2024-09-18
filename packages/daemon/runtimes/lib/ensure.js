const select = "id, slug, name, version, installed";

async function findModule(Module, runtime) {
  let query = runtime.locals.supabase
    .from(Module.manifest.type)
    .select(select)
    .eq("slug", Module.manifest.slug);
  if (runtime.manifest) query = query.eq("runtimeId", runtime.manifest.id);
  const { error, data } = await query.single();
  if (error && error.code !== "PGRST116") throw error;
  return data;
}

async function createModule(Module, runtime) {
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

  const { data, error } = await runtime.locals.supabase
    .from(Module.manifest.type)
    .insert(insert)
    .select(select)
    .single();

  if (error) throw error;
  return data;
}

async function updateModule(Module, runtime) {
  let update = {
    slug: Module.manifest.slug,
    name: Module.manifest.name,
    installed: false,
  };

  if (Module.manifest.description) update.description = Module.manifest.description;
  if (Module.manifest.version) update.version = Module.manifest.version;

  if (["Tactic"].includes(Module.manifest.type)) {
    update = { ...update, ...Module.tactic };
  }

  const { data, error } = await runtime.locals.supabase
    .from(Module.manifest.type)
    .update(update)
    .select(select)
    .eq("slug", Module.manifest.slug)
    .single();

  if (error) throw error;
  return data;
}

//  make sure the module is installed in the runtime
export default async function ensure(Module, runtime) {
  if (["Strategy"].includes(Module.manifest.type)) {
    // Strategies are per user, not per runtime, and joinded manually
    return Module.manifest;
  }

  let manifest = await findModule(Module, runtime);

  if (!manifest) {
    manifest = await createModule(Module, runtime);
  } else if (Module.manifest.version && manifest.version !== Module.manifest.version) {
    manifest = await updateModule(Module, runtime);
  }

  return { ...manifest, ...Module.manifest };
}
