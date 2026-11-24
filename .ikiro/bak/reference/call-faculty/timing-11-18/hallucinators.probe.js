// limit: 6500 chars · 11-18 timing: the two hallucinator calls a dictation makes, alone. argv[0] a 16 kHz mono wav. Paid: one scribe pass (the clip) + three polish renders (~$0.01). Run ONCE, teed.
import * as dotenv from "@std/dotenv";
import { Controller, Cortex } from "@vivalence/typology";
import openrouter from "../../../../commons/hallucinators/openrouter/provider/index.js";
import elevenlabs from "../../../../commons/hallucinators/elevenlabs/provider/index.js";

const POLISH = [
  "You repair the formatting of a machine transcription of dictated speech.",
  "Fix punctuation and casing; normalize numbers, dates and units the way a careful typist would.",
  "Preserve every word as spoken, in whatever language it was spoken — never translate, never correct grammar or word choice, never add, remove or reorder content, never answer or comment.",
  "Output only the corrected transcript.",
].join(" ");
const SPOKEN = "Hola, hoy quiero practicar español con durante 10 min.";
const CHUNK = 2048;

const home = Deno.env.get("HOME");
const env = await dotenv.load({ envPath: `${home}/.viva/.env` });
const ledger = JSON.parse(await Deno.readTextFile(`${home}/.viva/ledger.viva.json`));
const rows = [];
JSON.stringify(ledger, (key, held) => {
  if (held && typeof held === "object" && typeof held.module === "string" && Array.isArray(held.faculties)) rows.push(held);
  return held;
});
const row = (slug) => rows.find((held) => held.module.endsWith(`/${slug}`));

const clock = performance.now();
const at = () => Math.round(performance.now() - clock);

const fetched = globalThis.fetch;
globalThis.fetch = async (...args) => {
  const begun = performance.now();
  const response = await fetched(...args);
  console.log("  fetch headers", Math.round(performance.now() - begun), "ms", response.status);
  return response;
};

const Socket = globalThis.WebSocket;
globalThis.WebSocket = class extends Socket {
  constructor(...args) {
    super(...args);
    const begun = performance.now();
    this.addEventListener("open", () => console.log("  ws open", Math.round(performance.now() - begun), "ms"));
    this.addEventListener("close", (event) => console.log("  ws close", Math.round(performance.now() - begun), "ms", event.code));
  }
};

const cortex = new Cortex(ledger.tiers)
  .register(await openrouter({ secrets: { key: env.SECRET_VIVA_OPENROUTER_API_KEY }, faculties: row("openrouter").faculties }))
  .register(await elevenlabs({ secrets: { key: env.SECRET_VIVA_ELEVENLABS_API_KEY }, faculties: row("elevenlabs").faculties }));

const polish = async (label, extra) => {
  const begun = performance.now();
  try {
    const rendered = await cortex.hallucinate.dialogue.render({
      controller: new Controller(),
      system: { polish: POLISH },
      turns: [{ role: "user", parts: [{ type: "text", text: SPOKEN }] }],
      policy: { tier: "fast", rounds: 1, ...extra.policy },
      ...(extra.settings && { settings: extra.settings }),
    });
    const turn = rendered.turns.at(-1);
    console.log("polish", label, {
      ms: Math.round(performance.now() - begun),
      usage: turn.meta?.usage,
      model: turn.meta?.model,
      parts: turn.parts.map((part) => `${part.type}:${String(part.text ?? "").length}`),
      message: rendered.product.message,
      raw: JSON.stringify(rendered).slice(0, 500),
    });
  } catch (fault) {
    console.log("polish", label, "FAULT", Math.round(performance.now() - begun), fault.message);
  }
};

console.log("fast →", cortex.findOne({ type: "dialogue", tier: "fast" }).id, "· frugal →", cortex.findOne({ type: "dialogue", tier: "frugal" }).id);
await polish("as shipped (tier fast, no settings)", {});
await polish("effort none (tier fast)", { settings: { effort: "none" } });
await polish("effort none (tier frugal)", { policy: { tier: "frugal" }, settings: { effort: "none" } });

const wav = await Deno.readFile(Deno.args[0]);
const data = wav.findIndex((_, index) => String.fromCharCode(...wav.subarray(index, index + 4)) === "data");
const pcm = wav.subarray(data + 8);
let sent = 0;
let ended = null;
async function* microphone() {
  for (let offset = 0; offset < pcm.length; offset += CHUNK) {
    const slice = pcm.subarray(offset, offset + CHUNK);
    yield { event: "/audio/packet", audio: { data: btoa(String.fromCharCode(...slice)), rate: 16000, codec: "pcm_16000" } };
    sent = (offset + slice.length) / 32000;
    await new Promise((resolve) => setTimeout(resolve, 64));
  }
  ended = performance.now();
  console.log("  audio ended", at(), "ms", `${sent.toFixed(2)}s sent`);
}

const guard = new AbortController();
const timer = setTimeout(() => guard.abort(), 25000);
const begun = performance.now();
const since = () => Math.round(performance.now() - begun);
try {
  const verbatim = cortex.findOne({ type: "verbatim", via: "stream" });
  let first = true;
  for await (const packet of verbatim.via.stream({ source: microphone(), settings: { language: [] } }, { signal: guard.signal })) {
    if (first) console.log("scribe first packet", since(), "ms", `audio sent ${sent.toFixed(2)}s`);
    first = false;
    if (packet.event === "/turn/close") console.log("scribe /turn/close", since(), "ms", ended === null ? "before audio end" : `${Math.round(performance.now() - ended)} ms after audio end`);
    if (packet.event === "/part/delta") console.log("scribe delta", since(), JSON.stringify(packet.part.text));
  }
  console.log("scribe stream end", since(), "ms", ended === null ? "" : `${Math.round(performance.now() - ended)} ms after audio end`);
} catch (fault) {
  console.log("scribe FAULT", since(), fault.message);
}
clearTimeout(timer);
