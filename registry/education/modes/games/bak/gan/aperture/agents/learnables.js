import { Type } from "@sinclair/typebox";
import { Agent } from "@vivalence/shared/agent";
import { Planning, Learnables } from "../../types/index.ts";

// input {text}
export default async function agent(input, ctx) {
  // return [{status: "UNKNOWN", slug: "salve", known: "Hello (to one person)", learning: "Salve!",}, {status: "UNKNOWN", slug: "salvete", known: "Hello (to multiple people)", learning: "Salvete!",}, {status: "UNKNOWN", slug: "quid_agis", known: "How are you? (to one person)", learning: "Quid agis?",}, {status: "UNKNOWN", slug: "bene", known: "Well/good (response to 'how are you')", learning: "Bene!",}, {status: "UNKNOWN", slug: "nomen_meum", known: "My name is...", learning: "Nomen meum est...",}, {status: "UNKNOWN", slug: "vale", known: "Goodbye (to one person)", learning: "Vale!",},];
  const agent = new Agent("learnables")
    .withOutput(Type.Object({ planning: Planning, learnables: Learnables }))
    .withInput(Type.String({ description: "This is the inciting incident." }))
    .withBrain(ctx.runtime.services.brain);

  agent
    .enhance(
      `### identity
	You are inside viva. the agentic symbolic intelligence operating system.
	All output is used for input into other llms! So, there is no need for niceties. Be a helpful, concise and diligent agent.
	The user is learning a language, and you help them by chosing exercises for them to do.
	The language is: ${JSON.stringify(ctx.runtime.statics.language)}.
      `,
    )
    .enhance(
      `### Proficiency level of the learner:
        The learner knows almost nothing about the subject. 
    `,
    )
    .enhance(
      `### examples of learnables
        {slug: "nomen_mihi", status: "UNKNOWN", known: "My name is...", learning: "Nomen mihi est...",}, {slug: "quid_est", status: "UNKNOWN", known: "What is your name?", learning: "Quid est nomen tibi?",},
    `,
    )
    .enhance(
      `### ideas
	if the topic is "describe actions of children", create learnables for boy and girl and for them performing actions like: "runs/walks/plays/sings".
    `,
    )
    .enhance(
      `### task
	you have to create a set of learnables.
	its a very small-scale and specific curriculum, optimized for the learners knowledge level right now.
	all learnables should follow a theme. there should be some variance between each. to keep it interesting and challanging.
        Each learnable is a unique singular and specifi entity. No usage of any slashes to indicate variance. ITS FUCKING SPECIFIC!!!!!!!!!!!
    `,
    )
    .enhance(
      `### process
	1. chose one topic to focus on for this session.
	2. chose a handful of learnables related to the topic.
	3. predict a 4-8 messages interaction between a teacher and a student.
	each message no longer than 10 words. each response no longer than 5 words with an average of ~3.
	4. output the {learnable}
    `,
    );

  const { learnables } = await agent.generate(input.text);
  console.log("@eva/learnables.js", JSON.stringify(learnables, null, 2));
  return learnables;
}

// agent.withContext("demos", ` ### demo: clue based Lets start with this sentence: "The girl sings." Latin for 'girl' is 'puella'. To sing is canere, but thats the infinite version of the verb. For third person singular, add "-it" to the stem "can-". What's "the girl sings" in latin? `,);
