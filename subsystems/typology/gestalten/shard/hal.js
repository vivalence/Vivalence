import { Queue } from "../../prototypes/queue.js";
import * as soma from "../belt/soma.js";

async function* polishing(packets, repair) {
  const polishes = new Queue();
  let turn = null;
  let inflight = 0;
  let drained = false;

  const settle = () => {
    if (drained && !inflight) polishes.close();
  };

  const polish = (sealed, index) => {
    const text = sealed.parts[index].text.trim();
    if (!text) return;
    inflight += 1;
    Promise.resolve(repair(text))
      .then((corrected) => {
        if (!corrected || corrected === text) return;
        polishes.enqueue({
          event: "/part/full",
          index,
          part: { type: "text", text: corrected },
          turn: sealed.id,
        });
      })
      .catch(() => {})
      .finally(() => {
        inflight -= 1;
        settle();
      });
  };

  const upstream = (async function* () {
    try {
      for await (const packet of packets) {
        turn = soma.pour(turn, packet);
        if (packet.event === "/turn/close" && turn.role === "user")
          for (const [index, part] of turn.parts.entries()) if (part.type === "text") polish(turn, index);
        yield packet;
      }
    } finally {
      drained = true;
      settle();
    }
  })();

  yield* soma.merge(upstream, polishes.drain());
}

const repairing = (ctx, controller, polish) => {
  const { engaged, ...selector } = ctx.conversational.polish;
  const repair = async (text) => {
    const rendered = await ctx.cortex.hallucinate.dialogue.render({
      controller: controller.branch("dialogue"),
      system: { polish },
      turns: [{ role: "user", parts: [{ type: "text", text }] }],
      settings: { effort: "none" },
      policy: { tier: "fast", ...selector, rounds: 1 },
    });
    return rendered.product.message?.trim() ?? null;
  };
  return (packets) => (engaged ? polishing(packets, repair) : packets);
};

const heard = (ctx, name) => {
  const source = ctx.input.source ?? (ctx.request.raw?.body && ctx.request.subscribe());
  if (!source) throw new Error(`[hal.${name}] no audio source — pass input.source or feed the request body`);
  return source;
};

export const verbatim = ({ polish, tier } = {}) => async (ctx) => {
  const conversational = ctx.conversational;
  const source = heard(ctx, "verbatim");
  const hear = conversational.hear;
  const picked = { provider: hear.provider, id: hear.id, tier: hear.tier ?? tier, tune: hear.tune };
  const controller = ctx.controller;
  const events = await ctx.cortex.hallucinate.verbatim.stream({
    controller: controller.branch("verbatim"),
    source,
    settings: { language: conversational.language },
    policy: { ...picked, ...(conversational.harmonize && { harmonize: conversational.harmonize }) },
  });
  ctx.output = controlled(controller, repairing(ctx, controller, polish)(events));
};

export const call = ({ polish, tier } = {}) => async (ctx) => {
  const conversational = ctx.conversational;
  const source = heard(ctx, "call");
  const organ = (selector) => ({ ...selector, tier: selector.tier ?? tier });
  const { controller, policy, ...request } = ctx.hallucination;
  const packets = await ctx.cortex.hallucinate.call.stream({
    ...request,
    controller: controller.branch("call"),
    source,
    settings: { ...request.settings, language: conversational.language },
    policy: {
      ...conversational.call,
      hear: organ(conversational.hear),
      mind: { provider: policy.provider, id: policy.id, tier: policy.tier ?? tier, tune: policy.tune },
      speak: organ(conversational.speak),
      ...(policy.rounds && { rounds: policy.rounds }),
    },
  });
  ctx.output = controlled(controller, repairing(ctx, controller, polish)(packets));
};

async function* controlled(controller, output) {
  controller.start();
  try {
    yield* output;
  } catch (fault) {
    controller.fault(fault);
    throw fault;
  } finally {
    controller.stop();
  }
}

export const voice = () => async (ctx, next) => {
  await next();
  if (!ctx.output?.[Symbol.asyncIterator]) return;
  ctx.output = soma.channel(ctx.output, "dialogue");
};

const layers = ["policy", "settings", "system", "output"];

export const defaults = (record) => async (ctx, next) => {
  for (const layer of layers)
    for (const [key, value] of Object.entries(record[layer] ?? {}))
      (ctx.hallucination[layer] ??= {})[key] ??= value;
  await next();
};
