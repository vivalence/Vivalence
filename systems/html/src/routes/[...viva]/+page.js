// import { Signal, fromm } from "@vivalence/typology"; // Context
// import { Buffer, Stall } from "@vivalence/html/typology";
// import { controller, Context, NotFound } from "@vivalence/vector";
// // import { Buffer } from "@vivalence/html/typology";
// import { dataspace } from "$client";
// import { perspective } from "./perspective.js";

// export const prerender = false;
// export const ssr = false;
// export const csr = true;

// export const load = async (event) => {
//   const signal = new Signal(event.url.pathname);
//   const stall = new Stall();
//   const [take, apply, match] = controller.traverse(perspective, signal); // TODO match exact or depth first.
//   // console.log([take, apply, match]);
//   console.log("LOAD", signal.pathname, take);
//   const params = fromm.match(match).parameters;
//   // console.log({ params, signal, event });

//   stall.withPull(async () => {
//     if (!take) return [];
//     // console.log("PULL", signal.absolute);
//     const context = new Context({ stall, signal, match, params });

//     await apply(context, async (ctx) => (ctx.take = await take(ctx)));

//     return context.take || [];
//   });

//   // if !stall.active ...? some default?
//   // if stall.active ...? ?? overwrite???
//   return { stall, hash: signal.hash };
// };
