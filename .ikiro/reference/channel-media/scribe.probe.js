import { Controller, Cortex, Span } from "@vivalence/typology";
import provider from "../../commons/hallucinators/elevenlabs/provider/index.js";

const faculties = await provider({
  secrets: { key: "fake-key" },
  faculties: [
    { type: "verbatim", id: "scribe_v3_live", model: "scribe_v3_live", tune: [0.8, 0.9, 0.7] },
    { type: "verbatim", id: "scribe_v3", model: "scribe_v3", tune: [0.8, 0.9, 0.7] },
  ],
});
const cortex = new Cortex(faculties);
globalThis.fetch = async (url, init) =>
  Response.json({ text: `heard ${init.body.get("file").size} bytes as ${init.body.get("model_id")}` });
console.log("render ear", cortex.findOne({ type: "verbatim", via: "render" }).id);
console.log("stream ear", cortex.findOne({ type: "verbatim", via: "stream" }).id);
const output = await cortex.hallucinate.verbatim.render({
  controller: new Controller({ stdout: new Span("probe") }),
  turns: [{ role: "user", parts: [{ type: "audio", mime: "audio/ogg; codecs=opus", data: "T2dnUw==" }] }],
  settings: { language: ["en"] },
  policy: {},
});
console.log(JSON.stringify(output.turns.at(-1)));
