import { is, fromm, Value, Context, ValidationError } from "@vivalence/typology";

export function dispatch(effect, ctx) {
  if (effect.length === 0) return effect();
  if (effect.length === 1) return effect(ctx);
  return effect(ctx.input, ctx);
}

export const direct = (carry, effect, steps, signal) => async (input) => {
  const ctx = new Context({
    request: { body: input, url: signal },
    params: fromm.match(steps).parameters,
    signal,
    steps,
  });
  await carry(ctx, async (c) => {
    const result = await dispatch(effect, c);
    if (!is.undefined(result)) c.output = result;
  });
  return ctx.output;
};

export const guarded = (carry, effect, steps, signal) => async (input) => {
  for (const step of steps) {
    if (step.input) {
      Value.Default(step.input, input);
      const errors = [...Value.Errors(step.input, input)];
      if (errors.length) throw new ValidationError(errors, signal);
    }
  }
  const ctx = new Context({
    request: { body: input, url: signal },
    params: fromm.match(steps).parameters,
    signal,
    steps,
  });
  await carry(ctx, async (c) => {
    const result = await dispatch(effect, c);
    if (!is.undefined(result)) c.output = result;
  });
  return ctx.output;
};
