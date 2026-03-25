import { Vector } from "@vivalence/typology";

import dataset from "./dataset/index.js";

export const manifest = {
  type: "tactic",
  slug: "test",
  traits: ["INTENTED", "EMITTER"],
};

export const emitter = new Vector().open("/flashcards", async (ctx) => {
  const literals = await ctx.daemon.entities.literal.feed({
    symbols: ctx.input.seek?.symbols,
    user: ctx.user.id,
    take: ctx.input.batch ?? 3,
    blacklist: ctx.input.blacklist,
  });

  if (!literals.length) return [];

  return Promise.all(
    literals.map((literal) =>
      ctx.daemon.modes.game.flashcard.buffer({
        data: { recall: ctx.input.defaults?.recall ?? "LEARNING" },
        literals: [literal],
      }),
    ),
  );
});

// export const emitter = new Vector().open("/flashcards", async (ctx) => {
//   const literals = await ctx.daemon.call("/pick/literal/feed", {
//     take: ctx.input.queue ?? 3,
//     seek: ctx.input.seek,
//     blacklist: ctx.input.blacklist,
//   });
//
//   if (!literals.length) return [];
//
//   return Promise.all(
//     literals.map((literal) =>
//       ctx.daemon.modes.game.flashcard.emit.literal({
//         literal,
//         recall: ctx.input.furnished?.recall ?? "LEARNING",
//       }),
//     ),
//   );
// });

export { dataset };

// export const emitter = new Vector().open("/introduction", async (ctx) => {
//   const [sentence] = await ctx.daemon.call("/pick/literal/feed", {
//     take: 1,
//     seek: ctx.input.seek,
//     blacklist: ctx.input.blacklist,
//   });
//
//   if (!sentence) return [];
//
//   const tokens = (
//     await Promise.all(
//       sentence.trait.ANNOTATED.tokens.map((token) => {
//         return ctx.daemon.entities.literal.findOne(
//           { slug: token.literal },
//           { populate: ["memories"], populateWhere: { memories: { user: ctx.user.id } } },
//         );
//       }),
//     )
//   ).filter(Boolean);
//
//   const buffers = [];
//
//   if (!sentence.memory) {
//     buffers.push(
//       await ctx.daemon.modes.game.shadow.emit.literal({
//         literal: sentence,
//         recall: "KNOWN",
//         speed: { rate: "SLOW" },
//       }),
//     );
//   }
//
//   for (const token of tokens) {
//     if (!token.memory || token.memory.status === "UNKNOWN") {
//       buffers.push(
//         await ctx.daemon.modes.game.shadow.emit.literal({
//           literal: token,
//           recall: "LEARNING",
//           speed: { rate: "SLOW" },
//         }),
//       );
//     } else if (token.memory.status === "LEARNING") {
//       buffers.push(
//         await ctx.daemon.modes.game.flashcard.emit.literal({
//           literal: token,
//           recall: "LEARNING",
//         }),
//       );
//     }
//   }
//
//   for (const token of tokens) {
//     if (!token.memory || token.memory.status === "UNKNOWN") {
//       buffers.push(
//         await ctx.daemon.modes.game.write.emit.literal({
//           literal: token,
//           recall: "LEARNING",
//         }),
//       );
//     }
//   }
//
//   if (!sentence.memory || sentence.memory.status === "UNKNOWN") {
//     buffers.push(
//       await ctx.daemon.modes.game.shadow.emit.literal({
//         literal: { ...sentence },
//         recall: "LEARNING",
//       }),
//     );
//   } else {
//     buffers.push(
//       await ctx.daemon.modes.game.write.emit.literal({
//         literal: { ...sentence },
//         recall: "LEARNING",
//       }),
//     );
//   }
//
//   return buffers;
// });
