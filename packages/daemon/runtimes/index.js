import createEmitter from "../lib/emitter.js";
import { Runtimes } from "../lib/viva/module-loader.js";
import { connect, createRuntimeLocals, ensure } from "./lib.js";

export default async function ({ router, ...params }) {
  const runtimes = new Map();
  const locals = await createRuntimeLocals();

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

    ontology = await Runtime.Ontology.boot(
      { ...runtime, bus: runtime.bus.scope(`@Ontology`) },
      locals,
    );
    corpus = await Runtime.Corpus.boot({
      ...runtime,
      bus: runtime.bus.scope(`@Corpus`),
    }, locals);

    runtime.ontology = ontology;
    runtime.corpus = corpus;

    runtime.router.use(async (ctx, next) => {
      console.log(`[Runtime router use] ${Runtime.manifest.slug} router`);
      ctx.runtime = runtime;
      await next();
    });

    runtimes.set(Runtime.manifest.slug, runtime);
  }

  return { ...params, runtimes, router };
}

// boot could be abstracted @lj:
// [Ontology, Corpus].reduce(async (module) => (runtime = await boot(module,runtime)));
