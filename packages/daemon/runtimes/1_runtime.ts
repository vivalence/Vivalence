import {
  Daemon,
  Module,
  RouterWithExtensions,
  Runtime,
  UnknownObject,
} from "../../../types/types.d.ts";
import createEmitter from "../emitter/create.js";
import createRouter from "../server/router/create.js";
import executionMiddleware from "./lib/executionMiddleware.ts";

export default function (daemon: Daemon) {
  for (const [key, runtime] of daemon.runtimes.entries()) {
    try {
      const { modules, Services, statics } = runtime.Module ?? {};
      runtime.statics = statics;

      if (modules) {
        const { Ontology, Corpora } = modules;
        const corporaArray = Corpora ?? [];

        // Required for TS to infer types. Check if reflects the logic
        const modulesArray = [Ontology, ...corporaArray] as Module[];

        runtime.schema = {};
        runtime.schema = modulesArray.reduce(
          (s, { schema = (s: UnknownObject) => s }) =>
            typeof schema === "function" ? schema(s) ?? s : s,
          runtime.schema,
        );
      }

      if (Services) {
        runtime.services = Object.keys(Services).reduce(
          (acc, slug) => {
            if (typeof Services[slug]?.client === "function") {
              return {
                ...acc,
                [slug]: Services[slug].client(runtime),
              };
            }

            return acc;
          },
          { ...daemon.services },
        );
      }

      runtime.locals = {
        // TODO: type better
        validate: runtime.schema?.validate as () => unknown,
      };

      runtime.router = createRouter() as RouterWithExtensions;
      runtime.bus = createEmitter();

      // Also currently the best solution to switch from
      // one context to another
      executionMiddleware(runtime as Runtime, daemon);
      daemon.runtimes.set(key, runtime);
    } catch (e) {
      console.error("[runtime build error]", e);
    }
  }

  return daemon;
}
