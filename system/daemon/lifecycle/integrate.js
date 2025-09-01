import { context, mw as mwa } from "@vivalence/vector/aperture";
import { mw, compiler, controller } from "@vivalence/vector";
import { secure, is } from "@vivalence/shared";
import { Application } from "oak";
import * as lifecycle from "./runtime/index.js";

export async function serve(daemon) {
  const app = new Application();
  app.use(mwa.notFound);
  app.use(mwa.cors);
  app.use(daemon.aperture.compose(true));

  app.addEventListener("listen", ({ hostname, port, serverType }) => {
    console.log(`${"listening on :"}${`${port}`}`);
  });

  const PORT = parseInt(daemon.config.server.port);
  daemon.server = app.listen({ hostname: "127.0.0.1", port: PORT });
}

export async function runtimes(daemon) {
  for (const rme of daemon.runtimes) {
    await call(rme);
    await lifecycle.twitch(rme);
    await lifecycle.expose(rme, daemon);
    // await modules(rme);
    // datasets
  }
}

export async function attach(daemon) {
  daemon.aperture.open("/status", async () => ({
    code: "SUCCESS",
    message: "daemon:/status ok",
  }));

  for (const rme of daemon.runtimes) {
    const attached = daemon.aperture.branch(`/attached/runtime/${rme.slug}`);

    attached
      .branch("/view")
      .use(mw.identity("runtime", rme.instance))
      .branch("/:module/:slug")
      // identity module // filter for module trait
      .open("/bundle/(.*)", async (input, ctx) => {
        const module = ctx.runtime.modules[ctx.params.module][ctx.params.slug];
        const bundle = await module.view.bundle.serve(ctx.params["0"]);
        ctx.response.type = "application/javascript";
        return bundle;
      });

    for (const service of daemon.services) {
      if (service.runtime !== rme.slug) continue;
      if (!service.implements("ATTACHED")) continue;
      if (!service.prototype.server) continue;

      await service.prototype.server(
        service,
        attached
          .branch(`/service/${service.slug}`)
          .use(mw.identity("service", service)),
      );
    }
  }
}

export async function install(daemon) {
  for (const rme of daemon.runtimes) {
    if (rme.register.domain.lifecycle.install)
      await rme.register.domain.lifecycle.install(rme.instance);
  }
}

async function modules(rme) {
  // load module apertures into runtime aperture.
}

async function call(rme) {
  const composed = await rme.instance.aperture.compose(true);
  // .use(notFoundMiddleware)

  rme.instance.call = async (path, body = {}, params = {}) => {
    const ctx = context(path, body, params);
    await composed(ctx);
    if (ctx.response.status === 404) console.log("[404]", ctx.request);
    return ctx.response.body;
  };
}
