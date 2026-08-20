import { atom, computed, onMount } from "nanostores";
import { string, shard, sse, Url, Request, Response, middleware, promise } from "@vivalence/typology";
import { object } from "@vivalence/typology";
import { Socket } from "./socket.js";

const CONFIG = {
  backoff: 1000,
  ceiling: 30000,
};

export class Connection {
  $state = atom("IDLE");
  $error = atom(null);

  carry = [];
  children = new Map();

  constructor(url, transport = shard.transmitter.fetcher) {
    this.url = url instanceof Url ? url : new Url(url);
    this.transport = transport;
  }

  use(fn) {
    this.carry.push(fn);
    return this;
  }

  dispatch(ctx) {
    return middleware.compose(this.carry)(ctx, this.transport);
  }

  child(segment) {
    let next = this.children.get(segment);
    if (!next) {
      next = new this.constructor(this.url.branch(`/${segment}`), (ctx) => this.dispatch(ctx));
      this.children.set(segment, next);
    }
    return next;
  }

  branch(path) {
    let node = this;
    for (const segment of string.split(path)) node = node.child(segment);
    return node;
  }

  clone() {
    return new this.constructor(this.url, this.transport);
  }

  async request(request) {
    if (!(request instanceof Request)) {
      request = new Request({
        ...request,
        url: this.url.branch(request.url || "/"),
      });
    }

    const ctx = {
      request,
      response: new Response(),
      state: {},
    };

    await this.dispatch(ctx);

    return ctx.response;
  }

  resolve(endpoint) {
    let node = this;
    for (const segment of string.split(endpoint)) {
      const next = node.children.get(segment);
      if (!next) break;
      node = next;
    }
    return node;
  }

  async fetch(endpoint, body = {}, options = {}) {
    const node = this.resolve(endpoint);
    const request = new Request({
      url: this.url.branch(endpoint),
      body,
      ...options,
    });
    return node.request(request);
  }

  async call(endpoint, body = {}, options = {}) {
    const response = await this.fetch(endpoint, body, options);

    if (response.error) {
      response.error.message = `${response.error.message} @ ${this.url.branch(endpoint).pathname}`;
      throw response.error;
    }

    return response.body;
  }

  aim(endpoint, bodyBase = {}, optionsBase = {}) {
    return (body = {}, options = {}) => {
      return this.call(endpoint, object.merge(body, bodyBase), object.merge(options, optionsBase));
    };
  }

  async *stream(endpoint, signal, { method = "GET", body, headers, opened, raw } = {}) {
    const response = await this.fetch(endpoint, body ?? {}, {
      method,
      headers: { accept: "text/event-stream", ...headers },
      signal,
      ...(raw && { raw }),
    });
    if (response.error) throw response.error;
    if (response.body?.[Symbol.asyncIterator] && !response.body.getReader) {
      if ("onArrival" in response.body) response.body.onArrival = opened ?? null;
      else opened?.();
      yield* response.body;
      return;
    }
    if (!response.body?.getReader)
      throw new Error(`SSE stream expected ReadableStream, got ${typeof response.body}`);
    opened?.();
    yield* sse.frames(response.body);
  }

  converse(endpoint, source, { input, signal, headers, opened } = {}) {
    return this.stream(endpoint, signal, {
      method: "POST",
      body: input ?? {},
      headers,
      opened,
      raw: { body: sse.encode(source) },
    });
  }

  observe(endpoint, options = {}) {
    const controller = new AbortController();
    const iterator = this.stream(endpoint, controller.signal, options);
    iterator.unsubscribe = () => controller.abort();
    return iterator;
  }

  subscribe(endpoint, callback, options = {}) {
    const { backoff = CONFIG.backoff, resumed, ...streaming } = options;
    const controller = new AbortController();
    (async () => {
      for (let attempt = 0, round = 0; !controller.signal.aborted; attempt++, round++) {
        const heal = round;
        try {
          for await (const event of this.stream(endpoint, controller.signal, {
            ...streaming,
            opened: () => {
              if (heal > 0) resumed?.();
            },
          })) {
            attempt = 0;
            callback(event);
          }
          if (controller.signal.aborted) return;
        } catch (error) {
          if (controller.signal.aborted || error.name === "AbortError") return;
        }
        const gate = promise.waiter();
        const timer = setTimeout(gate.wake, Math.min(backoff * 2 ** attempt, CONFIG.ceiling));
        await gate.wait(controller.signal);
        clearTimeout(timer);
      }
    })();
    return () => controller.abort();
  }

  nanoatom(endpoint, initial = null) {
    const $store = atom(initial);
    onMount($store, () => this.subscribe(`${endpoint}/subscribe`, (value) => $store.set(value)));
    return $store;
  }

  async publish(endpoint, source, options = {}) {
    const response = await this.fetch(endpoint, options.input ?? {}, {
      method: "POST",
      headers: { ...options.headers },
      signal: options.signal,
      raw: { body: sse.encode(source) },
    });
    return response.body;
  }

  socket(endpoint, vector, query = {}) {
    const base = this.url.branch(endpoint).with(query);
    const ws = base.scheme(base.secure ? "wss" : "ws");
    return new Socket(new WebSocket(ws.absolute), vector);
  }

  get $isConnected() {
    return computed(this.$state, (s) => s === "CONNECTED");
  }

  get $isError() {
    return computed(this.$state, (s) => s === "ERROR");
  }
}
// import { atom, computed } from "nanostores";
// import { shards } from "@vivalence/typology";
// import { Url, Status, Request, Response } from "@vivalence/typology";

// export class Connection {
//   status = new Status(null, this);
//   $state = atom("UNRESOLVED");
//   $error = atom(null);

//   constructor(url, transport = shard.transmitter.fetcher) {
//     this.url = url instanceof Url ? url : new Url(url);
//     this.transport = transport;
//     this.use(track(this));
//   }

//   use(fn) {
//     const inner = this.transport;
//     this.transport = (ctx) => fn(ctx, () => inner(ctx));
//     return this;
//   }

//   branch(path) {
//     return new this.constructor(this.url.branch(path), this.transport);
//   }

//   clone() {
//     return new this.constructor(this.url, this.transport);
//   }

//   async request(request) {
//     if (!(request instanceof Request)) {
//       console.warn(
//         "@prototype/connection:/request] conceptually unsupported to pass non request.",
//       );
//       request = new Request({
//         ...request,
//         url: this.url.branch(request.url || "/"),
//       });
//     }

//     // retry on the request object itself.!

//     const ctx = {
//       request,
//       response: new Response(),
//       state: {},
//     };

//     await this.transport(ctx);

//     return ctx.response;
//   }

//   async fetch(endpoint, body = {}, options = {}) {
//     const request = new Request({
//       url: this.url.branch(endpoint),
//       body,
//       ...options,
//     });

//     const response = await this.request(request);

//     return response;
//   }

//   async call(endpoint, body = {}, options = {}) {
//     const response = await this.fetch(endpoint, body, options);

//     if (!response.ok) {
//       // NEED: prototype.CallError ~ not.xzy
//       const error = new Error(`Request failed: ${response.status}`);
//       error.response = response;
//       console.error({ endpoint, response });
//       throw error;
//     }

//     return response.body;
//   }

//   aim(endpoint, bodyI = {}, optionsI = {}) {
//     return (bodyII = {}, optionsII = {}) => {
//       return this.call(
//         endpoint,
//         object.merge(bodyII, bodyI),
//         object.merge(optionsII, optionsI),
//       );
//     };
//     //
//   }

//   get isHealthy() {
//     return computed(this.$state, (state) => state === "HEALTHY");
//   }

//   get isFaulty() {
//     return computed(this.$state, (state) => state === "FAULTY");
//   }

//   setActive() {
//     this.status.set({ code: "ACTIVE" });
//   }

//   setHealthy() {
//     this.$state.set("HEALTHY");
//     this.status.set({ code: "SUCCESS", label: "connected" });
//     this.$error.set(null);
//   }

//   setFaulty(error) {
//     this.$state.set("FAULTY");
//     this.status.set({ code: "ERROR", error });
//     this.$error.set(error);
//   }
// }

// const track = (connection) => async (ctx, next) => {
//   try {
//     connection.setActive();
//     await next();
//     connection.setHealthy();
//   } catch (error) {
//     connection.setFaulty(error);
//     throw error;
//   }
// };

// export class Connection {
//   constructor(url, carry) {
//     this.url = url;
//     // this.carry = [carry, track(this)];
//   }

//   branch(path) {
//     return new this.constructor(
//       this.url.branch(path),
//       // (ctx) => compose(this.carry)(ctx), // whatever to compose the dispatch of this connections carry at this moment.
//     );
//   }

//   async call(endpoint, body = {}, params = {}) {
//     // const url = this.url.branch(endpoint).absolute;

//     // const composed = compose(carry);
//     const ctx = {};
//     await composed(ctx, vtransport);

//     // return ctx.response.body;
//   }

//   // TODO LATER ctx.request.retry = async () => {if (!ctx.state.isRetry === true) {ctx.state.isRetry = true; ctx.response.body = await instance(endpoint, body, params);}};
//   use(middleware) {
//     this.carry.push(middleware);
//     return this;
//   }

// }
