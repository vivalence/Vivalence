import { strings } from "@vivalence/shared";
import { Manifest, Module, Runtime } from "../../../../types/types.d.ts";
const select = "id, slug, version, installed, name";

export default async function registerModuleManifest(runtime: Runtime, Module: Module) {
  // const user = await runtime.services.identity.getUser();

  let manifest = await findModule(runtime, Module);

  if (!manifest) {
    manifest = await createModule(runtime, Module);
  } else if (Module.manifest.version && manifest.version !== Module.manifest.version) {
    manifest = await updateModule(runtime, Module, manifest);
  }

  if (["runtime", "game", "tactic", "strategy"].includes(Module.manifest.type)) {
    manifest && (manifest.url = `/${Module.manifest.type[0]}/${manifest.slug}`);
  }

  return manifest;
}

async function findModule(runtime: Runtime, Module: Module) {
  if (!runtime.Services.supabase) return;

  let query = runtime.Services.supabase
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

  return data as Manifest;
}

async function createModule(runtime: Runtime, Module: Module) {
  if (!runtime.Services.supabase) return;

  let insert: Record<string, unknown> = {
    slug: Module.manifest.slug,
    name: Module.manifest.name,
  };

  if (!["runtime"].includes(Module.manifest.type)) {
    insert.runtimeId = runtime.Module.manifest.id;
  }

  if (Module.manifest.description) insert.description = Module.manifest.description;
  if (Module.manifest.version) insert.version = Module.manifest.version;
  if (Module.manifest.icon) insert.icon = Module.manifest.icon;

  if (["tactic", "game", "strategy"].includes(Module.manifest.type)) {
    insert = { ...insert, ...Module.data };
  }

  const { data, error } = await runtime.Services.supabase
    .from(strings.capitalize(Module.manifest.type))
    .insert(insert)
    .select(select)
    .single();

  if (error) throw error;

  return data as Manifest;
}

async function updateModule(runtime: Runtime, Module: Module, manifest: Manifest) {
  if (!runtime.Services.supabase) return;

  let update: Record<string, unknown> = {
    slug: Module.manifest.slug,
    name: Module.manifest.name,
    installed: false,
  };

  if (Module.manifest.description) update.description = Module.manifest.description;
  if (Module.manifest.version) update.version = Module.manifest.version;
  if (Module.manifest.icon) update.icon = Module.manifest.icon;

  if (["tactic", "game", "strategy"].includes(Module.manifest.type)) {
    update = { ...update, ...Module.data };
  }

  const query = runtime.Services.supabase
    .from(strings.capitalize(Module.manifest.type))
    .update(update)
    .eq("id", manifest.id)
    .select(select);

  const { data, error } = await query.single();

  if (error) {
    console.error("[updateManifestError]");
    console.error(error);
    throw error;
  }

  return data as Manifest;
}
