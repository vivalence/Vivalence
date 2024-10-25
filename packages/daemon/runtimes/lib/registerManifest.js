import { strings } from "@vivalence/shared";
const select = "id, slug, version, installed, name";

async function findModule(runtime, Module) {
  let query = runtime.locals.supabase
    .from(strings.capitalize(Module.manifest.type))
    .select(select)
    .eq("slug", Module.manifest.slug);

  if (!["runtime"].includes(Module.manifest.type)) {
    query = query.eq("runtimeId", runtime.Module.manifest.id);
  }

  const { error, data } = await query.single();
  if (error && error.code !== "PGRST116") {
    throw error;
  }
  return data;
}

async function createModule(runtime, Module) {
  let insert = {
    slug: Module.manifest.slug,
    name: Module.manifest.name,
  };
  if (!["runtime"].includes(Module.manifest.type)) {
    insert.runtimeId = runtime.Module.manifest.id;
  }
  if (Module.manifest.description) insert.description = Module.manifest.description;
  if (Module.manifest.version) insert.version = Module.manifest.version;
  if (["tactic", "game", "strategy"].includes(Module.manifest.type)) {
    insert = { ...insert, ...Module.data };
  }
  const { data, error } = await runtime.locals.supabase
    .from(strings.capitalize(Module.manifest.type))
    .insert(insert)
    .select(select)
    .single();
  if (error) throw error;
  return data;
}

async function updateModule(runtime, Module, manifest) {
  let update = {
    slug: Module.manifest.slug,
    name: Module.manifest.name,
    installed: false,
  };
  if (Module.manifest.description) update.description = Module.manifest.description;
  if (Module.manifest.version) update.version = Module.manifest.version;

  if (["tactic", "game", "strategy"].includes(Module.manifest.type)) {
    update = { ...update, ...Module.data };
  }
  let query = runtime.locals.supabase
    .from(strings.capitalize(Module.manifest.type))
    .update(update)
    .select(select)
    .eq("id", manifest.id);

  const { data, error } = await query.single();
  if (error) {
    console.error("[updateManifestError]");
    console.error(error);
    throw error;
  }
  return data;
}

export default async function registerModuleManifest(runtime, Module) {
  // console.log("registerModule", Module);
  let manifest = await findModule(runtime, Module);
  if (!manifest) {
    manifest = await createModule(runtime, Module);
  } else if (Module.manifest.version && manifest.version !== Module.manifest.version) {
    manifest = await updateModule(runtime, Module, manifest);
  }

  if (["runtime", "game", "tactic", "strategy"].includes(Module.manifest.type)) {
    manifest.url = `/${Module.manifest.type[0]}/${manifest.slug}`;
  }

  return manifest;
}
