import { shape, shard, Seek, Blacklist, Yield, accumulator } from "@vivalence/typology";

export const EMITTER = async (mode, daemon) => {
  if (!mode.cake.emitter) return;

  mode.cake.emitter.use(
    shard.ambient.assign((store) => ({
      user: store.user,
      entities: store.entities,
    })),
  );

  mode.cake.emitter.use(async (ctx, next) => {
    ctx.daemon = daemon;
    ctx.mode = mode;

    if (!ctx.input) console.log("INPUT MISSING?!", { ctx });
    if (ctx.input.thread) {
      ctx.thread = await daemon.entities.thread.findOne(ctx.input.thread);
    }

    await next();
  });

  mode.cake.emitter.use(async (ctx, next) => {
    // if (ctx.input.seek) ctx.input.seek = await new Seek().fromMask(ctx.input.seek, ctx);
    if (ctx.input.blacklist) ctx.input.blacklist = new Blacklist(ctx.input.blacklist);
    await next();
  });

  mode.cake.emitter.use(async (ctx, next) => {
    ctx.yield = accumulator();
    await next();

    const raw = ctx.output;
    const result = raw?.condition ? raw : ctx.yield.resolve(raw);

    if (ctx.thread && result.condition === "NOMINAL") {
      for (const buffer of result.buffers) {
        buffer.thread = ctx.thread;
        buffer.index = ctx.thread.counter++;
      }
    }

    await daemon.entities.em.flush();
    ctx.output = result;
  });

  const compiled = shape.object(mode.cake.emitter);
  mode.emit = Object.fromEntries(
    Object.entries(compiled).map(([key, fn]) => [
      key,
      async (...args) => {
        const result = await fn(...args);
        return result?.condition === "NOMINAL" ? result.buffers : result;
      },
    ]),
  );
  mode.aperture.branch("/emit").slurp(mode.cake.emitter);
};

// export const EMITTER = async (mode, daemon) => {
//   if (!mode.cake.emitter) return;
//   mode.cake.emitter.use(async (ctx, next) => { ctx.daemon = daemon; ctx.mode = mode; await next(); });
//   mode.cake.emitter.use(async (ctx, next) => {
//     if (ctx.input.seek) ctx.input.seek = await new Seek().fromMask(ctx.input.seek, ctx);
//     if (ctx.input.blacklist) ctx.input.blacklist = new Blacklist(ctx.input.blacklist);
//     await next();
//   });
//   mode.cake.emitter.use(async (ctx, next) => {
//     await next();
//     if (!ctx.input.thread) return;
//     const session = await daemon.entities.thread.findOne(ctx.input.thread);
//     for (const [index, pojo] of ctx.output.entries()) {
//       ctx.output[index] = daemon.entities.buffer.create({
//         mode: pojo.mode, session: ctx.input.thread, status: pojo.status,
//         traits: pojo.traits, trait: pojo.trait, position: session.counter++,
//       });
//     }
//     await daemon.entities.em.flush();
//   });
//   mode.cake.emitter.use(async (ctx, next) => {
//     await next();
//     const raw = ctx.output;
//     const raws = Array.isArray(raw) ? raw.flat() : [raw];
//     ctx.output = raws.map((r) => ({
//       mode: r.mode ?? mode.entity.id, status: r.status ?? "PENDING",
//       traits: r.traits ?? [], trait: r.trait ?? {},
//     }));
//   });
//   mode.emit = shape.object(mode.cake.emitter);
//   mode.aperture.branch("/emit").slurp(mode.cake.emitter);
// };
