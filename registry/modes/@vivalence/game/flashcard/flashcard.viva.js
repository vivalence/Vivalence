import { cast, BufferView, Vector, v } from "@vivalence/typology";

const manifest = {
  type: "game",
  slug: "flashcard",
  name: "Flashcard",
  description: "Classic flashcard recall for words and sentences, both directions.",
  version: "0.1.0",
  traits: ["BUFFERED", "INTENTED", "EMITTER"],
};

const buffer = new BufferView(
  "buffer/Flashcard.svelte",
  v.buffer({
    data: {
      recall: v.union([v.string(), v.array(v.string())], {
        description: "LEARNING, KNOWN, per-literal array, or omit for random",
      }).optional(),
    },
  }),
);

const emitter = new Vector().open("/literals", async (ctx) => {
  return ctx.mode.buffer({
    data: { recall: ctx.input.recall },
    literals: ctx.input.literals ?? cast.array(ctx.input.literal),
  });
});
// .open("/batch", async (ctx) => {return ctx.mode.buffer({data: { recall: ctx.input.recall }, literals: ctx.input.literals,});});

const dataset = { intent: [] };

export { manifest, buffer, emitter, dataset };

// import { View, Vector } from "@vivalence/typology";
//
// const manifest = {
//   type: "game",
//   slug: "flashcard",
//   name: "Flashcard",
//   description: "Classic flashcard recall for words and sentences, both directions.",
//   version: "0.1.0",
//   traits: ["VIEWABLE", "INTENTED", "EMITTER"],
// };
//
// const view = new View("buffer/flashcard.svelte.js");
//
// const emitter = new Vector().open("/literal", async (ctx) => ({
//   traits: ["FURNISHED"],
//   trait: { FURNISHED: ctx.input.intent?.trait?.FURNISHED ?? ctx.input },
//   literals: [ctx.input.literal?.id],
// }));
//
// const dataset = {
//   intent: [],
// };
//
// export { manifest, view, emitter, dataset };
