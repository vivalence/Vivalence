import { atom } from "nanostores";
import { Entity, Path, RemoteRepository, Vector } from "@vivalence/typology";

export class Daemon extends Entity {
  type = "daemon";
  id = null;
  slug = null;
  reference = null;
  manifest = null;
  statics = null;
  connection = null;
  aperture = null;
  call = null;
  cortex = null;
  cargo = null;
  entities = null;
  runtime = null;
  $status = atom({ code: "IDLE" });

  get status() {
    return this.$status.get();
  }
  get modes() {
    return this.runtime.entities.mode.$entities.get().filter((mode) => mode.daemon === this);
  }

  toJSON() {
    return { id: this.id, slug: this.slug, reference: this.reference === null ? null : this.reference.absolute, manifest: this.manifest, status: this.status };
  }
}

export const repository = (dataspace) => {
  const repo = new RemoteRepository(Daemon).connect(dataspace.runtime.connection.branch("/metadata/daemons"));
  repo.find = async () => {
    const roster = await dataspace.runtime.connection.call("/metadata/daemons");
    return repo.epoch(() => Promise.all(roster.map((row) => repo.cast({ id: row.slug, slug: row.slug, reference: row.reference }))));
  };
  return repo;
};

export const hydration = new Vector().use(async (ctx, next) => {
  await next();
  ctx.entity.runtime = ctx.runtime;
  ctx.entity.reference = new Path(ctx.raw.reference);
  ctx.entity.connection = ctx.runtime.connection.branch(ctx.raw.reference);
  ctx.entity.aperture = ctx.entity.connection;
  ctx.entity.entities = { mode: ctx.dataspace.branch(ctx.entity.aperture, "mode") };
});
