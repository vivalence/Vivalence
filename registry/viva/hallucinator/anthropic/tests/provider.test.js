import { specimen } from "@vivalence/typology";
import provider from "../provider/index.js";
import {
  buildParams,
  translateTurns,
  translateTools,
  translateResponse,
  translateStreamEvent,
} from "../provider/translate.js";

const opus = { id: "claude-opus-4-6", tune: [0.9, 1.0, 0.3], thinking: true };
const haiku = { id: "claude-haiku-4-5", tune: [0.1, 0.3, 1.0], thinking: false };

specimen.describe("anthropic provider", () => {
  specimen.describe("translateTurns", () => {
    specimen.it("hoists system turns into system[], rest into messages (user-first)", () => {
      const { system, messages } = translateTurns([
        { role: "system", parts: [{ type: "text", text: "sys" }] },
        { role: "user", parts: [{ type: "text", text: "hi" }] },
        { role: "assistant", parts: [{ type: "text", text: "yo" }] },
      ]);
      specimen.expect(system).toEqual([{ type: "text", text: "sys" }]);
      specimen.expect(messages[0]).toEqual({ role: "user", content: [{ type: "text", text: "hi" }] });
      specimen.expect(messages[1].role).toBe("assistant");
    });

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
        { role: "assistant", parts: [{ type: "tool_use", id: "t1", name: "look", input: { q: 1 } }] },
        { role: "user", parts: [{ type: "tool_result", id: "t1", output: { r: 2 } }] },
      ]);
      specimen.expect(messages[0].content[0]).toEqual({ type: "tool_use", id: "t1", name: "look", input: { q: 1 } });
      specimen.expect(messages[1].content[0]).toEqual({ type: "tool_result", tool_use_id: "t1", content: JSON.stringify({ r: 2 }) });
    });

    specimen.it("parses a stringified tool_use input", () => {
      const { messages } = translateTurns([
        { role: "assistant", parts: [{ type: "tool_use", id: "t1", name: "look", input: JSON.stringify({ q: 1 }) }] },
      ]);
      specimen.expect(messages[0].content[0].input).toEqual({ q: 1 });
    });

    specimen.it("translates image + thinking parts", () => {
      const { messages } = translateTurns([
        {
          role: "user",
          parts: [
            { type: "image", data: "abc", media: "image/png" },
            { type: "thinking", text: "hmm", signature: "sig" },
          ],
        },
      ]);
      specimen.expect(messages[0].content[0]).toEqual({ type: "image", source: { type: "base64", media_type: "image/png", data: "abc" } });
      specimen.expect(messages[0].content[1]).toEqual({ type: "thinking", thinking: "hmm", signature: "sig" });
    });
  });

  specimen.describe("translateTools", () => {
    specimen.it("maps a spec to {name, description, input_schema}", () => {
      const out = translateTools({ look: { valence: "look up", input: { type: "object" } } });
      specimen.expect(out).toEqual([{ name: "look", description: "look up", input_schema: { type: "object" } }]);
    });

    specimen.it("a function spec falls back to empty description + object schema", () => {
      const out = translateTools({ run: () => {} });
      specimen.expect(out[0]).toEqual({ name: "run", description: "", input_schema: { type: "object" } });
    });

    specimen.it("missing valence/input default", () => {
      specimen.expect(translateTools({ x: {} })[0]).toEqual({ name: "x", description: "", input_schema: { type: "object" } });
    });
  });

  specimen.describe("translateResponse", () => {
    specimen.it("maps a response to a Turn with meta", () => {
      const turn = translateResponse({
        role: "assistant",
        content: [{ type: "text", text: "hello" }],
        usage: { input_tokens: 1 },
        stop_reason: "end_turn",
        model: "claude-opus-4-6",
      });
      specimen.expect(turn.role).toBe("assistant");
      specimen.expect(turn.parts).toEqual([{ type: "text", text: "hello" }]);
      specimen.expect(turn.meta).toEqual({ usage: { input_tokens: 1 }, stop: "end_turn", model: "claude-opus-4-6" });
    });

    specimen.it("maps tool_use (input stringified) + thinking blocks", () => {
      const turn = translateResponse({
        role: "assistant",
        content: [
          { type: "tool_use", id: "t1", name: "look", input: { q: 1 } },
          { type: "thinking", thinking: "hmm", signature: "s" },
        ],
        usage: {},
        stop_reason: "tool_use",
        model: "m",
      });
      specimen.expect(turn.parts[0]).toEqual({ type: "tool_use", id: "t1", name: "look", input: JSON.stringify({ q: 1 }) });
      specimen.expect(turn.parts[1]).toEqual({ type: "thinking", text: "hmm", signature: "s" });
    });
  });

  specimen.describe("translateStreamEvent", () => {
    specimen.it("message_start → /turn/open", () => {
      specimen.expect(translateStreamEvent({ type: "message_start", message: { role: "assistant" } }))
        .toEqual({ event: "/turn/open", turn: { role: "assistant" } });
    });

    specimen.it("content_block_start (tool_use) resets input for streaming fill", () => {
      const packet = translateStreamEvent({ type: "content_block_start", index: 0, content_block: { type: "tool_use", id: "t1", name: "look", input: { q: 1 } } });
      specimen.expect(packet.event).toBe("/part/open");
      specimen.expect(packet.part.input).toBe("");
    });

    specimen.it("content_block_delta maps text/thinking/input_json/signature", () => {
      specimen.expect(translateStreamEvent({ type: "content_block_delta", index: 0, delta: { type: "text_delta", text: "hi" } }).delta).toEqual({ text: "hi" });
      specimen.expect(translateStreamEvent({ type: "content_block_delta", index: 0, delta: { type: "thinking_delta", thinking: "t" } }).delta).toEqual({ text: "t" });
      specimen.expect(translateStreamEvent({ type: "content_block_delta", index: 0, delta: { type: "input_json_delta", partial_json: "{" } }).delta).toEqual({ input: "{" });
      specimen.expect(translateStreamEvent({ type: "content_block_delta", index: 0, delta: { type: "signature_delta", signature: "s" } }).delta).toEqual({ signature: "s" });
    });

    specimen.it("content_block_stop → /part/close; message_delta → /turn/close; message_stop + ping → null", () => {
      specimen.expect(translateStreamEvent({ type: "content_block_stop", index: 0 })).toEqual({ event: "/part/close", index: 0 });
      specimen.expect(translateStreamEvent({ type: "message_delta", delta: { stop_reason: "end_turn" }, usage: { output_tokens: 3 } }))
        .toEqual({ event: "/turn/close", meta: { stop: "end_turn", usage: { output_tokens: 3 } } });
      specimen.expect(translateStreamEvent({ type: "message_stop" })).toBe(null);
      specimen.expect(translateStreamEvent({ type: "ping" })).toBe(null);
    });
  });

  specimen.describe("buildParams (Request → messages.create params)", () => {
    const request = () => ({
      turns: [
        { role: "system", parts: [{ type: "text", text: "sys" }] },
        { role: "user", parts: [{ type: "text", text: "hi" }] },
      ],
    });

    specimen.it("builds model/system/messages + default max_tokens; no stream/thinking", () => {
      const params = buildParams(haiku, request());
      specimen.expect(params.model).toBe(haiku.id);
      specimen.expect(params.system).toEqual([{ type: "text", text: "sys" }]);
      specimen.expect(params.messages[0].role).toBe("user");
      specimen.expect(params.max_tokens).toBe(8192);
      specimen.expect(params.stream).toBe(undefined);
      specimen.expect(params.thinking).toBe(undefined);
    });

    specimen.it("settings.maxTokens overrides the default", () => {
      specimen.expect(buildParams(haiku, { ...request(), settings: { maxTokens: 500 } }).max_tokens).toBe(500);
    });

    specimen.it("stream=true sets params.stream", () => {
      specimen.expect(buildParams(haiku, request(), true).stream).toBe(true);
    });

    specimen.it("a thinking model without tool_choice enables thinking + bumps max_tokens to 32000", () => {
      const params = buildParams(opus, request());
      specimen.expect(params.thinking).toEqual({ type: "enabled", budget_tokens: 16000 });
      specimen.expect(params.max_tokens).toBe(32000);
    });

    specimen.it("thinking is suppressed when tool_choice is set (forced tools)", () => {
      const params = buildParams(opus, { ...request(), settings: { tool_choice: { type: "any" } } });
      specimen.expect(params.thinking).toBe(undefined);
      specimen.expect(params.tool_choice).toEqual({ type: "any" });
    });

    specimen.it("a non-thinking model never adds thinking", () => {
      specimen.expect(buildParams(haiku, request()).thinking).toBe(undefined);
    });

    specimen.it("request.tools → translated params.tools", () => {
      const params = buildParams(haiku, { ...request(), tools: { look: { valence: "v", input: { type: "object" } } } });
      specimen.expect(params.tools).toEqual([{ name: "look", description: "v", input_schema: { type: "object" } }]);
    });

    specimen.it("no tools / tool_choice keys when absent", () => {
      const params = buildParams(haiku, request());
      specimen.expect(params.tools).toBe(undefined);
      specimen.expect(params.tool_choice).toBe(undefined);
    });
  });

  specimen.describe("provider(service)", () => {
    specimen.it("returns 3 dialogue faculties (no network) with render + stream", async () => {
      const faculties = await provider({ secrets: { key: "fake-key" } });
      specimen.expect(faculties).toHaveLength(3);
      for (const faculty of faculties) {
        specimen.expect(faculty.type).toBe("dialogue");
        specimen.expect(Array.isArray(faculty.tune)).toBe(true);
        specimen.expect(typeof faculty.via.render).toBe("function");
        specimen.expect(typeof faculty.via.stream).toBe("function");
      }
    });

    specimen.it("only the thinking model exposes thinking channels", async () => {
      const faculties = await provider({ secrets: { key: "fake-key" } });
      const thinking = faculties.filter((faculty) => faculty.channels.out.includes("thinking"));
      specimen.expect(thinking).toHaveLength(1);
    });
  });
});
