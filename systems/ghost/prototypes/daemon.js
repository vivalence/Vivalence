import { atom } from "nanostores";
import { Path, RemoteRepository } from "@vivalence/typology";
import { Entity } from "./entity.js";

export class Daemon extends Entity {
  id = null;
  slug = null;
  reference = null;
  manifest = null;
  statics = null;
  connection = null;
  call = null;
  cortex = null;
  cargo = null;
  entities = null;
  mounting = null;
  mounted = Promise.withResolvers();
  $modes = null;
  $status = atom({ code: "IDLE" });

  get status() {
    return this.$status.get();
  }
  get modes() {
    return this.$modes.get();
  }

  toJSON() {
    return { id: this.id, slug: this.slug, reference: this.reference === null ? null : this.reference.absolute, manifest: this.manifest, status: this.status };
  }
}

export const DaemonDossier = {
  name: "daemon",
  kind: () => Daemon,
  repository: (schema, dataspace) => {
    const repo = new RemoteRepository(schema.kind());
    repo.connect(dataspace.runtime.branch("/metadata/daemons"));
    repo.find = async () => {
      const roster = await dataspace.runtime.call("/metadata/daemons");
      return repo.epoch(() => Promise.all(roster.map((row) => repo.cast({ id: row.slug, slug: row.slug, reference: row.reference }))));
    };
    return repo;
  },
  use: [
    async (ctx, next) => {
      await next();
      const daemon = ctx.entity;
      daemon.reference = new Path(ctx.raw.reference);
      daemon.connection = ctx.dataspace.runtime.branch(ctx.raw.reference);
      daemon.entities = ctx.dataspace.rung(daemon.connection);
    },
  ],
};
