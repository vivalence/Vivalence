import ffi from "./deno-ffi.js";

globalThis.__opentuiNodeFfi = ffi;

const WebWorker = globalThis.Worker;

globalThis.Worker = class ModuleWorker extends WebWorker {
  constructor(url, options = {}) {
    super(typeof url === "string" && url.startsWith("/") ? `file://${url}` : url, { type: "module", ...options });
  }
};
