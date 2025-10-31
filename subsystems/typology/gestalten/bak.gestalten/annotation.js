import { EntitySchema } from "@mikro-orm/core";

export const Annotation = Type.Object({
  // street!: string;
  // any:any;
});

// export const AnnotationSchema = new EntitySchema({
//   class: Annotation,
//   embeddable: true,
//   properties: {
//     // ...runtime.schema.primitives.
//   },
// });
// really more of a domain thing.
// export default {
//   type: "object",
//   title: "annotation",
//   description:
//     "An annotation describes the smallest learnable unit uniquely. No null values. never [key]: null.",
//   properties: {}, // aggregate all annotation dimensions here.
//   required: [], // topographical
//   additionalProperties: true,
//   // DESIGNCHOICE: all of? if i integrate dimensional constraints here id have ontological integrity guaranteed on generation, but context size would bloat.
// };
