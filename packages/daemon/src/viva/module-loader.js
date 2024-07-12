import { join, extname, dirname, fromFileUrl } from "https://deno.land/std/path/mod.ts";
import { walk } from "https://deno.land/std/fs/mod.ts";

const BASEPATH = "../../viva";

function verifyVivaModule(module) {
    if (!module.manifest) {
        throw new Error("Viva module missing manifest");
    }
    if (!module.manifest.id) {
        throw new Error("Viva module manifest missing id");
    }
    if (!module.manifest.type) {
        throw new Error("Viva module manifest missing type");
    }
    if (!module.boot) {
        throw new Error("Viva module missing boot");
    }
    if (module.manifest.type === "Corpus") {
        if (!module.manifest.ontology.id) {
            throw new Error("Corpus module missing ontology id");
        }
    }
}
async function loadVivaModules(entries) {
    const modules = new Map();
    const issues = new Map();

    for await (const entry of entries) {
        if (entry.isFile) {
            try {
                const module = await import(entry.path);
                verifyVivaModule(module.default);
                modules.set(module.default.manifest.id, module.default);
            } catch (error) {
                console.error(`Error loading module ${entry.path}: ${error.message}`);
                issues.set(entry.path, error);
            }
        }
    }

    return { modules, issues };
}
async function getVivaFiles(path) {
    const corporaDir = join(dirname(fromFileUrl(import.meta.url)), BASEPATH, path);
    return walk(corporaDir, { maxDepth: 3, exts: [".viva"] });
}
const { modules: Ontologies } = await loadVivaModules(await getVivaFiles("ontologies"));
const { modules: Corpora } = await loadVivaModules(await getVivaFiles("corpora"));

export async function getCorporaModules() {
    return Corpora.values();
}

export async function getOntologyModule(Corpus) {
    const Ontology = Ontologies.get(Corpus.manifest.ontology.id);
    if (!Ontology) {
        throw new Error(
            `Ontology ${Corpus.manifest.ontology.id} not found for corpus ${Corpus.manifest.id}`
        );
    }
    return Ontology;
}
