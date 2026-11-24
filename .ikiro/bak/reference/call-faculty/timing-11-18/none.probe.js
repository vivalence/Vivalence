// limit: 5000 chars · 11-18 control: the polish render with thinking OFF on the wire. Paid: four renders (<$0.01). Run ONCE, teed.
import * as dotenv from "@std/dotenv";
import { Controller, Cortex } from "@vivalence/typology";
import openrouter from "../../../../commons/hallucinators/openrouter/provider/index.js";
import anthropic from "../../../../commons/hallucinators/anthropic/provider/index.js";

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
let rewrite = null;
globalThis.fetch = async (...args) => {
  const begun = performance.now();
  if (rewrite && typeof args[1]?.body === "string") {
    args[1] = { ...args[1], body: JSON.stringify(rewrite(JSON.parse(args[1].body))) };
    const sent = JSON.parse(args[1].body);
    console.log("  sent", JSON.stringify({ model: sent.model, thinking: sent.thinking, reasoning: sent.reasoning, output_config: sent.output_config }));
  }
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
  .register(await anthropic({ secrets: { key: env.SECRET_VIVA_ANTHROPIC_API_KEY }, faculties: row("anthropic").faculties }));

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

const off = (body) => {
  const { output_config, ...rest } = body;
  return { ...rest, thinking: { type: "disabled" } };
};
rewrite = off;
await polish("haiku · thinking disabled #1", { policy: { id: "claude-haiku-5-5" }, settings: { effort: "none" } });
await polish("haiku · thinking disabled #2", { policy: { id: "claude-haiku-5-5" }, settings: { effort: "none" } });
await polish("haiku · thinking disabled #3", { policy: { id: "claude-haiku-5-5" }, settings: { effort: "none" } });
rewrite = (body) => ({ ...body, reasoning: { effort: "minimal", exclude: true } });
await polish("flash-lite · minimal", { policy: { id: "google/gemini-3.5-flash-lite" }, settings: { effort: "low" } });
