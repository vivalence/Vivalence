import config from "@vivalence/config";
import { Vector, parser, shards } from "@vivalence/vector";
import { bundler, secure, is } from "@vivalence/shared";
import { maps } from "@vivalence/entities";
import { path } from "@vivalence/typology";

import * as lifecycle from "../runtime/index.js";

export async function runtimes(daemon) {
  for (const rme of daemon.runtimes) {
    for (const populate of Object.values(lifecycle.populate)) {
      await populate(rme, daemon);
    }
    // checks

    for (const resolve of Object.values(lifecycle.resolve)) {
      await resolve(rme, daemon);
    }
    // checks
  }
}

export async function attachments(daemon) {
  for (const rme of daemon.runtimes) {
    const attached = daemon.aperture.branch(`/attached/runtime/${rme.slug}`);

    attached
      .use(shards.context.attach("runtime", rme.instance))
      .branch("/module/:type/:slug")
      .open("/bundle/(.*)", async (input, ctx) => {
        const { type, slug } = ctx.params;
        const module = ctx.runtime.module[type]?.[slug];
        ctx.response.type = "application/javascript";
        if (config.is.dev) await module?.view?.bundle();
        return module?.view?.serve(path.fromParams(ctx.params))?.text;
      });

    const attachables = [[rme.config.lighthouse, rme.register.lighthouse]];

    for (const attachable of attachables) {
      const { slug, type } = attachable[1].manifest;

      await attachable[1].server(
        attachable[0],
        attached
          .branch(`/${type}/${slug}`)
          .use(shards.middleware.identity(type, attachable[0])),
      );
    }
  }
}
