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
  };
}

const Tune = v.primitives.hallucination.Tune;

const Dialogue = v.object({
  type: v.const("dialogue"),
  id: v.string(),
  tune: Tune,
  context: v.integer(),
  thinking: v.boolean().optional(),
});

const Choice = v.object({
  type: v.const("choice"),
  id: v.string(),
  tune: Tune,
  context: v.integer(),
  options: v.integer({ minimum: 2 }),
  choices: v.union([v.integer({ minimum: 1 }), v.null()]),
});

const Picture = v.object({
  type: v.const("picture"),
  id: v.string(),
  tune: Tune,
  limits: v.object({
    references: v.integer(),
    mask: v.boolean(),
    aspects: v.array(v.string()),
  }),
});

const Faculties = v.array(v.union([Dialogue, Choice, Picture]));

export default async function provider(service) {
  const [violation] = v.faults(Faculties, service.faculties);
  if (violation) throw new Error(`[openrouter] faculties${violation.at} ${violation.reason}`);
  const client = new OpenAI({
    apiKey: service.secrets.key,
    baseURL: "https://openrouter.ai/api/v1",
  });

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

  const dialogue = (model) => {
    const { render, stream } = makeDialogue(model);
    return {
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
    };
  };

  const choice = (model) => ({
    type: "choice",
    id: model.id,
    tune: model.tune,
    context: model.context,
    options: model.options,
    choices: model.choices,
    channels: { in: ["text", "object"], out: ["object"] },
    via: makeChoice(model),
  });

  const picture = (model) => ({
    type: "picture",
    id: model.id,
    tune: model.tune,
    context: 0,
    channels: { in: ["text", "image"], out: ["image"] },
    limits: model.limits,
    via: makePicture(model),
  });

  const TYPES = { dialogue, choice, picture };

  return service.faculties.map((entry) => TYPES[entry.type](entry));
}
