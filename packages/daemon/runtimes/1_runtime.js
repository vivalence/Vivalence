import config from "@vivalence/config";
import { validators } from "@vivalence/shared";

import executionMiddleware from "./lib/executionMiddleware.js";
import registerManifest from "./lib/registerManifest.js";
import createRouter from "../server/router/create.js";
import createEmitter from "../emitter/create.js";

export default async function (daemon) {
  for (const [key, runtime] of daemon.runtimes.entries()) {
    try {
      const { modules, Services } = runtime.Module;

      runtime.statics = runtime.Module.statics || {};

      runtime.schema = [modules.Ontology, ...modules.Corpora] //
        .reduce((s, { schema = (s) => s }) => schema(s) || s, { validate: validators.ajv() });

      runtime.services = Object.keys(Services).reduce(
        (acc, slug) => ({ ...acc, [slug]: Services[slug].client(runtime) }),
        { ...daemon.services }, // unsafe
      );

      // runtime.
      runtime.locals = {
        // deprecated
        validate: runtime.schema.validate,
        // deprecated / is superseeded; in favor of service.database and service.identity.
        // supabase: daemon.services.supabase.createAdminClient(),
        supabase: runtime.services.supabase,
      };

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
