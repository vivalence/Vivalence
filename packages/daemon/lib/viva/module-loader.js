import { dirname, extname, fromFileUrl, join } from "https://deno.land/std/path/mod.ts";
import { walk } from "https://deno.land/std/fs/mod.ts";

const VIVA_RUNTIMES_PATH = join(Deno.cwd(), "./runtimes");

async function getVivaFiles(type) {
  const walked = await walk(VIVA_RUNTIMES_PATH, { maxDepth: 8, exts: [".viva.js"] });
  const files = [];
  for await (const entry of walked) {
    files.push(entry);
  }
  return files;
}
async function loadModules(entries, type) {
  const modules = [];
  for (const entry of entries) {
    if (entry.isFile) {
      try {
        const module = await import(entry.path);
        if (!type || module.default.manifest.type === type) {
          modules.push({
            slug: module.default.manifest.slug,
            path: entry.path,
            module: module.default,
          });
        }
      } catch (error) {
        console.error(`[[VIVA MODULE LOADER ERROR]]`);
        console.error(`Error loading module ${entry.path}: ${error.message}`);
        console.error(error);
        throw error;
      }
    }
  }
  return modules;
}
async function importModule(manifest, root, Modules = []) {
  let Module;

  if (manifest.path && root) {
    Module = {
      module: (await import(join(root, manifest.path))).default,
      path: join(root, manifest.path),
      slug: manifest.slug,
    };
  } else {
    const module = Modules.find((c) => c.slug === manifest.slug);
    if (module) {
      Module = {
        module: (await import(module.path)).default,
        path: module.path,
        slug: module.slug,
      };
    }
  }

  return Module;
}

const vivaFiles = await getVivaFiles();
const RuntimeModules = await loadModules(vivaFiles, "Runtime");
const OntologyModules = await loadModules(vivaFiles, "Ontology");
const CorpusModules = await loadModules(vivaFiles, "Corpus");

export async function buildRuntimes() {
  const results = [];

  for (const { path, slug, module: Runtime } of RuntimeModules) {
    const Corpus = await importModule(Runtime.manifest.corpus, dirname(path), CorpusModules);
    const Ontology = await importModule(Corpus.module.manifest.ontology, dirname(Corpus.path), OntologyModules);

    Runtime.Corpus = Corpus.module;
    Runtime.Ontology = Ontology.module;
    results.push(Runtime);
  }

  return results;
}

export const Runtimes = await buildRuntimes();
