import { assertEquals, assertExists, assertStringIncludes } from "$std@std@std/assert";
import { assertRejects, assertInstanceOf } from "$std@std@std/assert";
import { Type } from "@sinclair/typebox";

import { Agent } from "../agent.js";
// @lj hot
import { brain } from "./lib/createBrain.js";

Deno.test("Agent - generateing hot //off", async () => {
  const eva = new Agent("eva", "Emacs virtual assistant")
    .withBrain(brain.mock) // MOCKED
    .withInput(Type.Object({ expression: Type.String() }))
    .withTemplate((i) => input.expression)
    .withOutput(
      Type.Object({
        evaluation: Type.String(),
      }),
    );

  eva.withContext(
    "greeting",
    "you are eva, the emacs virtual assistant. evalute the provided expression.",
  );

  const input = { expression: `(eva "say hallo world")` };
  const result = await eva.generate(input);
  assertExists(result.evaluation);
});
Deno.test("Agent - generatorSchemaFromInput", () => {
  const agent = new Agent("test", "test");
  const schema = Type.Object({ message: Type.String() });
  agent.withOutput(schema);

  assertEquals(agent.output, schema);
});

Deno.test("Agent - generate with valid input", async () => {
  const agent = new Agent("test", "test")
    .withBrain(brain.mock)
    .withInput(Type.Object({ message: Type.String() }))
    .withOutput(
      Type.Object({
        evaluation: Type.String(),
      }),
    );

  agent.withContext("greeting", "You are helpful.");
  const input = { message: "Hello" };
  const result = await agent.generate(input);

  assertExists(result.evaluation);
});

Deno.test("Agent - Constructor", () => {
  const agent = new Agent("test-slug", "Test Agent");

  assertEquals(agent.slug, "test-slug");
  assertEquals(agent.name, "Test Agent");
  assertInstanceOf(agent.context, Map);
  assertEquals(agent.context.size, 0);
});

Deno.test("Agent - withProvider method", () => {
  const agent = new Agent("test", "test");
  const result = agent.withBrain(brain.mock);

  assertEquals(result, agent);
  assertEquals(agent.brain, brain.mock);
});
Deno.test("Agent - withInput method", () => {
  const agent = new Agent("test", "test");
  const inputSchema = Type.Object({ message: Type.String() });
  const result = agent.withInput(inputSchema);

  assertEquals(result, agent);
  assertEquals(agent.input, inputSchema);
  assertExists(agent.inputValidator);
});

Deno.test("Agent - withOutput method", () => {
  const agent = new Agent("test", "test");
  const outputSchema = Type.Object({ response: Type.String() });
  const result = agent.withOutput(outputSchema);

  assertEquals(result, agent);
  assertEquals(agent.output, outputSchema);
  assertExists(agent.outputValidator);
});

Deno.test("Agent - withTemplate method", () => {
  const agent = new Agent("test", "test");
  const template = (msg) => `Template: ${msg}`;
  const result = agent.withTemplate(template);

  assertEquals(result, agent);
  assertEquals(agent.template, template);
});

Deno.test("Agent - withContext and getContext", () => {
  const agent = new Agent("test", "test");

  agent.withContext("greeting", "Hello, ");
  agent.withContext("dynamic", () => "World!");

  const context = agent.getContext();
  assertEquals(context.length, 2);
  assertEquals(context[0], "Hello, ");
  assertEquals(context[1], "World!");
});

Deno.test("Agent - system getter", () => {
  const agent = new Agent("test", "test");

  agent.withContext("part1", "You are ");
  agent.withContext("part2", "a helpful ");
  agent.withContext("part3", () => "assistant.");

  const system = agent.system;
  assertEquals(system, "You are a helpful assistant.");
});

// Deno.test("Agent - consumes context", () => {
//   const agent = new Agent("test", "test");

//   agent.withContext("salve", (agent) => `Salve. "${agent.consume("dynamic")}"`);
//   agent.withContext("greeting", "Hello");
//   agent.withContext("dynamic", (a) => `${a.consume("greeting")}, World!`);

//   const system = agent.system;
//   assertStringIncludes(system, 'Salve. "');
//   assertStringIncludes(system, "Hello, World!");
// });

Deno.test("Agent - validate with valid input", () => {
  const agent = new Agent("test", "test");
  const schema = Type.Object({ message: Type.String() });
  agent.withInput(schema);

  const validInput = { message: "Hello" };
  const issues = agent.validate(validInput);

  assertEquals(issues.length, 0);
});

Deno.test("Agent - validate with invalid input", () => {
  const agent = new Agent("test", "test");
  const schema = Type.Object({ message: Type.String() });
  agent.withInput(schema);
  const invalidInput = { message: 123 };

  assertRejects(
    async () => await agent.validate(invalidInput),
    Error,
    "Validation failed",
  );
});

Deno.test("Agent - validate without input schema", () => {
  const agent = new Agent("test", "test");
  const input = { message: "Hello" };
  const issues = agent.validate(input);

  assertEquals(issues.length, 0);
});

Deno.test("Agent - onIssues throws error", () => {
  const agent = new Agent("test", "test");
  const issues = [{ message: "Test error" }];

  assertRejects(
    async () => await agent.onIssues(issues),
    Error,
    "Validation failed",
  );
});

Deno.test("Agent - parse with valid output", () => {
  const agent = new Agent("test", "test");
  const schema = Type.Object({ response: Type.String() });
  agent.withOutput(schema);

  const validOutput = { response: "Hello" };
  const result = agent.parse(validOutput);

  assertEquals(result, validOutput);
});

Deno.test("Agent - parse with invalid output", () => {
  const agent = new Agent("test", "test");
  const schema = Type.Object({ response: Type.String() });
  agent.withOutput(schema);

  const invalidOutput = { response: 123 };

  assertRejects(
    async () => await agent.parse(invalidOutput),
    "Expected String",
  );
});

Deno.test("Agent - parse without output schema", () => {
  const agent = new Agent("test", "test");
  const output = { response: "Hello" };
  const result = agent.parse(output);

  assertEquals(result, output);
});

Deno.test("Agent - prompt without template", () => {
  const agent = new Agent("test", "test");
  const message = "Hello";
  const result = agent.prompt(message);

  assertEquals(result, "Hello");
});

Deno.test("Agent - prompt with template", () => {
  const agent = new Agent("test", "test");
  const template = (msg) => `Template: ${msg}`;
  agent.withTemplate(template);

  const message = "Hello";
  const result = agent.prompt(message);

  assertEquals(result, "Template: Hello");
});

Deno.test("Agent - check with complete configuration", async () => {
  const agent = new Agent("test", "test")
    .withBrain(brain.mock)
    .withInput(Type.Object({ message: Type.String() }))
    .withOutput(Type.Object({ response: Type.String() }));

  agent.check();
});

Deno.test("Agent - check with incomplete configuration", () => {
  const agent = new Agent("test", "test");

  assertRejects(
    async () => await agent.check(),
    Error,
    "Agent configuration incomplete",
  );
});

// // // // // // // // // // // // // // // // // // // // // // // // // // // // // // // // // // // // // // //
// // // // // // // // // // // // // // // // // // // // // // // // // // // // // // // // // // // // // // //
// // // // // // // // // // // // // // // // // // // // // // // // // // // // // // // // // // // // // // //
// // // // // // // // // // // // // // // // // // // // // // // // // // // // // // // // // // // // // // //

// Deno.test("Agent - generate with invalid input", async () => {
//   const agent = new Agent("test", "test")
//     .withProvider(mockProvider)
//     .withProfile("gpt-4")
//     .withInput(Type.Object({ message: Type.String() }))
//     .withOutput(Type.Object({ response: Type.String() }));

//   const invalidInput = { message: 123 };

//   await assertRejects(async () => await agent.generate(invalidInput));
// });

// Deno.test("Agent - generate with template", async () => {
//   const agent = new Agent("test", "test")
//     .withProvider(mockProvider)
//     .withProfile("gpt-4")
//     .withInput(Type.Object({ message: Type.String() }))
//     .withOutput(
//       Type.Object({
//         result: Type.String(),
//         model: Type.String(),
//         system: Type.String(),
//         prompt: Type.String(),
//       }),
//     )
//     .withTemplate((msg) => `Template: ${msg.message}`);

//   const input = { message: "Hello" };
//   const result = await agent.generate(input);

//   assertEquals(result.prompt, "Template: Hello");
// });

// Deno.test("Agent - method chaining", () => {
//   const agent = new Agent("test", "test")
//     .withProvider(mockProvider)
//     .withProfile("gpt-4")
//     .withInput(Type.Object({ message: Type.String() }))
//     .withOutput(Type.Object({ response: Type.String() }))
//     .withTemplate((msg) => `Template: ${msg}`);

//   assertEquals(agent.provider, mockProvider);
//   assertEquals(agent.profile, "gpt-4");
//   assertExists(agent.input);
//   assertExists(agent.output);
//   assertExists(agent.template);
// });

// import config from "@vivalence/paladin";
// import { assertEquals } from "$std@std@std/assert";

// import { Type } from "@sinclair/typebox";
// import { createAnthropic } from "@ai/sdk/anthropic";

// import { Agent } from "../agent.js";

// // @lj hot
// const auth = { apiKey: config.env.get("ANTHROPIC_API_KEY") };
// const provider = createAnthropic(auth);
// const profile = { thinking: { type: "enabled", budgetTokens: 24000 } };

// // agent.context
// // context.role // language learning system
// // context.identity // generator
// // context.tools // scope: some of function of the trajectory and mcp
// // context.task // description of the problem and the methodology to appy.
// // context.terra // information about the operating system, runtime, deamon and maybe repo
// // context.orientation // you will be given an identity, introduced into the world, given tools, get described a task to perform, maybe examples of how to do it. you are an agent of viva. you persist across time and share a long term interface with both an operating system and some entity. the entity might be a person or a task or both combined.

// // ctx.services.llm.provider
// Deno.test("Some Tests", async () => {
//   const generator = new Agent("generator").withProvider(provider).withProfile();
//   // assertObject generator.model(profile)

//   generator.input = Type.Object({
//     userInput: Type.String({
//       description: "The learners input. Empty on first step.",
//     }),
//     currentStep: Type.Union([Step, Type.Null()]),
//     learnables: Learnables,
//     process: Process,
//   });

//   generator.output = Type.Object({});
//   // assert that incorrect output shapes lead to error thrown

//   generator.template = (input) => JSON.stringify(input);
//   // assert correct result of generator.prompt on both cases of: template function provided / not provided.

//   //

//   generator.withContext(
//     "terra",
//     `
//   you are an agent of viva. you persist across time and share a long term interface with both an operating system and some entity. the entity might be a person or a task or both combined.
//   you will be given an identity, introduced into the world, given tools, get described a task to perform, maybe examples of how to do it.
// we generally follow the follwing conventions inside the system prompt:
// propertyName:string "description" => output:json{}
// f()
// `,
//   );
//   generator.withContext("identity", `generator`);
//   generator.withContext(
//     "task",
//     (agent) => `### description of the problem and the methodology to aply
// in this section we will cover:
// a input schema in json form, followed by a semantic description.
// a output schema in json form, followed by a semantic description.
// a description of how to get from input to output.

// ### ### semantics
// steps and process, learnable and learnables.
// a learnable is a bit of knowledge.
// a step is a way to way to communicate that knowledge
// currentStep has to by interpreted like fX and values of [xyz] mean [abc]
// user input can look like abc; recognize moods
// in case of moods cbd do thc

// ### ### input
// ${JSON.stringify(agent.input)}
// [...]

// ### ### output
// ${JSON.stringify(agent.output)}
// [...]

// ### ### process
// our goal is to move to the next step, and teach the next learnable according to the process.
// we must make a decision if the we want to stay at this step or move on the next step.

// // currentStep = response.nextStep;
// you call the nextStep function with the following schema({nextStep: slug:string })

// you are given a few examples of response templates. ie what good responses look like.
// []

// `,
//   );

//   // assertStringContains generator.system
//   // assertStringContains generator.prompt(input)

//   const output = await generator.generate(input);
//   // assert output
//   // assertObjectShape output
// });
