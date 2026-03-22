import { BufferView, Vector, Type, BufferSchema, Ref } from "@vivalence/typology";

const manifest = {
  type: "game",
  slug: "flashcard",
  name: "Flashcard",
  description: "Classic flashcard recall for words and sentences, both directions.",
  version: "0.1.0",
  traits: ["BUFFERED", "INTENTED", "EMITTER"],
};

const buffer = new BufferView(
  "buffer/flashcard.svelte.js",
  BufferSchema.of({
    data: { recall: Type.String({ default: "LEARNING" }) },
    literals: Type.Array(Ref),
  }),
);

const emitter = new Vector().open("/literal", async (ctx) => {
  return ctx.mode.buffer({
    data: { recall: ctx.input.recall },
    literals: [ctx.input.literal],
  });
});

const dataset = {
  intent: [],
};

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
