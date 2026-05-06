import { RemoteRepository } from "@vivalence/typology";
import { Entity } from "../prototypes/entity.js";
import * as traits from "../traits/index.js";
import { applyTraits } from "../traits/runner.js";

export class Mode extends Entity {
  implements(trait) {
    return this.traits?.includes(trait.toUpperCase());
  }
}

export const ModeDossier = {
  name: "mode",
  kind: () => Mode,
  repository: (schema, dataspace) => {
    const repo = new RemoteRepository(schema.kind());
    repo.connect(dataspace.connection.branch("/entities/mode"));
    return repo;
  },

  use: [
    applyTraits(traits.mode),

    async (ctx, next) => {
      await next();
      ctx.entity.daemon = ctx.daemon;
      ctx.entity.mount = ctx.daemon.mount.branch(`/mode/${ctx.entity.type}/${ctx.entity.slug}`);
      ctx.entity.connection = ctx.daemon.connection.branch(ctx.entity.mount.nature);
      ctx.entity.call = ctx.entity.connection.call.bind(ctx.entity.connection);
      ctx.entity.link = ctx.daemon.link.branch(`/${ctx.entity.type}/${ctx.entity.slug}`);
    },
  ],
};
