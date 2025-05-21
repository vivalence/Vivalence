import { Type } from "@sinclair/typebox";

export const Step = Type.Object(
  {
    index: Type.Number({
      description: "The numerical order of the step in the process",
    }),
    slug: Type.String({
      description: "Unique identifier for the step",
    }),
    task: Type.String({
      description: "Description of what needs to be done in this step",
    }),
  },
  {
    description: "A single step in the learning process",
  },
);

export const Learnable = Type.Object(
  {
    slug: Type.String({
      description: "Unique identifier for the learnable item",
    }),
    known: Type.String({
      description: "The term or concept in the user's known language",
    }),
    learning: Type.String({
      description: "The term or concept in the language being learned",
    }),
    state: Type.Optional(
      Type.String({
        description:
          "Current state of the learnable (e.g., 'todo', 'completed')",
      }),
    ),
  },
  {
    description: "An item that can be learned or memorized",
  },
);

export const Process = Type.Array(Step, {
  description: "An ordered collection of steps to complete",
});

export const Learnables = Type.Array(Learnable, {
  description: "A collection of items to be learned",
});
