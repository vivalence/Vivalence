// import { BufferMode, BufferState } from "@vivalence/interface";
// import context from "@client/context";
// import ErrorMode from "./components/ErrorMode.js";
import { Type } from "@sinclair/typebox";
import { Agent } from "@vivalence/shared/agent";
import { Agentic, Trajectory, parsers } from "@vivalence/shared/trajectory";
import { History, Planning, Prompt } from "../types/index.ts";
import { play } from "./tools/index.js";

export const load = async (event) => {
  // const ctx = await context(event);
  const tools = new Trajectory([parsers.sig]) //
    .use(async (input, context, next) => {
      context.instructions = instructions;
      context.games = ctx.runtime.modules.games;
      return await next();
    });

  [play].map((f) => f(tools, ctx));

  // const controller = new Agentic(tools);

  // trajectory
  // walker
  // handler = walk()
  // buffer = await handler()
  // return { buffer };
};

// import { resolvers } from "@client/app";
// import { Type } from "@vivalence/typology";
// import { Walker, Vector, Deferred, parsers } from "@vivalence/vector";
// import { BufferMode, BufferState, Buffer } from "@vivalence/interface";

// import strategy from "./domains/learning/strategy.js";

// export const load = async (event) => {
//   const buffer = new BufferState(INITIAL_QUEUE_THRESHOLD);
//   const ctx = new Context({ intent, buffer });
//   const deferred = new Deferred();
//   const walker = new Walker(resolvers, deferred);

//   const signal = new parsers.sig.signal();
//   await walker.walk(signal);

//   buffer.withPull(await deferred.handler(ctx));
//   return { buffer };
// };

// // import { parsers, Walker, Deferred } from "@vivalence/shared/trajectory";
// // import { Prompt } from "@vivalence/interfaces-cli";

// // export default async (viva) => {
// //   const signal = parsers.sig.signal(Deno.args.join("/"));

// //   const deferred = new Deferred();
// //   const walker = new Walker(viva.trajectory, deferred);

// //   await walker.walk(signal, async (docs) => {
// //     const selection = await Prompt.Select.prompt({
// //       message: "",
// //       options: docs.map((d) => d.segment),
// //     });
// //     const signal = parsers.sig.signal(selection);
// //     return signal;
// //   });

// //   const handler = await deferred.handler;
// //   const ctx = { ...viva };
// //   const result = await handler({}, ctx);

// //   return viva;
// // };
// // import { parsers, Walker, Deferred } from "@vivalence/shared/trajectory";
// // import { Prompt } from "@vivalence/interfaces-cli";

// // export default async (viva) => {
// //   const signal = parsers.sig.signal(Deno.args.join("/"));

// //   const deferred = new Deferred();
// //   const walker = new Walker(viva.trajectory, deferred);

// //   await walker.walk(signal, async (docs) => {
// //     const selection = await Prompt.Select.prompt({
// //       message: "",
// //       options: docs.map((d) => d.segment),
// //     });
// //     const signal = parsers.sig.signal(selection);
// //     return signal;
// //   });

// //   const handler = await deferred.handler;
// //   const ctx = { ...viva };
// //   const result = await handler({}, ctx);

// //   return viva;
// // };
