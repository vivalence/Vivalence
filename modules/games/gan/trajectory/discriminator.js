// import { agents } from "./lib/agents.js";

export default async function discriminator(input, ctx) {
  const { step, process, learnables, prompt, userInput } = input;

  const stepInfo = process.find((s) => s.slug === step) || {};

  const result = await agents.arbiter.run(
    {
      itinerary: JSON.stringify(process),
      userResponse: userInput,
      expectedResponse: "",
      context: JSON.stringify({
        step: stepInfo,
        prompt,
        learnables,
      }),
    },
    ctx.runtime.services.llm,
  );

  const updatedLearnables = {};

  Object.keys(learnables).forEach((key) => {
    if (result.evaluation.includes(key)) {
      if (result.evaluation.includes(`${key} is correct`)) {
        updatedLearnables[key] = "mastered";
      } else if (result.evaluation.includes(`${key} needs practice`)) {
        updatedLearnables[key] = "learning";
      } else {
        updatedLearnables[key] = "todo";
      }
    }
  });

  return {
    learnables: updatedLearnables,
    feedback: result.evaluation,
  };
}
