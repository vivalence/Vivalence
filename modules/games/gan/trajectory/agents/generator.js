import { Type } from "@sinclair/typebox";
import { Agent } from "@vivalence/shared/agent";
import { History, Planning, Session, Learnables } from "../../types/index.ts";

const GeneratorInput = Type.Object({
  session: Session,
  learnables: Learnables,
  history: History,
  step: Type.String({
    description: "The slug of the active session step.",
  }),
  input: Type.String(),
});

const GeneratorOutput = Type.Object({
  planning: Planning,
  activeStep: Type.String({
    description:
      "The slug of the active session step. We dont advance if the message doesnt successfully demonstrate knowledge of the learnable.",
  }),
  activePrompt: Type.String({
    description:
      "the prompt shown to the agent who doesnt know the learnable yet. as concise as possible. format is html, using only: <br, em>.",
  }),
});

export default async function generator(input, ctx) {
  const agent = new Agent("generator") //
    .withBrain(ctx.runtime.services.brain)
    .withInput(GeneratorInput)
    .withOutput(GeneratorOutput);

  agent
    .withContext(
      "terra",
      `### identity
	you are inside viva. the agentic symbolic intelligence operating system.
        be a helpful, concise and diligent agent. All output is used for input into other llms! So, there is no need for niceties. `,
    )
    .withContext(
      "task",
      `### task
	you must chose the session step and write the next prompt.
	the prompt must be minimal. this is not for humans. the prompt is for other agents / llms. `,
    );

  return await agent.generate(input);
}
