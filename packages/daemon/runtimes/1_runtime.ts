import { validators } from "@vivalence/shared";

import executionMiddleware from "./lib/executionMiddleware.js";
// import registerManifest from "./lib/registerManifest.js";
import { Daemon, RouterWithExtensions } from "../../../types/types.d.ts";
import createEmitter from "../emitter/create.js";
import createRouter from "../server/router/create.js";

export default function (daemon: Daemon) {
  for (const [key, runtime] of daemon.runtimes.entries()) {
    try {
      const { modules, Services } = runtime.Module;
      runtime.statics = runtime.Module.statics ?? {};

      if (modules) {
        const { Ontology, Corpora } = modules;
        runtime.schema = [Ontology, ...Corpora] //
          .reduce((s, { schema = (s) => s }) => schema(s) || s, { validate: validators.ajv() });
      }

      if (Services) {
        runtime.services = Object.keys(Services).reduce(
          (acc, slug) => ({ ...acc, [slug]: Services[slug].client?.(runtime) }),
          { ...daemon.services }, // unsafe
        );
      }

      // runtime.
      runtime.locals = {
        // deprecated
        validate: runtime.schema.validate,
        // deprecated / is superseeded; in favor of service.database and service.identity.
        // supabase: daemon.services.supabase.createAdminClient(),
        supabase: runtime.services.supabase,
      };

      runtime.router = createRouter() as RouterWithExtensions;
      runtime.bus = createEmitter();

      executionMiddleware(runtime, daemon);

      daemon.runtimes.set(key, runtime);
    } catch (e) {
      console.error("[runtime build error]", e);
    }
  }

  return daemon;
}
