import { Blacklist, Scope } from "@vivalence/shared";
import { BufferMode, BufferState, Widget } from "@vivalence/interface";

import context from "@client/context";
import { env } from "$env/dynamic/public";
import ErrorMode from "./components/ErrorMode.js";

const QUEUE_THRESHOLD = 5;

export const load = async (event) => {
  const ctx = await context(event);
  // console.log("load event", event);
  // console.log("load ctx", ctx);

  // ctx.runtime = ctx.call.wrap(`/aperture/v1/runtime/${event.params.runtime}`);
  const buffer = new BufferState(QUEUE_THRESHOLD, async (buffer) => {
    try {
      // const blacklist = new Blacklist().fromBuffer(buffer);
      // const scope = new Scope({ dependency: { id: dependency.id } });
      // const input = { take: QUEUE_THRESHOLD, blacklist, scope };
      // const { instructions, status } = await ctx.runtime(`/feed/dependency`, input,);
      // return instructions.map((instruction) => modes[instruction.type](instruction),);
      return [
        new BufferMode(Widget, {
          ctx: {
            runtime: ctx.runtime,
            game: ctx.game,
          },
          client: {
            trajectory: ctx.trajectory,
          },
          instruction,
          bundle: {
            url: "http://localhost:5175/aperture/v1/runtime/eng2lat/game/gan/bundle/buffer.svelte.js",
          },
        }),
      ];
    } catch (e) {
      return ErrorMode(e);
    }
  });

  return { buffer };
};

const instruction = {
  learnables: [
    {
      slug: "puer",
      known: "the boy",
      learning: "puer",
    },
    {
      slug: "puella",
      known: "the girl",
      learning: "puella",
    },
    {
      slug: "canare",
      known: "to sing",
      learning: "canare",
    },
    {
      slug: "canit",
      known: "[third person] sings",
      learning: "canit",
    },
  ],
  process: [
    {
      step: 1,
      slug: "introduction_boy_runs",
      task: "build the sentence 'the boy runs' from described building blocks",
    },
    {
      step: 2,
      slug: "introduction_girl_signs",
      task: "build the sentence 'the girl sings' from described building blocks",
    },
    {
      step: 3,
      slug: "combination_girl_runs",
      task: "build the sentence 'the girl runs' by their own volition",
    },
    {
      step: 4,
      slug: "combination_boy_sings",
      task: "build the sentence 'the boy sings by their own volition",
    },
  ],
};
