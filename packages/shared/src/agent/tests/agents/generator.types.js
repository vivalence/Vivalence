import { Type } from "@sinclair/typebox";

const Step = Type.Object(
  {
    index: Type.Number({
      description: "The numerical order of the step in the process",
    }),
    slug: Type.String({ description: "Unique identifier for the step" }),
    task: Type.String({
      description: "Description of what needs to be done in this step",
    }),
  },
  { description: "A single step in the learning process" },
);
const Learnable = Type.Object(
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
  { description: "An item that can be learned or memorized" },
);
const Process = Type.Array(Step, {
  description: "An ordered collection of steps to complete",
});
const Learnables = Type.Array(Learnable, {
  description: "A collection of items to be learned",
});

export const Input = Type.Object({
  currentStep: Type.Union([Step, Type.Null()], {
    description: "The current step being worked on, or null if at start",
  }),
  userInput: Type.String({
    description: "The user's latest input/response",
  }),
  process: Process,
  learnables: Learnables,
});

export const Output = Type.Object({
  nextStep: Type.Union([Step, Type.Null()], {
    description:
      "The next step to present to the user, or null if process complete",
  }),
  userPrompt: Type.String({
    description: "The prompt to show the user for the next interaction",
  }),
  shouldAdvance: Type.Boolean({
    description: "Whether to advance to the next step or stay on current",
  }),
  reasoning: Type.String({
    description: "Explanation of the decision made",
  }),
});
