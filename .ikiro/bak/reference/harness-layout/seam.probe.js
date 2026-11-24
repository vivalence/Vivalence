import Anthropic from "@anthropic-ai/sdk";

const env = Deno.readTextFileSync(`${Deno.env.get("HOME")}/.viva/.env`);
const client = new Anthropic({ apiKey: env.match(/^SECRET_VIVA_ANTHROPIC_API_KEY=["']?([^"'\n]+)/m)[1] });
const [model, carrier, nonce = ""] = Deno.args;
if (!["split", "system"].includes(carrier)) throw new Error(`unknown carrier ${carrier}`);
const key = "tool_name";
const betas = ["mid-conversation-tool-changes-2026-07-01"];

const rule = (index) => `Rule ${index}: when the learner answers card ${index}, grade it from zero to five and say one short sentence about the grade.`;
const primerA = `You run a vocabulary drill ${nonce}.\n${Array.from({ length: 400 }, (_, index) => rule(index)).join("\n")}`;
const queried = { type: "object", properties: { query: { type: "string" } }, required: ["query"] };
const pathed = { type: "object", properties: { path: { type: "string" } }, required: ["path"] };
const tools = [
  { name: "modeA_deal", description: "Deals the next drill card.", input_schema: { type: "object", properties: {} } },
  { name: "load", description: "Loads one mode by path: its instructions and its tools.", input_schema: pathed },
  { name: "modeB_search", description: "Searches the web for pages.", input_schema: queried },
  { name: "modeC_rewrite", description: "Rewrites one sentence.", input_schema: queried, defer_loading: true },
];
const mark = { cache_control: { type: "ephemeral" } };
const text = (value) => ({ type: "text", text: value });
const called = (id, name, input) => ({ role: "assistant", content: [{ type: "tool_use", id, name, input }] });
const loaded = (id, primer, tool, marked) =>
  carrier === "split"
    ? [{ role: "user", content: [{ type: "tool_result", tool_use_id: id, content: [{ type: "tool_reference", tool_name: tool }] }, { ...text(primer), ...(marked && mark) }] }]
    : carrier === "result"
    ? [{ role: "user", content: [{ type: "tool_result", tool_use_id: id, content: [text(primer), { type: "tool_reference", [key]: tool }], ...(marked && mark) }] }]
    : [
        { role: "user", content: [{ type: "tool_result", tool_use_id: id, content: "loaded", ...(marked && mark) }] },
        { role: "system", content: [text(primer), { type: "tool_addition", tool: { type: "tool_reference", name: tool } }] },
      ];

const send = async (label, messages) => {
  try {
    const response = await client.beta.messages.create({ model, max_tokens: 600, betas, system: [text(primerA), { ...text("You research the web. Cite every source you use."), ...mark }], tools, messages });
    const calls = response.content.filter((block) => block.type === "tool_use").map((block) => block.name);
    console.log(`\n## ${model} · ${carrier} · ${label}\n${JSON.stringify({ usage: response.usage, stop_reason: response.stop_reason, calls }, null, 2)}`);
  } catch (fault) {
    console.log(`\n## ${model} · ${carrier} · ${label} FAILED\n${fault.status} ${fault.message}`);
  }
};

const ask = "Search the web for one example sentence with the Italian congiuntivo.";
const kept = [
  { role: "user", content: [text("Earlier turns, compacted: the learner drilled ten cards.")] },
  { role: "assistant", content: [text("Understood.")] },
  { role: "user", content: [text(ask)] },
  called("toolu_01", "load", { path: "/modeB" }),
];
await send("after a compact · the kept tail still holds the load", [
  ...kept,
  ...loaded("toolu_01", "You research the web. Cite every source you use.", "modeB_search", true),
]);
