import { cast, BufferView, Vector, v } from "@vivalence/typology";

import dataset from "./dataset/index.js";

const manifest = {
  type: "game",
  slug: "shadow",
  name: "Shadow",
  traits: ["BUFFERED", "INTENTED", "EMITTER"],
};

const buffer = new BufferView("buffer/Shadow.svelte", v.buffer({
  data: {
    recall: v.union([v.string(), v.array(v.string())], {
      description: "LEARNING, KNOWN, per-literal array, or omit for random",
    }).optional(),
    speed: v.object({}).desc("Speed preset {rate: FAST|NORMAL|SLOW} or custom {base, multiplier}").optional(),
  },
}));

const emitter = new Vector().open("/literals", async (ctx) => {
  const recall = ctx.input.recall ?? ctx.input.defaults?.recall;
  return ctx.mode.buffer({
    data: { recall, speed: ctx.input.speed ?? null },
    literals: ctx.input.literals ?? cast.array(ctx.input.literal),
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
