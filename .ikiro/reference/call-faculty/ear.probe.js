import { Cortex } from "@vivalence/typology";
import deepgram from "/Users/finn/vivalence/code/vivalence/commons/hallucinators/deepgram/provider/index.js";
import elevenlabs from "/Users/finn/vivalence/code/vivalence/commons/hallucinators/elevenlabs/provider/index.js";
const cortex = new Cortex();
for (const provider of [["deepgram", deepgram], ["elevenlabs", elevenlabs]])
  cortex.register((await provider[1]({ secrets: { key: "probe" } })).map((faculty) => ({ ...faculty, provider: provider[0] })));
const pick = (query) => {
  try { const held = cortex.findOne(query); return held ? `${held.provider}/${held.id}` : String(held); }
  catch (error) { return `THROWS ${error.message}`; }
};
for (const query of [
  { type: "verbatim", via: "stream", tier: "fast" },
  { type: "verbatim", via: "stream" },
  { type: "verbatim", via: "stream", tier: "eager" },
  { type: "verbatim", via: "stream", id: "flux-general-multi" },
  { type: "speech", via: "stream", tier: "fast" },
  { type: "speech", via: "stream" },
  { type: "call", via: "stream" },
]) console.log(JSON.stringify(query), "→", pick(query));
const bare = new Cortex();
console.log("no ear held →", (() => { try { return String(bare.findOne({ type: "verbatim", via: "stream", tier: "fast" })); } catch (error) { return `THROWS ${error.message}`; } })());
