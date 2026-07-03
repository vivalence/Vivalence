import { Span } from "@vivalence/typology";

export function span(name, pipe) {
  return async (ctx, next) => {
    const nature = typeof name === "function" ? name(ctx) : name;
    const parent = ctx.span;
    ctx.span = parent ? parent.branch(nature).begin() : new Span(nature).to(pipe).begin();
    try { await next(); }
    finally { ctx.span.drain(); ctx.span = parent ?? ctx.span; }
  };
}

export function request() {
  return async (ctx, next) => {
    if (ctx.span && ctx.request) ctx.span.track.transport().send(ctx.request);
    await next();
    if (ctx.span?.transport && ctx.response) ctx.span.transport.receive(ctx.response);
  };
}

export function transition(from, to) {
  return async (ctx, next) => {
    if (ctx.span) ctx.span.track.transition().depart(typeof from === "function" ? from(ctx) : from);
    await next();
    if (ctx.span?.transition) ctx.span.transition.arrive(typeof to === "function" ? to(ctx) : to);
  };
}

export function subject(schema, id) {
  return async (ctx, next) => {
    if (ctx.span) ctx.span.track.subject().target(
      typeof schema === "function" ? schema(ctx) : schema,
      typeof id === "function" ? id(ctx) : id,
    );
    await next();
  };
}

export function fault() {
  return async (ctx, next) => {
    try { await next(); }
    catch (error) {
      if (ctx.span) ctx.span.track.fault().raise(error.message, error.code);
      throw error;
    }
  };
}
