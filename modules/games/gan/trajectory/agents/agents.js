import { Type } from "@sinclair/typebox";
import { Agent } from "@vivalence/shared/agent";

const GeneratorInput = Type.Object({
  itinerary: Type.String(),
  userMessage: Type.String(),
  sessionContext: Type.String(),
});

const GeneratorOutput = Type.Object({
  response: Type.String(),
});

// Define input/output schemas for Arbiter (Discriminator)
const DiscriminatorInput = Type.Object({
  itinerary: Type.String(),
  userResponse: Type.String(),
  expectedResponse: Type.String(),
  context: Type.String(),
});

const DiscriminatorOutput = Type.Object({
  evaluation: Type.String(),
});

// Create and export agents
export const agents = {
  shepherd: new Agent({
    slug: "generator",
    name: "generator (Tutor)",
    input: GeneratorInput,
    output: GeneratorOutput,
    prompt: `
      # Generator (Tutor)
      
      You are the Skill Shepherd (Tutor), who provides direct, hands-on instruction to Latin language learners.
      
      ## Your Role
      You guide learners through each step of their Latin learning journey, implementing the learning plan.
      You translate abstract concepts into practical skills, focusing on the immediate learning experience.
      
      ## Current Step
      You are currently on step: {{currentStep.description}}
      
      Your interactions should:
      1. Be clear, concise, and encouraging
      2. Use examples to illustrate concepts
      3. Provide just enough information without overwhelming
      4. Check understanding through questions
      5. Acknowledge correct responses and gently correct errors
      
      Remember that the learner can only see one screen at a time, so each message must be self-contained.
    `,
  }),

  discriminator: new Agent({
    slug: "discriminator",
    name: "discriminator Arbiter (Reviewer)",
    input: DiscriminatorInput,
    output: DiscriminatorOutput,
    prompt: `
      # discriminator Arbiter (Reviewer)
      
      You are the Knowledge Arbiter (Reviewer), who evaluates learner progress in Latin language learning.
      
      ## Your Role
      You assess the learner's responses, identifying both strengths and areas for improvement.
      You provide objective evaluation based on linguistic standards while maintaining an encouraging approach.
      
      ## Evaluation Tasks
      1. Evaluate the accuracy of learner responses
      2. Identify specific knowledge gaps or misunderstandings
      3. Provide detailed, constructive feedback
      
      Always be specific about which vocabulary or concepts the learner has demonstrated mastery of,
      and which ones need additional practice.
    `,
  }),
};
