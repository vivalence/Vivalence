import { Aperture } from "@vivalence/vector/aperture";
import { Seek, Blacklist, is, object } from "@vivalence/typology";
import { ProductionRequest, ProductionResult } from "@vivalence/typology";
import { helper } from "@mikro-orm/core";

export const PRODUCTIVE = async (mode, daemon) => {
  if (!mode.cake.producer) {
    console.error("PRODUCTIVE MODE MISSING PRODUCER", { mode });
    return;
  }

  const aperture = new Aperture()

    .use(async (ctx, next) => {
      await next();
    })

    // request normalization + status boundary
    .use(async (ctx, next) => {
      ctx.intent = await ctx.daemon.entities.intent //
        .findOne(ctx.input.scope.intent);

      ctx.valence = await ctx.daemon.entities.valence //
        .findOne(ctx.input.scope.valence);

      if (ctx.input.scope.session)
        ctx.session = await ctx.daemon.entities.session //
          .findOne(ctx.input.scope.session);

      await next();
    })

    // request normalization + status boundary
    .use(async (ctx, next) => {
      const request = new ProductionRequest(ctx.input);

      request.seek = await new Seek().fromMask(ctx.input.seek, ctx);

      ctx.input = request;

      const inventory = await ctx.daemon.entities.product.count({
        intent: request.scope.intent,
        status: { $nin: ["ERROR", "DONE"] },
      });

      await next();

      const status = ctx.output.statusGiven(request, inventory);
      const recall = ctx.output.recallGiven(request, inventory);

      if (recall) {
        const recallPath = mode.mount.barf().branch(ctx.valence.data["producer"]).absolute;
        ctx.daemon.call(recallPath, recall);
      }

      ctx.output.products.forEach((product) => (product.status = "ACTIVE"));

      await ctx.daemon.entities.em.flush();
    })

    // greed — serve from queue
    .use(async (ctx, next) => {
      const query = {
        intent: ctx.input.scope.intent,
        commissioner: ctx.input.scope.commissioner,
        status: { $nin: ["ERROR", "DONE"] },
      };
      if (ctx.input.blacklist?.products) query.id = { $nin: ctx.input.blacklist.products };

      const pending = await ctx.daemon.entities.product //
        .find(query, { limit: ctx.input.batch });

      if (pending.length > 0) {
        ctx.output = ProductionResult.cast.nominal(pending);
        return;
      }
      await next();
    })

    // lock
    .use(async (ctx, next) => {
      if (lock.has(ctx)) {
        ctx.output = ProductionResult.cast.locked();
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

    // persist new products
    .use(async (ctx, next) => {
      await next();

      const result = new ProductionResult(ctx.output);

      if (is.empty(result.products)) return;

      result.products = result.products.map((product, index) => {
        if (helper(product)) {
          product.index = index;
          return product;
        }

        if (!product.scope.producer) product.scope.producer = ctx.mode.id;

        return ctx.daemon.entities.product.create({
          index,
          ...object.omit(product, ["scope"]),
          ...object.pick(product.scope, ProductScopeSet),
        });
      });

      await ctx.daemon.entities.em.flush();

      ctx.output = result;
    });

  aperture.slurp(mode.cake.producer);
  mode.aperture.slurp(aperture);
};

const ProductScopeSet = [
  // TODO: needs to be f(domain.entities) for domain level relations
  "literals",
  "symbols",
  "producer",
  "commissioner",
  "intent",
  "session",
];
const ProductionLock = new Map();

const lockKey = (ctx) =>
  `${ctx.input.scope.intent}-${ctx.input.scope.commissioner}-${ctx.mode.entity}`;

const lock = {
  has: (ctx) => ProductionLock.has(lockKey(ctx)),
  set: (ctx) => ProductionLock.set(lockKey(ctx), new Date()),
  delete: (ctx) => ProductionLock.delete(lockKey(ctx)),
};

// import { Aperture } from "@vivalence/vector/aperture";
// import { object } from "@vivalence/shared";
// import { Blacklist, is, cast } from "@vivalence/typology";

// import { ProductionSignal,ProductionStatus, ProductionRequest,ProductionResult} from "@vivalence/typology";
// import { helper } from "@mikro-orm/core";

// let calls = 0;
// let maxCalls = 3;

// export const PRODUCTIVE = async (mode, daemon) => {
//   if (!mode.cake.producer) {
//     console.error("PRODUCTIVE MODE MISSING PRODUCER", { mode });
//     return;
//   }

//   const aperture = new Aperture()

//     .use(async (ctx, next) => {
//       if (calls++ > maxCalls) throw new Error();
//       console.log("-".repeat(20));
//       await next();
//     })

//     .use(async (ctx, next) => {
//       ctx.intent = await ctx.daemon.entities.intent.findOne({ id: ctx.input.scope.intent.id });
//       ctx.valence = await ctx.daemon.entities.valence.findOne({ id: ctx.input.scope.valence.id });
//       await next();
//     })

//     .use(async (ctx, next) => {
//       const request = ctx.input instanceof ProductionRequest
//         ? ctx.input
//         : new ProductionRequest(ctx.input);

//       ctx.input = request;

//       const inventory = await ctx.daemon.entities.product.count({
//         intent: request.scope.intent.id,
//         status: { $nin: ["ERROR", "DONE"] },
//       });

//       await next();

//       const result = ctx.output
//       const status = ProductionStatus.resolve(request, result, inventory);
//       const recall = request.recall(result, inventory);

//       if (recall) {
//         const recallPath = mode.mount.barf().branch(ctx.valence.data["producer"]).absolute;
//         ctx.daemon.call(recallPath, recall);
//       }

//       ctx.output = { status, products: result.products };
//     })

//     .use(async (ctx, next) => {
//       await next();
//       const result = ctx.output;
//       if (!(result instanceof ProductionResult) || !result.products.length) return;

//       result.products = result.products.map((proto, index) => {
//         if (helper(proto)) {
//           proto.index = index;
//           proto.status = "ACTIVE";
//           return proto;
//         }
//         return ctx.daemon.entities.product.create({
//           index,
//           status: "ACTIVE",
//           data: proto.data,
//           ...proto.scope,
//         });
//       });

//       await ctx.daemon.entities.em.flush();
//     })

//     .use(async (ctx, next) => {
//       const query = {
//         intent: ctx.input.scope.intent.id,
//         status: { $nin: ["ERROR", "DONE"] },
//       };
//       if (ctx.input.blacklist?.products)
//         query.id = { $nin: ctx.input.blacklist.products };

//       const pending = await ctx.daemon.entities.product.find(query, {
//         limit: ctx.input.batch,
//       });

//       if (pending.length > 0) {
//         ctx.output = ProductionResult.from.products(pending);
//         return;
//       }
//       await next();
//     })

//     .use(async (ctx, next) => {
//       if (lock.has(ctx)) {
//         ctx.output = ProductionResult.cast.locked();
//         return;
//       }
//       lock.set(ctx);
//       try {
//         await next();
//       } finally {
//         lock.delete(ctx);
//       }
//     })

//     .use(async (ctx, next) => {
//       ctx.input.blacklist = new Blacklist(ctx.input.blacklist);
//       await ctx.input.blacklist.fromQueue(ctx.input.scope, ctx);
//       await next();
//     })

//     .use(async (ctx, next) => {
//       await next();

//       ctx.output = ProductionResult.from.output(ctx.output);

//       for (const item of ctx.output.products) {
//         if (item.type === "SIGNAL" && item.data?.signal === "COMPLETED") {
//           ctx.output.signal = ProductionSignal.COMPLETED;
//         }
//       }

//       if (ctx.input.batch > 0 && products.length < ctx.input.batch && signal === Signal.FULFILLED)
//         signal = Signal.INCOMPLETE;

//       ctx.output = new ProductionResult(products, signal);
//     });

//   aperture.slurp(mode.cake.producer);
//   mode.aperture.slurp(aperture);
// };

// const ProductionLock = new Map();

// const lockKey = (ctx) =>
//   `${ctx.input.scope.intent.id}-${ctx.input.scope.commissioner.id}-${ctx.mode.entity.id}`;

// const lock = {
//   has: (ctx) => ProductionLock.has(lockKey(ctx)),
//   set: (ctx) => ProductionLock.set(lockKey(ctx), new Date()),
//   delete: (ctx) => ProductionLock.delete(lockKey(ctx)),
// };
// let calls = 0;
// let maxCalls = 3;

// export const PRODUCTIVE = async (mode, daemon) => {
//   if (!mode.cake.producer) {
//     console.error("PRODUCTIVE MODE MISSING PRODUCER", { mode });
//     return;
//   }

//   const aperture = new Aperture()
//     .use(async (ctx, next) => {
//       if (calls++ > maxCalls) throw new Error();
//       console.log("-".repeat(20));
//       console.log("-".repeat(20));
//       console.log("-".repeat(20));
//       await next();
//     })

//     // ctx population
// .use(async (ctx, next) => {
//   ctx.intent = await ctx.daemon.entities.intent //
//     .findOne({ id: ctx.input.scope.intent.id });

//   ctx.valence = await ctx.daemon.entities.valence //
//     .findOne({ id: ctx.input.scope.valence.id });
//   // TODO assert that valence has data.producer

//   await next();//
//     })

//     // debt collection
//     .use(async (ctx, next) => {
//       const request =
//         ctx.input instanceof ProductionRequest
//           ? ctx.input
//           : new ProductionRequest(ctx.input);

//       const inventory = await ctx.daemon.entities.product.count({
//         intent: request.scope.intent.id,
//         status: { $nin: ["ERROR", "DONE"] },
//       });

//       await next();

//       const result = ProductionResult.from.raw(ctx.output, request.batch);
//       ctx.output = result;

//       const recall = request.recall(result, inventory);

//       if (recall) {
//         ctx.output.status = "PENDING";
//         const recallPath = mode.mount
//           .barf()
//           .branch(ctx.valence.data["producer"]).absolute;
//         ctx.daemon.call(recallPath, recall);
//       } else {
//         ctx.output.status = result.toStatus();
//       }
//     })

// //     // mark output products as active
//     .use(async (ctx, next) => {
//       await next();
//       ctx.output?.products?.map((product) => (product.status = "ACTIVE"));
//       await ctx.daemon.entities.em.flush();//
// //     })

// //     // greed
//     .use(async (ctx, next) => {
//       // return await next();
//       const query = {
//         intent: ctx.input.scope.intent.id,
//         status: { $nin: ["ERROR", "DONE"] },
//       };

//       if (ctx.input.blacklist?.products)
//         query.id = { $nin: ctx.input.blacklist.products };

//       const pending = await ctx.daemon.entities.product //
//         .find(query, { limit: ctx.input.batch });

//       if (pending.length > 0) {
//         return (ctx.output = { products: pending });
//       }

//       await next();//
// //     })

// //     // lock
//     .use(async (ctx, next) => {
//       if (lock.has(ctx)) {
//         ctx.output = { status: "PENDING", products: [] };
//         return;
//       }

//       lock.set(ctx);
//       try {
//         await next();
//       } finally {
//         lock.delete(ctx);
//       }//
// //     })

// //     // blacklist
//     .use(async (ctx, next) => {
//       ctx.input.blacklist = new Blacklist(ctx.input.blacklist);
//       await ctx.input.blacklist.fromQueue(ctx.input.scope, ctx);
//       await next();//
// //     })

// //     .use(async (ctx, next) => {
// //       await next();

// //       const response = { products: [] };

// //       if (is.empty(ctx.output)) {
// //         response.status = "TERMINATED";
// //         ctx.output = response;
// //         return;
// //       }
// //       if (!is.array(ctx.output)) ctx.output = cast.array(ctx.output);
// //       if (ctx.input.batch > ctx.output.length) response.status = "TERMINATED";

// //       ctx.output.forEach((product, index) => {
// //         if (
// //           product.type === "SIGNAL" &&
// //           ["COMPLETED"].includes(product.data.signal)
// //         ) {
// //           response.status = "TERMINATED";
// //           return;
// //         }
// //         if (helper(product)) {
// //           product.index = index;
// //           response.products.push(product);
// //         } else {
// //           const entity = ctx.daemon.entities.product //
// //             .create({ index, data: product.data, ...product.scope });

// //           response.products.push(entity);
// //         }
// //       });

// //       ctx.output = response;
// //       await ctx.daemon.entities.em.flush();
// //     });

// //   aperture.slurp(mode.cake.producer);
// //   mode.aperture.slurp(aperture);
// // };

// // const ProductionLock = new Map();

// // const lockKey = (ctx) =>
// //   `${ctx.input.scope.intent.id}-${ctx.input.scope.commissioner.id}-${ctx.mode.entity.id}`;

// // const lock = {
// //   has: (ctx) => ProductionLock.has(lockKey(ctx)),
// //   set: (ctx) => ProductionLock.set(lockKey(ctx), new Date()),
// //   delete: (ctx) => ProductionLock.delete(lockKey(ctx)),
// // };
