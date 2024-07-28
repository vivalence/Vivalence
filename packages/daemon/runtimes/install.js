export default async function install({ runtimes, ...params }) {
  for (const runtime of runtimes.values()) {
    runtime.call = runtime.caller();
    for (const { manifest, Module } of [runtime.ontology, runtime.corpus, ...runtime.games]) {
      if (!manifest.installed) {
        if (Module.install) await Module.install(runtime);
        await runtime.locals.supabase
          .from(manifest.type)
          .update({ installed: true })
          .eq("id", manifest.id);
      }
    }
  }

  return { runtimes, ...params };
}
