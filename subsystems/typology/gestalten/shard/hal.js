import { soma } from "../belt/index.js";

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
