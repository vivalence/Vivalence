import { Type } from "@sinclair/typebox";
import { Agent } from "@vivalence/shared/agent";
import { Step, Process, Learnables } from "../../types/index.js";

const GeneratorInput = Type.Object({
  userInput: Type.String({
    description: "The learners input. Empty on first step.",
  }),
  currentStep: Type.Union([Step, Type.Null()]),
  learnables: Learnables,
  process: Process,
});

const GeneratorOutput = Type.Object({
  response: Type.String(),
});

export default new Agent({
  slug: "generator",
  scope: scopeController(trajectory),
  input: GeneratorInput,
  output: GeneratorOutput,
  context: ``,
  identity: ``,
  task: ``,

  // prompt: ` ${input} `,
});
