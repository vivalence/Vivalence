import { BufferMode, BufferState } from "@vivalence/surface";

export default async function (ctx) {
  // console.log(JSON.stringify(ctx, null, 2));
  // async function makeGameBuffer(instruction, hook) {const gameContext = {...ctx, game: await ctx.module.game({ slug: instruction.bundle.game.slug }),}; const hooks = []; if (hook) hooks.push(hook); const mode = new BufferMode({ bundle: instruction.bundle }, { ctx: gameContext, instruction }, hooks,); buffer.push(mode);}
  // ctx. pushGame= makeGameBuffer
  // return [new BufferMode({ bundle: ctx.strategy.view.bundle }, ctx)];
  // call strategy.???
  // buffer.onNext((previous, next, promise) => ctx.runtime(`/feed/remove`, next));
}

// import { Blacklist, Scope } from "@vivalence/shared";
// import { BufferMode, BufferState, Widget } from "@vivalence/surface";

// import context from "@client/context";
// import { env } from "$env/dynamic/public";
// import SignalHandler from "./components/SignalHandler.svelte";

// const QUEUE_THRESHOLD = 5;

// export const load = async (event) => {
//   const ctx = await context(event);
//   const intent = event.intent;

//   // get
//   const dependency = await ctx.runtime("/entities/dependency/findOne", {
//     where: { slug: event.params.dependency },
//   });

//   const modes = {
//     SIGNAL: (i) => new BufferMode(SignalHandler, i, ctx),
//     WIDGET: (i) => new BufferMode(Widget, i, ctx),
//   };

//   const buffer = new BufferState(QUEUE_THRESHOLD, async (buffer) => {
//     try {
//       // if !intent.resolved
//       // if intent.traits.includes('constrained')
//       const blacklist = new Blacklist().fromBuffer(buffer);
//       const scope = new Scope({ dependency: { id: dependency.id } });
//       const input = { take: QUEUE_THRESHOLD, blacklist, scope };

//       const { instructions, status } = await ctx.runtime(
//         `/feed/dependency`,
//         input,
//       );

//       return instructions.map((instruction) =>
//         modes[instruction.type](instruction),
//       );
//     } catch (e) {
//       console.log("[practive.page.svelte pull]uncaught error", e);
//       return [
//         new BufferMode(SignalHandler, {
//           signal: {
//             type: "ERROR",
//             error: {
//               message:
//                 "Something went wrong while pulling the next dependency instruction.",
//               ...e,
//             },
//           },
//         }),
//       ];
//     }
//   });

//   // buffer.onNext((previous, next) => ctx.runtime(`/feed/remove`, next));
//   return { buffer, intent };
// };

// import { BufferMode, BufferState } from "@vivalence/surface";
// import context from "@client/context";

// import ErrorMode from "./components/ErrorMode.js";
// const QUEUE_THRESHOLD = 1;

// export const load = async (event) => {
//   const ctx = await context(event);

//   // intent entity is given.
//   // if no session?

//   async function StateGenerator(buffer) {
//     async function makeGameBuffer(instruction, hook) {
//       const gameContext = {
//         ...ctx,
//         game: await ctx.module.game({ slug: instruction.bundle.game.slug }),
//       };

//       const hooks = [];
//       if (hook) hooks.push(hook);

//       const mode = new BufferMode(
//         { bundle: instruction.bundle },
//         { ctx: gameContext, instruction },
//         hooks,
//       );

//       buffer.push(mode);
//     }

//     try {
//       //
//       // console.log("state generator", ctx.strategy, buffer);
//       return [
//         new BufferMode(
//           { bundle: ctx.strategy.bundle },
//           { ctx, pushGame: makeGameBuffer },
//         ),
//       ];
//     } catch (e) {
//       return ErrorMode(e);
//     }
//   }

//   const buffer = new BufferState(QUEUE_THRESHOLD, StateGenerator);

//   // buffer.onNext((previous, next, promise) => ctx.runtime(`/feed/remove`, next));

//   return { buffer };
// };
