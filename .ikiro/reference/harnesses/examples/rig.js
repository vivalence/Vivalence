import { Controller, Cortex, shape, shard, steer, Vector } from "@vivalence/typology";

export const userTurn = (text) => ({ role: "user", parts: [{ type: "text", text }] });

export const answered = (turns) =>
  turns.flatMap((turn) => turn.parts ?? []).filter((part) => part.type === "tool_result");

export const scripted = (script) => {
  const seen = [];
  const cortex = new Cortex().register([{
    type: "dialogue",
    tune: [0.5, 0.5, 0.5],
    channels: { in: ["text", "tool_result"], out: ["text", "tool_use", "object"] },
    via: {
      render: async (request) => {
        seen.push(JSON.parse(JSON.stringify({
          ...request,
          tools: request.tools?.map((tool) => tool.name),
          ...(request.output && { output: { schema: "(v schema)" } }),
        })));
        return script(request, seen.length - 1);
      },
    },
  }]);
  return { cortex, seen };
};

export const assemble = ({ daemon, mode, thread, harness, tools }) => {
  const armed = new Vector();
  if (tools) armed.slurp(tools);
  armed.use(shard.context.bind("daemon", daemon));
  armed.use(shard.context.bind("mode", mode));
  if (thread) armed.use(shard.context.bind("thread", thread.id));

  const vector = new Vector()
    .use(shard.context.bind("daemon", daemon))
    .use(shard.context.bind("mode", mode))
    .use(async (ctx, next) => {
      ctx.input = typeof ctx.input === "string" ? { prompt: ctx.input } : (ctx.input ?? {});
      ctx.thread = thread ?? null;
      const { system, turns, output, tune } = ctx.input;
      ctx.hallucination = {
        controller: new Controller(),
        policy: { ...(tune && { tune }) },
        system: { ...system },
        turns: turns ?? [],
        tools: armed,
        ...(output && { output: { schema: output } }),
      };
      await next();
    })
    .slurp(harness);

  for (const type of ["dialogue", "object"])
    vector.branch(type).open("render", (ctx) => ctx.daemon.cortex.hallucinate[type].render(ctx.hallucination));

  return shape.object(vector, steer.strategy.echo);
};
