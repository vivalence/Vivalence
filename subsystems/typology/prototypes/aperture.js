import { Vector } from "./vector.js";
import { dispatch } from "../gestalten/steer/strategy.js";

export class Aperture extends Vector {
  get(sig, handler)    { return this._route("GET", sig, handler); }
  post(sig, handler)   { return this._route("POST", sig, handler); }
  put(sig, handler)    { return this._route("PUT", sig, handler); }
  patch(sig, handler)  { return this._route("PATCH", sig, handler); }
  delete(sig, handler) { return this._route("DELETE", sig, handler); }

  _route(method, sig, handler) {
    const pattern = new this.signature(sig);

    if (pattern.heir) {
      const fin = pattern.fin.pop();
      return this.branch(pattern)._route(method, fin.nature, handler);
    }

    const existing = Array.from(this.effects.entries())
      .find(([p]) => p.hash === pattern.hash);

    if (existing && existing[1].methods) {
      existing[1].methods[method] = handler;
    } else {
      const dispatcher = methods();
      if (existing) {
        dispatcher.methods["*"] = existing[1];
        this.effects.delete(existing[0]);
      }
      dispatcher.methods[method] = handler;
      this.effects.set(pattern, dispatcher);
    }

    return this;
  }
}

export function method(m, handler) {
  return (ctx) =>
    ctx.request.method === m ? dispatch(handler, ctx) : undefined;
}

export function methods(map) {
  const m = map || {};
  const fn = (ctx) => {
    const handler = m[ctx.request.method] || m["*"];
    if (!handler) { ctx.response.status = 405; return null; }
    return dispatch(handler, ctx);
  };
  fn.methods = m;
  return fn;
}
