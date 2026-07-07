// Anthropic faculty provider
// Contract: provider(service) → Faculty[]
// Exposes dialogue faculties at three tune points + object faculty.

import Anthropic from "@anthropic-ai/sdk";
import { buildParams, translateResponse, translateStreamEvent } from "./translate.js";

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
    const render = async (request) =>
      translateResponse(await client.messages.create(buildParams(model, request)));

    const stream = async (request) => {
      const raw = await client.messages.create(buildParams(model, request, true));
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
