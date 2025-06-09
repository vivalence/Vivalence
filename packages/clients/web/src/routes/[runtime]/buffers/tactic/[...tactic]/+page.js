import { Blacklist, Scope } from "@vivalence/shared";
import { BufferMode, BufferState } from "@vivalence/interface";
import context from "@client/context";

import ErrorMode from "./components/ErrorMode.js";
const QUEUE_THRESHOLD = 5;

export const load = async (event) => {
  const ctx = await context(event);

  async function StateGenerator(buffer) {
    try {
      const blacklist = new Blacklist().fromBuffer(buffer);

      const input = {
        tactic: { slug: ctx.tactic.manifest.slug },
        take: QUEUE_THRESHOLD,
        blacklist,
      };

      const { instructions, status } = await ctx.runtime.call(
        `/feed/tactic`,
        input,
      );

      const modes = [];
      for (const instruction of instructions) {
        const mode = new BufferMode(
          { bundle: instruction.bundle },
          {
            ctx: {
              ...ctx,
              game: await ctx.module.game({
                slug: instruction.bundle.game.slug,
              }),
            },
            instruction,
          },
        );
        modes.push(mode);
      }

      return modes;
    } catch (e) {
      console.log("[STATE GENERATOR] error", e);
      return ErrorMode(e);
    }
  }

  const buffer = new BufferState(QUEUE_THRESHOLD, StateGenerator);

  buffer.onNext((previous, next, promise) => {
    // console.log(`/feed/remove`, {instruction: { id: previous.props.instruction.id },});
    ctx.runtime.call(`/feed/remove`, {
      instruction: { id: previous.props.instruction.id },
    });
    // console.log({ removed });
  });

  return { buffer };
};
