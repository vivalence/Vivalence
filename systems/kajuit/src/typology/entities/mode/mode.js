import { RemoteRepository, Status } from "@vivalence/typology";
import { Entity } from "../../prototypes/entity.js";
import * as traits from "./traits/index.js";
import { applyTraits } from "../../gestalten/belt/index.js";

export class Mode extends Entity {
  status = new Status();
  metadata = {};
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
    async (ctx, next) => {
      try {
        await next();
        ctx.entity.status.set("healthy");
      } catch (error) {
        if (!["CLIENT", "NETWORK", "TIMEOUT"].includes(error?.type)) {
          ctx.entity.status.set({ code: "error", error });
          throw error;
        }
        ctx.entity.status.set({ code: "unavailable", error });
      }
    },

    applyTraits(traits),

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
