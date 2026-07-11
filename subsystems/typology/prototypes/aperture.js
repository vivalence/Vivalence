import { Vector } from "./vector.js";
import { fire } from "../gestalten/steer/strategy.js";

export class Aperture extends Vector {
  get(sig, handler)    { return this._route("GET", sig, handler); }
  post(sig, handler)   { return this._route("POST", sig, handler); }
  put(sig, handler)    { return this._route("PUT", sig, handler); }
  patch(sig, handler)  { return this._route("PATCH", sig, handler); }
  delete(sig, handler) { return this._route("DELETE", sig, handler); }

  _route(method, sig, handler) {
    const tip = this.branch(sig);

    if (tip.effect && tip.effect.methods) {
      tip.effect.methods[method] = handler;
    } else {
      const dispatcher = methods();
      if (tip.effect) dispatcher.methods["*"] = tip.effect;
      dispatcher.methods[method] = handler;
      tip.effect = dispatcher;
    }

    return this;
  }
}

export function method(m, handler) {
  return (ctx) =>
    ctx.request.method === m ? fire(handler, ctx) : undefined;
}

export function methods(map) {
  const m = map || {};
  const fn = (ctx) => {
    const handler = m[ctx.request.method] || m["*"] || wildcard(m, ctx);
    if (!handler) { ctx.response.status = 405; return null; }
    return fire(handler, ctx);
  };
  fn.methods = m;
  return fn;
}

const wildcard = (m, ctx) => {
  if (ctx.request.method !== "*") return undefined;
  const handlers = Object.values(m);
  if (handlers.length === 1) return handlers[0];
  throw new Error(`methods: leaf is method-ambiguous (${Object.keys(m).join(", ")}) — asked without a method`);
};
