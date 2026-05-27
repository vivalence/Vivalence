import paladin from "@vivalence/paladin";

export async function doctor(ctx) {
  // console.log(paladin.env.vars);
  // console.log(paladin.scope);
  await paladin.variant.mount();
  console.log(paladin.variant);
}
