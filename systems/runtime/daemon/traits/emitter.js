import { shape, shard, Blacklist, Pool } from "@vivalence/typology";

export const EMITTER = async (mode, daemon) => {
  if (!mode.module.emitter) return;

  mode.module.emitter.use(async (ctx, next) => {
    for (const step of ctx.steps ?? []) step.input?.cast(ctx.input);
    await next();
    // console.log("[EMITTER] after()", { input: Object.keys(ctx.input), output: ctx.output });
    // console.log("VALIDATE OUTPUT");
    // for (const step of ctx.steps ?? []) step.output?.cast(ctx.output);
  });

  mode.module.emitter.use(async (ctx, next) => {
    ctx.daemon = daemon;
    ctx.mode = mode;

    if (!ctx.input) console.log("INPUT MISSING?!", { ctx });

    if (ctx.input.thread) {
      ctx.thread = await daemon.entities.thread.findOne(ctx.input.thread);
    } else if (!ctx.thread) {
      throw new Error("[@emitter] THREAD MISSING");
    }

    await next();
  });

  mode.module.emitter.use(async (ctx, next) => {
    ctx.input.blacklist = new Blacklist(ctx.input.blacklist);
    await next();
  });

  mode.module.emitter.use(async (ctx, next) => {
    ctx.pool = new Pool();

    // console.log("playground/spawn", ctx.input);

    await next();

    if (ctx.output != null) ctx.pool.add(ctx.output);

    const result = await ctx.pool.drain();
    // console.log("EMITTER {result}", { result });

    // console.log(result.buffers.map((b) => console.log(b.literals.map((l) => [l.id, l.slug]))));

    if (ctx.thread && result.condition === "NOMINAL") {
      for (const buffer of result.entities.buffer) {
        buffer.thread = ctx.thread;
        buffer.index = ctx.thread.counter++;
      }
    }

    await daemon.entities.em.flush();
    ctx.output = result;
  });

  mode.emit = shape.object(mode.module.emitter);
  mode.aperture.branch("/emit").slurp(mode.module.emitter);
};
