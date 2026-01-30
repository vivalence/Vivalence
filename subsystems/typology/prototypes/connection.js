import { atom, computed } from "nanostores";
import { shards } from "@vivalence/typology";
import { object } from "@vivalence/shared";
import { Url, Status, Request, Response } from "@vivalence/typology";

export class Connection {
  status = new Status(null, this);
  $state = atom("UNRESOLVED");
  $error = atom(null);

  constructor(url, transport = shards.transport.fetcher) {
    this.url = url instanceof Url ? url : new Url(url);
    this.transport = transport;
    this.use(track(this));
  }

  use(fn) {
    const inner = this.transport;
    this.transport = (ctx) => fn(ctx, () => inner(ctx));
    return this;
  }

  branch(path) {
    return new this.constructor(this.url.branch(path), this.transport);
  }
  clone() {
    return new this.constructor(this.url, this.transport);
  }

  async request(req) {
    if (!(req instanceof Request)) {
      console.warn(
        "@prototype/connection:/request] conceptually unsupported to pass non request.",
      );
      req = new Request({ ...req, url: this.url.branch(req.url || "/") });
    }

    // retry on the request object itself.!

    const ctx = {
      request: req,
      response: new Response(),
      state: {},
    };

    await this.transport(ctx);
    return ctx.response;
  }

  async fetch(endpoint, body = {}, options = {}) {
    const request = new Request({
      url: this.url.branch(endpoint),
      body,
      ...options,
    });

    const response = await this.request(request);

    return response;
  }

  async call(endpoint, body = {}, options = {}) {
    const response = await this.fetch(endpoint, body, options);

    if (!response.ok) {
      // NEED: prototype.CallError ~ not.xzy
      const error = new Error(`Request failed: ${response.status}`);
      error.response = response;
      console.error({ endpoint, response });
      throw error;
    }

    return response.body;
  }

  aim(endpoint, bodyI = {}, optionsI = {}) {
    return (bodyII = {}, optionsII = {}) => {
      return this.call(
        endpoint,
        object.merge(bodyII, bodyI),
        object.merge(optionsII, optionsI),
      );
    };
    //
  }

  get isHealthy() {
    return computed(this.$state, (state) => state === "HEALTHY");
  }

  get isFaulty() {
    return computed(this.$state, (state) => state === "FAULTY");
  }

  setActive() {
    this.status.set({ code: "ACTIVE" });
  }

  setHealthy() {
    this.$state.set("HEALTHY");
    this.status.set({ code: "SUCCESS", label: "connected" });
    this.$error.set(null);
  }

  setFaulty(error) {
    this.$state.set("FAULTY");
    this.status.set({ code: "ERROR", error });
    this.$error.set(error);
  }
}

const track = (connection) => async (ctx, next) => {
  try {
    connection.setActive();
    await next();
    connection.setHealthy();
  } catch (error) {
    connection.setFaulty(error);
    throw error;
  }
};

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
