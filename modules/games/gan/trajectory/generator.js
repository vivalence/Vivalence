import Generator from "./agents/generator.js";

export default async function generator(inputs, ctx) {
  const { currentStep, learnables, process, userInput } = inputs;
  const profile = ctx.runtime.services.llm.profiles.STRATEGIST;

  // console.log("Generator inputs:", inputs);
  const result = await Generator.withProfile(profile).run(inputs);
  // console.log("Generator result:", result);

  // const step = process.find((step) => step.slug === input.step) || process[0];

  // const aiInput = {
  //   currentStep: stepInfo.slug,
  //   input,
  //   process,
  //   learnables,
  // };

  // let nextIndex = process.findIndex((step) => step.slug === currentStep) + 1;
  // if (nextIndex >= process.length) nextIndex = process.length - 1;
  // Generator.run()
  // const result = await agents.shepherd.run(
  //   {
  //     itinerary: JSON.stringify(process),
  //     userMessage: lastUserMessage || "",
  //     sessionContext: JSON.stringify({
  //       currentStep: stepInfo,
  //       learnables,
  //     }),
  //   },
  //   ctx.runtime.services.llm,
  // );

  // return {
  //   prompt: result.response,
  //   nextStep: process[nextIndex].slug,
  // };
}
