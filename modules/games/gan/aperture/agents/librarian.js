import { Type } from "@sinclair/typebox";
import { Agent } from "@vivalence/shared/agent";
import { Agentic, Trajectory, parsers } from "@vivalence/shared/trajectory";
import { review, classify } from "./tools/index.js";
import { Learnable } from "../../types/index.ts";

const LibrarianInput = Type.Object({ learnable: Learnable });

export default async function librarian(input, ctx) {
  const trajectory = new Trajectory([parsers.sig]) //
    .use(async (input, context, next) => {
      context.game = ctx.game;
      return await next();
    });
  [review, classify].map((f) => f(trajectory, ctx));

  const controller = new Agentic(trajectory);

  const agent = new Agent("librarian")
    .withBrain(ctx.runtime.services.brain)
    .withInput(LibrarianInput)
    .withTools(controller.tools)
    .enhance(
      `### identity
	you are inside viva. the agentic symbolic intelligence operating system.
	be a helpful, concise and diligent agent. All output is used for input into other llms! So, there is no need for niceties.`,
    )
    .enhance(controller.llmstxt)
    .enhance(
      `### task
	You have to take the learnable were given, classify it, and then review each extracted feature.
	You can omit the final response. Just do the task.
	`,
    )
    .enhance(
      `### process
	1: classify the provided learnable in the language to be learnt. you will receive an array of features back.
	2: for each feature, call the review tool with the feature.annotation and an assessment whether the learnable known or not.
           signal is SUCCESS if known, and MISTAKE if unkown.
    `,
    );

  return await agent.do(input);
}

// const agent = new Agent("librarian") //
//   .withInput(LibrarianInput)
//   .withOutput(LibrarianOutput);

// agent
//   .withContext(
//     "terra",
//     `### identity
// 	you are inside viva. the agentic symbolic intelligence operating system.
//       be a helpful, concise and diligent agent. All output is used for input into other llms! So, there is no need for niceties. `,
//   )
//   .withContext(
//     "task",
//     `### task
// 	Identify the learnables where status has changed.
// 	The ones that where unknown and are now demonstrated to be known.`,
//   );

// const { evaluations } = await agent.bark(input);
// console.log("Librarian result", result);
