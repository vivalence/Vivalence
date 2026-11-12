const env = Deno.readTextFileSync(`${Deno.env.get("HOME")}/.viva/.env`);
const key = env.match(/^SECRET_VIVA_OPENROUTER_API_KEY=["']?([^"'\n]+)/m)[1];
const [model, nonce = ""] = Deno.args;

const rule = (index) => `Rule ${index}: when the learner answers card ${index}, grade it from zero to five and say one short sentence about the grade.`;
const primerA = `You run a vocabulary drill ${nonce}.\n${Array.from({ length: 400 }, (_, index) => rule(index)).join("\n")}`;
const fn = (name, description, properties) => ({ type: "function", function: { name, description, parameters: { type: "object", properties } } });
const deal = fn("modeA_deal", "Deals the next drill card.", {});
const load = fn("load", "Loads one mode by path: its instructions and its tools.", { path: { type: "string" } });
const search = fn("modeB_search", "Searches the web for pages.", { query: { type: "string" } });
const system = { role: "system", content: [{ type: "text", text: primerA, cache_control: { type: "ephemeral" } }] };
const ask = "Stop the drill. Search the web for one example sentence with the Italian congiuntivo. Load the mode you need: /modeB searches.";
const opening = [system, { role: "user", content: "Hello. Say one short sentence." }, { role: "assistant", content: "Ready when you are." }, { role: "user", content: ask }];
const called = { role: "assistant", content: null, tool_calls: [{ id: "call_01", type: "function", function: { name: "load", arguments: '{"path":"/modeB"}' } }] };
const result = { role: "tool", tool_call_id: "call_01", content: "/modeB loaded. Its instructions: You research the web. Cite every source you use. Its tool modeB_search is now available." };

const send = async (label, body) => {
  const response = await fetch("https://openrouter.ai/api/v1/chat/completions", {
    method: "POST",
    headers: { authorization: `Bearer ${key}`, "content-type": "application/json" },
    body: JSON.stringify({ model, max_tokens: 600, usage: { include: true }, ...body }),
  });
  const held = await response.json();
  const calls = held.choices?.[0]?.message?.tool_calls?.map((call) => call.function.name) ?? [];
  console.log(`## ${model} · ${label} ${JSON.stringify({ status: response.status, prompt_tokens: held.usage?.prompt_tokens, cached_tokens: held.usage?.prompt_tokens_details?.cached_tokens, calls, error: held.error?.message })}`);
};

await send("1 · thread opens", { tools: [deal, load], messages: opening });
await send("1 again · same request", { tools: [deal, load], messages: opening });
await send("2 · load appended, tool list UNCHANGED", { tools: [deal, load], messages: [...opening, called, result] });
await send("3 · load appended, tool ADDED at the end of the list", { tools: [deal, load, search], messages: [...opening, called, result] });
await send("3 again · same request", { tools: [deal, load, search], messages: [...opening, called, result] });
