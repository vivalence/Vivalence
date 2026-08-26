import { join } from "@std/path";
import { specimen } from "@vivalence/typology";
import {
  buildParams,
  translateTools,
  translateResponse,
  streamTranslator,
} from "../provider/translate.js";

const SNAPSHOTS = new URL("./snapshots", import.meta.url).pathname;
const HOT = Deno.env.get("SNAPSHOT_HOT") === "1";

function pin(subject, file) {
  const pojo = JSON.parse(JSON.stringify(subject));
  if (HOT) specimen.snapshot(pojo, { base: SNAPSHOTS, locate: file, parse: (value) => value });
  const frozen = JSON.parse(Deno.readTextFileSync(join(SNAPSHOTS, file)));
  specimen.expect(pojo).toEqual(frozen);
  return pojo;
}

const strong = { id: "openai/gpt-5.1", tune: [0.9, 1.0, 0.3], thinking: true };
const light = { id: "google/gemini-2.5-flash-lite", tune: [0.1, 0.3, 1.0], thinking: false };

const LookupInputSchema = {
  type: "object",
  properties: { query: { type: "string" } },
  required: ["query"],
};

const conversation = {
  turns: [
    { role: "system", parts: [{ type: "text", text: "You are the translation pin." }] },
    { role: "user", parts: [{ type: "text", text: "casa" }] },
  ],
};

specimen.describe("openrouter translate snapshot — pure outbound/inbound pins, offline", () => {
  specimen.it("buildParams across plain, reasoning, effort, tools, structured, stream, cache marks", () => {
    pin(
      {
        plain: buildParams(light, conversation),
        reasoningDefaults: buildParams(strong, conversation),
        reasoningEffort: buildParams(strong, { ...conversation, settings: { effort: "high" } }),
        toolCarrying: buildParams(light, {
          ...conversation,
          tools: [{ name: "bare" }, { name: "dressed", valence: "looks up a word", input: LookupInputSchema }],
        }),
        structuredOutput: buildParams(light, {
          ...conversation,
          tools: [{ name: "lookup" }],
          output: { object: LookupInputSchema },
        }),
        streaming: buildParams(light, conversation, true),
        cacheMarked: buildParams(light, { ...conversation, cache: { marks: ["context"] } }),
        explicitMaxTokensUnderReasoning: buildParams(strong, {
          ...conversation,
          settings: { maxTokens: 512 },
        }),
      },
      "translate-build-params.snapshot.json",
    );
  });

  specimen.it("translateTools: dressed spec, hollow spec", () => {
    pin(
      translateTools([{ name: "dressed", valence: "looks up a word", input: LookupInputSchema }, { name: "hollow" }]),
      "translate-tools.snapshot.json",
    );
  });

  specimen.it("translateResponse: reasoning, text, tool_calls", () => {
    pin(
      translateResponse({
        model: "openai/gpt-5.1",
        usage: { prompt_tokens: 11, completion_tokens: 29 },
        choices: [
          {
            finish_reason: "tool_calls",
            message: {
              role: "assistant",
              content: "considering the word",
              reasoning: "weighing cognates",
              tool_calls: [{ id: "call-1", type: "function", function: { name: "lookup", arguments: '{"query":"casa"}' } }],
            },
          },
        ],
      }),
      "translate-response.snapshot.json",
    );
  });

  specimen.it("streamTranslator over a full chunk sequence: reasoning → text → tool_call → finish → usage", () => {
    const chunks = [
      { choices: [{ delta: { role: "assistant", reasoning: "weighing" } }] },
      { choices: [{ delta: { reasoning: " cognates" } }] },
      { choices: [{ delta: { content: "let me look that up" } }] },
      { choices: [{ delta: { tool_calls: [{ index: 0, id: "call-1", function: { name: "lookup", arguments: '{"query":' } }] } }] },
      { choices: [{ delta: { tool_calls: [{ index: 0, function: { arguments: '"casa"}' } }] } }] },
      { model: "openai/gpt-5.1", choices: [{ delta: {}, finish_reason: "tool_calls" }] },
      { model: "openai/gpt-5.1", choices: [], usage: { prompt_tokens: 11, completion_tokens: 29 } },
    ];

    const translator = streamTranslator();
    const packets = [...chunks.flatMap((chunk) => translator.translate(chunk)), ...translator.flush()];
    specimen.expect(packets.at(-1).event).toBe("/turn/close");
    specimen.expect(packets.at(-1).meta.usage).toEqual({ prompt_tokens: 11, completion_tokens: 29 });
    pin(packets, "translate-stream-events.snapshot.json");
  });
});
