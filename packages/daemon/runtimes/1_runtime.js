import config from "@vivalence/config";
import { validator } from "@vivalence/shared";

import executionMiddleware from "./lib/executionMiddleware.js";
import registerManifest from "./lib/registerManifest.js";
import createRouter from "../modules/server/router/create.js";
import createEmitter from "../modules/emitter/create.js";

export default async function (daemon) {
  for (const [key, runtime] of daemon.runtimes.entries()) {
    try {
      const { modules, Services } = runtime.Module;

      runtime.statics = runtime.Module.statics || {};

      runtime.locals = {
        validate: validator.schema(),
        // To Be Depracated; in favor of runtime.database and runtime.identity.
        supabase: daemon.supabase.createAdminClient(),
      };

      runtime.schema = [modules.Ontology, ...modules.Corpora] //
        .reduce((s, { schema = (s) => s }) => schema(s) || s, {});

      runtime.services = Object.keys(Services) //
        .reduce((acc, slug) => ({ ...acc, [slug]: Services[slug].client(runtime) }), {});

      runtime.router = createRouter();
      runtime.bus = createEmitter();

      executionMiddleware(runtime, daemon);

      daemon.runtimes.set(key, runtime);
    } catch (e) {
      console.error("[runtime build error]", e);
    }
  }

  return daemon;
}
