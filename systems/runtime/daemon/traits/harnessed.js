import { Vector, ToolCall, shape, steer, shard, soma, v } from "@vivalence/typology";

const { Packet } = v.primitives.hallucination;

//@beef i think it might make sense to isolate some of the middlewares into
// ... shards.hal.["xyz"]() which would become our source of truth for cohesion in turn, hallucination etc implementation. nifty.

export const HARNESSED = (mode, daemon) => {
  if (!daemon.cortex) throw new Error("HARNESSED: daemon has no cortex");

  const harness = new Vector();

  harness.use(shard.context.bind("daemon", daemon));
  harness.use(shard.context.bind("mode", mode));

  harness.use(async (ctx, next) => {
    const input = typeof ctx.input === "string" ? { prompt: ctx.input } : (ctx.input ?? {}); // @beef holy shit stop rewriting input for your neurosis.
    const { system, prompt, turns, output, tune, tools, config } = input;

    const hallucination = daemon.cortex.hallucination({
      ...config,
      ...(tune && { tune }),
    });
    if (output) hallucination.output.object(output);
    if (system) hallucination.context.system(system);
    if (tools)
      for (const [name, supplied] of Object.entries(tools)) {
        const { execute, ...edge } =
          typeof supplied === "function" ? { execute: supplied } : supplied;
        hallucination.tools.open({ nature: new ToolCall(name).signal.pathname, ...edge }, execute);
      }
    if (input.thread) hallucination.tools.use(shard.context.bind("thread", input.thread));
    if (turns) hallucination.entities.turn.append(turns);
    else if (prompt)
      //@beef i dont think we watn manual prompt here?! do we? maybe input prompt is parsed later up the tree?! also to guarantee order. hmmm
      hallucination.entities.turn.append({ role: "user", parts: [{ type: "text", text: prompt }] });

    ctx.hallucination = hallucination;
    ctx.input = input;
    await next();
  });

  // DIALOGUE
  harness
    .branch("/dialogue")
    // .use(shard.hal.voice()) @@beef not yet
    .use(async (ctx, next) => {
      const history = await ctx.daemon.entities.turn.history({ thread: ctx.input.thread });
      ctx.turn = await ctx.daemon.entities.turn.chain({
        id: ctx.input.id, // optional — client-minted for identity reconciliation; repo mints if absent
        role: "user",
        parts: ctx.input.parts,
        parent: history.at(-1) ?? null,
        thread: ctx.input.thread,
        mode: ctx.mode.id,
      });
      ctx.hallucination.entities.turn.replace([...history, ctx.turn]);
      await next();
    })
    .use(async (ctx, next) => {
      await next();

      if (ctx.output?.[Symbol.asyncIterator]) {
        const source = ctx.output;
        let folded = null;
        let parent = ctx.turn;
        let persisted = 0;
        const created = [];
        ctx.output = (async function* () {
          try {
            for await (const record of source) {
              folded = soma.transcript(folded, record);
              while (persisted < folded.turns.length) {
                const sealed = folded.turns[persisted++];
                parent = ctx.daemon.entities.turn.create({
                  role: sealed.role,
                  parts: sealed.parts,
                  meta: sealed.meta,
                  parent,
                  thread: ctx.input.thread,
                  mode: ctx.mode.id,
                });
                created.push(parent);
              }
              yield record;
            }
            await ctx.daemon.entities.em.flush();
          } catch (error) {
            for (const entity of created) ctx.daemon.entities.em.remove(entity);
            throw error;
          }
        })();
      } else if (ctx.output?.turns) {
        let parent = ctx.turn;
        for (const sealed of ctx.output.turns)
          parent = await ctx.daemon.entities.turn.chain({
            role: sealed.role,
            parts: sealed.parts,
            meta: sealed.meta,
            parent,
            thread: ctx.input.thread,
            mode: ctx.mode.id,
          });
      }
    });

  for (const type of ["dialogue", "object", "speech", "verbatim"])
    harness
      .branch(type)
      .open("render", (ctx) => ctx.hallucination[type].render())
      .open({ nature: "stream", yields: Packet.Session }, (ctx) =>
        ctx.hallucination[type].stream(),
      );

  if (mode.module.harness) harness.slurp(mode.module.harness);

  return () => {
    mode.harness = shape.object(harness, steer.strategy.echo);
    mode.aperture.branch("/harness").slurp(harness);
  };
};
