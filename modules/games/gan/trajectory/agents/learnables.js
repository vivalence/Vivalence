import { Type } from "@sinclair/typebox";
import { Agent } from "@vivalence/shared/agent";
import { Planning, Learnables } from "../../types/index.ts";

export default async function agent(inputs, ctx) {
  return [
    {
      status: "UNKNOWN",
      slug: "salve",
      known: "Hello (to one person)",
      learning: "Salve!",
    },
    {
      status: "UNKNOWN",
      slug: "salvete",
      known: "Hello (to multiple people)",
      learning: "Salvete!",
    },
    {
      status: "UNKNOWN",
      slug: "quid_agis",
      known: "How are you? (to one person)",
      learning: "Quid agis?",
    },
    {
      status: "UNKNOWN",
      slug: "bene",
      known: "Well/good (response to 'how are you')",
      learning: "Bene!",
    },
    {
      status: "UNKNOWN",
      slug: "nomen_meum",
      known: "My name is...",
      learning: "Nomen meum est...",
    },
    {
      status: "UNKNOWN",
      slug: "vale",
      known: "Goodbye (to one person)",
      learning: "Vale!",
    },
  ];
  // const agent = new Agent("learnables")
  //   .withOutput(Type.Object({ planning, learnables }))
  //   .withBrain(ctx.runtime.services.brain);

  // agent
  //   .withContext(
  //     "terra",
  //     `### identity
  // 	you are inside viva. the agentic symbolic intelligence operating system.
  //       be a helpful, concise and diligent agent.
  //   `,
  //   )
  //   .withContext(
  //     "john snow",
  //     `### prior knowledge
  // 	the user knows nothing about the subject.
  //   `,
  //   )
  //   .withContext(
  //     "task",
  //     `### task
  // 	you have to create a set of learnables.
  // 	a group of learnables should be completable in about 5 minutes. all learnables should follow a theme.
  // 	its a very small-scale and specific curriculum, optimized for the learners knowledge level right now.
  //   `,
  //   )
  //   .withContext(
  //     "process",
  //     `### process
  // 	1. chose one topic to focus on for this session.
  // 	2. chose a handful of learnables related to the topic.
  // 	3. predict a 4-8 messages interaction between a teacher and a student.
  // 	each message no longer than 10 words. each response no longer than 5 words with an average of ~3.
  // 	4. output the {learnable}
  //   `,
  //   )
  //   .withContext(
  //     "demos",
  //     `### demos
  // 	topic "describe actions of children". learnables "boy/girl" "runs/walks/plays/sings".
  //   `,
  //   );

  // console.log("agent", agent);
  // const result = await agent.generate(` i want to learn latin. `);
  // console.log("result", result);
}

// agent.withContext("demos", ` ### demo: clue based Lets start with this sentence: "The girl sings." Latin for 'girl' is 'puella'. To sing is canere, but thats the infinite version of the verb. For third person singular, add "-it" to the stem "can-". What's "the girl sings" in latin? `,);
