import { Type } from "@sinclair/typebox";
import { Agent } from "@vivalence/shared/agent";
import { Planning, Learnables, Session } from "../../types/index.ts";

const SessionPlannerOutput = Type.Object({
  planning: Planning,
  session: Session,
});
const SessionPlannerInput = Type.Object({
  learnables: Learnables,
  text: Type.String(),
});
// input {learnables, text}
export default async function agent(input, ctx) {
  const agent = new Agent("session-planner") //
    .withBrain(ctx.runtime.services.brain)
    .withInput(SessionPlannerInput)
    .withOutput(SessionPlannerOutput);

  agent
    .enhance(
      `### identity
	you are inside viva. the agentic symbolic intelligence operating system.
         be a helpful, concise and diligent agent. All output is used for input into other llms.
     `,
    )
    .enhance(
      `### prior knowledge
	the user knows nothing about the subject.
     `,
    )
    .enhance(
      `### task
	You have to setup a learning trajectory from a set of learnables.
	This learning trajectory will be covered within the scope of one session.
	The whole session takes about 5 minutes, so its very concise and narrow.
	A learning trajectory is made up of sequence of prompts to the learner, each requiring the learner to actively engage and respond.
	This is the schema of a session: ${JSON.stringify(Session)}
	the most important part to get right is the clue and the prompt for each learnable.
         what you do is weave a narrative. you predict what an optimal session would look like.
  `,
    )
    .enhance(
      `### process
	1: work out the clues required for each learnable.
	2: predict the optimal conversion, where all learnables are covered. predict both teacher and student.
	3: synthesise a session prediction. propose a series of instructions that optimally express the learnables.
     `,
    );
  // .withContext("learnables", `The learnables we have to cover are: ${JSON.stringify(input.learnables)}`,);

  const { session } = await agent.generate(input);
  console.log("@eva/session.js", JSON.stringify(session, null, 2));
  return session;
}
