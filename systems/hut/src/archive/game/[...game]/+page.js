import { Blacklist, Scope } from "@vivalence/shared";
import { BufferMode, BufferState } from "@vivalence/interface";

import context from "@client/context";
import { env } from "$env/dynamic/public";
import ErrorMode from "./components/ErrorMode.js";

const QUEUE_THRESHOLD = 5;

async function getIntent(buffer, ctx) {
  // const scope = new Scope({ dependency: { id: dependency.id } });
  // const input = { take: QUEUE_THRESHOLD,  scope };
  // const { instructions } = await ctx.runtime(`/feed/dependency`, input);
  // return instructions.map((instruction) => BufferMode(instruction));

  return {};
}
async function getInstruction(buffer, ctx) {
  // const scope = new Scope({ game: { id: game.id } });
  // const input = { take: QUEUE_THRESHOLD,  scope };
  // const { instructions } = await ctx.game.call(`/feed/game`, input);

  // const { instructions } = await ctx.runtime(`/feed/game`, input);
  // return instructions.map((instruction) => BufferMode(instruction));
  return {};
}

export const load = async (event) => {
  const ctx = await context(event);

  async function StateGenerator(buffer) {
    try {
      const intent = await getIntent(buffer, ctx);
      const instruction = await getInstruction(buffer, ctx);
      // throw new Error("test");
      return [
        new BufferMode(
          { bundle: ctx.game.bundle },
          { ctx, intent, instruction },
        ),
      ];
    } catch (e) {
      return ErrorMode(e);
    }
  }
  const buffer = new BufferState(QUEUE_THRESHOLD, StateGenerator);

  return { buffer };
};

// const instruction = {
//   learnables: [
//     {
//       slug: "puer",
//       known: "the boy",
//       learning: "puer",
//     },
//     {
//       slug: "puella",
//       known: "the girl",
//       learning: "puella",
//     },
//     {
//       slug: "canare",
//       known: "to sing",
//       learning: "canare",
//     {
//       slug: "canit",
//       known: "[third person] sings",
//       learning: "canit",
//     },
//   ],
//   process: [
//     {
//       step: 1,
//       slug: "introduction_boy_runs",
//       task: "build the sentence 'the boy runs' from described building blocks",
//     },
//     {
//       step: 2,
//       slug: "introduction_girl_signs",
//       task: "build the sentence 'the girl sings' from described building blocks",
//     },
//     {
//       step: 3,
//       slug: "combination_girl_runs",
//       task: "build the sentence 'the girl runs' by their own volition",
//     },
//     {
//       step: 4,
//       slug: "combination_boy_sings",
//       task: "build the sentence 'the boy sings by their own volition",
//     },
//   ],
// };

// ctx.runtime = ctx.call.wrap(`/aperture/v1/runtime/${event.params.runtime}`);
