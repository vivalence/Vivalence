import { AxAgent } from "@ax-llm/ax";
import { AgenticController } from "../../controller/agentic.js";

export const createArbiterAgent = (trajectory) => {
  const controller = new AgenticController(trajectory);
  // console.log("controller.index", controller.index);
  // console.log("controller.callables", controller.callables);

  const agent = new AxAgent({
    name: "Discriminator",
    signature: `itinerary:string, userResponse:string, expectedResponse:string -> evaluation:string`,
    functions: controller.callables,
    description: `
# You are the Discriminator
Your roles are those of the arbiter, record keeper and judge.
You are working in tandem with a generator.
Its your shared goal and responsibility to teach a learner a specific and defined set of learnables, called the itinerary.
The itinerary is a sequence of numbered steps through some material. 

The process looks like this:
1. the generator goes first, prompting the user for some bit of knowledge. 
2. the user provides input to the best of their ability.
3. you, the discriminator, evaluate the users input and, by applying tools, store the review.

You receive the following inputs:
- the whole itinerary
- the current step
- the generators prompt given to the user
- some statement by the generator about the knowledge it expects the user to demonstrate

## Your Tools
${controller.index}

## Detailed Evaluation Process

1. Determine which parts need classification.
2. use /classify/sentence to receive a list of identifiable features.
3. Compare actual vs. expected understanding and judge correctness.
4. for each of your judgements, create a record by invoking /review/annotation

  `,
  });
  // agent.setDemos(demos);
  return agent;
};

const demos = `
## Examples

EXAMPLE 1: Evaluating a translation

User response: "puella currit means 'the girl runs'"

Process:
1. First analyze the Latin sentence: /classify/sentence with {text: "puella currit"}
   This gives you the grammatical structure and meaning of each word
2. Review the classification against expected response: /review/annotation
3. Provide feedback:

\`\`\`
I've analyzed your translation of "puella currit" as "the girl runs."

Checking each word:
- "puella" is correctly identified as "girl" (feminine noun)
- "currit" is correctly identified as "runs" (third-person singular present verb)

Your translation is accurate! You've demonstrated understanding of:
- Basic vocabulary
- The subject-verb relationship
- Proper word order

Well done! You're ready to proceed to more complex sentences.
\`\`\`

EXAMPLE 2: Evaluating grammar identification

User response: "In 'puer legit', 'puer' is a masculine noun"

Process:
1. Classify the word: /classify/word with {text: "puer"}
2. Review the results to check if user is correct
3. Provide feedback:

\`\`\`
I've analyzed your statement about "puer" in the phrase "puer legit."

You identified "puer" as a masculine noun, which is correct!

Analysis details:
- "puer" is indeed a masculine noun in the nominative case
- It functions as the subject of the sentence
- In this context, it means "boy" or "young male"

Your understanding of Latin grammatical gender is accurate. This concept will be important as you learn about adjective agreement.
\`\`\`

ALWAYS use the classification and review tools before providing feedback to ensure accuracy in your evaluation.

`;
