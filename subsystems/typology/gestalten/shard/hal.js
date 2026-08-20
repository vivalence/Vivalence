import { Queue, soma } from "@vivalence/typology";

async function* polishing(events, repair) {
  const polishes = new Queue();
  let finals = [];
  let inflight = 0;
  let drained = false;

  const settle = () => {
    if (drained && !inflight) polishes.close();
  };

  const flush = () => {
    if (!finals.length) return;
    const segments = finals.map((final) => final.segment);
    const text = finals.map((final) => final.transcript).join(" ");
    finals = [];
    inflight += 1;
    Promise.resolve(repair(text))
      .then((corrected) => {
        if (corrected && corrected !== text)
          polishes.enqueue({ event: "/verbatim/polish", transcript: corrected, segments });
      })
      .catch(() => {})
      .finally(() => {
        inflight -= 1;
        settle();
      });
  };

  const upstream = (async function* () {
    try {
      for await (const event of events) {
        if (event.event === "/verbatim/final") finals.push(event);
        if (event.event === "/turn/close") flush();
        yield event;
      }
      flush();
    } finally {
      drained = true;
      settle();
    }
  })();

  yield* soma.merge(upstream, polishes.drain());
}

export const verbatim = ({ polish, tune } = {}) => async (ctx) => {
  const vocal = ctx.vocal;
  const source = ctx.input.source ?? (ctx.request.raw?.body && ctx.request.subscribe());
  if (!source) throw new Error("[hal.verbatim] no audio source — pass input.source or feed the request body");
  const desire = vocal.tune ?? tune;
  const events = await ctx.daemon.cortex.hallucinate.verbatim.stream({
    source,
    config: { ...(vocal.language && { language: vocal.language }) },
    ...(vocal.harmonize && { harmonize: vocal.harmonize }),
    policy: { ...(desire && { tune: desire }) },
  });
  if (!polish || vocal.polish === false) {
    ctx.output = events;
    return;
  }
  const repair = async (text) => {
    const rendered = await ctx.daemon.cortex.hallucinate.dialogue.render({
      system: { polish },
      turns: [{ role: "user", parts: [{ type: "text", text }] }],
      policy: { tune: "fast", rounds: 1 },
    });
    return rendered.output.message?.trim() ?? null;
  };
  ctx.output = polishing(events, repair);
};

export const voice = () => async (ctx, next) => {
  await next();
  if (!ctx.output?.[Symbol.asyncIterator]) return;

  const speech = ctx.input.tune?.voice
    ? ctx.daemon.cortex.findOne({ type: "speech", tune: ctx.input.tune, via: "stream" })
    : null;

  if (!speech) {
    ctx.output = soma.channel(ctx.output, "dialogue");
    return;
  }

  const [text, forSpeech] = soma.tee(ctx.output);
  ctx.output = soma.merge(
    soma.channel(text, "dialogue"),
    soma.channel(speech.via.stream(soma.textFromPackets(forSpeech), {}), "speech"),
  );
};
