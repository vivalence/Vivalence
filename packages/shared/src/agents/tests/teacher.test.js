import { assertEquals, assertStringIncludes } from "https://deno.land/std/assert/mod.ts";
import { createTestTrajectory } from "./trajectory/learning.js";
import { AgenticController } from "../controller/agentic.js";
import { createSenseiAgent } from "./agents/sensei.js";
import { createShepherdAgent } from "./agents/shepard.js";
import { createArbiterAgent } from "./agents/arbiter.js";

class MockAI {
  functionCalls = [];
  
  async complete(prompt) {
    if (prompt.includes("Learning Architect")) {
      return {
        completion: `# Latin Learning Itinerary for Beginners

## Learning Objectives
- Understand basic Latin noun gender (masculine/feminine)
- Learn first vocabulary: puer (boy), puella (girl)
- Learn first verb: currit (runs)
- Construct simple sentences

## Introduction Sequence
1. Introduce nouns: "puella" (girl) and "puer" (boy)
2. Explain gender: feminine and masculine
3. Introduce verb: "currit" (runs)
4. Demonstrate sentence construction

## Practice Exercises
1. Translate: "puella currit" (the girl runs)
2. Translate: "puer currit" (the boy runs)
3. Identify gender: Is "puella" masculine or feminine?

## Review
- Review vocabulary: puella, puer, currit
- Review gender concepts
- Practice sentence formation

## Assessment
- Correct translation of simple sentences
- Identification of noun gender
- Understanding of subject-verb relationships`
      };
    } else if (prompt.includes("Skill Shepherd")) {
      return {
        completion: `Let's learn some basic Latin!

Today we'll start with two important nouns:

"puella" - which means "girl" in Latin
"puer" - which means "boy" in Latin

These words have different genders in Latin:
- "puella" is feminine
- "puer" is masculine

Now let's add an action. The Latin word "currit" means "runs" or "is running".

Let's put these together to make our first sentences:

"puella currit" - "the girl runs"
"puer currit" - "the boy runs"

Can you translate "puer currit" into English?`
      };
    } else if (prompt.includes("Knowledge Arbiter")) {
      return {
        completion: `I've analyzed your response to the translation task.

You translated "puella currit" as "the girl runs."

Let me check this:
1. "puella" means "girl" in Latin (feminine noun)
2. "currit" means "runs" (third-person singular present tense verb)

Your translation is correct! You've accurately identified:
- The meaning of each word
- The subject-verb relationship
- The present tense of the action

Great job understanding your first Latin sentence!`
      };
    }
    return { completion: "Test response" };
  }
  
  wrapCallables(callables) {
    return callables.map(callable => ({
      ...callable,
      func: async (input) => {
        this.functionCalls.push({
          name: callable.name,
          input
        });
        return await callable.func(input);
      }
    }));
  }
}

Deno.test("AgenticController initialization and index generation", async () => {
  const trajectory = createTestTrajectory();
  const controller = new AgenticController(trajectory);
  
  const index = controller.index;
  assertStringIncludes(index, "# Available Capabilities");
  assertStringIncludes(index, "/pick");
  assertStringIncludes(index, "/classify");
  assertStringIncludes(index, "/review");
});

Deno.test("AgenticController callables creation", async () => {
  const trajectory = createTestTrajectory();
  const controller = new AgenticController(trajectory);
  
  const callables = controller.callables;
  assertEquals(callables.length > 0, true);
  
  const pickUnitsPath = callables.find(c => c.name.includes("/pick/units/byStatus"));
  assertEquals(!!pickUnitsPath, true);
  
  const classifySentencePath = callables.find(c => c.name.includes("/classify/sentence"));
  assertEquals(!!classifySentencePath, true);
});

Deno.test("Sensei Agent - Learning Plan Generation", async () => {
  const trajectory = createTestTrajectory();
  const controller = new AgenticController(trajectory);
  const mockAI = new MockAI();
  
  const senseiAgent = createSenseiAgent(controller, controller.callables);
  
  const senseiPrompt = "I'd like to learn Latin from scratch. I've never studied it before.";
  const senseiResponse = await senseiAgent.forward(mockAI, { request: senseiPrompt });
  
  assertStringIncludes(senseiResponse, "Learning Objectives");
  assertStringIncludes(senseiResponse, "Introduction Sequence");
  assertStringIncludes(senseiResponse, "Practice Exercises");
  assertEquals(senseiResponse.length > 100, true);
});

Deno.test("Shepherd Agent - Learning Instruction", async () => {
  const trajectory = createTestTrajectory();
  const controller = new AgenticController(trajectory);
  const mockAI = new MockAI();
  
  const shepherdAgent = createShepherdAgent(controller, controller.callables);
  
  const itinerary = `# Latin Basics
  
  ## Learning Objectives
  - Learn basic vocabulary
  
  ## Introduction Sequence
  1. Introduce nouns
  `;
  
  const shepherdPrompt = "What does puella mean?";
  const shepherdResponse = await shepherdAgent.forward(mockAI, { 
    itinerary,
    userMessage: shepherdPrompt,
    sessionHistory: "This is the first message in the session."
  });
  
  assertStringIncludes(shepherdResponse, "Latin");
  assertStringIncludes(shepherdResponse, "puella");
  assertEquals(shepherdResponse.length > 50, true);
});

Deno.test("Arbiter Agent - Response Evaluation", async () => {
  const trajectory = createTestTrajectory();
  const controller = new AgenticController(trajectory);
  const mockAI = new MockAI();
  
  const arbiterAgent = createArbiterAgent(controller, mockAI.wrapCallables(controller.callables));
  
  mockAI.functionCalls = [];
  
  const itinerary = `# Latin Basics
  
  ## Learning Objectives
  - Translate simple sentences
  `;
  
  const arbiterPrompt = "puella currit means 'the girl runs'";
  await arbiterAgent.forward(mockAI, {
    itinerary,
    userResponse: arbiterPrompt,
    expectedResponse: "the girl runs"
  });
  
  const hasClassifyCall = mockAI.functionCalls.some(call => call.name.includes('/classify/'));
  const hasReviewCall = mockAI.functionCalls.some(call => call.name.includes('/review/'));
  
  assertEquals(hasClassifyCall, true);
  assertEquals(hasReviewCall, true);
});

Deno.test("End-to-End Test - Full Learning Cycle", async () => {
  const trajectory = createTestTrajectory();
  const controller = new AgenticController(trajectory);
  const mockAI = new MockAI();
  
  const senseiAgent = createSenseiAgent(controller, controller.callables);
  const shepherdAgent = createShepherdAgent(controller, controller.callables);
  const arbiterAgent = createArbiterAgent(controller, mockAI.wrapCallables(controller.callables));
  
  mockAI.functionCalls = [];
  
  const initialPrompt = "I want to learn Latin";
  const itinerary = await senseiAgent.forward(mockAI, { request: initialPrompt });
  
  const learnerMessage = "What does puella mean?";
  const instruction = await shepherdAgent.forward(mockAI, {
    itinerary,
    userMessage: learnerMessage,
    sessionHistory: ""
  });
  
  const learnerResponse = "puella means 'girl' in Latin";
  const evaluation = await arbiterAgent.forward(mockAI, {
    itinerary,
    userResponse: learnerResponse,
    expectedResponse: "girl"
  });
  
  assertStringIncludes(itinerary, "Learning Objectives");
  assertStringIncludes(instruction, "puella");
  assertStringIncludes(evaluation, "correct");
  
  const functionCallCount = mockAI.functionCalls.length;
  assertEquals(functionCallCount > 0, true);
});
