import onRequest from "./lib/middlewares/onRequest.js";

import diagnostics from "./diagnostics/index.js";
import dependencies from "./dependencies/index.js";
import dependency from "./dependency/index.js";
import instructions from "./instructions/index.js";

export default async function (aperture) {
  const router = aperture.router.create();

  router.route("/", (i, ctx) => ctx.runtime.manifest);

  await [
    instructions,
    dependency,
    dependencies, //
    diagnostics,
  ].reduce((acc, fn) => acc.then(fn), Promise.resolve({ router }));

  aperture.router.use("/runtime/:slug", onRequest, router.routes(), router.allowedMethods());
  return aperture;
}
