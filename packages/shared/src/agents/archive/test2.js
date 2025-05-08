import { AxAI, AxAgent } from "@ax-llm/ax";

export default async function (ctx) {
  const profile = ctx.services.llm.profiles.STRATEGIST;
  const ai = new AxAI({
    name: profile.provider,
    apiKey: profile.key,
    config: profile.model,
  });

  const user = { location: "Tokyo" };

  const functions = [
    {
      name: "getCurrentWeather",
      description: "get the current weather for the users home location.",
      // parameters: {type: "object", properties: {location: {type: "string", description: "location to get weather for",}, units: {type: "string", enum: ["imperial", "metric"], default: "imperial", description: "units to use",},}, required: ["location"],},
      func: async () => {
        return `The weather in ${user.location} is 72 degrees`;
      },
    },
  ];

  const cot = new AxAgent({
    name: "Question answering agent",
    description: "you answer questions by the user",
    signature: `question:string -> answer:string`,
    functions,
  });

  const values = {
    question: "What is the weather like at home?",
  };

  const res = await cot.forward(ai, values, { debug: true });

  console.log("res:");
  console.log(res);
}
