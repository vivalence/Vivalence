import { assertEquals, assertExists, assertStringIncludes } from "$std/assert";
import { assertThrows, assertRejects, assertInstanceOf } from "$std/assert";
import { Type } from "@sinclair/typebox";

import { Agent } from "../agent.js";
import { brain, provider } from "./lib/createBrain.js";
import { Agentic } from "@vivalence/shared/trajectory";
import { createTrajectory } from "./lib/trajectory.js";
import { createController } from "./lib/controller.js";

import { generateText, jsonSchema, tool } from "@ai/sdk";
import { generateObject } from "@ai/sdk";

Deno.test("Controller - Integrated & Hot", async () => {
  const trajectory = createTrajectory();
  const controller = createController(trajectory);

  const agent = new Agent("toolcaller")
    .withBrain(brain.hot)
    .withTemplate((i) => input.message)
    .withInput(Type.Object({ message: Type.String() }))
    .withTools(controller.tracedTools)
    .withContext("llms.txt", controller.llmstxt);

  const input = { message: `call a function and respond with 'Done'` };
  const text = await agent.do(input);
  console.log("[agent do result]:", text);

  assertExists(text);

  const traceEntry = controller.trace[0];
  assertEquals(traceEntry.name, "functions_test");
});

// OLD:
// trajectory.open((p) => p.path({path: "response_json", valence: "Respond in json", input: Output,}), (input, ctx) => {console.log("response_json", input);},);
// ["weather"]: tool({description: "Get the weather in a location", parameters: jsonSchema(Type.Object({location: Type.String({description: "The location to get the weather for",}),}),), execute: async ({ location }) => {console.log("[CALLED EXCECTUTE", location); return {location, temperature: 72 + Math.floor(Math.random() * 21) - 10,};},}),}, toolChoice: "required", // force the model to call a tool

// Deno.test("controller.tools", async () => {
//   const Output = Type.Object({ message: Type.String() });
//   const trajectory = createTrajectory();
//   const controller = new Agentic(trajectory);
//   const result = await generateText({
//     model: provider("claude-3-7-sonnet-latest"),
//     tools: controller.tools,
//     system:
//       controller.readme +
//       `\n### Response.\n Your response must be JSON of schema: ${JSON.stringify(Output)}`,
//     prompt: "call one the test tool and respond 'Hello World!'",
//     maxSteps: 5,
//   });

//   console.log("[RESULT]");
//   console.log(result.response.body);
//   console.log(result.text);
//   console.log(JSON.parse(result.text));
// });
