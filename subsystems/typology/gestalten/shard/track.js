import { Span } from "@vivalence/typology";

const wire = (message) => {
  const shape = {};
  if (message.method) shape.method = message.method;
  const path = message.url?.pathname ?? message.path;
  if (path) shape.path = path;
  if (message.status) shape.status = message.status;
  return shape;
};

export function span(name, pipe) {
  return async (ctx, next) => {
    const nature = typeof name === "function" ? name(ctx) : name;
    const parent = ctx.span;
    ctx.span = parent ? parent.branch(nature) : new Span(nature).to(pipe);
    ctx.span.open();
    try {
      await next();
    } finally {
      ctx.span.close();
      ctx.span = parent ?? ctx.span;
    }
  };
}

export function request() {
  return async (ctx, next) => {
    if (ctx.span && ctx.request) ctx.span.mark("request", wire(ctx.request));
    await next();
    if (ctx.span && ctx.response) ctx.span.mark("response", wire(ctx.response));
  };
}

export function subject(schema, id) {
  return async (ctx, next) => {
    if (ctx.span)
      ctx.span.mark("subject", {
        schema: typeof schema === "function" ? schema(ctx) : schema,
        id: typeof id === "function" ? id(ctx) : id,
      });
    await next();
  };
}

export function fault() {
  return async (ctx, next) => {
    try {
      await next();
    } catch (error) {
      ctx.span?.fault(error);
      throw error;
    }
  };
}
