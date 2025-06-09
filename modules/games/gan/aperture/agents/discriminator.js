import { Type } from "@sinclair/typebox";
import { Agent } from "@vivalence/shared/agent";
import {
  History,
  Planning,
  Evaluations,
  Learnables,
} from "../../types/index.ts";
import Librarian from "./librarian.js";

const DiscriminatorInput = Type.Object({
  learnables: Learnables,
  history: History,
  step: Type.String({
    description: "slug of the currently active learnable.",
  }),
  input: Type.String({
    description: "input provided to demonstrate",
  }),
});

const DiscriminatorOutput = Type.Object({
  planning: Planning,
  evaluations: Evaluations,
  terminateSession: Type.Boolean({
    description:
      "This passes the message to terminate the session, either because the user has successfully completed the session, or explicity asked to terminate.",
  }),
});

export default async function discriminator(input, ctx) {
  const agent = new Agent("discriminator") //
    .withBrain(ctx.runtime.services.brain)
    .withInput(DiscriminatorInput)
    .withOutput(DiscriminatorOutput);

  agent
    .enhance(
      `### identity
	you are inside viva. the agentic symbolic intelligence operating system.
        be a helpful, concise and diligent agent. All output is used for input into other llms! So, there is no need for niceties. `,
    )
    .enhance(
      `### task
	Identify the learnables where status has changed.
	The ones that where unknown and are now demonstrated to be known.`,
    );

  const { evaluations, terminateSession } = await agent.generate(input);

  const evaluatedLearnables = input.learnables
    .filter((learnable) => {
      return evaluations[learnable.slug] !== learnable.status;
    })
    .map((learnable) => {
      learnable.status = evaluations[learnable.slug];
      return learnable;
    });

  evaluatedLearnables.map((learnable) => Librarian({ learnable }, ctx));

  return { evaluations, terminateSession };
}
