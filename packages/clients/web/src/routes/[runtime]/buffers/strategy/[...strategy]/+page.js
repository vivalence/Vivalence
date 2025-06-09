import { BufferMode, BufferState } from "@vivalence/interface";
import context from "@client/context";

import ErrorMode from "./components/ErrorMode.js";
const QUEUE_THRESHOLD = 1;

export const load = async (event) => {
  const ctx = await context(event);

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

    try {
      //
      // console.log("state generator", ctx.strategy, buffer);
      return [
        new BufferMode(
          { bundle: ctx.strategy.bundle },
          { ctx, pushGame: makeGameBuffer },
        ),
      ];
    } catch (e) {
      return ErrorMode(e);
    }
  }

  const buffer = new BufferState(QUEUE_THRESHOLD, StateGenerator);

  // buffer.onNext((previous, next, promise) => ctx.runtime(`/feed/remove`, next));

  return { buffer };
};
