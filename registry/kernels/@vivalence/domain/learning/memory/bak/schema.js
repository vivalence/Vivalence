import { v } from "@vivalence/typology";

const SignalEnum = v.union([
  v.const("MASTERY"),
  v.const("SUCCESS"),
  v.const("NEUTRAL"),
  v.const("MISTAKE"),
  v.const("FAILURE"),
]);

const SignalRatio = v.object({
  success: v.number(),
  total: v.number(),
});

export const signal = v.union(
  [
    SignalEnum,
    v.object({
      enum: SignalEnum,
    }),
    v.object({
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
