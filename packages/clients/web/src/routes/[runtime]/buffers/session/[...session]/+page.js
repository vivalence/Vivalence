import { Blacklist, Scope } from "@vivalence/shared";
import { BufferMode, BufferState, Widget } from "@vivalence/interface";

import context from "@client/context";
import { env } from "$env/dynamic/public";
import SignalHandler from "./components/SignalHandler.svelte";

const QUEUE_THRESHOLD = 5;

export const load = async function control_loop(event) {
  const ctx = await context(event);

  const session = await ctx.runtime("/entities/session/findOne", {
    where: { slug: event.params.session },
  });

  console.log("session", session);

  const modes = {
    SIGNAL: (i) => new BufferMode(SignalHandler, i, ctx),
    WIDGET: (i) => new BufferMode(Widget, i, ctx),
  };

  const buffer = new BufferState(QUEUE_THRESHOLD, async (buffer) => {
    try {
      const blacklist = new Blacklist().fromBuffer(buffer);
      const scope = new Scope({ session: { id: session.id } });
      const input = { take: QUEUE_THRESHOLD, blacklist, scope };
      const { instructions, status } = await ctx.runtime(
        `/feed/session`,
        input,
      );
      return instructions.map((instruction) =>
        modes[instruction.type](instruction),
      );
    } catch (e) {
      console.log("[practive.page.svelte pull]uncaught error", e);
      return [
        new BufferMode(SignalHandler, {
          signal: {
            type: "ERROR",
            error: {
              message:
                "Something went wrong while pulling the next dependency instruction.",
              ...e,
            },
          },
        }),
      ];
    }
  });

  // buffer.onNext((previous, next) => ctx.runtime(`/feed/remove`, next));
  return { buffer };
};
