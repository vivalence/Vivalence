import { BufferView, Vector, Type, BufferSchema, Ref } from "@vivalence/typology";
import dataset from "./dataset/index.js";

const manifest = {
  type: "game",
  slug: "write",
  name: "Write",
  traits: ["BUFFERED", "INTENTED", "EMITTER"],
};

const buffer = new BufferView("buffer/write.svelte.js", BufferSchema.of({
  data: { recall: Type.String({ default: "LEARNING" }) },
  literals: Type.Array(Ref),
}));

const emitter = new Vector().open("/literal", async (ctx) => {
  const recall = ctx.input.recall ?? ctx.input.defaults?.recall;
  return ctx.mode.buffer({
    data: { recall },
    literals: [ctx.input.literal],
  });
});

export { manifest, buffer, emitter, dataset };

// import { View, Vector } from "@vivalence/typology";
// import dataset from "./dataset/index.js";
//
// const manifest = {
//   type: "game",
//   slug: "write",
//   name: "Write",
//   traits: ["VIEWABLE", "INTENTED", "EMITTER"],
// };
//
// const view = new View("buffer/write.svelte.js");
//
// const emitter = new Vector().open("/literal", async (ctx) => ({
//   traits: ["FURNISHED"],
//   trait: { FURNISHED: ctx.input.intent?.trait?.FURNISHED ?? ctx.input },
//   literals: [ctx.input.literal?.id],
// }));
//
// export { manifest, view, emitter, dataset };
