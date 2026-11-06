import { OpenAI } from "openai";
import { v } from "@vivalence/typology";
import {
  buildParams,
  buildPicture,
  fault,
  readChoice,
  RESPOND,
  streamTranslator,
  translateChoice,
  translatePicture,
  translateResponse,
} from "./translate.js";

const DECISIONS = "https://openrouter.ai/api/alpha/decisions";
const IMAGES = "https://openrouter.ai/api/v1/images";

function extractObject(turn, schema) {
  const done = turn.parts.find((part) =>
    part.type === "tool_use" && part.name === RESPOND.name
  );
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
  strong: {
    id: "openai/gpt-5.1",
    tune: [0.8, 0.85, 0.35, 0.3],
    context: 400000,
    thinking: true,
  },
  standard: {
    id: "google/gemini-2.5-flash",
    tune: [0.45, 0.5, 0.85, 0.7],
    context: 1048576,
    thinking: false,
  },
  light: {
    id: "google/gemini-2.5-flash-lite",
    tune: [0.1, 0.1, 1.0, 0.95],
    context: 1048576,
    thinking: false,
  },
};

const choosers = {
  standard: {
    id: "typesafe/jev-1.13",
    tune: [0.4, 0.3, 1.0, 0.95],
    context: 32000,
    options: 255,
    choices: null,
  },
};

const painters = {
  capable: {
    id: "openai/gpt-image-2",
    tune: [0.8, 0.6, 0.4, 0.4],
    limits: { references: 16, mask: false, aspects: ["1:1", "3:2", "2:3"] },
  },
  balanced: {
    id: "black-forest-labs/flux.2-pro",
    tune: [0.6, 0.5, 0.6, 0.6],
    limits: { references: 8, mask: false, aspects: ["1:1", "3:2", "2:3", "4:3", "3:4", "16:9", "9:16"] },
  },
  fast: {
    id: "google/gemini-2.5-flash-image",
    tune: [0.4, 0.3, 0.9, 0.9],
    limits: { references: 3, mask: false, aspects: ["1:1", "2:3", "3:2", "3:4", "4:3", "4:5", "5:4", "9:16", "16:9", "21:9"] },
  },
};

export default async function provider(service) {
  const client = new OpenAI({
    apiKey: service.secrets.key,
    baseURL: "https://openrouter.ai/api/v1",
  });
  const table = service.statics?.models ?? models;
  const choosing = service.statics?.choosers ?? choosers;
  const pictures = service.statics?.pictures ?? painters;

  function makeDialogue(model) {
    const render = async (request, { signal } = {}) => {
      try {
        const turn = translateResponse(
          await client.chat.completions.create(buildParams(model, request), { signal }),
        );
        return request.output?.schema
          ? extractObject(turn, request.output.schema)
          : turn;
      } catch (error) {
        throw fault(error);
      }
    };

    const stream = async (request, { signal } = {}) => {
      let raw;
      try {
        raw = await client.chat.completions.create(
          buildParams(model, request, true),
          { signal },
        );
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

  function makeChoice(model) {
    const render = async (round, { signal } = {}) => {
      const response = await fetch(DECISIONS, {
        method: "POST",
        signal,
        headers: { authorization: `Bearer ${service.secrets.key}`, "content-type": "application/json" },
        body: JSON.stringify(translateChoice(model, round)),
      }).catch((error) => { throw fault(error); });
      const body = await response.json().catch(() => ({}));
      if (!response.ok) throw fault(Object.assign(new Error(body.error?.message ?? response.statusText), { status: response.status }));
      return readChoice(body, round);
    };
    return { render };
  }

  function makePicture(model) {
    const render = async (request, { signal } = {}) => {
      if (request.mask) throw new Error(`[openrouter] ${model.id}: openrouter paints no mask`);
      if (request.images.length > model.limits.references) {
        throw new Error(`[openrouter] ${model.id} takes at most ${model.limits.references} references, ${request.images.length} given`);
      }
      if (request.settings?.aspect && !model.limits.aspects.includes(request.settings.aspect)) {
        throw new Error(`[openrouter] ${model.id} paints ${model.limits.aspects.join(" · ")}, not ${request.settings.aspect}`);
      }
      const response = await fetch(IMAGES, {
        method: "POST",
        signal,
        headers: { Authorization: `Bearer ${service.secrets.key}`, "Content-Type": "application/json" },
        body: JSON.stringify(buildPicture(model, request)),
      }).catch((error) => { throw fault(error); });
      const body = await response.json().catch(() => ({}));
      if (!response.ok) throw fault(Object.assign(new Error(body.error?.message ?? response.statusText), { status: response.status }));
      return translatePicture(body);
    };
    return { render };
  }

  const faculties = [];

  for (const [, model] of Object.entries(table)) {
    const { render, stream } = makeDialogue(model);
    faculties.push({
      type: "dialogue",
      id: model.id,
      tune: model.tune,
      context: model.context,
      channels: {
        in: [
          "text",
          "image",
          "document",
          "tool_result",
          ...(model.thinking ? ["thinking"] : []),
        ],
        out: ["text", "tool_use", ...(model.thinking ? ["thinking"] : [])],
      },
      via: { render, stream },
    });
  }

  for (const [, model] of Object.entries(choosing)) {
    faculties.push({
      type: "choice",
      id: model.id,
      tune: model.tune,
      context: model.context,
      options: model.options,
      choices: model.choices,
      channels: { in: ["text", "object"], out: ["object"] },
      via: makeChoice(model),
    });
  }

  for (const [, model] of Object.entries(pictures)) {
    faculties.push({
      type: "picture",
      id: model.id,
      tune: model.tune,
      context: 0,
      channels: { in: ["text", "image"], out: ["image"] },
      limits: model.limits,
      via: makePicture(model),
    });
  }

  return faculties;
}
