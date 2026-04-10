import { is, fromm, Value, Context, ValidationError } from "@vivalence/typology";

export function dispatch(effect, context) {
  if (effect.length === 0) return effect();
  if (effect.length === 1) return effect(context);
  return effect(context.input, context);
}

export const resolve = (effect) => async (context) => {
  const result = await dispatch(effect, context);
  if (!context.output && !is.undefined(result)) context.output = result;
  return context.output;
};

export const direct = (carry, effect) => async (context) => {
  await carry(context, resolve(effect));
  return context.output;
};

export const bare = (carry, effect) => async (input) => {
  const context = { input, output: undefined };
  await carry(context, resolve(effect));
  return context.output;
};

export const request = (carry, effect, steps, signal) => async (input) => {
  const ctx = new Context({
    request: { body: input, url: signal },
    params: fromm.match(steps).parameters,
    signal,
    steps,
  });
  await carry(ctx, resolve(effect));
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
  await carry(ctx, resolve(effect));
  return ctx.output;
};
