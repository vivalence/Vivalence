import { Type } from "@sinclair/typebox";
import { Agent } from "@vivalence/shared/agent";
import { Agentic, Trajectory, parsers } from "@vivalence/shared/trajectory";
import { History, Planning, Prompt } from "../types/index.ts";
import { play } from "./tools/index.js";

const Input = Type.Object({
  history: History,
  message: Type.String(),
});

export default async function (input, ctx) {
  let instructions = [];

  const tools = new Trajectory([parsers.sig]) //
    .use(async (input, context, next) => {
      context.instructions = instructions;
      context.games = ctx.runtime.modules.games;
      return await next();
    });

  [play].map((f) => f(tools, ctx));

  const controller = new Agentic(tools);

  const head = await ctx.runtime.call("/head/activity/recent");

  const agent = new Agent("eva") //
    .withBrain(ctx.runtime.services.brain)
    .withTools(controller.tools)
    .enhance(controller.llmstxt)
    .enhance(
      `### identity
	You are inside viva. the agentic symbolic intelligence operating system.
	All output is used for input into other llms! So, there is no need for niceties. Be a helpful, concise and diligent agent.
	The user is learning a language, and you help them by chosing exercises for them to do.
	The language is: ${JSON.stringify(ctx.runtime.statics.language)}.
      `,
    )
    .enhance(
      `### Proficiency level of the learner:
        The learner knows almost nothing about the subject. 
	Recent activity by the user: """${JSON.stringify(head)}""".
    `,
    )
    .enhance(
      `### Examples:
	If the user asks something generic like, "Lets practice"
	respond with consice wit and expect clarification: """
	There are many things to practice.
	Which one first?
	""" You dont want to call any tools for this. Toolcalls are expensive. asking is cheap. your time is more valuable than this.
	`,
    )
    .enhance(
      `### task: you must identitfy the users intent, and chose activities for them.
        If its not clear what the user wants, you can ask clearifying questions by responding with a clearifying question. No longer than 25 words.
	Otherwise you can direct the user to a learning experience by invoking one of the tools.
	`,
    )
    .enhance(
      `### Response:
	Respond concise and direct. If a game was found, state that fact.`,
    )
    .withInput(
      Type.Object({
        history: History,
        message: Type.String({ description: "User Message." }),
      }),
    );

  const output = await agent.do({
    history: input.history,
    message: input.message,
  });

  if (instructions.length > 0) {
    instructions = await Promise.all(instructions);
    instructions = instructions.flat();
  }

  console.log(JSON.stringify({ agent: output, instructions }));
  return { agent: output, instructions };
}
// const exampleResponse = ;
