import { specimen, v } from "@vivalence/typology";
import provider from "../provider/index.js";
import {
  buildParams,
  streamTranslator,
  translateResponse,
  translateTools,
  translateTurns,
} from "../provider/translate.js";

const opus = { id: "claude-opus-5", tune: [0.9, 0.3, 0.5], thinking: true };
const haiku = {
  id: "claude-haiku-4-5",
  tune: [0.1, 1.0, 0.5],
  thinking: false,
};

const FACULTIES = [
  { type: "dialogue", id: "claude-opus-5-5", tune: [1.0, 0.8, 0.1], context: 1000000, thinking: true },
  { type: "dialogue", id: "claude-sonnet-5-5", tune: [0.6, 0.6, 0.5], context: 1000000, thinking: true },
  { type: "dialogue", id: "claude-haiku-5-5", tune: [0.25, 0.95, 0.5], context: 1000000, thinking: true },
];

const service = (faculties = FACULTIES) => ({ secrets: { key: "fake-key" }, faculties });

specimen.describe("anthropic provider", () => {
  specimen.describe("translateTurns", () => {
    specimen.it(
      "hoists system turns into system[], rest into messages (user-first)",
      () => {
        const { system, messages } = translateTurns([
          { role: "system", parts: [{ type: "text", text: "sys" }] },
          { role: "user", parts: [{ type: "text", text: "hi" }] },
          { role: "assistant", parts: [{ type: "text", text: "yo" }] },
        ]);
        specimen.expect(system).toEqual([{ type: "text", text: "sys" }]);
        specimen.expect(messages[0]).toEqual({
          role: "user",
          content: [{ type: "text", text: "hi" }],
        });
        specimen.expect(messages[1].role).toBe("assistant");
      },
    );

    specimen.it("hoists MULTIPLE system turns anywhere in the array", () => {
      const { system, messages } = translateTurns([
        { role: "system", parts: [{ type: "text", text: "a" }] },
        { role: "user", parts: [{ type: "text", text: "u" }] },
        { role: "system", parts: [{ type: "text", text: "b" }] },
      ]);
      specimen.expect(system.map((part) => part.text)).toEqual(["a", "b"]);
      specimen.expect(messages).toHaveLength(1);
    });

    specimen.it("translates tool_use and tool_result parts", () => {
      const { messages } = translateTurns([
        {
          role: "assistant",
          parts: [{
            type: "tool_use",
            id: "t1",
            name: "look",
            input: { q: 1 },
          }],
        },
        {
          role: "user",
          parts: [{ type: "tool_result", id: "t1", product: { r: 2 } }],
        },
      ]);
      specimen.expect(messages[0].content[0]).toEqual({
        type: "tool_use",
        id: "t1",
        name: "look",
        input: { q: 1 },
      });
      specimen.expect(messages[1].content[0]).toEqual({
        type: "tool_result",
        tool_use_id: "t1",
        content: JSON.stringify({ r: 2 }),
      });
    });

    specimen.it(
      "an assistant turn carrying its own tool_result splits into assistant then user messages — same wire as a sync round",
      () => {
        const { messages } = translateTurns([
          {
            role: "assistant",
            parts: [
              { type: "text", text: "done" },
              { type: "tool_use", id: "a1", name: "appraise", input: {} },
              {
                type: "tool_result",
                id: "a1",
                product: { object: [{ literal: "vedere", signal: "SUCCESS" }] },
              },
            ],
          },
        ]);
        specimen.expect(messages[0].role).toBe("assistant");
        specimen.expect(messages[0].content.map((part) => part.type)).toEqual([
          "text",
          "tool_use",
        ]);
        specimen.expect(messages[1]).toEqual({
          role: "user",
          content: [
            {
              type: "tool_result",
              tool_use_id: "a1",
              content: JSON.stringify({
                object: [{ literal: "vedere", signal: "SUCCESS" }],
              }),
            },
          ],
        });
      },
    );

    specimen.it(
      "passes tool_use input verbatim — the stream translator parsed it at content_block_stop",
      () => {
        const { messages } = translateTurns([
          {
            role: "assistant",
            parts: [{
              type: "tool_use",
              id: "t1",
              name: "look",
              input: { q: 1 },
            }],
          },
        ]);
        specimen.expect(messages[0].content[0].input).toEqual({ q: 1 });
      },
    );

    specimen.it("translates image + thinking parts", () => {
      const { messages } = translateTurns([
        {
          role: "user",
          parts: [
            { type: "image", data: "abc", mime: "image/png" },
            { type: "thinking", text: "hmm", signature: "sig" },
          ],
        },
      ]);
      specimen.expect(messages[0].content[0]).toEqual({
        type: "image",
        source: { type: "base64", media_type: "image/png", data: "abc" },
      });
      specimen.expect(messages[0].content[1]).toEqual({
        type: "thinking",
        thinking: "hmm",
        signature: "sig",
      });
    });

    specimen.it("a thinking part another provider wrote (no signature) is dropped; a turn left empty sends no message", () => {
      const { messages } = translateTurns([
        { role: "user", parts: [{ type: "text", text: "hola" }] },
        { role: "assistant", parts: [{ type: "thinking", text: "gemini reasons" }, { type: "text", text: "hola!" }] },
        { role: "user", parts: [{ type: "text", text: "otra vez" }] },
        { role: "assistant", parts: [{ type: "thinking", text: "only thought" }] },
        { role: "assistant", parts: [] },
        { role: "user", parts: [{ type: "text", text: "y?" }] },
      ]);
      specimen.expect(messages).toEqual([
        { role: "user", content: [{ type: "text", text: "hola" }] },
        { role: "assistant", content: [{ type: "text", text: "hola!" }] },
        { role: "user", content: [{ type: "text", text: "otra vez" }] },
        { role: "user", content: [{ type: "text", text: "y?" }] },
      ]);
    });
  });

  specimen.describe("translateTools", () => {
    specimen.it(
      "maps a declaration list to {name, description, input_schema}",
      () => {
        const out = translateTools([{
          name: "look",
          valence: "look up",
          input: { type: "object" },
        }]);
        specimen.expect(out).toEqual([{
          name: "look",
          description: "look up",
          input_schema: { type: "object" },
        }]);
      },
    );

    specimen.it("missing valence/input default", () => {
      specimen.expect(translateTools([{ name: "x" }])[0]).toEqual({
        name: "x",
        description: "",
        input_schema: { type: "object" },
      });
    });
  });

  specimen.describe("translateResponse", () => {
    specimen.it("maps a response to a Turn with meta", () => {
      const turn = translateResponse({
        role: "assistant",
        content: [{ type: "text", text: "hello" }],
        usage: { input_tokens: 1, output_tokens: 2, cache_read_input_tokens: 5 },
        stop_reason: "end_turn",
        model: "claude-opus-4-6",
      });
      specimen.expect(turn.role).toBe("assistant");
      specimen.expect(turn.parts).toEqual([{ type: "text", text: "hello" }]);
      specimen.expect(turn.meta).toEqual({
        state: "complete",
        usage: [{ name: "input", unit: "tokens", amount: 1 }, { name: "output", unit: "tokens", amount: 2 }],
        provider: {
          stop_reason: "end_turn",
          model: "claude-opus-4-6",
          usage: { input_tokens: 1, output_tokens: 2, cache_read_input_tokens: 5 },
        },
      });
      specimen.expect(turn).matches(v.primitives.hallucination.Turn);
    });

    specimen.it("maps tool_use (input verbatim) + thinking blocks", () => {
      const turn = translateResponse({
        role: "assistant",
        content: [
          { type: "tool_use", id: "t1", name: "look", input: { q: 1 } },
          { type: "thinking", thinking: "hmm", signature: "s" },
        ],
        usage: { input_tokens: 1, output_tokens: 2 },
        stop_reason: "tool_use",
        model: "m",
      });
      specimen.expect(turn.parts[0]).toEqual({
        type: "tool_use",
        id: "t1",
        name: "look",
        input: { q: 1 },
      });
      specimen.expect(turn.parts[1]).toEqual({
        type: "thinking",
        text: "hmm",
        signature: "s",
      });
    });
  });

  specimen.describe("streamTranslator", () => {
    specimen.it("message_start → /turn/open", () => {
      specimen.expect(
        streamTranslator().translate({
          type: "message_start",
          message: { role: "assistant", usage: { input_tokens: 7, output_tokens: 1 } },
        }),
      )
        .toEqual([{ event: "/turn/open", turn: { role: "assistant" } }]);
    });

    specimen.it(
      "content_block_start (tool_use) opens a valid part, input {} until content_block_stop",
      () => {
        const [packet] = streamTranslator().translate({
          type: "content_block_start",
          index: 0,
          content_block: {
            type: "tool_use",
            id: "t1",
            name: "look",
            input: { q: 1 },
          },
        });
        specimen.expect(packet.event).toBe("/part/open");
        specimen.expect(packet.part.input).toEqual({});
        specimen.expect(packet).matches(v.primitives.hallucination.Packet.PartOpen);
      },
    );

    specimen.it(
      "content_block_delta maps text/thinking/signature to part; input_json is held",
      () => {
        const translator = streamTranslator();
        const deltas = [
          { type: "text_delta", text: "hi" },
          { type: "thinking_delta", thinking: "t" },
          { type: "input_json_delta", partial_json: "{" },
          { type: "signature_delta", signature: "s" },
        ].map((delta) => translator.translate({ type: "content_block_delta", index: 0, delta }));
        specimen.expect(deltas).toEqual([
          [{ event: "/part/delta", index: 0, part: { text: "hi" } }],
          [{ event: "/part/delta", index: 0, part: { text: "t" } }],
          [],
          [{ event: "/part/delta", index: 0, part: { signature: "s" } }],
        ]);
      },
    );

    specimen.it(
      "content_block_stop parses a tool's held input once — an empty string parses to {}",
      () => {
        const translator = streamTranslator();
        const tool = (index) => ({
          type: "content_block_start",
          index,
          content_block: { type: "tool_use", id: `t${index}`, name: "look", input: {} },
        });
        translator.translate(tool(0));
        translator.translate({
          type: "content_block_delta",
          index: 0,
          delta: { type: "input_json_delta", partial_json: '{"q":' },
        });
        translator.translate({
          type: "content_block_delta",
          index: 0,
          delta: { type: "input_json_delta", partial_json: "1}" },
        });
        specimen.expect(translator.translate({ type: "content_block_stop", index: 0 })).toEqual([
          { event: "/part/delta", index: 0, part: { input: { q: 1 } } },
          { event: "/part/close", index: 0 },
        ]);
        translator.translate(tool(1));
        specimen.expect(translator.translate({ type: "content_block_stop", index: 1 })).toEqual([
          { event: "/part/delta", index: 1, part: { input: {} } },
          { event: "/part/close", index: 1 },
        ]);
      },
    );

    specimen.it(
      "content_block_stop → /part/close; message_delta → /turn/close in our words; message_stop + ping → []",
      () => {
        const translator = streamTranslator();
        translator.translate({
          type: "message_start",
          message: { role: "assistant", usage: { input_tokens: 7, output_tokens: 1 } },
        });
        specimen.expect(
          translator.translate({ type: "content_block_stop", index: 0 }),
        ).toEqual([{ event: "/part/close", index: 0 }]);
        specimen.expect(
          translator.translate({
            type: "message_delta",
            delta: { stop_reason: "end_turn" },
            usage: { output_tokens: 3 },
          }),
        )
          .toEqual([{
            event: "/turn/close",
            turn: {
              meta: {
                state: "complete",
                usage: [{ name: "input", unit: "tokens", amount: 7 }, { name: "output", unit: "tokens", amount: 3 }],
                provider: { stop_reason: "end_turn", usage: { input_tokens: 7, output_tokens: 3 } },
              },
            },
          }]);
        specimen.expect(translator.translate({ type: "message_stop" })).toEqual([]);
        specimen.expect(translator.translate({ type: "ping" })).toEqual([]);
      },
    );
  });

  specimen.describe("buildParams (Request → messages.create params)", () => {
    const request = () => ({
      turns: [
        { role: "system", parts: [{ type: "text", text: "sys" }] },
        { role: "user", parts: [{ type: "text", text: "hi" }] },
      ],
    });

    specimen.it(
      "builds model/system/messages + default max_tokens; no stream/thinking",
      () => {
        const params = buildParams(haiku, request());
        specimen.expect(params.model).toBe(haiku.id);
        specimen.expect(params.system).toEqual([{ type: "text", text: "sys" }]);
        specimen.expect(params.messages[0].role).toBe("user");
        specimen.expect(params.max_tokens).toBe(8192);
        specimen.expect(params.stream).toBe(undefined);
        specimen.expect(params.thinking).toBe(undefined);
      },
    );

    specimen.it("settings.maxTokens overrides the default", () => {
      specimen.expect(
        buildParams(haiku, { ...request(), settings: { maxTokens: 500 } })
          .max_tokens,
      ).toBe(500);
    });

    specimen.it("stream=true sets params.stream", () => {
      specimen.expect(buildParams(haiku, request(), true).stream).toBe(true);
    });

    specimen.it(
      "a thinking model runs adaptive + bumps max_tokens under the SDK's non-stream ceiling",
      () => {
        const params = buildParams(opus, request());
        specimen.expect(params.thinking).toEqual({
          type: "adaptive",
          display: "summarized",
        });
        specimen.expect(params.max_tokens).toBe(16000);
        specimen.expect(params.output_config).toBe(undefined);
      },
    );

    specimen.it(
      "a streaming thinking model gets the full output budget",
      () => {
        specimen.expect(buildParams(opus, request(), true).max_tokens).toBe(
          64000,
        );
      },
    );

    specimen.it("thinking survives a forced tool_choice", () => {
      const params = buildParams(opus, {
        ...request(),
        settings: { tool_choice: { type: "any" } },
      });
      specimen.expect(params.thinking).toEqual({
        type: "adaptive",
        display: "summarized",
      });
      specimen.expect(params.tool_choice).toEqual({ type: "any" });
    });

    specimen.it("settings.effort rides output_config", () => {
      const params = buildParams(opus, {
        ...request(),
        settings: { effort: "xhigh" },
      });
      specimen.expect(params.output_config).toEqual({ effort: "xhigh" });
    });

    specimen.it(
      "effort none forces a thinking model quiet — thinking disabled on the wire, no output_config",
      () => {
        const params = buildParams(opus, {
          ...request(),
          settings: { effort: "none" },
        });
        specimen.expect(params.thinking).toEqual({ type: "disabled" });
        specimen.expect(params.output_config).toBe(undefined);
      },
    );

    specimen.it("a non-thinking model never adds thinking", () => {
      specimen.expect(buildParams(haiku, request()).thinking).toBe(undefined);
    });

    specimen.it("request.tools → translated params.tools", () => {
      const params = buildParams(haiku, {
        ...request(),
        tools: [{ name: "look", valence: "v", input: { type: "object" } }],
      });
      specimen.expect(params.tools).toEqual([{
        name: "look",
        description: "v",
        input_schema: { type: "object" },
      }]);
    });

    specimen.it("no tools / tool_choice keys when absent", () => {
      const params = buildParams(haiku, request());
      specimen.expect(params.tools).toBe(undefined);
      specimen.expect(params.tool_choice).toBe(undefined);
    });

    specimen.it(
      "request.output.schema appends a respond tool, tool_choice auto: 5.5 refuses a forced choice",
      () => {
        const schema = {
          type: "object",
          properties: { verdict: { type: "string" } },
        };
        const params = buildParams(haiku, { ...request(), output: { schema } });
        specimen.expect(params.tools.at(-1)).toEqual({
          name: "respond",
          description:
            "Return the final result as structured data. Finish by calling this tool, never in plain text.",
          input_schema: schema,
        });
        specimen.expect(params.tool_choice).toEqual({ type: "auto" });
      },
    );

    specimen.it(
      "output.schema appends respond after the mode's real tools",
      () => {
        const schema = { type: "object" };
        const params = buildParams(haiku, {
          ...request(),
          tools: [{ name: "look" }],
          output: { schema },
        });
        specimen.expect(params.tools.map((tool) => tool.name)).toEqual([
          "look",
          "respond",
        ]);
      },
    );
  });

  specimen.describe("provider(service)", () => {
    specimen.it(
      "returns 3 dialogue faculties (no network) with render + stream",
      async () => {
        const faculties = await provider(service());
        specimen.expect(faculties).toHaveLength(3);
        for (const faculty of faculties) {
          specimen.expect(faculty.type).toBe("dialogue");
          specimen.expect(Array.isArray(faculty.tune)).toBe(true);
          specimen.expect(typeof faculty.via.render).toBe("function");
          specimen.expect(typeof faculty.via.stream).toBe("function");
        }
      },
    );

    specimen.it(
      "all three models think: each exposes thinking channels",
      async () => {
        const faculties = await provider(service());
        const thinking = faculties.filter((faculty) =>
          faculty.channels.out.includes("thinking")
        );
        specimen.expect(thinking).toHaveLength(3);
      },
    );

    specimen.it(
      "only the row's faculties load: one entry yields one faculty; an unknown type faults naming it",
      async () => {
        const faculties = await provider(service([FACULTIES[0]]));
        specimen.expect(faculties.map((faculty) => [faculty.id, faculty.tune])).toEqual([
          ["claude-opus-5-5", [1.0, 0.8, 0.1]],
        ]);
        const speech = { ...FACULTIES[0], type: "speech" };
        await specimen.expect(provider(service([speech]))).rejects.toThrow(
          "[anthropic] faculties/0/type must be equal to constant",
        );
        await specimen.expect(provider({ secrets: { key: "fake-key" } })).rejects.toThrow(
          "[anthropic] faculties/ must be array",
        );
        specimen.expect(await provider(service([]))).toEqual([]);
      },
    );
  });
});

specimen.describe("anthropic · a faculty carries its entry forward (m126 Q7A)", () => {
  specimen.it("tier · provider, stamped on the entry by paladin, reach the built faculty; type · id · via stay the builder's", async () => {
    const [entry] = FACULTIES;
    const [faculty] = await provider(service([{ ...entry, tier: "actor", provider: "anthropic" }]));
    specimen.expect([faculty.type, faculty.id, faculty.tier, faculty.provider]).toEqual([entry.type, entry.id, "actor", "anthropic"]);
    specimen.expect(Object.keys(faculty.via).length).toBeGreaterThan(0);
    specimen.expect(entry.tier).toBeUndefined();
  });
});
