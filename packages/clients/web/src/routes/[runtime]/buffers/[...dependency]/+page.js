import { env } from "$env/dynamic/public";
import { BufferMode, BufferState, Widget } from "@vivalence/interface";
import { Blacklist, Scope } from "@vivalence/shared";

import context from "@client/context";
import SignalHandler from "./components/SignalHandler.svelte";

const QUEUE_THRESHOLD = 5;

export const load = async (event) => {
  const ctx = await context(event);

  // console.log("dependency puffer page event", event);

  const dependency = await ctx.runtime("/entities/dependency/findOne", {
    where: { slug: event.params.dependency },
  });
  console.log("dependency,", dependency);

  // const modes = {
  //   SIGNAL: (instruction) => new BufferMode(SignalHandler, { ctx, signal }),
  //   GAME: (instruction) => new BufferMode(Widget, { ctx, bundle: instruction.game.bundle }),
  // };

  const buffer = new BufferState(QUEUE_THRESHOLD, async (buffer) => {
    try {
      console.log("called buffer function", buffer);
      const blacklist = new Blacklist().fromBuffer(buffer);
      const scope = new Scope({ dependency: { id: dependency.id } });
      const input = { take: QUEUE_THRESHOLD, blacklist, scope };

      const instructions = await ctx.runtime(`/feed/dependency`, input);
      // console.log("instructions", instructions);
      // // validate instructions is correctformat.

      // return instructions.map((instruction) => modes[instruction.type](instruction)).filter(BOOLEAN);
      return [];
    } catch (e) {
      console.log("[practive.page.svelte pull]uncaught error", e);
      return [
        new BufferMode(SignalHandler, {
          signal: {
            type: "ERROR",
            error: {
              message: "Something went wrong while pulling the next dependency instruction.",
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
