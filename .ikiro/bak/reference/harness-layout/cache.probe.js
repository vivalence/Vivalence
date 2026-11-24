import Anthropic from "@anthropic-ai/sdk";

const env = Deno.readTextFileSync(`${Deno.env.get("HOME")}/.viva/.env`);
const apiKey = env.match(/^SECRET_VIVA_ANTHROPIC_API_KEY=["']?([^"'\n]+)/m)[1];
const client = new Anthropic({ apiKey });
const model = Deno.args[0] ?? "claude-haiku-5-5";
const betas = ["mid-conversation-tool-changes-2026-07-01"];

const rule = (index) => `Rule ${index}: when the learner answers card ${index}, grade it from zero to five and say one short sentence about the grade.`;
const primerA = `You run a vocabulary drill.\n${Array.from({ length: 400 }, (_, index) => rule(index)).join("\n")}`;
const primerB = "You research the web. Cite every source you use.";
const object = { type: "object", properties: { query: { type: "string" } }, required: ["query"] };
const deal = { name: "modeA_deal", description: "Deals the next drill card.", input_schema: { type: "object", properties: {} } };
const search = { name: "modeB_search", description: "Searches the web for pages.", input_schema: object };

const mark = { cache_control: { type: "ephemeral" } };
const said = (role, text, marked) => ({ role, content: [{ type: "text", text, ...(marked && mark) }] });
const first = said("user", "Hello. Before we drill: say one short sentence.", true);
const ask = "Stop the drill. Search the web for three example sentences with the Italian congiuntivo. Use a tool.";

const send = async (label, body) => {
  try {
    const response = await client.beta.messages.create({ model, max_tokens: 400, betas, ...body });
    console.log(`\n## ${label}\n${JSON.stringify({ usage: response.usage, stop_reason: response.stop_reason, content: response.content.filter((block) => block.type !== "thinking") }, null, 2)}`);
    return response;
  } catch (fault) {
    console.log(`\n## ${label} FAILED\n${fault.status} ${fault.message}`);
    return null;
  }
};

const frozen = { system: [{ type: "text", text: primerA, ...mark }], tools: [deal, { ...search, defer_loading: true }] };
const opened = await send("1 · thread opens: modeA primer, modeA tool, modeB tool declared hidden", { ...frozen, messages: [first] });
const history = [said("user", first.content[0].text), { role: "assistant", content: opened.content.filter((block) => block.type !== "thinking") }];

await send("2 · APPENDED load: system and tools untouched, one system message in the turns", {
  ...frozen,
  messages: [
    ...history,
    said("user", ask, true),
    { role: "system", content: [{ type: "text", text: primerB }, { type: "tool_addition", tool: { type: "tool_reference", name: "modeB_search" } }] },
  ],
});

await send("3 · REWRITTEN load: modeB primer into the system prompt, modeB tool into the tool list", {
  system: [{ type: "text", text: `${primerA}\n${primerB}`, ...mark }],
  tools: [deal, search],
  messages: [...history, said("user", ask, true)],
});
