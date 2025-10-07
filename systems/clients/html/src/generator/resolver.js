// todo
// import { controller, signature, classes, errors } from "@vivalence/vector"; // Context
// import { BufferState, Buffer } from "@vivalence/surface";
// import { generator } from "@client/generator";

// export const load = async (event) => {
//   const buffer = new BufferState();
//   const signal = signature.signal(event.url.pathname);

//   const [state, apply, _, path] = controller.traverse(generator, signal);
//   if (!state) throw new errors.NotFound(signal);

//   buffer.withPull(async () => {
//     const context = new classes.Context({
//       buffer,
//       path,
//       signal,
//       params: signature.params(path),
//       query: Object.fromEntries(event.url.searchParams),
//     });

//     await apply(context, async (ctx) => (ctx.generation = await state(ctx)));

//     return context.generation || [];
//   });

//   return { buffer };
// };
