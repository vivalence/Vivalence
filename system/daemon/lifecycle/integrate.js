import { context, mw as mwa } from "@vivalence/vector/aperture";
import { mw, compiler, controller } from "@vivalence/vector";
import { secure, is } from "@vivalence/shared";
import { Application } from "oak";

export async function serve(daemon) {
  const app = new Application();
  app.use(mwa.notFound);
  app.use(mwa.cors);
  app.use(daemon.aperture.compose(true));

  const PORT = parseInt(daemon.config.server.port);

  daemon.server = app.listen({ port: PORT });
  console.log("daemon listening on port:", PORT);
}

export async function runtimes(daemon) {
  for (const rme of daemon.runtimes) {
    await call(rme);
    // await modules(rme);
    // await ontology(daemon);
    await twitch(rme);
    // datasets
  }
}

export async function attach(daemon) {
  for (const rme of daemon.runtimes) {
    daemon.aperture
      .branch(`/runtime/${rme.slug}`)
      .use(
        secure.context(
          rme.instance.services.identity,
          rme.instance.entities.user,
        ),
      )
      .use(secure.authorize())
      .descendants.push(rme.instance.aperture);

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

async function twitch(rme) {
  const subscriptions = rme.instance.entities.on.patterns
    .map((p) => p.signature)
    .map((s) => rme.register.domain.data.map[s].entity);

  const subscriber = new compiler.Subscriber(
    subscriptions,
    async (signal, event) => {
      const [effect, apply] = controller //
        .traverse(rme.instance.entities.on, signal);
      const context = { event, runtime: rme.instance };
      context.runtime.entities.em = context.runtime.entities.em.fork();
      await apply(context, async (ctx) => (ctx.effect = await effect(ctx)));
      await context.runtime.entities.em.flush();
    },
  );

  rme.instance.entities.em
    .getEventManager() //
    .registerSubscriber(subscriber);
}
