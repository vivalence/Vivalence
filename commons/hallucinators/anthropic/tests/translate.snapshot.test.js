import { join } from "@std/path";
import { specimen, v } from "@vivalence/typology";
import {
  buildParams,
  streamTranslator,
  translateResponse,
  translateTools,
} from "../provider/translate.js";

const SNAPSHOTS = new URL("./snapshots", import.meta.url).pathname;
const HOT = Deno.env.get("SNAPSHOT_HOT") === "1";

function pin(subject, file) {
  const pojo = JSON.parse(JSON.stringify(subject));
  if (HOT) {
    specimen.snapshot(pojo, {
      base: SNAPSHOTS,
      locate: file,
      parse: (value) => value,
    });
  }
  const frozen = JSON.parse(Deno.readTextFileSync(join(SNAPSHOTS, file)));
  specimen.expect(pojo).toEqual(frozen);
  return pojo;
}

const opus = { id: "claude-opus-5", tune: [0.9, 0.3, 0.5], thinking: true };
const haiku = {
  id: "claude-haiku-4-5",
  tune: [0.1, 1.0, 0.5],
  thinking: false,
};

const LookupInputSchema = {
  type: "object",
  properties: { query: { type: "string" } },
  required: ["query"],
};

const conversation = {
  turns: [
    {
      role: "system",
      parts: [{ type: "text", text: "You are the translation pin." }],
    },
    { role: "user", parts: [{ type: "text", text: "casa" }] },
  ],
};

specimen.describe(
  "anthropic translate snapshot — pure outbound/inbound pins, offline",
  () => {
    specimen.it(
      "buildParams across plain, thinking, tool_choice, tools, stream, maxTokens",
      () => {
        pin(
          {
            plain: buildParams(haiku, conversation),
            thinkingDefaults: buildParams(opus, conversation),
            thinkingUnderToolChoice: buildParams(opus, {
              ...conversation,
              settings: { tool_choice: { type: "any" } },
            }),
            thinkingUnderEffort: buildParams(opus, {
              ...conversation,
              settings: { effort: "xhigh" },
            }),
            thinkingOff: buildParams(opus, {
              ...conversation,
              settings: { effort: "none" },
            }),
            toolCarrying: buildParams(haiku, {
              ...conversation,
              tools: [{ name: "bare" }, {
                name: "dressed",
                valence: "looks up a word",
                input: LookupInputSchema,
              }],
            }),
            structuredOutput: buildParams(haiku, {
              ...conversation,
              tools: [{ name: "lookup" }],
              output: { object: LookupInputSchema },
            }),
            streaming: buildParams(haiku, conversation, true),
            explicitMaxTokensUnderThinking: buildParams(opus, {
              ...conversation,
              settings: { maxTokens: 512 },
            }),
          },
          "translate-build-params.snapshot.json",
        );
      },
    );

    specimen.it("translateTools: dressed spec, hollow spec", () => {
      pin(
        translateTools([{
          name: "dressed",
          valence: "looks up a word",
          input: LookupInputSchema,
        }, { name: "hollow" }]),
        "translate-tools.snapshot.json",
      );
    });

    specimen.it(
      "translateResponse: text, thinking, tool_use, unknown block",
      () => {
        pin(
          translateResponse({
            role: "assistant",
            model: "claude-opus-4-6",
            stop_reason: "tool_use",
            usage: { input_tokens: 11, output_tokens: 29 },
            content: [
              { type: "text", text: "considering the word" },
              {
                type: "thinking",
                thinking: "weighing cognates",
                signature: "signature-1",
              },
              {
                type: "tool_use",
                id: "toolu-1",
                name: "lookup",
                input: { query: "casa" },
              },
              { type: "web_search_result", url: "https://example.test" },
            ],
          }),
          "translate-response.snapshot.json",
        );
      },
    );

    specimen.it(
      "alien blocks round-trip verbatim: unknown inbound block → alien part → original block outbound",
      () => {
        const inbound = translateResponse({
          role: "assistant",
          model: "claude-opus-4-6",
          stop_reason: "end_turn",
          usage: { input_tokens: 3, output_tokens: 1 },
          content: [{ type: "redacted_thinking", data: "opaque-bytes" }],
        });
        specimen.expect(inbound.parts[0]).toEqual({
          type: "alien",
          dialect: "anthropic",
          block: { type: "redacted_thinking", data: "opaque-bytes" },
        });

        const outbound = buildParams(haiku, {
          turns: [{ role: "assistant", parts: inbound.parts }],
        });
        specimen.expect(outbound.messages[0].content[0]).toEqual({
          type: "redacted_thinking",
          data: "opaque-bytes",
        });
      },
    );

    specimen.it(
      "streamTranslator over a full event sequence, every packet a valid Packet.Response",
      () => {
        const events = [
          {
            type: "message_start",
            message: { role: "assistant", usage: { input_tokens: 11, output_tokens: 1 } },
          },
          {
            type: "content_block_start",
            index: 0,
            content_block: { type: "thinking", thinking: "", signature: "" },
          },
          {
            type: "content_block_delta",
            index: 0,
            delta: { type: "thinking_delta", thinking: "weighing" },
          },
          {
            type: "content_block_delta",
            index: 0,
            delta: { type: "signature_delta", signature: "signature-1" },
          },
          { type: "content_block_stop", index: 0 },
          {
            type: "content_block_start",
            index: 1,
            content_block: { type: "text", text: "" },
          },
          {
            type: "content_block_delta",
            index: 1,
            delta: { type: "text_delta", text: "let me look that up" },
          },
          { type: "content_block_stop", index: 1 },
          {
            type: "content_block_start",
            index: 2,
            content_block: {
              type: "tool_use",
              id: "toolu-1",
              name: "lookup",
              input: {},
            },
          },
          {
            type: "content_block_delta",
            index: 2,
            delta: { type: "input_json_delta", partial_json: '{"query":' },
          },
          {
            type: "content_block_delta",
            index: 2,
            delta: { type: "input_json_delta", partial_json: '"casa"}' },
          },
          { type: "content_block_stop", index: 2 },
          {
            type: "message_delta",
            delta: { stop_reason: "tool_use" },
            usage: { output_tokens: 29 },
          },
          { type: "message_stop" },
          { type: "ping" },
        ];

        const translator = streamTranslator();
        const packets = events.flatMap((event) => translator.translate(event));
        for (const packet of packets) {
          specimen.expect(v.primitives.hallucination.Packet.Response.check(packet)).toBe(true);
        }
        pin(packets, "translate-stream-events.snapshot.json");
      },
    );
  },
);

specimen.describe("translateTools — Q15: output never reaches the wire", () => {
  specimen.it("a declaration's output schema is dropped; the provider's tool takes no output field", () => {
    const declared = {
      name: "web_search",
      valence: "Searches the web.",
      input: v.object({ query: v.string() }),
      output: v.object({ pages: v.array(v.string()) }),
    };
    const wire = translateTools([declared]);
    console.log(JSON.stringify(wire, null, 2));
    specimen.expect(JSON.stringify(wire).includes('"pages"')).toBe(false);
    specimen.expect(JSON.stringify(wire).includes('"query"')).toBe(true);
  });
});
