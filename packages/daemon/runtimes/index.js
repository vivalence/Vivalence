import createEmitter from "../lib/emitter.js";
import { Runtimes } from "../lib/viva/module-loader.js";

const ensure = async (manifest, locals) => {
  let data;
  const select = "id, slug, name";
  const query = await locals.supabase.from(manifest.type).select(select).eq("slug", manifest.slug).single();
  if (query.error && query.error.code !== "PGRST116") throw error;
  else if (query.data) data = query.data;
  else if (!query.data) {
    let insert = { slug: manifest.slug, name: manifest.name };
    if (manifest.version) insert.version = manifest.version;
    insert = await locals.supabase.from(manifest.type).insert(insert).select(select).single();
    if (insert.error) throw insert.error;
    if (data) data = insert.data;
  }
  return data;
};
const connect = async ({ runtime, ontology, corpus }, locals) => {
  // maybe gate this?! @lj
  await locals.supabase
    .from("Runtime")
    .update({ ontologyId: ontology.id, corpusId: corpus.id })
    .eq("id", runtime.id)
    .select("*")
    .single();
};

export default async function ({ router, locals, ...params }) {
  const runtimes = new Map();

  for (const Runtime of Runtimes) {
    let ontology = await ensure(Runtime.Ontology.manifest, locals);
    let corpus = await ensure(Runtime.Corpus.manifest, locals);
    let runtime = await ensure(Runtime.manifest, locals);
    await connect({ runtime, ontology, corpus }, locals);

    runtime = {
      ...runtime,
      ontology: ontology,
      corpus: corpus,
      module: Runtime,
      bus: createEmitter(),
      router: router.scope(`/runtime/${Runtime.manifest.slug}`),
    };

    ontology = await Runtime.Ontology.boot({ ...runtime, bus: runtime.bus.scope(`@Ontology`) }, locals);
    corpus = await Runtime.Corpus.boot({ ...runtime, bus: runtime.bus.scope(`@Corpus`) }, locals);

    runtime.ontology = ontology;
    runtime.corpus = corpus;

    runtimes.set(Runtime.manifest.slug, runtime);
  }

  return { ...params, runtimes, router };
}

// boot could be abstracted @lj:
// [Ontology, Corpus].reduce(async (module) => (runtime = await boot(module,runtime)));
