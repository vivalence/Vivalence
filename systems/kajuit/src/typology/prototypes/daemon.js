import { Vector, shape, Path, shard } from "@vivalence/typology";
import { Dataspace } from "./dataspace.js";
import { ModeDossier } from "../entities/mode.js";
import { IntentDossier } from "../entities/intent.js";
import { ThreadDossier } from "../entities/thread/index.js";
import { BufferDossier } from "../entities/buffer.js";
import { TurnDossier } from "../entities/turn.js";
import { LiteralDossier } from "../entities/literal.js";

const entities = [ModeDossier, IntentDossier, ThreadDossier, BufferDossier, TurnDossier, LiteralDossier];

export class Daemon {
  manifest = null;
  mount = null;
  connection = null;
  entities = null;
  cargo = {};

  constructor(connection) {
    this.connection = connection;
  }

  get slug() {
    return this.manifest?.slug ?? null;
  }

  getAsset(asset) {
    if (!this.cargo || !asset) return null;
    if (asset.path) return this.cargo[asset.path] ?? null;
    if (asset.slug) {
      const entry = Object.entries(this.cargo).find(
        ([key]) => key.endsWith("/" + asset.slug) || key.startsWith(asset.slug),
      );
      return entry?.[1] ?? null;
    }
    return null;
  }

  toJSON() {
    return {
      slug: this.slug,
      mount: this.mount?.nature ?? null,
      manifest: this.manifest,
    };
  }
}

function seedDaemon(daemon) {
  return (vector) => vector.use(shard.context.attach("daemon", daemon));
}

const lifecycle = new Vector()
  .use(async (ctx, next) => {
    await next();
    ctx.entity.entities = new Dataspace({
      entities,
      connection: ctx.entity.connection,
      seed: seedDaemon(ctx.entity),
    });
    await ctx.entity.entities.init();
    await ctx.entity.entities.populate(["mode"]);
    await ctx.entity.entities.populate(["intent"]);
  })
  .use(async (ctx, next) => {
    await next();
    const [manifest, cargo] = await Promise.all([
      ctx.entity.connection.call("/manifest"),
      ctx.entity.connection.call("/cargo"),
    ]);
    ctx.entity.manifest = manifest;
    ctx.entity.mount = new Path(`/daemon/${manifest.slug}`);
    ctx.entity.cargo = cargo;
    ctx.entity.call = ctx.entity.connection.call.bind(ctx.entity.connection);
    ctx.entity.link = new Path(`/${ctx.lighthouse.manifest.slug}/${manifest.slug}`).rebase("/viva");
  })
  .affect((ctx) => {
    ctx.entity = new Daemon(ctx.connection);
    ctx.entity.lighthouse = ctx.lighthouse;
  });

export const boot = shape.selbstbestimmt(lifecycle, (carry, effect) => async ({ connection, lighthouse }) => {
  const ctx = { connection, lighthouse };
  await carry(ctx, async () => await effect(ctx));
  return ctx.entity;
});
