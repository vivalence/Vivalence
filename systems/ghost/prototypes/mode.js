import { RemoteRepository, Status } from "@vivalence/typology";
import { atom } from "nanostores";
import { Entity } from "./entity.js";

export class Mode extends Entity {
  status = new Status();
  metadata = {};

  $application = atom(null);

  get manifest() {
    return { type: this.type, slug: this.slug, name: this.name, description: this.description, version: this.version, traits: this.traits };
  }

  get application() {
    return this.$application.get();
  }

  set application(value) {
    this.$application.set(value);
  }

  implements(trait) {
    return this.traits.includes(trait.toUpperCase());
  }

  toJSON() {
    const { $application, call, emit, harness, ...base } = super.toJSON();
    return { ...base, application: this.application };
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
      await next();
      const host = ctx.entity.daemon === null ? ctx.runtime.daemon : ctx.entity.daemon;
      ctx.entity.runtime = ctx.runtime;
      ctx.entity.host = host;
      ctx.entity.reference = host.reference.branch(`/mode/${ctx.entity.type}/${ctx.entity.slug}`);
      ctx.entity.connection = host.connection.branch(`/mode/${ctx.entity.type}/${ctx.entity.slug}`);
    },
  ],
};
