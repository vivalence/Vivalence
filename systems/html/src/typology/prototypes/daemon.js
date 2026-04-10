import { Vector, shape, Path } from "@vivalence/typology";
import { Dataspace } from "./dataspace.js";
import { ModeSchema } from "../entities/mode.js";
import { IntentSchema } from "../entities/intent.js";
import { ThreadSchema } from "../entities/thread.js";
import { BufferSchema } from "../entities/buffer.js";
import { TurnSchema } from "../entities/turn.js";
import { TraceSchema } from "../entities/trace.js";
import { LiteralSchema } from "../entities/literal.js";

const entities = [ModeSchema, IntentSchema, ThreadSchema, BufferSchema, TurnSchema, TraceSchema, LiteralSchema];

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

function createFactory(daemon) {
  return (carry, effect) => async (raw) => {
    const ctx = {
      raw,
      entity: raw,
      daemon,
      mount: daemon.mount,
      link: daemon.link,
      connection: daemon.connection,
    };
    await carry(ctx, async () => await effect(ctx));
    return ctx.entity;
  };
}

const lifecycle = new Vector()
  .use(async (ctx, next) => {
    await next();
    ctx.entity.entities = new Dataspace({
      entities,
      connection: ctx.entity.connection,
      factory: createFactory(ctx.entity),
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
