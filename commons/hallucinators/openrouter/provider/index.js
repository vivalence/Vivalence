import { OpenAI } from "openai";
import { v } from "@vivalence/typology";
import { buildParams, translateResponse, streamTranslator, fault, RESPOND } from "./translate.js";

function extractObject(turn, schema) {
  const done = turn.parts.find((part) => part.type === "tool_use" && part.name === RESPOND.name);
  if (!done) return turn;
  const data = schema ? v.fill(schema, done.input) : done.input;
  return {
    role: "assistant",
    parts: [{ type: "object", data }],
    meta: { ...turn.meta, state: "complete" },
    object: data,
  };
}

const models = {
  strong: { id: "openai/gpt-5.1", tune: [0.8, 0.85, 0.35, 0.3], context: 400000, thinking: true },
  standard: { id: "google/gemini-2.5-flash", tune: [0.45, 0.5, 0.85, 0.7], context: 1048576, thinking: false },
  light: { id: "google/gemini-2.5-flash-lite", tune: [0.1, 0.1, 1.0, 0.95], context: 1048576, thinking: false },
};

export default async function provider(service) {
  const client = new OpenAI({ apiKey: service.secrets.key, baseURL: "https://openrouter.ai/api/v1" });
  const table = service.statics?.models ?? models;

  function makeDialogue(model) {
    const render = async (request) => {
      try {
        const turn = translateResponse(await client.chat.completions.create(buildParams(model, request)));
        return request.output?.schema ? extractObject(turn, request.output.schema) : turn;
      } catch (error) {
        throw fault(error);
      }
    };

    const stream = async (request) => {
      let raw;
      try {
        raw = await client.chat.completions.create(buildParams(model, request, true));
      } catch (error) {
        throw fault(error);
      }
      return (async function* () {
        const translator = streamTranslator();
        for await (const chunk of raw) {
          for (const packet of translator.translate(chunk)) yield packet;
        }
        for (const packet of translator.flush()) yield packet;
      })();
    };

    return { render, stream };
  }

  const faculties = [];

  for (const [, model] of Object.entries(table)) {
    const { render, stream } = makeDialogue(model);
    faculties.push({
      type: "dialogue",
      tune: model.tune,
      context: model.context,
      channels: {
        in: ["text", "image", "document", "tool_result", ...(model.thinking ? ["thinking"] : [])],
        out: ["text", "tool_use", ...(model.thinking ? ["thinking"] : [])],
      },
      config: { model: model.id },
      via: { render, stream },
    });
  }

  return faculties;
}
