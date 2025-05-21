import config from "@vivalence/config";
import { assertEquals } from "$std/assert";

import { Type } from "@sinclair/typebox";
import { createAnthropic } from "@ai/sdk/anthropic";

import { Agent } from "../agent.js";

// @lj hot
const auth = { apiKey: config.env.get("ANTHROPIC_API_KEY") };
const provider = createAnthropic(auth);

// agent.context
// context.role // language learning system
// context.identity // generator
// context.tools // scope: some of function of the trajectory and mcp
// context.task // description of the problem and the methodology to appy.
// context.terra // information about the operating system, runtime, deamon and maybe repo
// context.orientation // you will be given an identity, introduced into the world, given tools, get described a task to perform, maybe examples of how to do it. you are an agent of viva. you persist across time and share a long term interface with both an operating system and some entity. the entity might be a person or a task or both combined.

Deno.test("Some Tests", () => {
  const generator = new Agent("generator").withProvider(provider).withProfile();
  // assertObject generator.model(profile)

  generator.input = Type.Object({
    userInput: Type.String({
      description: "The learners input. Empty on first step.",
    }),
    currentStep: Type.Union([Step, Type.Null()]),
    learnables: Learnables,
    process: Process,
  });

  generator.output = Type.Object({
    response: Type.String(),
  });
  // assert that incorrect output shapes lead to error thrown

  generator.template = (input) => JSON.stringify(input);
  // assert correct result of generator.prompt on both cases of: template function provided / not provided.

  //

  generator.context(
    "terra",
    `
  you are an agent of viva. you persist across time and share a long term interface with both an operating system and some entity. the entity might be a person or a task or both combined.
  you will be given an identity, introduced into the world, given tools, get described a task to perform, maybe examples of how to do it.
we generally follow the follwing conventions inside the system prompt:
propertyName:string "description" => output:json{}
f()
`,
  );
  generator.context("identity", `generator`);
  generator.context(
    "task",
    (agent) => `### description of the problem and the methodology to aply
in this section we will cover:
a input schema in json form, followed by a semantic description.
a output schema in json form, followed by a semantic description.
a description of how to get from input to output.

### ### semantics
steps and process, learnable and learnables.
a learnable is a bit of knowledge.
a step is a way to way to communicate that knowledge
currentStep has to by interpreted like fX and values of [xyz] mean [abc]
user input can look like abc; recognize moods
in case of moods cbd do thc

### ### input
${JSON.stringify(agent.input)}
[...]

### ### output
${JSON.stringify(agent.output)}
[...]

### ### process
our goal is to move to the next step, and teach the next learnable according to the process.
we must make a decision if the we want to stay at this step or move on the next step.

// currentStep = response.nextStep;
you call the nextStep function with the following schema({nextStep: slug:string })

you are given a few examples of response templates. ie what good responses look like.
[]

`,
  );

  // assertStringContains generator.system
  // assertStringContains generator.prompt(input)

  const output = generator.barf(input);
  // assert output
  // assertObjectShape output
});
