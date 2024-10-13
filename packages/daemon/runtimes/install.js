const success = (manifest, runtime) => {
  manifest.installed = true;
  manifest.id = manifest.id;

  return runtime.locals.supabase
    .from(manifest.type)
    .update({ installed: true })
    .eq("id", manifest.id);
};

export default async function install({ runtimes, ...params }) {
  for (const runtime of runtimes.values()) {
    for (const { manifest, Module } of [
      runtime.domain,
      runtime.ontology,
      ...runtime.corpora.values(),
      ...runtime.games.values(),
      ...runtime.tactics.values(),
    ]) {
      if (manifest.installed) continue;
      let installed = false;

      if (Module.install && typeof Module.install === "function") {
        console.log("[RUNTIME] installing", manifest);
        installed = !!(await Module.install(runtime, { ...Module, manifest }));
      } else if (Module.install === undefined && manifest.id) {
        installed = true;
      }

      if (installed) await success(manifest, runtime);
    }
  }

  return { runtimes, ...params };
}
