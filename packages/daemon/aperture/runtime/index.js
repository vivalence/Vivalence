import dependency from "./dependency/index.js";

import dependencies from "./dependencies.js";

// create router for this scope. add slug middleware .
export default async function runtime(aperture) {
  const router = aperture.router.create();

  router.middleware.push(async (ctx, next) => {
    const url = new URL(ctx.request.url).pathname.split("/");
    const slug = url[url.indexOf("runtime") + 1];

    for (const [_, runtime] of ctx.daemon.runtimes) {
      if (runtime.manifest.slug === slug) {
        ctx.state.runtime = runtime.manifest;
        break;
      }
    }
    if (!ctx.state.runtime) throw new Error("No Runtime found");

    await next();
  });

  router.route("/", (i, ctx) => ctx.state.runtime);
  router.route("/dependencies", dependencies);

  await dependency({ router });

  aperture.router.use(
    "/runtime/:slug",
    ...router.middleware,
    router.routes(),
    router.allowedMethods(),
  );

  return aperture;
}
