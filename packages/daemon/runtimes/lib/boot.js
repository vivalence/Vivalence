import createRouter from "../../lib/router/create.js";
import ensure from "./ensure.js";

export default async function boot(Module, runtime) {
  const type = Module.manifest.type.toLowerCase();
  const bus = runtime.bus.scope(`@${type}`);
  const router = createRouter();
  const { manifest } = await ensure(Module, runtime);
  const module = await Module.boot({ ...runtime, router, bus }, { manifest, Module });
  return { ...runtime, ...module, manifest, Module };
}
