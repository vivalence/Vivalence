// limit: 3200 chars · 11-19 the call's mind alone: first-token time of fast-silicon candidates through OpenRouter, pinned per provider. One actor-shaped request (system + 3 turns, no tools), streamed, 40 tokens, 3 runs each. Paid: ~21 tiny completions (< $0.01). Run ONCE, teed to mind.txt.
import * as dotenv from "@std/dotenv";
const { SECRET_VIVA_OPENROUTER_API_KEY: key } = await dotenv.load({ envPath: `${Deno.env.get("HOME")}/.viva/.env` });

const SYSTEM = [
  "You are Francesca, a warm Spanish tutor on a voice call with an English speaker at level A1.",
  "Speak mostly English, weave in the Spanish the director hands you, one short spoken sentence at a time.",
  "Never use lists, markup or emoji. Always end on a prompt that makes the learner speak Spanish.",
  "DIRECTOR: game RONDA. Card now: pan.noun (bread). Last answer graded SUCCESS. Next card: agua.noun (water).",
].join(" ");
const TURNS = [
  { role: "user", content: "Okay, I'm ready." },
  { role: "assistant", content: "¡Vamos! How do you say bread in Spanish?" },
  { role: "user", content: "Pan." },
];

const CANDIDATES = [
  { model: "meta-llama/llama-3.3-70b-instruct", only: ["Groq"] },
  { model: "meta-llama/llama-3.1-8b-instruct", only: ["Groq"] },
  { model: "openai/gpt-oss-120b", only: ["Groq"], reasoning: { effort: "low" } },
  { model: "openai/gpt-oss-120b", only: ["Cerebras"], reasoning: { effort: "low" } },
  { model: "qwen/qwen3.8-27b", only: ["Cerebras"], reasoning: { enabled: false } },
  { model: "minimax/minimax-m2.7", only: ["Groq"], reasoning: { enabled: false } },
  { model: "anthropic/claude-haiku-5.5", reasoning: { enabled: false } },
];

async function run({ model, only, reasoning }) {
  const begun = performance.now();
  const at = () => Math.round(performance.now() - begun);
  const seen = { model, provider: only?.[0] ?? "default" };
  const response = await fetch("https://openrouter.ai/api/v1/chat/completions", {
    method: "POST",
    headers: { authorization: `Bearer ${key}`, "content-type": "application/json" },
    body: JSON.stringify({
      model,
      stream: true,
      max_tokens: 40,
      messages: [{ role: "system", content: SYSTEM }, ...TURNS],
      ...(only && { provider: { only, allow_fallbacks: false } }),
      ...(reasoning && { reasoning }),
    }),
  });
  seen.headers = at();
  if (!response.ok) return { ...seen, fault: `${response.status} ${(await response.text()).slice(0, 160)}` };
  let text = "";
  let pending = "";
  for await (const bytes of response.body.pipeThrough(new TextDecoderStream())) {
    pending += bytes;
    const rows = pending.split("\n");
    pending = rows.pop();
    for (const row of rows) {
      if (!row.startsWith("data: ") || row === "data: [DONE]") continue;
      const chunk = JSON.parse(row.slice(6));
      const delta = chunk.choices?.[0]?.delta;
      if (chunk.provider) seen.served = chunk.provider;
      if (delta?.reasoning) seen.firstReasoning ??= at();
      if (delta?.content) {
        seen.firstText ??= at();
        text += delta.content;
      }
    }
  }
  return { ...seen, end: at(), text };
}

for (const candidate of CANDIDATES) for (let pass = 0; pass < 3; pass++) console.log(JSON.stringify(await run(candidate)));
