import createEmitter from "../lib/emitter.js";
import createRouter from "../lib/router.js";
import { getCorporaModules, getOntologyModule } from "./module-loader.js";

export default async function bootModules() {
    const runtimes = new Map();
    const router = createRouter();

    for (const Corpus of await getCorporaModules()) {
        const id = Corpus.manifest.id;
        if (runtimes.has(id)) throw new Error(`Duplicate runtime id: ${id}`);
        const Ontology = await getOntologyModule(Corpus);

        const locals = {};

        const runtime = {
            bus: createEmitter(),
            router: router.scope(`/corpus/${id}`)
        };

        runtime.ontology = await Ontology.boot(
            { ...runtime, bus: runtime.bus.scope(`@Ontology`), module: Ontology },
            locals
        );

        runtime.corpus = await Corpus.boot(
            { ...runtime, bus: runtime.bus.scope(`@Corpus`), module: Corpus },
            locals
        );

        runtimes.set(id, runtime);
    }

    return { runtimes, router };
}
