import config from "@vivalence/config";
import { fn } from "@vivalence/shared";

import entities from "./entities/index.js";
import modules from "./modules/index.js";

import events from "./events/index.js";
import aperture from "./aperture/index.js";

async function boot(runtime, daemon) {
  return await fn.reduce(
    [
      // entities.boot,
      modules.runtime,
      modules.ontology,
      modules.corpora,
      modules.tactics,
      modules.games,
      modules.strategies,
      aperture.boot,
      events.boot,
    ],
    runtime,
  );
}

async function install(runtime, daemon) {
  async function ensureTags(runtime) {
    const promises = [];
    for (const dimension of runtime.ontology.dimensions) {
      for (const category of dimension.descendants) {
        const tag = {
          data: {
            ONTOLOGICAL: {
              branch: dimension.slug,
              leaf: category.slug,
            },
          },
        };
        promises.push(runtime.assert.tag(tag, ["EXISTENTIAL"]));
      }
    }
    await Promise.all(promises);
  }

  await ensureTags(runtime);
  return runtime;
}

const manifest = {
  type: "domain",
  slug: "learning",
  name: "Learning",
  description: "Domain for learning with units tags ebisu and annotations",
  version: "0.0.5",
  traits: [],
};

export { manifest, entities, modules, boot, install };
