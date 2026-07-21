// Anthropic faculty provider
// Contract: provider(service) → Faculty[]
// Exposes dialogue faculties at three tune points + object faculty.

import Anthropic from "@anthropic-ai/sdk";
import { v } from "@vivalence/typology";
import { buildParams, translateResponse, translateStreamEvent, fault, RESPOND } from "./translate.js";

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
  opus: { id: "claude-opus-4-6", tune: [0.9, 1.0, 0.3], context: 1000000, thinking: true },
  sonnet: { id: "claude-sonnet-4-6", tune: [0.5, 0.7, 0.7], context: 1000000, thinking: false },
  haiku: {
    id: "claude-haiku-4-5-20251001",
    tune: [0.1, 0.3, 1.0],
    context: 200000,
    thinking: false,
  },
};

export default async function provider(service) {
  const client = new Anthropic({ apiKey: service.secrets.key });

  function makeDialogue(model) {
    const render = async (request) => {
      try {
        const turn = translateResponse(await client.messages.create(buildParams(model, request)));
        return request.output?.object ? extractObject(turn, request.output.object) : turn;
      } catch (error) {
        throw fault(error);
      }
    };

    const stream = async (request) => {
      let raw;
      try {
        raw = await client.messages.create(buildParams(model, request, true));
      } catch (error) {
        throw fault(error);
      }
      return (async function* () {
        for await (const event of raw) {
          const packet = translateStreamEvent(event);
          if (packet) yield packet;
        }
      })();
    };

    return { render, stream };
  }

  const faculties = [];

  for (const [, model] of Object.entries(models)) {
    const { render, stream } = makeDialogue(model);
    faculties.push({
      type: "dialogue",
      tune: model.tune,
      context: model.context,
      channels: {
        in: ["text", "image", "document", "tool_result", ...(model.thinking ? ["thinking"] : [])],
        out: ["text", "tool_use", ...(model.thinking ? ["thinking"] : [])],
      },
      via: { render, stream },
    });
  }

  return faculties;
}
