import { shape, Blacklist, Pool, Vector } from "@vivalence/typology";

export const EMITTER = async (mode, daemon) => {
  if (!mode.module.emitter) return;

  // trait habit: middleware rides a live Vector we own; the read-only module declaration
  // is slurped in — never .use() directly on mode.module.emitter.
  const emitter = new Vector();

  emitter.use(async (ctx, next) => {
    // @beef maybe impleennt as: shards.schematics.input
    for (const step of ctx.steps ?? []) step.input?.cast(ctx.input);
    await next();
    // console.log("[EMITTER] after()", { input: Object.keys(ctx.input), output: ctx.output });
    // console.log("VALIDATE OUTPUT");
    // for (const step of ctx.steps ?? []) step.output?.cast(ctx.output);
  });

  emitter.use(async (ctx, next) => {
    ctx.daemon = daemon;
    ctx.mode = mode;
    // ctx.thread

    if (!ctx.input) console.log("INPUT MISSING?!", { ctx });

    // thread is OPTIONAL — turn-free / standalone modes (riddler) emit without one.
    // emitter requires thread.
    if (ctx.input.thread) ctx.thread = await daemon.entities.thread.findOne(ctx.input.thread);

    ctx.input.blacklist = new Blacklist(ctx.input.blacklist);
    // ctx.hallucination

    await next();
  });

  emitter.use(async (ctx, next) => {
    await next();
  });

  emitter.use(async (ctx, next) => {
    ctx.pool = new Pool();

    // console.log("playground/spawn", ctx.input);

    await next();

    if (ctx.output != null) ctx.pool.add(ctx.output);

    const result = await ctx.pool.drain();
    // console.log("EMITTER {result}", { result });

    // console.log(result.buffers.map((b) => console.log(b.literals.map((l) => [l.id, l.slug]))));

    // buffers bind + index onto the thread only when a thread is present.
    if (ctx.thread && result.condition === "NOMINAL") {
      for (const buffer of result.entities.buffer) {
        buffer.thread = ctx.thread;
        buffer.index = ctx.thread.counter++;
      }
    }

    await daemon.entities.em.flush();
    ctx.output = result;
  });

  emitter.slurp(mode.module.emitter);

  return () => {
    mode.aperture.branch("/emit").slurp(emitter);
    mode.emit = shape.object(emitter);
  };
};
