export class Timed {
  span = null;
  begun = null;
  sealed = null;
  constructor(options, span) { if (options) Object.assign(this, options); this.span = span; }
  begin()        { this.begun = performance.now(); }
  seal()         { this.sealed = performance.now(); }
  get duration() { return this.begun != null && this.sealed != null ? this.sealed - this.begun : null; }
  get complete() { return this.sealed != null; }
  get json()     { return { begun: this.begun, sealed: this.sealed }; }
}

export class Transported {
  span = null;
  request = null;
  response = null;
  constructor(options, span) { if (options) Object.assign(this, options); this.span = span; }
  send(request) { this.request = request; }
  receive(response) {
    this.response = response;
    const headers = response.headers;
    const header = headers?.get?.("server-timing") ?? headers?.["server-timing"];
    if (header && this.span) {
      for (const entry of header.split(",")) {
        const [name, dur] = entry.trim().split(";dur=");
        if (name && dur) {
          const child = this.span.branch(name.trim());
          child.timing.begun = 0;
          child.timing.sealed = parseFloat(dur);
        }
      }
    }
  }
  get json() {
    const result = {};
    if (this.request) result.request = this.request.json ?? this.request;
    if (this.response) result.response = this.response.json ?? this.response;
    return result;
  }
}

export class Transitioned {
  span = null;
  from = null;
  to = null;
  constructor(options, span) { if (options) Object.assign(this, options); this.span = span; }
  depart(from) { this.from = from; }
  arrive(to)   { this.to = to; }
  get json()   { return { from: this.from, to: this.to }; }
}

export class Subjected {
  span = null;
  schema = null;
  id = null;
  constructor(options, span) { if (options) Object.assign(this, options); this.span = span; }
  target(schema, id) { this.schema = schema; this.id = id ?? null; }
  get json()         { return { schema: this.schema, id: this.id }; }
}

export class Faulted {
  span = null;
  message = null;
  code = null;
  constructor(options, span) { if (options) Object.assign(this, options); this.span = span; }
  raise(message, code) { this.message = message; this.code = code ?? null; }
  get json()           { return { message: this.message, code: this.code }; }
}
