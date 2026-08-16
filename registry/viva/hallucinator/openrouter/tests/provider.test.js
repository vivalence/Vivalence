import { specimen } from "@vivalence/typology";
import provider from "../provider/index.js";
import {
  buildParams,
  translateTurns,
  translateTools,
  translateResponse,
  streamTranslator,
} from "../provider/translate.js";

const strong = { id: "openai/gpt-5.1", tune: [0.9, 1.0, 0.3], thinking: true };
const light = { id: "google/gemini-2.5-flash-lite", tune: [0.1, 0.3, 1.0], thinking: false };

specimen.describe("openrouter provider", () => {
  specimen.describe("translateTurns", () => {
    specimen.it("keeps system turns inline as system messages with content parts", () => {
      const messages = translateTurns([
        { role: "system", parts: [{ type: "text", text: "sys" }] },
        { role: "user", parts: [{ type: "text", text: "hi" }] },
        { role: "assistant", parts: [{ type: "text", text: "yo" }] },
      ]);
      specimen.expect(messages[0]).toEqual({ role: "system", content: [{ type: "text", text: "sys" }] });
      specimen.expect(messages[1]).toEqual({ role: "user", content: [{ type: "text", text: "hi" }] });
      specimen.expect(messages[2]).toEqual({ role: "assistant", content: [{ type: "text", text: "yo" }] });
    });

    specimen.it("assistant tool_use parts fold into message.tool_calls with stringified arguments", () => {
      const messages = translateTurns([
        { role: "assistant", parts: [{ type: "tool_use", id: "t1", name: "look", input: { q: 1 } }] },
      ]);
      specimen.expect(messages[0]).toEqual({
        role: "assistant",
        tool_calls: [{ id: "t1", type: "function", function: { name: "look", arguments: JSON.stringify({ q: 1 }) } }],
      });
    });

    specimen.it("tool_result parts split into role:tool messages ahead of remaining user content", () => {
      const messages = translateTurns([
        {
          role: "user",
          parts: [
            { type: "text", text: "and also" },
            { type: "tool_result", id: "t1", output: { r: 2 } },
          ],
        },
      ]);
      specimen.expect(messages[0]).toEqual({ role: "tool", tool_call_id: "t1", content: JSON.stringify({ r: 2 }) });
      specimen.expect(messages[1]).toEqual({ role: "user", content: [{ type: "text", text: "and also" }] });
    });

    specimen.it("an assistant turn carrying its own tool_result splits into tool_calls then role:tool — same wire as a sync round", () => {
      const messages = translateTurns([
        {
          role: "assistant",
          parts: [
            { type: "text", text: "done" },
            { type: "tool_use", id: "a1", name: "appraise", input: {} },
            { type: "tool_result", id: "a1", output: { object: [{ literal: "vedere", signal: "SUCCESS" }] } },
          ],
        },
      ]);
      specimen.expect(messages[0]).toEqual({
        role: "assistant",
        content: [{ type: "text", text: "done" }],
        tool_calls: [{ id: "a1", type: "function", function: { name: "appraise", arguments: "{}" } }],
      });
      specimen.expect(messages[1]).toEqual({
        role: "tool",
        tool_call_id: "a1",
        content: JSON.stringify([{ literal: "vedere", signal: "SUCCESS" }]),
      });
    });

    specimen.it("translates image parts to data-url image_url; assistant thinking folds into message.reasoning", () => {
      const messages = translateTurns([
        { role: "user", parts: [{ type: "image", data: "abc", media: "image/png" }] },
        {
          role: "assistant",
          parts: [
            { type: "thinking", text: "hmm" },
            { type: "text", text: "so" },
          ],
        },
      ]);
      specimen.expect(messages[0].content[0]).toEqual({
        type: "image_url",
        image_url: { url: "data:image/png;base64,abc" },
      });
      specimen.expect(messages[1].reasoning).toBe("hmm");
      specimen.expect(messages[1].content).toEqual([{ type: "text", text: "so" }]);
    });
  });

  specimen.describe("translateTools", () => {
    specimen.it("maps a declaration list to type:function wrappers", () => {
      const out = translateTools([{ name: "look", valence: "look up", input: { type: "object" } }]);
      specimen.expect(out).toEqual([
        { type: "function", function: { name: "look", description: "look up", parameters: { type: "object" } } },
      ]);
    });

    specimen.it("missing valence/input default", () => {
      specimen.expect(translateTools([{ name: "x" }])[0]).toEqual({
        type: "function",
        function: { name: "x", description: "", parameters: { type: "object" } },
      });
    });
  });

  specimen.describe("translateResponse", () => {
    specimen.it("maps a completion to a Turn with meta", () => {
      const turn = translateResponse({
        model: "google/gemini-2.5-flash-lite",
        choices: [{ message: { role: "assistant", content: "hello" }, finish_reason: "stop" }],
        usage: { prompt_tokens: 1 },
      });
      specimen.expect(turn.role).toBe("assistant");
      specimen.expect(turn.parts).toEqual([{ type: "text", text: "hello" }]);
      specimen.expect(turn.meta).toEqual({
        state: "complete",
        usage: { prompt_tokens: 1 },
        provider: { finish_reason: "stop", model: "google/gemini-2.5-flash-lite" },
      });
    });

    specimen.it("maps tool_calls (arguments parsed to object) + reasoning", () => {
      const turn = translateResponse({
        model: "m",
        choices: [
          {
            message: {
              role: "assistant",
              content: null,
              reasoning: "hmm",
              tool_calls: [{ id: "t1", type: "function", function: { name: "look", arguments: '{"q":1}' } }],
            },
            finish_reason: "tool_calls",
          },
        ],
        usage: {},
      });
      specimen.expect(turn.parts[0]).toEqual({ type: "thinking", text: "hmm" });
      specimen.expect(turn.parts[1]).toEqual({ type: "tool_use", id: "t1", name: "look", input: { q: 1 } });
      specimen.expect(turn.meta.state).toBe("tools");
    });

    specimen.it("empty arguments string parses to {}", () => {
      const turn = translateResponse({
        model: "m",
        choices: [
          {
            message: { role: "assistant", tool_calls: [{ id: "t1", type: "function", function: { name: "look", arguments: "" } }] },
            finish_reason: "tool_calls",
          },
        ],
        usage: {},
      });
      specimen.expect(turn.parts[0].input).toEqual({});
    });
  });

  specimen.describe("streamTranslator", () => {
    specimen.it("first delta opens the turn, content opens a text part", () => {
      const translator = streamTranslator();
      const packets = translator.translate({ choices: [{ delta: { role: "assistant", content: "hi" } }] });
      specimen.expect(packets).toEqual([
        { event: "/turn/open", turn: { role: "assistant" } },
        { event: "/part/open", index: 0, part: { type: "text", text: "" } },
        { event: "/part/delta", index: 0, delta: { text: "hi" } },
      ]);
    });

    specimen.it("kind flip closes the open part and opens the next at the following index", () => {
      const translator = streamTranslator();
      translator.translate({ choices: [{ delta: { role: "assistant", reasoning: "hm" } }] });
      const packets = translator.translate({ choices: [{ delta: { content: "so" } }] });
      specimen.expect(packets).toEqual([
        { event: "/part/close", index: 0 },
        { event: "/part/open", index: 1, part: { type: "text", text: "" } },
        { event: "/part/delta", index: 1, delta: { text: "so" } },
      ]);
    });

    specimen.it("tool_call deltas open a tool_use part with input filled via string deltas", () => {
      const translator = streamTranslator();
      translator.translate({ choices: [{ delta: { role: "assistant" } }] });
      const opening = translator.translate({
        choices: [{ delta: { tool_calls: [{ index: 0, id: "t1", function: { name: "look", arguments: '{"q":' } }] } }],
      });
      specimen.expect(opening[0]).toEqual({
        event: "/part/open",
        index: 0,
        part: { type: "tool_use", id: "t1", name: "look", input: "" },
      });
      specimen.expect(opening[1]).toEqual({ event: "/part/delta", index: 0, delta: { input: '{"q":' } });
      const filling = translator.translate({
        choices: [{ delta: { tool_calls: [{ index: 0, function: { arguments: "1}" } }] } }],
      });
      specimen.expect(filling).toEqual([{ event: "/part/delta", index: 0, delta: { input: "1}" } }]);
    });

    specimen.it("finish_reason closes the part and holds /turn/close until the usage chunk", () => {
      const translator = streamTranslator();
      translator.translate({ choices: [{ delta: { role: "assistant", content: "hi" } }] });
      const finishing = translator.translate({ choices: [{ delta: {}, finish_reason: "stop" }] });
      specimen.expect(finishing).toEqual([{ event: "/part/close", index: 0 }]);
      const closing = translator.translate({ model: "m", choices: [], usage: { completion_tokens: 3 } });
      specimen.expect(closing).toEqual([
        {
          event: "/turn/close",
          meta: { state: "complete", usage: { completion_tokens: 3 }, provider: { finish_reason: "stop", model: undefined } },
        },
      ]);
      specimen.expect(translator.flush()).toEqual([]);
    });

    specimen.it("flush emits the held /turn/close when no usage chunk arrives", () => {
      const translator = streamTranslator();
      translator.translate({ choices: [{ delta: { role: "assistant", content: "hi" } }] });
      translator.translate({ model: "m", choices: [{ delta: {}, finish_reason: "stop" }] });
      const packets = translator.flush();
      specimen.expect(packets).toHaveLength(1);
      specimen.expect(packets[0].event).toBe("/turn/close");
      specimen.expect(packets[0].meta.usage).toBe(null);
    });
  });

  specimen.describe("buildParams (Request → chat.completions.create params)", () => {
    const request = () => ({
      turns: [
        { role: "system", parts: [{ type: "text", text: "sys" }] },
        { role: "user", parts: [{ type: "text", text: "hi" }] },
      ],
    });

    specimen.it("builds model/messages + default max_tokens; no stream", () => {
      const params = buildParams(light, request());
      specimen.expect(params.model).toBe(light.id);
      specimen.expect(params.messages[0].role).toBe("system");
      specimen.expect(params.messages[1].role).toBe("user");
      specimen.expect(params.max_tokens).toBe(8192);
      specimen.expect(params.stream).toBe(undefined);
    });

    specimen.it("settings.maxTokens overrides the default", () => {
      specimen.expect(buildParams(light, { ...request(), settings: { maxTokens: 500 } }).max_tokens).toBe(500);
    });

    specimen.it("stream=true sets params.stream + usage accounting", () => {
      const params = buildParams(light, request(), true);
      specimen.expect(params.stream).toBe(true);
      specimen.expect(params.usage).toEqual({ include: true });
    });

    specimen.it("a thinking model enables reasoning + bumps max_tokens to 32000", () => {
      const params = buildParams(strong, request());
      specimen.expect(params.reasoning).toEqual({ enabled: true });
      specimen.expect(params.max_tokens).toBe(32000);
    });

    specimen.it("settings.effort steers reasoning effort", () => {
      specimen.expect(buildParams(strong, { ...request(), settings: { effort: "high" } }).reasoning).toEqual({ effort: "high" });
    });

    specimen.it("a non-thinking model explicitly disables reasoning — provider defaults must not leak thinking", () => {
      specimen.expect(buildParams(light, request()).reasoning).toEqual({ enabled: false });
    });

    specimen.it("request.tools → translated params.tools", () => {
      const params = buildParams(light, { ...request(), tools: [{ name: "look", valence: "v", input: { type: "object" } }] });
      specimen.expect(params.tools).toEqual([
        { type: "function", function: { name: "look", description: "v", parameters: { type: "object" } } },
      ]);
    });

    specimen.it("no tools / tool_choice keys when absent", () => {
      const params = buildParams(light, request());
      specimen.expect(params.tools).toBe(undefined);
      specimen.expect(params.tool_choice).toBe(undefined);
    });

    specimen.it("request.output.object appends a respond tool + forces tool_choice to it", () => {
      const schema = { type: "object", properties: { verdict: { type: "string" } } };
      const params = buildParams(light, { ...request(), output: { object: schema } });
      specimen.expect(params.tools.at(-1)).toEqual({
        type: "function",
        function: { name: "respond", description: "Return the final result as structured data.", parameters: schema },
      });
      specimen.expect(params.tool_choice).toEqual({ type: "function", function: { name: "respond" } });
    });

    specimen.it("output.object appends respond after the mode's real tools", () => {
      const schema = { type: "object" };
      const params = buildParams(light, { ...request(), tools: [{ name: "look" }], output: { object: schema } });
      specimen.expect(params.tools.map((tool) => tool.function.name)).toEqual(["look", "respond"]);
    });

    specimen.it("cache marks: context pins cache_control on the last system content part", () => {
      const params = buildParams(light, { ...request(), cache: { marks: ["context"] } });
      specimen.expect(params.messages[0].content.at(-1).cache_control).toEqual({ type: "ephemeral" });
    });

    specimen.it("a record-shaped system section survives the context mark as a parts array", () => {
      const params = buildParams(light, {
        system: { persona: "You are Francesca.\n" },
        turns: [{ role: "user", parts: [{ type: "text", text: "ciao" }] }],
        cache: { marks: ["context"] },
      });
      const section = params.messages[0];
      specimen.expect(section.role).toBe("system");
      specimen.expect(section.content.at(-1).text).toBe("You are Francesca.\n");
      specimen.expect(section.content.at(-1).cache_control).toEqual({ type: "ephemeral" });
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

    specimen.it("statics.models replaces the default table", async () => {
      const faculties = await provider({
        secrets: { key: "fake-key" },
        statics: { models: { solo: { id: "qwen/qwen3-coder", tune: [0.5, 0.5, 0.5], context: 262144, thinking: false } } },
      });
      specimen.expect(faculties).toHaveLength(1);
      specimen.expect(faculties[0].context).toBe(262144);
    });
  });
});
