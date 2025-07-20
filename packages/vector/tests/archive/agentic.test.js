import { assertEquals, assertExists, assertStringIncludes } from "$std/assert";
import { assertThrows, assertRejects, assertInstanceOf } from "$std/assert";

import { Agentic } from "../controllers/agentic.js";
import { createTrajectory } from "./lib/createTrajectory.js";

Deno.test("Agentic Controller - Tool Calling", async () => {
  const trajectory = createTrajectory();
  const controller = new Agentic(trajectory);

  const input = { text: "text" };
  const result = await controller.tools["functions_test"].execute(input);
  assertEquals(result, "text");
});

// trajectory.open((p) => p.path({path: "response_json", valence: "Respond in json", input: Output,}), (input, ctx) => {console.log("response_json", input);},);
// ["weather"]: tool({description: "Get the weather in a location", parameters: jsonSchema(Type.Object({location: Type.String({description: "The location to get the weather for",}),}),), execute: async ({ location }) => {console.log("[CALLED EXCECTUTE", location); return {location, temperature: 72 + Math.floor(Math.random() * 21) - 10,};},}),}, toolChoice: "required", // force the model to call a tool
