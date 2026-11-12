import { Cortex, Vector, shape } from "@vivalence/typology";
const scribe = {
  type: "verbatim", id: "scribe_v3_live", tune: [0.8, 0.9, 0.7], context: 0, provider: "elevenlabs",
  channels: { in: [{ type: "audio", codec: "pcm_16000" }], out: [{ type: "event" }] },
  via: { stream: async function* () {} },
};
const harness = (cortex) => {
  const vector = new Vector();
  if (cortex.find({ type: "verbatim", via: "stream" }).length)
    vector.branch("/verbatim").open({ nature: "stream" }, () => {});
  vector.branch("/dialogue").open({ nature: "stream" }, () => {});
  return vector;
};
for (const [name, cortex] of [["no ear", new Cortex()], ["scribe", new Cortex().register([scribe])]]) {
  console.log(name, JSON.stringify(shape.strip(harness(cortex)), null, 2));
}
try { await new Cortex().hallucinate.verbatim.stream({ source: (async function* () {})(), settings: {} }); console.log("cortex route: resolved"); }
catch (error) { console.log("today, no ear, the cortex's own route:", error.message); }
