import { belt, v } from "@vivalence/typology";
import { Selector } from "/Users/finn/vivalence/code/vivalence/subsystems/typology/schematics/primitives/hallucination.js";
import { Intelligent } from "/Users/finn/vivalence/code/vivalence/subsystems/typology/schematics/traits/intelligent.js";
import anthropic from "/Users/finn/vivalence/code/vivalence/commons/hallucinators/anthropic/provider/index.js";
import openrouter from "/Users/finn/vivalence/code/vivalence/commons/hallucinators/openrouter/provider/index.js";
import elevenlabs from "/Users/finn/vivalence/code/vivalence/commons/hallucinators/elevenlabs/provider/index.js";
import { Cortex } from "./cortex.copy.js";

const Conversational = v.object({
  language: v.array(v.string()).default([]),
  hear: v.object({ ...Selector }).default({}),
  speak: v.object({ ...Selector }).default({}),
  call: v.object({ ...Selector }).default({}),
});
const scribe = { type: "verbatim", id: "scribe_v3_live", tune: [0.8, 0.9, 0.7], channels: { in: [], out: [] }, via: { stream: async function* () {} }, provider: "elevenlabs" };
const native = { type: "call", id: "gemini-3.8-live", tune: [0.5, 0.9, 0.5], channels: { in: [], out: [] }, via: { stream: async function* () {} }, provider: "google" };
const fill = async (...extra) => {
  const cortex = new Cortex();
  for (const [slug, provider] of [["anthropic", anthropic], ["openrouter", openrouter], ["elevenlabs", elevenlabs]])
    cortex.register((await provider({ secrets: { key: "probe" } })).map((faculty) => ({ ...faculty, provider: slug })));
  return cortex.register(extra);
};
const query = (conversational, intelligent) => ({
  type: "call",
  via: "stream",
  ...conversational.call,
  hear: conversational.hear,
  mind: belt.object.pick(intelligent, ["provider", "id", "tier", "tune"]),
  speak: { tier: "fast", ...conversational.speak },
});
const pick = (cortex, asked) => {
  try {
    const held = cortex.findOne(asked);
    return held ? [held.provider, held.id].filter(Boolean).join("/") : String(held);
  } catch (error) {
    return "THROWS " + error.message;
  }
};
const show = (label, cortex, stored, mind = {}) => {
  const asked = query(Conversational.cast(structuredClone(stored)), Intelligent.cast(structuredClone(mind)));
  console.log("--- " + label + "\nthread   " + JSON.stringify(stored) + " · mind " + JSON.stringify(mind) + "\nquery    " + JSON.stringify(asked) + "\npicked   " + pick(cortex, asked));
};
const cortex = await fill(scribe);
show("a fresh thread", cortex, {});
show("the thread names its voice", cortex, { speak: { id: "21m00Tcm4TlvDq8ikWAM" } });
show("the thread names its mind", cortex, {}, { provider: "openrouter", tier: "fast" });
show("the thread names a native call, none held", cortex, { call: { provider: "google" } });
show("the thread names a native call, one held", await fill(scribe, native), { call: { provider: "google" } });
show("a native call held, the thread names none", await fill(scribe, native), {});
show("no ear held", await fill(), {});
console.log("--- the route's default tier for the mouth left out");
console.log("picked  ", pick(cortex, { type: "call", via: "stream", hear: {}, mind: { tier: "capable" }, speak: {} }));
console.log("--- a selector the schema refuses");
console.log("picked  ", pick(cortex, { type: "call", via: "stream", mind: { tier: "turbo" } }));
console.log("picked  ", pick(cortex, { type: "call", via: "stream", mind: "capable" }));
console.log("--- the three keys on a query that is not a call");
console.log("picked  ", pick(cortex, { type: "dialogue", via: "stream", tier: "fast", speak: { tier: "fast" } }));
