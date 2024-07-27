export default async function install({ runtimes, ...params }) {
  for (const runtime of runtimes.values()) {
    for (const module of [runtime.ontology, runtime.corpus, ...runtime.games]) {
      if (!module.manifest.installed) {
        if (module.Module.install) await module.Module.install(runtime);
        await runtime.locals.supabase
          .from(module.manifest.type)
          .update({ installed: true })
          .eq("id", module.manifest.id);
      }
    }
  }
  return { runtimes, ...params };
}
