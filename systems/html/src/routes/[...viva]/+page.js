// import { Signal, fromm } from "@vivalence/typology"; // Context
// import { Stall } from "@vivalence/html/typology";
// import { controller, Context } from "@vivalence/vector";
// import { perspective } from "./perspective.js";

// export const load = async (event) => {
//   return { stall };
// };

// // if (pages.has(signal.pathname)) stall = pages.get(signal.pathname);  else {
// // pages.set(signal.pathname, stall);}

// // export const prerender = false;
// // export const ssr = false;
// // export const csr = true;
// // $effect(
// //   () =>
// //     $page.url.pathname &&
// //     (async () => {

// //   const signal = new Signal(event.url.pathname);
// //   const stall = new Stall();
// //   const [take, apply, match] = controller.traverse(perspective, signal); // TODO match exact or depth first.
// //   // console.log([take, apply, match]);
// //   console.log("LOAD", signal.pathname, take);
// //   const params = fromm.match(match).parameters;
// //   // console.log({ params, signal, event });

// //   stall.withPull(async () => {
// //     if (!take) return [];
// //     // console.log("PULL", signal.absolute);
// //     const context = new Context({ stall, signal, match, params });

// //     await apply(context, async (ctx) => (ctx.take = await take(ctx)));

// //     return context.take || [];
// //   });

// //   // if !stall.active ...? some default?
// //   // if stall.active ...? ?? overwrite???
