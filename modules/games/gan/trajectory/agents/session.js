import { Type } from "@sinclair/typebox";
import { Agent } from "@vivalence/shared/agent";
import { Planning, Learnables, Session } from "../../types/index.ts";

const SessionPlannerOutput = Type.Object({
  planning: Planning,
  session: Session,
});

export default async function agent(input, ctx) {
  return [
    {
      index: 1,
      slug: "salve",
      expectedResponse: "Salve!",
      clue: "The Latin greeting for one person sounds like 'salve'",
      prompt:
        "In Latin, how would you say 'hello' to a single person?\n\nHint: It's a word that sounds like 'sal-vay' and ends with an 'e'.",
    },
    {
      index: 2,
      slug: "quid_agis",
      expectedResponse: "Quid agis?",
      clue: "To ask 'how are you' in Latin, use 'quid agis'",
      prompt:
        "After greeting someone with 'Salve!', you want to ask 'How are you?' in Latin.\n\nHint: The phrase has two words. The first word 'quid' means 'what' and the second word 'agis' relates to 'doing'.",
    },
    {
      index: 3,
      slug: "bene",
      expectedResponse: "Bene!",
      clue: "Respond positively with the Latin word 'bene'",
      prompt:
        "Someone asks you 'Quid agis?' (How are you?). How would you respond 'Well!' or 'Good!' in Latin?\n\nHint: It's a short word that sounds like 'beh-neh'.",
    },
    {
      index: 4,
      slug: "nomen_meum",
      expectedResponse: "Nomen meum est...",
      clue: "Introduce yourself using 'nomen meum est...'",
      prompt:
        "You want to say 'My name is...' in Latin.\n\nHint: The phrase starts with 'Nomen' (name) followed by 'meum' (my) and then 'est' (is).\n\nComplete the phrase: ___ ___ ___...",
    },
    {
      index: 5,
      slug: "salvete",
      expectedResponse: "Salvete!",
      clue: "For greeting multiple people, add 'te' to 'salve'",
      prompt:
        "You've learned 'Salve!' is 'Hello!' to one person. How would you greet multiple people in Latin?\n\nHint: Add the suffix '-te' to the singular form.",
    },
    {
      index: 6,
      slug: "vale",
      expectedResponse: "Vale!",
      clue: "Say goodbye with 'vale', similar to 'salve'",
      prompt:
        "To end your Latin conversation with one person, how would you say 'Goodbye!'?\n\nHint: It's similar to 'salve' but starts with a 'v' and sounds like 'vah-leh'.",
    },
  ];
  //  const agent = new Agent("session-planner") //
  //    .withBrain(ctx.runtime.services.brain)
  //    .withInput(Learnables)
  //    .withOutput(SessionPlannerOutput);

  //  agent
  //    .withContext(
  //      "terra",
  //      `### identity
  // 	you are inside viva. the agentic symbolic intelligence operating system.
  //        be a helpful, concise and diligent agent. All output is used for input into other llms.
  //    `,
  //    )
  //    .withContext(
  //      "john snow",
  //      `### prior knowledge
  // 	the user knows nothing about the subject.
  //    `,
  //    )
  //    .withContext(
  //      "task",
  //      `### task
  // 	You have to setup a learning trajectory from a set of learnables.
  // 	This learning trajectory will be covered within the scope of one session.
  // 	The whole session takes about 5 minutes, so its very concise and narrow.
  // 	A learning trajectory is made up of sequence of prompts to the learner, each requiring the learner to actively engage and respond.
  // 	This is the schema of a session: ${JSON.stringify(Session)}
  // 	the most important part to get right is the clue and the prompt for each learnable.
  //        what you do is weave a narrative. you predict what an optimal session would look like.
  // `,
  //    )
  //    .withContext(
  //      "process",
  //      `### process
  // 	1: work out the clues required for each learnable.
  // 	2: predict the optimal conversion, where all learnables are covered. predict both teacher and student.
  // 	3: synthesise a session prediction. propose a series of instructions that optimally express the learnables.
  //    `,
  //    );
  //  // .withContext("learnables", `The learnables we have to cover are: ${JSON.stringify(input.learnables)}`,);
  //  // .withContext("demos", ``,);

  //  const result = await agent.generate(input.learnables);
  //  console.log("result", JSON.stringify(result));
}
