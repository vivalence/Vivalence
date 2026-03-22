import { BufferView, Vector, Type, BufferSchema, Ref } from "@vivalence/typology";

import dataset from "./dataset/index.js";

const manifest = {
  type: "game",
  slug: "shadow",
  name: "Shadow",
  traits: ["BUFFERED", "INTENTED", "EMITTER"],
};

const buffer = new BufferView("buffer/shadow.svelte.js", BufferSchema.of({
  data: { recall: Type.String({ default: "LEARNING" }), speed: Type.Optional(Type.Object({})) },
  literals: Type.Array(Ref),
}));

const emitter = new Vector().open("/literal", async (ctx) => {
  const recall = ctx.input.recall ?? ctx.input.defaults?.recall;
  return ctx.mode.buffer({
    data: { recall, speed: ctx.input.speed ?? null },
    literals: [ctx.input.literal],
  });
});

export { manifest, buffer, emitter, dataset };

// import { View, Vector } from "@vivalence/typology";
//
// import dataset from "./dataset/index.js";
//
// const manifest = {
//   type: "game",
//   slug: "shadow",
//   name: "Shadow",
//   traits: ["VIEWABLE", "INTENTED", "EMITTER"],
// };
//
// const view = new View("buffer/shadow.svelte.js");
//
// const emitter = new Vector().open("/literal", async (ctx) => ({
//   traits: ["FURNISHED"],
//   trait: { FURNISHED: ctx.input.intent?.trait?.FURNISHED ?? ctx.input },
//   literals: [ctx.input.literal?.id],
// }));
//
// export { manifest, view, emitter, dataset };
