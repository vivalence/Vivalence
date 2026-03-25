import { is } from "@vivalence/typology";

export default async function (input, ctx) {
  const { scope = {}, signal } = input;

  const ref = scope.literal || input.literal;
  if (!ref) return { status: "bounce", message: "literal required" };

  const query = is.id(ref) ? ref : typeof ref === "string" ? { slug: ref } : ref;
  const literal = await ctx.daemon.entities.literal.findOne(query);
  if (!literal) return { status: "bounce", message: "literal not found" };

  const memory = await literal.review(signal, ctx);
  return memory;
}

// import { object } from "@vivalence/shared";
// import { is } from "@vivalence/typology";
//
// export default async function (input, ctx) {
//   let { scope = {}, signal } = input;
//
//   if (!is.id(scope.literal)) return { status: "bounce", message: "literal required" };
//
//   const memory = await ctx.daemon.call("/review/memory", input);
//
//   return memory;
// }
