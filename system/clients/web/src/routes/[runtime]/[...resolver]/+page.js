// import { BufferMode, BufferState } from "@vivalence/interface";
// import context from "@client/context";
// import ErrorMode from "./components/ErrorMode.js";
import { Type } from "@sinclair/typebox";
import { Walker, Trajectory, parsers } from "@vivalence/shared/trajectory";

import strategy from "./domains/learning/strategy.js";

export const load = async (event) => {
  // const ctx = await context(event);
  const resolvers = new Trajectory([parsers.sig]) //
    .use(async (input, context, next) => {
      return await next();
    });

  resolvers
    .branch((p) => p.sig({ path: "/domains/learning" }))
    .open(
      {
        path: "/strategy/:strategy",
        input: Type.Object({}), //
      },
      strategy,
    );

  // const controller = new Walker(resolvers);

  // handler = controller.walk()
  // const buffer = await handler(intent, ctx)
  // return { buffer };
};

// import { parsers, Walker, Deferred } from "@vivalence/shared/trajectory";
// import { Prompt } from "@vivalence/interfaces-cli";

// export default async (viva) => {
//   const signal = parsers.sig.signal(Deno.args.join("/"));

//   const deferred = new Deferred();
//   const walker = new Walker(viva.trajectory, deferred);

//   await walker.walk(signal, async (docs) => {
//     const selection = await Prompt.Select.prompt({
//       message: "",
//       options: docs.map((d) => d.segment),
//     });
//     const signal = parsers.sig.signal(selection);
//     return signal;
//   });

//   const handler = await deferred.handler;
//   const ctx = { ...viva };
//   const result = await handler({}, ctx);

//   return viva;
// };
