import { ReplSignal, contexts, shape, shard, steer, v } from "@vivalence/typology";

export const REPLING = (mode, context) => {
  mode.repl.use(shard.context.spread(contexts.host, context)).use(shard.context.bind("mode", mode)).graft(mode.module.repl);
  mode.aperture.get("/metadata/repl", () => shape.strip(mode.repl));
  mode.aperture.post({ nature: "/repl", input: v.primitives.harness.Signal }, (input, ctx) => {
    const replDie = { ...ctx, signal: new ReplSignal(input), output: undefined };
    return steer.dispatch.execute(mode.repl, replDie, replDie.signal).then(() => replDie.output);
  });
};
