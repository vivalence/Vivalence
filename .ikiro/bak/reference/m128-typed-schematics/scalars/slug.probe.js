import { v } from "@vivalence/typology";

console.log(typeof v.slug, JSON.stringify(v.scalars.Slug));
const { evaluation } = await import(`${Deno.env.get("HOME")}/.viva/registry/education/modes/games/riddler/hal/evaluation.js`).catch((error) => ({ evaluation: String(error).slice(0, 200) }));
const emitter = await import(`${Deno.env.get("HOME")}/.viva/registry/education/modes/games/riddler/hal/emitter.js`).then((module) => Object.keys(module)).catch((error) => String(error).slice(0, 200));
console.log(typeof evaluation, emitter);
