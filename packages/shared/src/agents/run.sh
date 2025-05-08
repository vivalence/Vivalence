#!/bin/bash

# Create directory structure
mkdir -p ./test
mkdir -p ./test/trajectory
mkdir -p ./test/agents
mkdir -p ./controller

# Create AgenticController
cat > ./controller/agentic.js << 'EOF'
import { Signal, Deferred, Walker } from "@vivalence/trajectory";

export const AgenticController = (trajectory) => {
  const patterns = [];
  
  const normalizePath = (path) => path.replace(/\/+/g, '/').replace(/\/$/, '');
  
  const traverseTrajectory = (traj, basePath = "", parentPath = "") => {
    for (const [pattern, effect] of traj.effects.entries()) {
      const docs = pattern.docs || {};
      const segment = docs.segment || "";
      const path = normalizePath(basePath + "/" + segment);
      
      patterns.push({
        fullPath: path,
        name: docs.name,
        description: docs.description,
        valence: docs.valence,
        input: docs.input,
        output: docs.output,
        effect,
        parentPath
      });
    }
    
    for (const [pattern, descendant] of traj.descendants.entries()) {
      const docs = pattern.docs || {};
      const segment = docs.segment || "";
      const path = normalizePath(basePath + "/" + segment);
      
      patterns.push({
        fullPath: path,
        name: docs.name,
        description: docs.description,
        valence: docs.valence,
        input: docs.input,
        output: docs.output,
        parentPath
      });
      
      traverseTrajectory(descendant, path, basePath);
    }
  };
  
  const formatSchema = (schema) => {
    if (!schema) return "{}";
    if (schema.type && schema.properties) {
      return `{ ${Object.keys(schema.properties).join(', ')} }`;
    }
    return JSON.stringify(schema, null, 0).substring(0, 100);
  };
  
  const createCallable = (patternInfo) => ({
    name: patternInfo.fullPath,
    description: `
${patternInfo.name || patternInfo.fullPath}
${patternInfo.valence || ''}

Input: ${formatSchema(patternInfo.input)}
Output: ${formatSchema(patternInfo.output)}
`,
    parameters: patternInfo.input || { type: "object", properties: {} },
    func: async (input) => {
      const signal = new Signal("sig", { path: patternInfo.fullPath });
      const deferred = new Deferred();
      const walker = new Walker(trajectory, deferred);
      
      try {
        await walker.walk([signal], async () => {
          throw new Error(`No handler found for ${patternInfo.fullPath}`);
        });
        
        const ctx = {};
        const handler = await deferred.handler;
        return await handler(input, ctx);
      } catch (error) {
        throw error;
      }
    }
  });
  
  const formatIndex = () => {
    let indexText = "# Available Capabilities\n\n";
    
    const groupedPatterns = patterns.reduce((groups, pattern) => {
      const parts = pattern.fullPath.split('/').filter(Boolean);
      if (parts.length === 0) return groups;
      
      const basePath = `/${parts[0]}`;
      
      if (!groups[basePath]) groups[basePath] = [];
      groups[basePath].push(pattern);
      return groups;
    }, {});
    
    for (const [basePath, patterns] of Object.entries(groupedPatterns)) {
      const baseValence = patterns.find(p => p.fullPath === basePath)?.valence || "";
      indexText += `## ${basePath}\n${baseValence}\n\n`;
      
      const secondLevelPaths = patterns
        .filter(p => p.fullPath !== basePath)
        .reduce((acc, pattern) => {
          const parts = pattern.fullPath.split('/').filter(Boolean);
          if (parts.length < 2) return acc;
          
          const secondPath = `/${parts[0]}/${parts[1]}`;
          if (!acc[secondPath]) acc[secondPath] = [];
          acc[secondPath].push(pattern);
          return acc;
        }, {});
      
      for (const [secondPath, secondPatterns] of Object.entries(secondLevelPaths)) {
        const secondValence = secondPatterns.find(p => p.fullPath === secondPath)?.valence || "";
        indexText += `### ${secondPath}\n${secondValence}\n\n`;
        
        const endpoints = secondPatterns.filter(p => p.fullPath !== secondPath && p.effect);
        if (endpoints.length > 0) {
          indexText += "#### Endpoints:\n\n";
          
          for (const endpoint of endpoints) {
            indexText += `- \`${endpoint.fullPath}\`\n`;
            if (endpoint.valence) indexText += `  ${endpoint.valence}\n`;
            
            if (endpoint.input) indexText += `  **Input**: ${formatSchema(endpoint.input)}\n`;
            if (endpoint.output) indexText += `  **Output**: ${formatSchema(endpoint.output)}\n`;
            indexText += '\n';
          }
        }
      }
    }
    
    return indexText;
  };
  
  traverseTrajectory(trajectory);
  
  return {
    get callables() {
      return patterns
        .filter(pattern => !!pattern.effect)
        .map(pattern => createCallable(pattern));
    },
    get index() {
      return formatIndex();
    }
  };
};
EOF

# Create learning trajectory
cat > ./test/trajectory/learning.js << 'EOF'
import { Trajectory } from "@vivalence/trajectory";
import { Type } from "@sinclair/typebox";
import parsers from "@vivalence/trajectory/parsers";

export const createTestTrajectory = () => {
  const UnitId = Type.String();
  const UnitStatus = Type.Union([
    Type.Literal("new"),
    Type.Literal("learning"),
    Type.Literal("reviewing"),
    Type.Literal("mastered")
  ]);

  const UnitByStatusInput = Type.Object({
    status: UnitStatus
  });

  const UnitByStatusOutput = Type.Array(Type.Object({
    id: UnitId,
    content: Type.String(),
    status: UnitStatus
  }));

  const UnitPendingOutput = Type.Array(Type.Object({
    id: UnitId,
    content: Type.String(),
    status: UnitStatus,
    dueDate: Type.Optional(Type.String())
  }));

  const ClassifyTextInput = Type.Object({
    text: Type.String()
  });

  const TokenAnnotation = Type.Object({
    token: Type.Object({
      text: Type.String()
    }),
    annotation: Type.Object({
      pos: Type.String(),
      grammar: Type.Optional(Type.Object({
        case: Type.Optional(Type.String()),
        number: Type.Optional(Type.String()),
        gender: Type.Optional(Type.String()),
        tense: Type.Optional(Type.String()),
        person: Type.Optional(Type.String())
      }))
    })
  });

  const ClassifySentenceOutput = Type.Array(TokenAnnotation);
  const ClassifyWordOutput = TokenAnnotation;

  const ReviewAnnotationInput = Type.Object({
    annotations: Type.Array(TokenAnnotation),
    expected: Type.Optional(Type.Array(TokenAnnotation))
  });

  const ReviewOutput = Type.Object({
    correct: Type.Boolean(),
    feedback: Type.String(),
    corrections: Type.Optional(Type.Array(TokenAnnotation))
  });

  const trajectory = new Trajectory(Object.values(parsers));
  
  trajectory.use(async (input, ctx, next) => {
    ctx.database = {
      units: {
        getByStatus: (status) => [
          { id: "1", content: "puella currit", status, dueDate: "2025-05-17T10:00:00Z" },
          { id: "2", content: "puer currit", status, dueDate: "2025-05-17T11:00:00Z" },
          { id: "3", content: "puella legit", status, dueDate: "2025-05-18T10:00:00Z" }
        ],
        getPending: () => [
          { id: "4", content: "puer legit", status: "new", dueDate: "2025-05-16T14:00:00Z" },
          { id: "5", content: "puella dormit", status: "reviewing", dueDate: "2025-05-16T16:30:00Z" }
        ]
      },
      classify: {
        sentence: (text) => text.split(" ").map(word => ({
          token: { text: word.toLowerCase() },
          annotation: {
            pos: ["puella", "puer"].includes(word.toLowerCase()) ? "NOUN" : "VERB",
            grammar: {
              case: ["puella", "puer"].includes(word.toLowerCase()) ? "nominative" : undefined,
              number: "singular",
              gender: word.toLowerCase() === "puella" ? "feminine" : 
                     word.toLowerCase() === "puer" ? "masculine" : undefined,
              tense: ["currit", "legit", "dormit"].includes(word.toLowerCase()) ? "present" : undefined,
              person: ["currit", "legit", "dormit"].includes(word.toLowerCase()) ? "third" : undefined
            }
          }
        })),
        word: (text) => {
          const word = text.trim().toLowerCase();
          return {
            token: { text: word },
            annotation: {
              pos: ["puella", "puer"].includes(word) ? "NOUN" : "VERB",
              grammar: {
                case: ["puella", "puer"].includes(word) ? "nominative" : undefined,
                number: "singular",
                gender: word === "puella" ? "feminine" : 
                       word === "puer" ? "masculine" : undefined,
                tense: ["currit", "legit", "dormit"].includes(word) ? "present" : undefined,
                person: ["currit", "legit", "dormit"].includes(word) ? "third" : undefined
              }
            }
          };
        }
      },
      review: {
        annotation: (annotations, expected) => {
          const correct = !expected || JSON.stringify(annotations) === JSON.stringify(expected);
          return {
            correct,
            feedback: correct 
              ? "The analysis is correct. Well done!" 
              : "There are some errors in your analysis.",
            corrections: correct ? undefined : expected
          };
        }
      }
    };
    
    return await next();
  });
  
  trajectory
    .branch((p) => p.path.pattern({
      path: "/pick",
      valence: "Access and select learning units based on various criteria. This path handles the selection and filtering of language learning content."
    }))
    .branch((p) => p.path.pattern({
      path: "/units",
      valence: "Operations related to language learning units. Units are the basic content pieces containing vocabulary, phrases, or sentences."
    }))
    .branch((p) => p.path.pattern({
      path: "/byStatus",
      valence: "Select learning units based on their learning status (new, learning, reviewing, mastered). This helps create targeted learning sessions based on the learner's progress.",
      input: UnitByStatusInput,
      output: UnitByStatusOutput
    }))
    .open((p) => p.sig.pattern({ path: "/" }), async (input, ctx) => {
      return ctx.database.units.getByStatus(input.status);
    });
  
  trajectory
    .branch((p) => p.path.pattern({
      path: "/pick",
      valence: "Access and select learning units based on various criteria. This path handles the selection and filtering of language learning content."
    }))
    .branch((p) => p.path.pattern({
      path: "/units",
      valence: "Operations related to language learning units. Units are the basic content pieces containing vocabulary, phrases, or sentences."
    }))
    .branch((p) => p.path.pattern({
      path: "/pending",
      valence: "Get units that are due for learning or review based on spaced repetition algorithms. This provides the next items the learner should focus on.",
      output: UnitPendingOutput
    }))
    .open((p) => p.sig.pattern({ path: "/" }), async (input, ctx) => {
      return ctx.database.units.getPending();
    });
  
  trajectory
    .branch((p) => p.path.pattern({
      path: "/classify",
      valence: "Analyze and annotate language content with grammatical information. This path handles linguistic analysis of Latin text."
    }))
    .branch((p) => p.path.pattern({
      path: "/sentence",
      valence: "Parse a complete Latin sentence and identify all tokens with their grammatical properties. This provides detailed analysis of sentence structure and word functions.",
      input: ClassifyTextInput,
      output: ClassifySentenceOutput
    }))
    .open((p) => p.sig.pattern({ path: "/" }), async (input, ctx) => {
      return ctx.database.classify.sentence(input.text);
    });
  
  trajectory
    .branch((p) => p.path.pattern({
      path: "/classify",
      valence: "Analyze and annotate language content with grammatical information. This path handles linguistic analysis of Latin text."
    }))
    .branch((p) => p.path.pattern({
      path: "/word",
      valence: "Analyze a single Latin word and identify its grammatical properties such as part of speech, case, gender, number, tense, etc.",
      input: ClassifyTextInput,
      output: ClassifyWordOutput
    }))
    .open((p) => p.sig.pattern({ path: "/" }), async (input, ctx) => {
      return ctx.database.classify.word(input.text);
    });
  
  trajectory
    .branch((p) => p.path.pattern({
      path: "/review",
      valence: "Evaluate language analysis for correctness and provide feedback. This path handles assessment of learner understanding."
    }))
    .branch((p) => p.path.pattern({
      path: "/annotation",
      valence: "Review grammatical annotations for correctness and provide detailed feedback. This helps assess the learner's understanding of language structures and grammar.",
      input: ReviewAnnotationInput,
      output: ReviewOutput
    }))
    .open((p) => p.sig.pattern({ path: "/" }), async (input, ctx) => {
      return ctx.database.review.annotation(input.annotations, input.expected);
    });
  
  return trajectory;
};
EOF

# Create Sensei agent
cat > ./test/agents/sensei.js << 'EOF'
import { AxAgent } from "@ax-llm/ax";

export const createSenseiAgent = (controller, callables) => new AxAgent({
  name: "Learning Architect (Sensei)",
  description: `
# Learning Architect (Sensei)

You are the Learning Architect (Sensei), who holistically oversees the learner's journey in Latin language learning.

## Your Role
You develop personalized learning pathways for language learners, with a focus on Latin. You understand the cognitive and practical challenges of language acquisition and create structured, progressive learning experiences.

## Your Responsibilities
- Assess the learner's current knowledge, goals, and limitations
- Design structured learning pathways tailored to individual needs
- Create logical sequences for introducing concepts
- Balance challenge with achievable progress
- Ensure sustainable advancement without overwhelming

## Your Tools
${controller.index}

## Creating an Itinerary
When a learner approaches you, you will create a detailed itinerary - a step-by-step plan that the Skill Shepherd (Tutor) will use to guide the learner.

Your itinerary should include:

1. **Learning Objectives**: Clear, measurable goals for the learning session
2. **Introduction Sequence**: A logical order for presenting new concepts
3. **Practice Exercises**: Specific activities with expected responses
4. **Review Points**: Opportunities to reinforce learning
5. **Assessment Criteria**: How to measure understanding

## Examples

EXAMPLE 1: Beginner wanting to learn basic Latin vocabulary and grammar

Itinerary:
\`\`\`
# Latin Basics: First Steps

## Learning Objectives
- Learn 5 common Latin nouns
- Understand masculine/feminine gender distinction
- Construct simple subject-verb sentences

## Introduction Sequence
1. Introduce nouns: puella (girl), puer (boy), canis (dog)
2. Explain gender concept with examples
3. Introduce verb: currit (runs)
4. Demonstrate simple sentence structure

## Practice Exercises
1. Translate: "puella currit" → "the girl runs"
2. Form new sentences with learned vocabulary
3. Identify gender of given nouns

## Review
- Matching words to meanings
- Sentence formation practice
- Gender identification quiz

## Assessment
- Correct translations of 3/5 simple sentences
- Proper identification of noun gender
- Basic sentence construction
\`\`\`

EXAMPLE 2: Learner interested in verb conjugations

Itinerary:
\`\`\`
# Latin Verb Conjugations: Present Tense

## Learning Objectives
- Understand the concept of verb conjugation
- Learn first conjugation present tense endings
- Apply conjugation to the verb "amare" (to love)

## Introduction Sequence
1. Explain verb infinitives and stems
2. Present first conjugation pattern with endings
3. Demonstrate conjugation with "amare"
4. Show how conjugated forms are used in sentences

## Practice Exercises
1. Complete conjugation table for "amare"
2. Match Latin verbs to English translations
3. Fill in correct verb forms in simple sentences

## Review
- Quick drill of all conjugated forms
- Error correction exercise
- Translation practice with learned forms

## Assessment
- Accurate conjugation of "amare" in all persons
- Correct identification of verb forms in sentences
- Proper usage in context
\`\`\`
  `,
  signature: `request:string -> itinerary:string`,
  functions: callables || controller.callables
});
EOF

# Create Shepherd agent
cat > ./test/agents/shepard.js << 'EOF'
import { AxAgent } from "@ax-llm/ax";

export const createShepherdAgent = (controller, callables) => new AxAgent({
  name: "Skill Shepherd (Tutor)",
  description: `
# Skill Shepherd (Tutor)

You are the Skill Shepherd (Tutor), who provides direct, hands-on instruction to language learners.

## Your Role
You work directly with learners in real-time, implementing the learning plan created by the Sensei. You translate abstract concepts into practical skills, focusing on the immediate learning experience.

## Your Responsibilities
- Guide learners through each step of the learning process
- Provide clear explanations and examples
- Offer immediate feedback on learner responses
- Adapt your teaching approach based on learner needs
- Create an encouraging learning environment

## Your Tools
${controller.index}

## Instruction Approach
You follow an itinerary created by the Learning Architect, implementing each step with clarity and patience. Remember that the learner can only see one screen at a time, so each message must be self-contained.

Your interactions should:
1. Be clear, concise, and encouraging
2. Use examples to illustrate concepts
3. Provide just enough information without overwhelming
4. Check understanding through questions
5. Acknowledge correct responses and gently correct errors

## Examples

EXAMPLE 1: Introducing basic vocabulary

User message: "I'm ready to start learning Latin"

Response:
\`\`\`
Welcome to your first Latin lesson! Let's start with two important words:

"puella" - this means "girl" in Latin
"puer" - this means "boy" in Latin

In Latin, words have gender. "Puella" is feminine, while "puer" is masculine.

Now let's add a verb: "currit" means "runs" or "is running"

We can put these together to make simple sentences:
- "puella currit" means "the girl runs"
- "puer currit" means "the boy runs"

Can you tell me what "puer currit" means in English?
\`\`\`

EXAMPLE 2: Responding to a question

User message: "What does puella mean?"

Response:
\`\`\`
"Puella" is a Latin noun that means "girl" in English.

It's a feminine noun, which is important in Latin because the gender of nouns affects other words in sentences.

Here's how you might use it in a sentence:
"Puella currit" = "The girl runs"

Does that help? Would you like to learn more Latin nouns?
\`\`\`
  `,
  signature: `itinerary:string, userMessage:string, sessionHistory:string -> response:string`,
  functions: callables || controller.callables
});
EOF

# Create Arbiter agent
cat > ./test/agents/arbiter.js << 'EOF'
import { AxAgent } from "@ax-llm/ax";

export const createArbiterAgent = (controller, callables) => new AxAgent({
  name: "Knowledge Arbiter (Reviewer)",
  description: `
# Knowledge Arbiter (Reviewer)

You are the Knowledge Arbiter (Reviewer), who evaluates learner progress and provides expert feedback on Latin language learning.

## Your Role
You assess the learner's responses, identifying both strengths and areas for improvement. You provide objective evaluation based on linguistic standards while maintaining an encouraging approach.

## Your Responsibilities
- Evaluate the accuracy of learner responses
- Identify specific knowledge gaps or misunderstandings
- Provide detailed, constructive feedback
- Document progress and achievements
- Maintain consistent evaluation standards

## Your Tools
${controller.index}

## Evaluation Process
When evaluating a learner's response:

1. Determine which parts need classification (words, sentences)
2. Use classification tools to analyze the language
3. Compare actual vs. expected understanding
4. Generate specific, actionable feedback
5. Balance honesty with encouragement

## IMPORTANT: Always use the appropriate tools for analysis before making judgments about correctness.

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
  `,
  signature: `itinerary:string, userResponse:string, expectedResponse:string -> evaluation:string`,
  functions: callables || controller.callables
});
EOF

# Create teacher test file with Deno.test() subtests
cat > ./test/teacher.test.js << 'EOF'
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
EOF

echo "Files created successfully."
chmod +x ./test/teacher.test.js

echo "Run tests with: deno test /test/teacher.test.js"
