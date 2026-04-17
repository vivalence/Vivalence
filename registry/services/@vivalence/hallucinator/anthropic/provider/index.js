// Anthropic faculty provider
// Contract: provider(service) → Faculty[]
// Exposes dialogue faculties at three tune points + object faculty.

import Anthropic from "@anthropic-ai/sdk";
import { translateTurns, translateTools, translateResponse, translateStreamEvent } from "./translate.js";

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
  const client = new Anthropic({ apiKey: service.secrets.anthropic });

  function makeDialogue(model) {
    const render = async (turns, config) => {
      const { system, messages } = translateTurns(turns);
      const params = {
        model: model.id,
        max_tokens: config?.maxTokens ?? 8192,
        system,
        messages,
      };
      if (model.thinking) {
        params.thinking = { type: "enabled", budget_tokens: config?.thinkingBudget ?? 16000 };
        params.max_tokens = config?.maxTokens ?? 32000;
      }
      if (config?.tools) params.tools = translateTools(config.tools);

      const response = await client.messages.create(params);
      return translateResponse(response);
    };

    const stream = async (turns, config) => {
      const { system, messages } = translateTurns(turns);
      const params = {
        model: model.id,
        max_tokens: config?.maxTokens ?? 8192,
        stream: true,
        system,
        messages,
      };
      if (model.thinking) {
        params.thinking = { type: "enabled", budget_tokens: config?.thinkingBudget ?? 16000 };
        params.max_tokens = config?.maxTokens ?? 32000;
      }
      if (config?.tools) params.tools = translateTools(config.tools);

      const raw = await client.messages.create(params);

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
