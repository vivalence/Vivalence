import { Aperture } from "@vivalence/vector/aperture";
import { View, Path, Url, Blacklist, is } from "@vivalence/typology";
import { helper } from "@mikro-orm/core";

export const PRODUCTIVE = async (mode, daemon) => {
  if (!mode.cake.producer) {
    console.error("PRODUCTIVE MODE MISSING PRODUCER", { mode });
    return;
  }

  const aperture = new Aperture()

    // ctx population
    .use(async (ctx, next) => {
      ctx.intent = await ctx.daemon.entities.intent //
        .findOne({ id: ctx.input.scope.intent.id });

      ctx.valence = await ctx.daemon.entities.valence //
        .findOne({ id: ctx.input.scope.valence.id });

      await next();
    })

    // debt collection
    .use(async (ctx, next) => {
      await next();

      if (["PENDING", "ERROR", "TERMINATED"].includes(ctx.output.status))
        return;

      const totalProducts = await ctx.daemon.entities.product //
        .count({ intent: ctx.input.scope.intent.id, status: "PENDING" });

      const batchDebt = ctx.input.batch - (ctx.output?.products?.length ?? 0);
      const stockDebt = ctx.input.stock - totalProducts;

      if (stockDebt > 0 || batchDebt > 0) {
        ctx.output.status = "PENDING";

        ctx.daemon.call(
          mode.mount.barf().branch(ctx.valence.data["GENERATIVE"]).absolute,
          { ...ctx.input, batch: 0, stock: Math.max(0, batchDebt) + stockDebt },
        );
      } else {
        ctx.output.status = "SUCCESS";
      }
    })

    // mark output products as active
    .use(async (ctx, next) => {
      await next();
      ctx.output.products.map((product) => (product.status = "ACTIVE"));
      await ctx.daemon.entities.em.flush();
    })

    // greedily pull products
    .use(async (ctx, next) => {
      const pending = await ctx.daemon.entities.product //
        .find(
          { intent: ctx.input.scope.intent.id, status: "PENDING" },
          { limit: ctx.input.batch },
        );

      if (pending.length > 0) {
        return (ctx.output = { products: pending });
      }

      await next();
    })

    // lock mechanism
    .use(async (ctx, next) => {
      if (lock.has(ctx)) {
        ctx.output = { status: "PENDING", products: [] };
        return;
      }

      lock.set(ctx);
      try {
        await next();
      } finally {
        lock.delete(ctx);
      }
    })

    // blacklist
    .use(async (ctx, next) => {
      ctx.input.blacklist = new Blacklist(ctx.input.blacklist);
      await ctx.input.blacklist.fromQueue(ctx.input.scope, ctx);
      await next();
    })

    .use(async (ctx, next) => {
      await next();
      const response = { products: [] };

      if (ctx.input.batch > ctx.output.length) response.status = "TERMINATED";

      ctx.output.forEach((product, index) => {
        if (product.type === "SIGNAL" && product.data.signal === "COMPLETED") {
          response.status = "TERMINATED";
          return;
        }
        if (helper(product)) {
          product.index = index;
          response.products.push(product);
        } else {
          response.products.push(
            ctx.daemon.entities.product //
              .create({ index, data: product.data, ...product.scope }),
          );
        }
      });

      ctx.output = response;
    });

  aperture.slurp(mode.cake.producer);
  mode.aperture.slurp(aperture);
};

const ProductionLock = new Map();

const lockKey = (ctx) =>
  `${ctx.input.scope.intent.id}-${ctx.input.scope.generator.id}-${ctx.mode.entity.id}`;

const lock = {
  has: (ctx) => ProductionLock.has(lockKey(ctx)),
  set: (ctx) => ProductionLock.set(lockKey(ctx), new Date()),
  delete: (ctx) => ProductionLock.delete(lockKey(ctx)),
};
