import { Blacklist, contexts, is, Pool, shape, shard, Vector } from "@vivalence/typology";

export const EMITTER = async (mode, context) => {
  if (!mode.module.emitter) return;

  // trait habit: middleware rides a live Vector we own; the read-only module declaration
  // is slurped in — never .use() directly on mode.module.emitter.
  const emitter = new Vector();

  emitter.use(async (ctx, next) => {
    // @beef maybe impleennt as: shards.schematics.input
    for (const step of ctx.steps ?? []) if (step.input) ctx.input = step.input.cast(ctx.input);
    await next();
    // console.log("[EMITTER] after()", { input: Object.keys(ctx.input), output: ctx.output });
    // console.log("VALIDATE OUTPUT");
    // for (const step of ctx.steps ?? []) step.output?.cast(ctx.output);
  });

  emitter.use(async (ctx, next) => {
    Object.assign(ctx, shard.context.lift(contexts.host, context));
    ctx.mode = mode;
    // ctx.thread

    if (!ctx.input) console.log("INPUT MISSING?!", { ctx });

    // emitter requires thread.
    ctx.thread = await context.entities.thread.findOneOrFail({ id: ctx.input.thread });

    ctx.input.blacklist = new Blacklist(ctx.input.blacklist);
    // ctx.hallucination

    await next();
  });

  emitter.use(async (ctx, next) => {
    await next();
  });

  emitter.use(async (ctx, next) => {
    ctx.pool = new Pool();

    await next();

    if (is.promise(ctx.output)) ctx.output = await ctx.output;

    let output;
    if (is.yieldish(ctx.output) || is.buffers(ctx.output)) {
      ctx.pool.add(ctx.output);
    } else if (!is.nill(ctx.output)) output = ctx.output;

    const result = await ctx.pool.drain();
    if (output !== undefined) result.output.object = output;

    if (result.condition === "NOMINAL") {
      for (const buffer of result.output.buffer) ctx.thread.bindBuffer(buffer);
    }

    await context.entities.em.flush();

    ctx.output = result;
  });

  emitter.graft(mode.module.emitter);

  return () => {
    mode.aperture.branch("/emit", emitter);
    // the emitter is NOT armed as a tool: a tool that draws has to exist separately and delegate.
    mode.emit = shape.object(emitter);
  };
};
