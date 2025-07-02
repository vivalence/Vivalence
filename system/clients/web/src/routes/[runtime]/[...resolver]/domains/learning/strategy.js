import { BufferMode, BufferState } from "@vivalence/interface";
import ErrorMode from "./components/ErrorMode.js";

export default async function (intent, ctx) {
  async function StateGenerator(buffer) {
    async function makeGameBuffer(instruction, hook) {
      const gameContext = {
        ...ctx,
        game: await ctx.module.game({ slug: instruction.bundle.game.slug }),
      };

      const hooks = [];
      if (hook) hooks.push(hook);

      const mode = new BufferMode(
        { bundle: instruction.bundle },
        { ctx: gameContext, instruction },
        hooks,
      );

      buffer.push(mode);
    }

    return [
      new BufferMode(
        { bundle: ctx.strategy.bundle },
        { ctx, pushGame: makeGameBuffer },
      ),
    ];
  }

  const buffer = new BufferState(QUEUE_THRESHOLD, StateGenerator);

  // buffer.onNext((previous, next, promise) => ctx.runtime(`/feed/remove`, next));

  return buffer;
}
