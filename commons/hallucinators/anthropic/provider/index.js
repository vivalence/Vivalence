import Anthropic from "@anthropic-ai/sdk";
import { v } from "@vivalence/typology";
import {
  buildParams,
  fault,
  RESPOND,
  streamTranslator,
  translateResponse,
} from "./translate.js";

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

const Dialogue = v.object({
  type: v.const("dialogue"),
  id: v.string(),
  tune: v.primitives.hallucination.Tune,
  context: v.integer(),
  thinking: v.boolean().optional(),
});

const Faculties = v.array(Dialogue);

export default async function provider(service) {
  const [violation] = v.faults(Faculties, service.faculties);
  if (violation) throw new Error(`[anthropic] faculties${violation.at} ${violation.reason}`);
  const client = new Anthropic({ apiKey: service.secrets.key });

  function makeDialogue(model) {
    const render = async (request, { signal } = {}) => {
      try {
        const turn = translateResponse(
          await client.messages.create(buildParams(model, request), { signal }),
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
        raw = await client.messages.create(buildParams(model, request, true), { signal });
      } catch (error) {
        throw fault(error);
      }
      return (async function* () {
        const translator = streamTranslator();
        for await (const event of raw) {
          for (const packet of translator.translate(event)) yield packet;
        }
      })();
    };

    return { render, stream };
  }

  const dialogue = (model) => {
    const { render, stream } = makeDialogue(model);
    return {
      ...model,
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

  const TYPES = { dialogue };

  return service.faculties.map((entry) => TYPES[entry.type](entry));
}
