import { assertEquals, assertExists, assertStringIncludes } from "$std@std@std/assert";
import { assertThrows, assertRejects, assertInstanceOf } from "$std@std@std/assert";

import { brain } from "./lib/createBrain.js";
// import { createGenerator } from "./agents/generator.js";

Deno.test("Generator", async () => {
  // const generator = createGenerator(brain.hot);

  const input = {
    // currentStep: sampleProcess[0],
    // userInput: "puer currit",
    // process: sampleProcess,
    // learnables: sampleLearnables,
  };

  // const result = await generator.generate(input);

  // assertEquals(typeof result.nextStep, "object");
  // assertEquals(typeof result.userPrompt, "string");
  // assertEquals(typeof result.shouldAdvance, "boolean");
  // assertEquals(typeof result.reasoning, "string");
});
