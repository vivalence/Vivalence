import Anthropic from "@anthropic-ai/sdk";

const env = Deno.readTextFileSync(`${Deno.env.get("HOME")}/.viva/.env`);
const client = new Anthropic({ apiKey: env.match(/^SECRET_VIVA_ANTHROPIC_API_KEY=["']?([^"'\n]+)/m)[1] });
const [model, carrier = "result", key = "tool_name", nonce = ""] = Deno.args;
const betas = ["mid-conversation-tool-changes-2026-07-01"];

const rule = (index) => `Rule ${index}: when the learner answers card ${index}, grade it from zero to five and say one short sentence about the grade.`;
const primerA = `You run a vocabulary drill ${nonce}.\n${Array.from({ length: 400 }, (_, index) => rule(index)).join("\n")}`;
const queried = { type: "object", properties: { query: { type: "string" } }, required: ["query"] };
const pathed = { type: "object", properties: { path: { type: "string" } }, required: ["path"] };
const tools = [
  { name: "modeA_deal", description: "Deals the next drill card.", input_schema: { type: "object", properties: {} } },
  { name: "load", description: "Loads one mode by path: its instructions and its tools.", input_schema: pathed },
  { name: "modeB_search", description: "Searches the web for pages.", input_schema: queried, defer_loading: true },
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
    const response = await client.beta.messages.create({ model, max_tokens: 600, betas, system: [{ ...text(primerA), ...mark }], tools, messages });
    const calls = response.content.filter((block) => block.type === "tool_use").map((block) => block.name);
    console.log(`\n## ${model} · ${carrier} · ${label}\n${JSON.stringify({ usage: response.usage, stop_reason: response.stop_reason, calls }, null, 2)}`);
  } catch (fault) {
    console.log(`\n## ${model} · ${carrier} · ${label} FAILED\n${fault.status} ${fault.message}`);
  }
};

const ask = "Stop the drill. Search the web for one example sentence with the Italian congiuntivo, then rewrite it in the past tense. Load the modes you need: /modeB searches, /modeC rewrites.";
const opening = [{ role: "user", content: [text("Hello. Say one short sentence.")] }, { role: "assistant", content: [text("Ready when you are.")] }];
await send("1 · thread opens", [...opening, { role: "user", content: [{ ...text(ask), ...mark }] }]);
const first = [...opening, { role: "user", content: [text(ask)] }, called("toolu_01", "load", { path: "/modeB" })];
await send("2 · first load", [...first, ...loaded("toolu_01", "You research the web. Cite every source you use.", "modeB_search", true)]);
const second = [
  ...first,
  ...loaded("toolu_01", "You research the web. Cite every source you use.", "modeB_search", false),
  called("toolu_02", "modeB_search", { query: "congiuntivo example sentence" }),
  { role: "user", content: [{ type: "tool_result", tool_use_id: "toolu_02", content: "Penso che lui sia stanco. (source: example.org)" }] },
  called("toolu_03", "load", { path: "/modeC" }),
];
await send("3 · second load, same thread", [...second, ...loaded("toolu_03", "You rewrite sentences. Keep the meaning.", "modeC_rewrite", true)]);
