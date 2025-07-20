import { Type } from "@sinclair/typebox";

const SignalEnum = Type.Union([
  Type.Literal("MASTERY"),
  Type.Literal("SUCCESS"),
  Type.Literal("NEUTRAL"),
  Type.Literal("MISTAKE"),
  Type.Literal("FAILURE"),
]);

const SignalRatio = Type.Object({
  success: Type.Number(),
  total: Type.Number(),
});

export const signal = Type.Union(
  [
    SignalEnum,
    Type.Object({
      enum: SignalEnum,
    }),
    Type.Object({
      ratio: SignalRatio,
    }),
  ],
  {
    description:
      "describes if the signal is positive or negative. Most common form is {enum: 'VALUE'}",
  },
);

// signal enum ratio
// MASTERY +10
// SUCCESS  +1
// NEUTRAL   0
// MISTAKE  -1
// FAILURE -10

// memoryTypes
// @prisma
//

// enum MemoryFlavorEnum {
//   INDIVIDUAL // Memory strength is measured directly on the resource.
//   RELATIONAL // Memory strenght is a function of its relations. only on tags.
// }

// enum MemoryStatusEnum {
//   UNTOUCHED // should not exist in database
//   UNKNOWN // not yet being learned but touched
//   LEARNING // being actively learned
//   KNOWN // sufficiently learned
//   GRADUATED // sufficiently learned and not Showing anymore
// }
