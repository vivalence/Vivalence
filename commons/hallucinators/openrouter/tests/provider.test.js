import { specimen, v } from "@vivalence/typology";
import provider from "../provider/index.js";
import {
  buildParams,
  readChoice,
  streamTranslator,
  translateChoice,
  translateResponse,
  translateTools,
  translateTurns,
} from "../provider/translate.js";

const strong = { id: "openai/gpt-5.1", tune: [0.9, 1.0, 0.3], thinking: true };
const light = {
  id: "google/gemini-2.5-flash-lite",
  tune: [0.1, 0.3, 1.0],
  thinking: false,
};

specimen.describe("openrouter provider", () => {
  specimen.describe("translateTurns", () => {
    specimen.it(
      "keeps system turns inline as system messages with content parts",
      () => {
        const messages = translateTurns([
          { role: "system", parts: [{ type: "text", text: "sys" }] },
          { role: "user", parts: [{ type: "text", text: "hi" }] },
          { role: "assistant", parts: [{ type: "text", text: "yo" }] },
        ]);
        specimen.expect(messages[0]).toEqual({
          role: "system",
          content: [{ type: "text", text: "sys" }],
        });
        specimen.expect(messages[1]).toEqual({
          role: "user",
          content: [{ type: "text", text: "hi" }],
        });
        specimen.expect(messages[2]).toEqual({
          role: "assistant",
          content: [{ type: "text", text: "yo" }],
        });
      },
    );

    specimen.it(
      "assistant tool_use parts fold into message.tool_calls with stringified arguments",
      () => {
        const messages = translateTurns([
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
        specimen.expect(messages[0]).toEqual({
          role: "assistant",
          tool_calls: [{
            id: "t1",
            type: "function",
            function: { name: "look", arguments: JSON.stringify({ q: 1 }) },
          }],
        });
      },
    );

    specimen.it(
      "tool_result parts split into role:tool messages ahead of remaining user content",
      () => {
        const messages = translateTurns([
          {
            role: "user",
            parts: [
              { type: "text", text: "and also" },
              { type: "tool_result", id: "t1", output: { r: 2 } },
            ],
          },
        ]);
        specimen.expect(messages[0]).toEqual({
          role: "tool",
          tool_call_id: "t1",
          content: JSON.stringify({ r: 2 }),
        });
        specimen.expect(messages[1]).toEqual({
          role: "user",
          content: [{ type: "text", text: "and also" }],
        });
      },
    );

    specimen.it(
      "an assistant turn carrying its own tool_result splits into tool_calls then role:tool — same wire as a sync round",
      () => {
        const messages = translateTurns([
          {
            role: "assistant",
            parts: [
              { type: "text", text: "done" },
              { type: "tool_use", id: "a1", name: "appraise", input: {} },
              {
                type: "tool_result",
                id: "a1",
                output: { object: [{ literal: "vedere", signal: "SUCCESS" }] },
              },
            ],
          },
        ]);
        specimen.expect(messages[0]).toEqual({
          role: "assistant",
          content: [{ type: "text", text: "done" }],
          tool_calls: [{
            id: "a1",
            type: "function",
            function: { name: "appraise", arguments: "{}" },
          }],
        });
        specimen.expect(messages[1]).toEqual({
          role: "tool",
          tool_call_id: "a1",
          content: JSON.stringify({ object: [{ literal: "vedere", signal: "SUCCESS" }] }),
        });
      },
    );

    specimen.it(
      "translates image parts to data-url image_url; assistant thinking folds into message.reasoning",
      () => {
        const messages = translateTurns([
          {
            role: "user",
            parts: [{ type: "image", data: "abc", media: "image/png" }],
          },
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
        specimen.expect(messages[1].content).toEqual([{
          type: "text",
          text: "so",
        }]);
      },
    );
  });

  specimen.describe("translateTools", () => {
    specimen.it("maps a declaration list to type:function wrappers", () => {
      const out = translateTools([{
        name: "look",
        valence: "look up",
        input: { type: "object" },
      }]);
      specimen.expect(out).toEqual([
        {
          type: "function",
          function: {
            name: "look",
            description: "look up",
            parameters: { type: "object" },
          },
        },
      ]);
    });

    specimen.it("missing valence/input default", () => {
      specimen.expect(translateTools([{ name: "x" }])[0]).toEqual({
        type: "function",
        function: {
          name: "x",
          description: "",
          parameters: { type: "object" },
        },
      });
    });

    specimen.it("a nested $id never reaches the wire — gpt-5.1 answers it with finish_reason length and no output (buffer_label, 09-23)", () => {
      const out = translateTools([{
        name: "buffer_label",
        valence: "Name a buffer.",
        input: {
          type: "object",
          required: ["id", "label"],
          properties: {
            id: { type: "string" },
            label: { type: "object", required: ["name"], properties: { name: { type: "string" } }, $id: "Label" },
          },
        },
      }]);
      specimen.expect(JSON.stringify(out)).not.toContain("$id");
      specimen.expect(out[0].function.parameters.properties.label).toEqual({
        type: "object",
        required: ["name"],
        properties: { name: { type: "string" } },
      });
    });
  });

  specimen.describe("translateResponse", () => {
    specimen.it("maps a completion to a Turn with meta", () => {
      const turn = translateResponse({
        model: "google/gemini-2.5-flash-lite",
        choices: [{
          message: { role: "assistant", content: "hello" },
          finish_reason: "stop",
        }],
        usage: { prompt_tokens: 1 },
      });
      specimen.expect(turn.role).toBe("assistant");
      specimen.expect(turn.parts).toEqual([{ type: "text", text: "hello" }]);
      specimen.expect(turn.meta).toEqual({
        state: "complete",
        usage: { prompt_tokens: 1 },
        provider: {
          finish_reason: "stop",
          model: "google/gemini-2.5-flash-lite",
        },
      });
    });

    specimen.it(
      "maps tool_calls (arguments parsed to object) + reasoning",
      () => {
        const turn = translateResponse({
          model: "m",
          choices: [
            {
              message: {
                role: "assistant",
                content: null,
                reasoning: "hmm",
                tool_calls: [{
                  id: "t1",
                  type: "function",
                  function: { name: "look", arguments: '{"q":1}' },
                }],
              },
              finish_reason: "tool_calls",
            },
          ],
          usage: {},
        });
        specimen.expect(turn.parts[0]).toEqual({
          type: "thinking",
          text: "hmm",
        });
        specimen.expect(turn.parts[1]).toEqual({
          type: "tool_use",
          id: "t1",
          name: "look",
          input: { q: 1 },
        });
        specimen.expect(turn.meta.state).toBe("tools");
      },
    );

    specimen.it("empty arguments string parses to {}", () => {
      const turn = translateResponse({
        model: "m",
        choices: [
          {
            message: {
              role: "assistant",
              tool_calls: [{
                id: "t1",
                type: "function",
                function: { name: "look", arguments: "" },
              }],
            },
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
      const packets = translator.translate({
        choices: [{ delta: { role: "assistant", content: "hi" } }],
      });
      specimen.expect(packets).toEqual([
        { event: "/turn/open", turn: { role: "assistant" } },
        { event: "/part/open", index: 0, part: { type: "text", text: "" } },
        { event: "/part/delta", index: 0, delta: { text: "hi" } },
      ]);
    });

    specimen.it(
      "kind flip closes the open part and opens the next at the following index",
      () => {
        const translator = streamTranslator();
        translator.translate({
          choices: [{ delta: { role: "assistant", reasoning: "hm" } }],
        });
        const packets = translator.translate({
          choices: [{ delta: { content: "so" } }],
        });
        specimen.expect(packets).toEqual([
          { event: "/part/close", index: 0 },
          { event: "/part/open", index: 1, part: { type: "text", text: "" } },
          { event: "/part/delta", index: 1, delta: { text: "so" } },
        ]);
      },
    );

    specimen.it(
      "tool_call deltas open a tool_use part with input filled via string deltas",
      () => {
        const translator = streamTranslator();
        translator.translate({ choices: [{ delta: { role: "assistant" } }] });
        const opening = translator.translate({
          choices: [{
            delta: {
              tool_calls: [{
                index: 0,
                id: "t1",
                function: { name: "look", arguments: '{"q":' },
              }],
            },
          }],
        });
        specimen.expect(opening[0]).toEqual({
          event: "/part/open",
          index: 0,
          part: { type: "tool_use", id: "t1", name: "look", input: "" },
        });
        specimen.expect(opening[1]).toEqual({
          event: "/part/delta",
          index: 0,
          delta: { input: '{"q":' },
        });
        const filling = translator.translate({
          choices: [{
            delta: {
              tool_calls: [{ index: 0, function: { arguments: "1}" } }],
            },
          }],
        });
        specimen.expect(filling).toEqual([{
          event: "/part/delta",
          index: 0,
          delta: { input: "1}" },
        }]);
      },
    );

    specimen.it(
      "finish_reason closes the part and holds /turn/close until the usage chunk",
      () => {
        const translator = streamTranslator();
        translator.translate({
          choices: [{ delta: { role: "assistant", content: "hi" } }],
        });
        const finishing = translator.translate({
          choices: [{ delta: {}, finish_reason: "stop" }],
        });
        specimen.expect(finishing).toEqual([{
          event: "/part/close",
          index: 0,
        }]);
        const closing = translator.translate({
          model: "m",
          choices: [],
          usage: { completion_tokens: 3 },
        });
        specimen.expect(closing).toEqual([
          {
            event: "/turn/close",
            meta: {
              state: "complete",
              usage: { completion_tokens: 3 },
              provider: { finish_reason: "stop", model: undefined },
            },
          },
        ]);
        specimen.expect(translator.flush()).toEqual([]);
      },
    );

    specimen.it(
      "flush emits the held /turn/close when no usage chunk arrives",
      () => {
        const translator = streamTranslator();
        translator.translate({
          choices: [{ delta: { role: "assistant", content: "hi" } }],
        });
        translator.translate({
          model: "m",
          choices: [{ delta: {}, finish_reason: "stop" }],
        });
        const packets = translator.flush();
        specimen.expect(packets).toHaveLength(1);
        specimen.expect(packets[0].event).toBe("/turn/close");
        specimen.expect(packets[0].meta.usage).toBe(null);
      },
    );
  });

  specimen.describe(
    "buildParams (Request → chat.completions.create params)",
    () => {
      const request = () => ({
        turns: [
          { role: "system", parts: [{ type: "text", text: "sys" }] },
          { role: "user", parts: [{ type: "text", text: "hi" }] },
        ],
      });

      specimen.it(
        "builds model/messages + default max_tokens; no stream",
        () => {
          const params = buildParams(light, request());
          specimen.expect(params.model).toBe(light.id);
          specimen.expect(params.messages[0].role).toBe("system");
          specimen.expect(params.messages[1].role).toBe("user");
          specimen.expect(params.max_tokens).toBe(8192);
          specimen.expect(params.stream).toBe(undefined);
        },
      );

      specimen.it("settings.maxTokens overrides the default", () => {
        specimen.expect(
          buildParams(light, { ...request(), settings: { maxTokens: 500 } })
            .max_tokens,
        ).toBe(500);
      });

      specimen.it("stream=true sets params.stream + usage accounting", () => {
        const params = buildParams(light, request(), true);
        specimen.expect(params.stream).toBe(true);
        specimen.expect(params.usage).toEqual({ include: true });
      });

      specimen.it(
        "a thinking model enables reasoning + bumps max_tokens to 32000",
        () => {
          const params = buildParams(strong, request());
          specimen.expect(params.reasoning).toEqual({ enabled: true });
          specimen.expect(params.max_tokens).toBe(32000);
        },
      );

      specimen.it("settings.effort steers reasoning effort", () => {
        specimen.expect(
          buildParams(strong, { ...request(), settings: { effort: "high" } })
            .reasoning,
        ).toEqual({ effort: "high" });
      });

      specimen.it("effort none disables reasoning on a thinking model", () => {
        specimen.expect(
          buildParams(strong, { ...request(), settings: { effort: "none" } })
            .reasoning,
        ).toEqual({ enabled: false });
      });

      specimen.it(
        "a non-thinking model explicitly disables reasoning — provider defaults must not leak thinking",
        () => {
          specimen.expect(buildParams(light, request()).reasoning).toEqual({
            enabled: false,
          });
        },
      );

      specimen.it("request.tools → translated params.tools", () => {
        const params = buildParams(light, {
          ...request(),
          tools: [{ name: "look", valence: "v", input: { type: "object" } }],
        });
        specimen.expect(params.tools).toEqual([
          {
            type: "function",
            function: {
              name: "look",
              description: "v",
              parameters: { type: "object" },
            },
          },
        ]);
      });

      specimen.it("no tools / tool_choice keys when absent", () => {
        const params = buildParams(light, request());
        specimen.expect(params.tools).toBe(undefined);
        specimen.expect(params.tool_choice).toBe(undefined);
      });

      specimen.it(
        "request.output.object appends a respond tool + forces tool_choice to it",
        () => {
          const schema = {
            type: "object",
            properties: { verdict: { type: "string" } },
          };
          const params = buildParams(light, {
            ...request(),
            output: { schema },
          });
          specimen.expect(params.tools.at(-1)).toEqual({
            type: "function",
            function: {
              name: "respond",
              description: "Return the final result as structured data.",
              parameters: schema,
            },
          });
          specimen.expect(params.tool_choice).toEqual({
            type: "function",
            function: { name: "respond" },
          });
        },
      );

      specimen.it(
        "output.object appends respond after the mode's real tools",
        () => {
          const schema = { type: "object" };
          const params = buildParams(light, {
            ...request(),
            tools: [{ name: "look" }],
            output: { schema },
          });
          specimen.expect(params.tools.map((tool) => tool.function.name))
            .toEqual(["look", "respond"]);
        },
      );

      specimen.it(
        "cache marks: context pins cache_control on the last system content part",
        () => {
          const params = buildParams(light, {
            ...request(),
            cache: { marks: ["context"] },
          });
          specimen.expect(params.messages[0].content.at(-1).cache_control)
            .toEqual({ type: "ephemeral" });
        },
      );

      specimen.it(
        "a record-shaped system section survives the context mark as a parts array",
        () => {
          const params = buildParams(light, {
            system: { persona: "You are Francesca.\n" },
            turns: [{ role: "user", parts: [{ type: "text", text: "ciao" }] }],
            cache: { marks: ["context"] },
          });
          const section = params.messages[0];
          specimen.expect(section.role).toBe("system");
          specimen.expect(section.content.at(-1).text).toBe(
            "You are Francesca.\n",
          );
          specimen.expect(section.content.at(-1).cache_control).toEqual({
            type: "ephemeral",
          });
        },
      );
    },
  );

  specimen.describe("provider(service)", () => {
    specimen.it(
      "returns 3 dialogue faculties (no network) with render + stream, one choice faculty and three picture faculties with render only",
      async () => {
        const faculties = await provider({ secrets: { key: "fake-key" } });
        specimen.expect(faculties).toHaveLength(7);
        for (const faculty of faculties.filter((faculty) => faculty.type === "dialogue")) {
          specimen.expect(Array.isArray(faculty.tune)).toBe(true);
          specimen.expect(typeof faculty.via.render).toBe("function");
          specimen.expect(typeof faculty.via.stream).toBe("function");
        }
        const [choice] = faculties.filter((faculty) => faculty.type === "choice");
        specimen.expect(choice.id).toBe("typesafe/jev-1.13");
        specimen.expect([choice.context, choice.options, choice.choices]).toEqual([32000, 255, null]);
        specimen.expect(Object.keys(choice.via)).toEqual(["render"]);
      },
    );

    specimen.it("translateChoice is the decisions dialect — system to state, the tag to type, options and levels to criteria; readChoice folds the answers back in the caller's order (live body 09-24)", () => {
      const round = {
        system: { expected: "Vado al mercato.", answer: "Io vado al mercato domani." },
        questions: {
          same: { type: "choice", ask: "Does `answer` mean `expected`?", options: { yes: null, partly: "extra or missing detail", no: null } },
          grade: { type: "score", ask: "How close is `answer` to `expected`?", levels: ["wrong", "close", "exact"] },
          ok: { type: "noul", ask: "Is `answer` grammatical Italian?" },
        },
      };
      specimen.expect(translateChoice({ id: "typesafe/jev-1.13" }, round)).toEqual({
        model: "typesafe/jev-1.13",
        state: { expected: "Vado al mercato.", answer: "Io vado al mercato domani." },
        questions: {
          same: { type: "choice", instructions: "Does `answer` mean `expected`?", criteria: { yes: null, partly: "extra or missing detail", no: null } },
          grade: { type: "score", instructions: "How close is `answer` to `expected`?", criteria: ["wrong", "close", "exact"] },
          ok: { type: "noul", instructions: "Is `answer` grammatical Italian?" },
        },
      });
      const body = {
        model: "typesafe/jev-1.13-20260917",
        answers: {
          same: { type: "choice", choice: "partly", probabilities: { partly: 0.96, no: 0.01, yes: 0.03 }, confidence: 0.93 },
          grade: { type: "score", score: 1.01, legend: { 0: "wrong", 1: "close", 2: "exact" }, probabilities: { 0: 0.01, 1: 0.97, 2: 0.02 }, confidence: 0.97 },
          ok: { type: "noul", noul: 0.97 },
        },
        usage: { input_tokens: 397, output_tokens: 70, cost: 1.6674e-05 },
      };
      const verdict = readChoice(body, round);
      specimen.expect(Object.keys(verdict.same)).toEqual(["yes", "partly", "no"]);
      specimen.expect(verdict).toEqual({ same: { yes: 0.03, partly: 0.96, no: 0.01 }, grade: [0.01, 0.97, 0.02], ok: 0.97 });
      specimen.expect(() => readChoice({ model: "m", answers: {} }, round)).toThrow(/answered no "same"/);
    });

    specimen.it(
      "only the thinking model exposes thinking channels",
      async () => {
        const faculties = await provider({ secrets: { key: "fake-key" } });
        const thinking = faculties.filter((faculty) =>
          faculty.channels.out.includes("thinking")
        );
        specimen.expect(thinking).toHaveLength(1);
      },
    );

    specimen.it("statics.models replaces the default table", async () => {
      const faculties = await provider({
        secrets: { key: "fake-key" },
        statics: {
          models: {
            solo: {
              id: "qwen/qwen3-coder",
              tune: [0.5, 0.5, 0.5],
              context: 262144,
              thinking: false,
            },
          },
        },
      });
      specimen.expect(faculties.filter((faculty) => faculty.type === "dialogue")).toHaveLength(1);
      specimen.expect(faculties[0].context).toBe(262144);
    });
  });

  specimen.describe("picture faculties", () => {
    const original = globalThis.fetch;
    const service = { secrets: { key: "sk-or-test" } };
    const PNG = "iVBORw0KGgo";
    const picture = (data) => ({ type: "image", media: "image/png", data });
    const OK = {
      created: 1762700000,
      data: [{ b64_json: PNG, media_type: "image/png" }],
      usage: { prompt_tokens: 12, completion_tokens: 4160, total_tokens: 4172, cost: 0.04 },
    };
    let calls;

    const stub = (status, body) => {
      calls = [];
      globalThis.fetch = (url, init) => {
        calls.push({ url, init, body: JSON.parse(init.body) });
        return Promise.resolve(new Response(JSON.stringify(body), { status }));
      };
    };

    specimen.afterEach(() => {
      globalThis.fetch = original;
    });

    const faculty = async (id) => (await provider(service)).find((each) => each.id === id);

    specimen.it("offers three picture faculties after the choice rows, each a valid Faculty", async () => {
      const faculties = await provider(service);
      const pictures = faculties.filter((each) => each.type === "picture");
      specimen.expect(pictures.map((each) => each.id)).toEqual([
        "openai/gpt-image-2",
        "black-forest-labs/flux.2-pro",
        "google/gemini-2.5-flash-image",
      ]);
      specimen.expect(faculties.slice(-3)).toEqual(pictures);
      for (const each of pictures) {
        specimen.expect(Object.keys(each.via)).toEqual(["render"]);
        specimen.expect(each.context).toBe(0);
        specimen.expect(each.limits.mask).toBe(false);
        specimen.expect([...v.primitives.hallucination.Faculty.errors(each)]).toEqual([]);
      }
    });

    specimen.it("a bare prompt posts model, prompt, aspect_ratio and n with the bearer key", async () => {
      stub(200, OK);
      const flux = await faculty("black-forest-labs/flux.2-pro");
      await flux.via.render({ prompt: "a red fox", images: [], settings: { aspect: "16:9", count: 2, seed: 7 } });
      specimen.expect(calls).toHaveLength(1);
      specimen.expect(calls[0].url).toBe("https://openrouter.ai/api/v1/images");
      specimen.expect(calls[0].init.headers.Authorization).toBe("Bearer sk-or-test");
      specimen.expect(calls[0].body).toEqual({ model: "black-forest-labs/flux.2-pro", prompt: "a red fox", aspect_ratio: "16:9", n: 2, seed: 7 });
    });

    specimen.it("two references post as two input_references data urls", async () => {
      stub(200, OK);
      const gpt = await faculty("openai/gpt-image-2");
      await gpt.via.render({
        prompt: "put the mug on the desk",
        images: [{ image: picture("AAAA"), role: "init" }, { image: { type: "image", media: "image/jpeg", data: "BBBB" }, role: "subject" }],
        settings: { format: "webp", background: "opaque", size: "1536x1024" },
      });
      specimen.expect(calls[0].body).toEqual({
        model: "openai/gpt-image-2",
        prompt: "put the mug on the desk",
        input_references: [
          { type: "image_url", image_url: { url: "data:image/png;base64,AAAA" } },
          { type: "image_url", image_url: { url: "data:image/jpeg;base64,BBBB" } },
        ],
        size: "1536x1024",
        output_format: "webp",
        background: "opaque",
      });
    });

    specimen.it("the answer is a valid Picture.Response, media from media_type", async () => {
      stub(200, OK);
      const gemini = await faculty("google/gemini-2.5-flash-image");
      const response = await gemini.via.render({ prompt: "a red fox", images: [] });
      specimen.expect(response).toEqual({ images: [{ type: "image", media: "image/png", data: PNG }], usage: OK.usage });
      specimen.expect([...v.primitives.hallucination.Picture.Response.errors(response)]).toEqual([]);
    });

    specimen.it("a mask is refused before any fetch", async () => {
      stub(200, OK);
      const gpt = await faculty("openai/gpt-image-2");
      const request = { prompt: "fill the hole", images: [{ image: picture("AAAA"), role: "init" }], mask: picture("MMMM") };
      await specimen.expect(gpt.via.render(request)).rejects.toThrow("openrouter paints no mask");
      specimen.expect(calls).toHaveLength(0);
    });

    specimen.it("more references than the row's limit are refused before any fetch", async () => {
      stub(200, OK);
      const gemini = await faculty("google/gemini-2.5-flash-image");
      const images = Array.from({ length: 4 }, () => ({ image: picture("AAAA"), role: "style" }));
      await specimen.expect(gemini.via.render({ prompt: "collage", images })).rejects.toThrow("at most 3 references, 4 given");
      specimen.expect(calls).toHaveLength(0);
    });

    specimen.it("an aspect the row lacks is refused before any fetch", async () => {
      stub(200, OK);
      const gpt = await faculty("openai/gpt-image-2");
      await specimen.expect(gpt.via.render({ prompt: "a wide fox", images: [], settings: { aspect: "21:9" } })).rejects.toThrow("not 21:9");
      specimen.expect(calls).toHaveLength(0);
    });

    specimen.it("a 502 faults overloaded, retryable", async () => {
      stub(502, { error: { message: "Generation failed" } });
      const flux = await faculty("black-forest-labs/flux.2-pro");
      const error = await flux.via.render({ prompt: "a fox", images: [] }).catch((caught) => caught);
      specimen.expect(error).toEqual({ kind: "overloaded", retryable: true, provider: { status: 502, message: "Generation failed" } });
    });

    specimen.it("statics.pictures replaces the picture table", async () => {
      const faculties = await provider({
        secrets: { key: "sk-or-test" },
        statics: {
          pictures: {
            solo: { id: "bytedance-seed/seedream-4.5", tune: [0.5, 0.5, 0.5, 0.5], limits: { references: 8, mask: false, aspects: ["1:1"] } },
          },
        },
      });
      const pictures = faculties.filter((each) => each.type === "picture");
      specimen.expect(pictures.map((each) => each.id)).toEqual(["bytedance-seed/seedream-4.5"]);
      specimen.expect(pictures[0].limits.references).toBe(8);
    });

    specimen.it("fetch is restored after each step", () => {
      specimen.expect(globalThis.fetch).toBe(original);
    });
  });
});
