export class Trace {
  spans = [];

  begin(name) {
    this.spans.push({ name, start: performance.now() });
  }

  end(name) {
    const span = this.spans.findLast((s) => s.name === name && !s.end);
    if (span) span.end = performance.now();
  }

  get timing() {
    return this.spans
      .filter((s) => s.end != null)
      .map((s) => `${s.name};dur=${(s.end - s.start).toFixed(1)}`)
      .join(", ");
  }
}

export function trace(name) {
  return async (ctx, next) => {
    ctx.trace = new Trace();
    ctx.trace.begin(name || "total");
    try { await next(); }
    finally { ctx.trace.end(name || "total"); }
  };
}

export function mark(name) {
  return async (ctx, next) => {
    ctx.trace?.begin(name);
    try { await next(); }
    finally { ctx.trace?.end(name); }
  };
}
