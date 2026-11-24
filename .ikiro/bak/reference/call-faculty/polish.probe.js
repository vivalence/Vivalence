import { Cortex, v } from "@vivalence/typology";
import { Selector } from "/Users/finn/vivalence/code/vivalence/subsystems/typology/schematics/primitives/hallucination.js";
import anthropic from "/Users/finn/vivalence/code/vivalence/commons/hallucinators/anthropic/provider/index.js";
import openrouter from "/Users/finn/vivalence/code/vivalence/commons/hallucinators/openrouter/provider/index.js";

const cortex = new Cortex();
for (const [slug, provider] of [["anthropic", anthropic], ["openrouter", openrouter]]) {
  const faculties = await provider({ secrets: { key: "probe" } });
  cortex.register(faculties.map((faculty) => ({ ...faculty, provider: slug })));
}
const pick = (query) => {
  try {
    const held = cortex.findOne({ type: "dialogue", via: "render", ...query });
    return held ? `${held.provider}/${held.id}` : String(held);
  } catch (error) {
    return `THROWS ${error.message}`;
  }
};
for (const query of [{ tier: "fast" }, { tier: "frugal" }, { provider: "openrouter", tier: "frugal" }, { tune: [0.2, 1.0, 1.0] }, {}])
  console.log(JSON.stringify(query), "→", pick(query));

const Polish = v.union([v.object({ ...Selector }), v.null()]).default({ tier: "fast" });
const Trait = v.object({ polish: Polish });
for (const held of [{}, { polish: null }, { polish: { provider: "openrouter", tier: "frugal" } }, { polish: true }]) {
  const cast = v.cast(Trait, structuredClone(held));
  console.log(JSON.stringify(held), "→", JSON.stringify(cast), "faults", JSON.stringify(v.faults(Trait, cast).map((fault) => fault.reason)));
}

console.log("--- Q13A: default · off · customized");
const shapes = {
  literal: v.object({ polish: v.union([v.const("off"), v.object({ ...Selector })]).optional() }),
  object: v.object({ polish: v.union([v.object({ ...Selector }), v.null()]).default({}) }),
};
const route = { tier: "fast" };
for (const [name, schema] of Object.entries(shapes)) {
  for (const stored of [{}, { polish: "off" }, { polish: null }, { polish: { id: "google/gemini-3.5-flash-lite" } }, { polish: true }]) {
    const cast = v.cast(schema, structuredClone(stored));
    const faults = v.faults(schema, cast).length;
    const off = cast.polish === "off" || cast.polish === null;
    const picked = faults ? "—" : off ? "no repair" : pick({ ...route, ...cast.polish });
    console.log(name, JSON.stringify(stored), "→", JSON.stringify(cast), faults ? "FAULT" : "ok", "·", picked);
  }
}

console.log("--- Q13B: a key beside the selector");
const Keyed = v.object({
  polish: v.object({ ...Selector, engaged: v.boolean().default(true) }).default({}),
});
for (const stored of [{}, { polish: { engaged: false } }, { polish: { id: "google/gemini-3.5-flash-lite" } }, { polish: { id: "google/gemini-3.5-flash-lite", engaged: false } }, { polish: true }]) {
  const cast = v.cast(Keyed, structuredClone(stored));
  const faults = v.faults(Keyed, cast).length;
  const { engaged, ...selector } = faults ? {} : cast.polish;
  console.log(JSON.stringify(stored), "→", JSON.stringify(cast), faults ? "FAULT" : "ok", "·", faults ? "—" : engaged ? pick({ ...route, ...selector }) : "no repair");
}

console.log("--- stored polish: true, healed as DOCKED is (systems/ghost/subjects/terminal/hydration.js:5)");
const heal = (schema, stored) => {
  try {
    return JSON.stringify(schema.repair(schema.cast(structuredClone(stored))));
  } catch (error) {
    return `THROWS ${error.message} ${JSON.stringify(error.cause?.errors?.[0]?.message)}`;
  }
};
const shapes13 = {
  required: v.object({ language: v.array(v.string()).default([]), polish: v.object({ ...Selector, engaged: v.boolean().default(true) }).default({}) }),
  optional: v.object({ language: v.array(v.string()).default([]), polish: v.object({ ...Selector, engaged: v.boolean().default(true).optional() }).default({}) }),
};
for (const [name, schema] of Object.entries(shapes13))
  for (const stored of [{ language: ["it"], polish: true }, { language: ["it"], polish: false }, { language: ["it"], polish: { id: "x", engaged: false } }, { language: ["it"] }])
    console.log(name, JSON.stringify(stored), "→", heal(schema, stored));

console.log("--- heal, then fill again");
for (const stored of [{ language: ["it"], polish: true }, { language: ["it"], polish: false }, { language: ["it"], polish: { id: "x", engaged: false } }])
  console.log(JSON.stringify(stored), "→", JSON.stringify(shapes13.optional.cast(shapes13.optional.repair(shapes13.optional.cast(structuredClone(stored))))));
