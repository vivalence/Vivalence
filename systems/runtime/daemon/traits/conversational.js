import { Vector, shape, soma } from "@vivalence/typology";

export const CONVERSATIONAL = async (mode, daemon) => {
  if (!mode.cake.dialogue) return;

  const dialogue = new Vector();

  // Layer 1: context — resolve thread, attach ambient state
  dialogue.use(async (ctx, next) => {
    ctx.daemon = daemon;
    ctx.mode = mode;
    ctx.thread = await daemon.entities.thread.findOne(ctx.input.thread);
    await next();
  });

  // Layer 2: setup — load history, create user turn, spawn hallucinate
  dialogue.use(async (ctx, next) => {
    const history = await daemon.entities.turn.find(
      { thread: ctx.thread },
      { orderBy: { createdAt: "ASC" } },
    );

    ctx.turn = daemon.entities.turn.create({
      role: "user",
      parts: [{ type: "text", text: ctx.input.message }],
      parent: history.at(-1) ?? null,
      thread: ctx.thread,
      mode: mode.id,
    });
    await daemon.entities.em.flush();

    ctx.hallucinate = daemon.cortex.spawn()
      .add(...history, ctx.turn)
      .tune(ctx.input.tune ?? mode.cake.tune ?? "balanced");

    await next();
  });

  // Layer 3: output — persistence via inline scribe pattern
  dialogue.use(async (ctx, next) => {
    await next();

    if (!ctx.output) {
      ctx.output = await ctx.hallucinate.conversation.stream();
    }

    if (ctx.output?.[Symbol.asyncIterator]) {
      const stream = ctx.output;
      let turn = null;
      let parent = ctx.turn;
      const created = [];

      ctx.output = (async function* () {
        try {
          for await (const packet of stream) {
            turn = soma.pour(turn, packet);
            if (packet.event === "turn.close") {
              parent = daemon.entities.turn.create({
                role: turn.role,
                parts: turn.parts,
                meta: turn.meta,
                parent,
                thread: ctx.thread,
                mode: mode.id,
              });
              created.push(parent);
              turn = null;
            }
            yield packet;
          }
          await daemon.entities.em.flush();
        } catch (error) {
          for (const entity of created) daemon.entities.em.remove(entity);
          throw error;
        }
      })();
    } else if (ctx.output?.role) {
      daemon.entities.turn.create({
        role: ctx.output.role,
        parts: ctx.output.parts,
        meta: ctx.output.meta,
        parent: ctx.turn,
        thread: ctx.thread,
        mode: mode.id,
      });
      await daemon.entities.em.flush();
    }
  });

  // Slurp mode's own dialogue effects (personality, tools, etc.)
  dialogue.slurp(mode.cake.dialogue);

  mode.dialogue = shape.object(dialogue);

  const branch = mode.aperture.branch("/dialogue");
  branch.use(async (ctx, next) => {
    await next();
    if (ctx.output?.[Symbol.asyncIterator]) {
      ctx.response.publish(ctx.output);
    }
  });
  branch.slurp(dialogue);
};
