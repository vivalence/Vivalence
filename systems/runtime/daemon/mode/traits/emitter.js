import { shape, Seek, Blacklist } from "@vivalence/typology";

export const EMITTER = async (mode, daemon) => {
  if (!mode.cake.emitter) return;

  mode.cake.emitter.use(async (ctx, next) => {
    ctx.daemon = daemon;
    ctx.mode = mode;

    if (ctx.input.session) {
      ctx.session = await daemon.entities.session.findOne(ctx.input.session);
    }

    await next();
  });

  mode.cake.emitter.use(async (ctx, next) => {
    if (ctx.input.seek) ctx.input.seek = await new Seek().fromMask(ctx.input.seek, ctx);
    if (ctx.input.blacklist) ctx.input.blacklist = new Blacklist(ctx.input.blacklist);
    await next();
  });

  mode.cake.emitter.use(async (ctx, next) => {
    await next();
    const raw = ctx.output;
    const entities = Array.isArray(raw) ? raw.flat() : [raw];

    if (ctx.session) {
      for (const buffer of entities) {
        buffer.session = ctx.session;
        buffer.index = ctx.session.counter++;
      }
    }
    await daemon.entities.em.flush();

    ctx.output = entities.map((entity) => ({
      id: entity.id,
      mode: entity.mode?.id ?? entity.mode,
      data: entity.data ?? {},
      index: entity.index ?? 0,
      literals: entity.literals?.getItems?.() ?? [],
      symbols: entity.symbols?.getItems?.() ?? [],
    }));
  });

  mode.emit = shape.object(mode.cake.emitter);
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
//     if (!ctx.input.session) return;
//     const session = await daemon.entities.session.findOne(ctx.input.session);
//     for (const [index, pojo] of ctx.output.entries()) {
//       ctx.output[index] = daemon.entities.buffer.create({
//         mode: pojo.mode, session: ctx.input.session, status: pojo.status,
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
