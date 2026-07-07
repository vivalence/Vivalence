import { Vector, shape, steer, shard, soma } from "@vivalence/typology";

export const HARNESSED = (mode, daemon) => {
  if (!daemon.cortex) throw new Error("HARNESSED: daemon has no cortex");

  const harness = new Vector();

  harness.use(shard.context.bind("daemon", daemon));
  harness.use(shard.context.bind("mode", mode));

  harness.use(async (ctx, next) => {
    const input = typeof ctx.input === "string" ? { prompt: ctx.input } : (ctx.input ?? {});
    const { system, prompt, turns, output, tune, tools, config } = input;

    const hallucination = daemon.cortex.hallucination({
      ...config,
      ...(tune && { tune }),
    });
    if (output) hallucination.output.object(output);
    if (system) hallucination.context.system(system);
    if (tools) hallucination.entities.tool.add(tools);
    if (turns) hallucination.entities.turn.append(turns);
    else if (prompt)
      hallucination.entities.turn.append({ role: "user", parts: [{ type: "text", text: prompt }] });

    ctx.hallucination = hallucination;
    ctx.input = input;
    await next();
  });

  // DIALOGUE
  harness
    .branch("/dialogue")
    .use(async (ctx, next) => {
      await next();

      if (ctx.output?.[Symbol.asyncIterator]) {
        const source = ctx.output;
        let turn = null;
        let parent = ctx.turn;
        const created = [];
        ctx.output = (async function* () {
          try {
            for await (const packet of source) {
              turn = soma.pour(turn, packet);
              if (packet.event === "/turn/close") {
                parent = ctx.daemon.entities.turn.create({
                  role: turn.role,
                  parts: turn.parts,
                  meta: turn.meta,
                  parent,
                  thread: ctx.input.thread,
                  mode: ctx.mode.id,
                });
                created.push(parent);
                turn = null;
              }
              yield packet;
            }
            await ctx.daemon.entities.em.flush();
          } catch (error) {
            for (const entity of created) ctx.daemon.entities.em.remove(entity);
            throw error;
          }
        })();
      } else if (ctx.output?.role) {
        await ctx.daemon.entities.turn.chain({
          role: ctx.output.role,
          parts: ctx.output.parts,
          meta: ctx.output.meta,
          parent: ctx.turn,
          thread: ctx.input.thread,
          mode: ctx.mode.id,
        });
      }
    })
    .use(async (ctx, next) => {
      const history = await ctx.daemon.entities.turn.history({ thread: ctx.input.thread });
      ctx.turn = await ctx.daemon.entities.turn.chain({
        role: "user",
        parts: ctx.input.parts,
        parent: history.at(-1) ?? null,
        thread: ctx.input.thread,
        mode: ctx.mode.id,
      });
      ctx.hallucination.entities.turn.replace([...history, ctx.turn]);
      await next();
    });

  for (const type of ["dialogue", "object", "speech", "verbatim"])
    harness
      .branch(type)
      .open("render", (ctx) => ctx.hallucination[type].render())
      .open("stream", (ctx) => ctx.hallucination[type].stream());

  if (mode.module.harness) harness.slurp(mode.module.harness);

  return () => {
    mode.aperture.branch("/harness").slurp(harness);
    mode.harness = shape.object(harness, steer.strategy.echo);
  };
};
