import { is, fromm, Context, ValidationError } from "@vivalence/typology";

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

export const bare = (carry, effect, steps) => async (input) => {
  const context = { input, output: undefined, steps };
  await carry(context, resolve(effect));
  return context.output;
};

export const echo = (carry, effect, steps, signal) => async (input) => {
  const ctx = { input, output: undefined, signal, steps, params: {}, state: {} };
  await carry(ctx, resolve(effect));
  return ctx.output;
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
      step.input.defaults(input);
      const errors = [...step.input.errors(input)];
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
