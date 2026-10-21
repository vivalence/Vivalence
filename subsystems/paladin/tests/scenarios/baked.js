export default {
  env: { PUBLIC_VIVA_PROBE: "twin", VIVA_SYSTEM_ROLE: "client" },
  instance: {
    manifest: { type: "instance", slug: "twin", version: "0.0.1" },
    environment: { type: "object", properties: {} },
    runtime: { manifest: { slug: "runtime" }, statics: { serve: "http://0.0.0.0:2501/", remote: "http://localhost:2501/" }, reference: "/runtime/runtime", url: "http://localhost:2501/runtime/runtime" },
    clients: [{ manifest: { type: "client", slug: "ghost", version: "0.0.1", traits: [] }, modes: ["@probe/home/console"], reference: "/client/ghost" }],
  },
  wired: { hallucinators: [], consume: {} },
};

export const modes = [
  { manifest: { type: "home", slug: "console", version: "0.0.1", traits: [] }, identifier: "@probe/home/console", module: () => import("./baked.mode.js") },
];
