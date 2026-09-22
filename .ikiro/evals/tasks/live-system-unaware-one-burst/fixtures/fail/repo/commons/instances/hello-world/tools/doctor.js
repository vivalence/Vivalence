import paladin from "@vivalence/paladin";

export function posture(ctx) {
  return { instance: paladin.instance.manifest.slug, mode: ctx.mode.manifest.slug };
}

export function machine(held) {
  return `This machine is instance ${held.instance}, mode ${held.mode}.`;
}
