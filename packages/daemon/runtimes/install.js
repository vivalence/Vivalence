const success = (manifest, installed, runtime) => {
  manifest.installed = true;
  manifest.id = installed.id;

  return runtime.locals.supabase
    .from(manifest.type)
    .update({ installed: true })
    .eq("id", manifest.id);
};

export default async function install({ runtimes, ...params }) {
  for (const runtime of runtimes.values()) {
    for (const { manifest, Module } of [
      runtime.ontology,
      runtime.corpus,
      ...runtime.games,
      ...runtime.tactics,
    ]) {
      if (manifest.installed) continue;
      let installed = false;

      if (Module.install && typeof Module.install === "function") {
        installed = await Module.install(runtime, { manifest, Module });
      } else if (Module.install === undefined && manifest.id) {
        installed = manifest;
      }

      if (installed) await success(manifest, installed, runtime);
    }
  }

  return { runtimes, ...params };
}
