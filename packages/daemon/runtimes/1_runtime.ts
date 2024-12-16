import executionMiddleware from "./lib/executionMiddleware.ts";
// import registerManifest from "./lib/registerManifest.js";
import { Daemon, RouterWithExtensions, Runtime } from "../../../types/types.d.ts";
import createEmitter from "../emitter/create.js";
import createRouter from "../server/router/create.js";

export default function (daemon: Daemon) {
  for (const [key, runtime] of daemon.runtimes.entries() as unknown as Map<symbol, Runtime>) {
    try {
      const { modules, Services } = runtime.Module;
      runtime.statics = runtime.Module.statics ?? {};

      if (modules) {
        const { Ontology, Corpora } = modules;
        const corporaArray = Corpora;

        runtime.schema = {};
        runtime.schema = [Ontology, ...corporaArray].reduce(
          (s, { schema = (s: Record<string, unknown>) => s }) =>
            typeof schema === "function" ? schema(s) ?? s : s,
          runtime.schema,
        );
      }

      if (Services) {
        runtime.services = Object.keys(Services).reduce(
          (acc, slug) => ({ ...acc, [slug]: Services[slug].client?.(runtime) }),
          { ...daemon.services },
        );
      }

      runtime.locals = {
        // TODO: type better
        validate: runtime.schema.validate as () => unknown,
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
