import { RemoteRepository, Status, is } from "@vivalence/typology";
import { atom } from "nanostores";
import { Entity } from "../../prototypes/entity.js";
import * as traits from "./traits/index.js";
import { applyTraits } from "../../gestalten/belt/index.js";

export class Mode extends Entity {
  status = new Status();
  metadata = {};

  $app = atom(null);

  get app() {
    return this.$app.get();
  }

  set app(value) {
    this.$app.set(value ?? null);
  }

  implements(trait) {
    return this.traits?.includes(trait.toUpperCase());
  }

  toJSON() {
    const { $app, ...base } = super.toJSON();
    return { ...base, app: this.app };
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

    // @beef: choice pending.
    // async (ctx, next) => {await next(); ctx.entity.connection.use(async (rqx, rext) => {await rext(); return; const body = rqx.response?.body; if (body?.entities && is.yieldish(body)) {for (const [name, pojos] of Object.entries(body.entities)) {const repository = ctx.daemon.entities[name]; if (!repository) continue; body.entities[name] = await Promise.all(pojos.map((pojo) => repository.merge(pojo)));}}});},

    applyTraits(traits),

    async (ctx, next) => {
      await next();
      ctx.entity.daemon = ctx.daemon;
      ctx.entity.mount = ctx.daemon.mount.branch(`/mode/${ctx.entity.type}/${ctx.entity.slug}`);
      ctx.entity.connection = ctx.daemon.connection.branch(`/mode/${ctx.entity.type}/${ctx.entity.slug}`);
      ctx.entity.link = ctx.daemon.link.branch(`/${ctx.entity.type}/${ctx.entity.slug}`);
    },
  ],
};
