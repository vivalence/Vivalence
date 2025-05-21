import { assertStringIncludes, assertEquals } from "$std/assert";

import { AgenticController } from "../controller/agentic.js";
import { createTestTrajectory } from "./trajectory/learning.js";
import { createArbiterAgent } from "./agents/arbiter.js";

import { MockAI } from "./lib.js";

Deno.test("Arbiter Agent - Response Evaluation", async () => {
  const trajectory = createTestTrajectory();
  const controller = new AgenticController(trajectory);
  const mockAI = new MockAI();

  // const arbiterAgent = createArbiterAgent(
  //   controller,
  //   mockAI.wrapCallables(controller.callables),
  // );

  // const itinerary = `# Latin Basics
  // ## Learning Objectives
  // - Translate simple sentences
  // `;

  // const arbiterPrompt = "puella currit means 'the girl runs'";

  // await arbiterAgent.forward(mockAI, {
  //   itinerary,
  //   userResponse: arbiterPrompt,
  //   expectedResponse: "the girl runs",
  // });

  // const hasClassifyCall = mockAI.functionCalls.some((call) =>
  //   call.name.includes("/classify/"),
  // );
  // const hasReviewCall = mockAI.functionCalls.some((call) =>
  //   call.name.includes("/review/"),
  // );

  // assertEquals(hasClassifyCall, true);
  // assertEquals(hasReviewCall, true);
});

// Deno.test("AgenticController initialization and index generation", async () => {
//   const controller = new AgenticController(trajectory);

//   assertStringIncludes(controller.index, "classify_sentence");
// });

// Deno.test("AgenticController callables creation", async () => {
//   const controller = new AgenticController(trajectory);

//   const callables = controller.callables;
//   assertEquals(callables.length > 0, true);

//   const classifySentencePath = callables.find((c) =>
//     c.name.includes("classify_sentence"),
//   );
//   assertEquals(!!classifySentencePath, true);
// });
// Deno.test("Sensei Agent - Learning Plan Generation", async () => {
//   const trajectory = createTestTrajectory();
//   const controller = new AgenticController(trajectory);
//   const mockAI = new MockAI();

//   // intent resolution?
//   const senseiAgent = createSenseiAgent(controller, controller.callables);

//   const senseiPrompt = "I'd like to learn Latin from scratch. I've never studied it before.";
//   const senseiResponse = await senseiAgent.forward(mockAI, { request: senseiPrompt });

//   assertStringIncludes(senseiResponse, "Learning Objectives");
//   assertStringIncludes(senseiResponse, "Introduction Sequence");
//   assertStringIncludes(senseiResponse, "Practice Exercises");
//   assertEquals(senseiResponse.length > 100, true);
// });

// Deno.test("Shepherd Agent - Learning Instruction", async () => {
//   const trajectory = createTestTrajectory();
//   const controller = new AgenticController(trajectory);
//   const mockAI = new MockAI();

//   const shepherdAgent = createShepherdAgent(controller, controller.callables);

//   const itinerary = `# Latin Basics

//   ## Learning Objectives
//   - Learn basic vocabulary

//   ## Introduction Sequence
//   1. Introduce nouns
//   `;

//   const shepherdPrompt = "What does puella mean?";
//   const shepherdResponse = await shepherdAgent.forward(mockAI, {
//     itinerary,
//     userMessage: shepherdPrompt,
//     sessionHistory: "This is the first message in the session."
//   });

//   assertStringIncludes(shepherdResponse, "Latin");
//   assertStringIncludes(shepherdResponse, "puella");
//   assertEquals(shepherdResponse.length > 50, true);
// });

// Deno.test("End-to-End Test - Full Learning Cycle", async () => {
//   const trajectory = createTestTrajectory();
//   const controller = new AgenticController(trajectory);
//   const mockAI = new MockAI();

//   const senseiAgent = createSenseiAgent(controller, controller.callables);
//   const shepherdAgent = createShepherdAgent(controller, controller.callables);
//   const arbiterAgent = createArbiterAgent(controller, mockAI.wrapCallables(controller.callables));

//   mockAI.functionCalls = [];

//   const initialPrompt = "I want to learn Latin";
//   const itinerary = await senseiAgent.forward(mockAI, { request: initialPrompt });

//   const learnerMessage = "What does puella mean?";
//   const instruction = await shepherdAgent.forward(mockAI, {
//     itinerary,
//     userMessage: learnerMessage,
//     sessionHistory: ""
//   });

//   const learnerResponse = "puella means 'girl' in Latin";
//   const evaluation = await arbiterAgent.forward(mockAI, {
//     itinerary,
//     userResponse: learnerResponse,
//     expectedResponse: "girl"
//   });

//   assertStringIncludes(itinerary, "Learning Objectives");
//   assertStringIncludes(instruction, "puella");
//   assertStringIncludes(evaluation, "correct");

//   const functionCallCount = mockAI.functionCalls.length;
//   assertEquals(functionCallCount > 0, true);
// });
