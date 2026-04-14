import {
  specimen, Span, tracks,
  Vector, Aperture, shape,
} from "@vivalence/typology";

const { Timed, Transported, Transitioned, Subjected, Faulted } = tracks;

const { http } = shape;

specimen.describe("tracks", () => {
  specimen.it("Timed: begin/seal/duration/complete", () => {
    const timed = new Timed();
    specimen.expect(timed.complete).toBe(false);
    timed.begin();
    specimen.expect(timed.duration).toBe(null);
    timed.seal();
    specimen.expect(timed.complete).toBe(true);
    specimen.expect(timed.duration).toBeTruthy();
  });

  specimen.it("Transported: send/receive stores request and response", () => {
    const transported = new Transported();
    const request = { url: "/emit", method: "POST", headers: new Map(), body: { action: "test" } };
    transported.send(request);
    specimen.expect(transported.request).toBe(request);
    specimen.expect(transported.json.request).toBe(request);

    const response = { status: 200, headers: new Map(), body: { ok: true } };
    transported.receive(response);
    specimen.expect(transported.response).toBe(response);
    specimen.expect(transported.json.response).toBe(response);
  });

  specimen.it("Transported: json delegates to .json getter on prototypes", () => {
    const transported = new Transported();
    const request = { url: "/emit", method: "POST", json: { url: "/emit", method: "POST" } };
    const response = { status: 200, json: { status: 200, ok: true } };
    transported.send(request);
    transported.receive(response);
    specimen.expect(transported.json.request).toEqual({ url: "/emit", method: "POST" });
    specimen.expect(transported.json.response).toEqual({ status: 200, ok: true });
  });

  specimen.it("Transported: receive parses server-timing into child spans", () => {
    const span = new Span("test").begin();
    const transported = new Transported(null, span);
    transported.receive({
      status: 200,
      headers: new Map([["server-timing", "db;dur=12.3, render;dur=5.1"]]),
    });
    specimen.expect(span.gauges.length).toBe(2);
    specimen.expect(span.gauges[0].nature).toBe("db");
    specimen.expect(span.gauges[0].timing.sealed).toBe(12.3);
    specimen.expect(span.gauges[1].nature).toBe("render");
    specimen.expect(span.gauges[1].timing.sealed).toBe(5.1);
  });

  specimen.it("Transported: options constructor hydrates fields", () => {
    const request = { url: "/test", method: "GET" };
    const transported = new Transported({ request });
    specimen.expect(transported.request).toBe(request);
  });

  specimen.it("Transitioned: depart/arrive + options constructor", () => {
    const transitioned = new Transitioned({ from: "IDLE" });
    transitioned.arrive("AUTHENTICATED");
    specimen.expect(transitioned.json).toEqual({ from: "IDLE", to: "AUTHENTICATED" });
  });

  specimen.it("Subjected: target + options constructor", () => {
    const subjected = new Subjected({ schema: "buffer" });
    subjected.target("buffer", "buf-123");
    specimen.expect(subjected.json).toEqual({ schema: "buffer", id: "buf-123" });
  });

  specimen.it("Faulted: raise + options constructor", () => {
    const faulted = new Faulted({ code: "SESSION_EXPIRED" });
    faulted.raise("token expired", "SESSION_EXPIRED");
    specimen.expect(faulted.json).toEqual({ message: "token expired", code: "SESSION_EXPIRED" });
  });

  specimen.it("span back-reference passed as second arg", () => {
    const span = new Span("test");
    const transported = new Transported({ request: { url: "/test" } }, span);
    specimen.expect(transported.span).toBe(span);
    specimen.expect(transported.request.url).toBe("/test");
  });
});

specimen.describe("Span", () => {
  specimen.it("begin/seal delegates to timing facet", () => {
    const span = new Span("test").begin();
    specimen.expect(span.timing).toBeInstanceOf(Timed);
    specimen.expect(span.complete).toBe(false);
    span.seal();
    specimen.expect(span.duration).toBeTruthy();
    specimen.expect(span.complete).toBe(true);
  });

  specimen.it("track accessors are lazy, pass options, return facet", () => {
    const span = new Span("test").begin();
    specimen.expect(span.transport).toBe(null);
    const transported = span.track.transport({ request: { url: "/emit", method: "POST" } });
    specimen.expect(transported).toBeInstanceOf(Transported);
    specimen.expect(transported.span).toBe(span);
    specimen.expect(transported.request.url).toBe("/emit");
    specimen.expect(span.track.transport()).toBe(transported);
  });

  specimen.it("facets accumulate via domain verbs", () => {
    const span = new Span("fetch").begin();
    span.track.transport().send({ url: "/emit", method: "POST" });
    span.track.transition().depart("IDLE");
    span.track.transport().receive({ status: 200, headers: new Map() });
    span.track.transition().arrive("OK");
    span.seal();
    specimen.expect(span.transport.request).toEqual({ url: "/emit", method: "POST" });
    specimen.expect(span.transport.response.status).toBe(200);
    specimen.expect(span.transition.json).toEqual({ from: "IDLE", to: "OK" });
  });

  specimen.it("branching builds tree with independent facets", () => {
    const root = new Span("request").begin();
    root.track.transport().send({ url: "/emit", method: "POST" });

    const auth = root.branch("auth").begin();
    auth.track.transition({ from: "IDLE" }).arrive("OK");
    auth.seal();

    const query = root.branch("query").begin();
    query.track.subject({ schema: "literal" }).target("literal", "lit-1");
    query.seal();

    root.seal();
    specimen.expect(root.complete).toBe(true);
    specimen.expect(root.gauges.length).toBe(2);
    specimen.expect(auth.absolute).toEqual(["request", "auth"]);
    specimen.expect(query.subject.id).toBe("lit-1");
  });

  specimen.it("hash is null before begin, unique after", () => {
    const span = new Span("test");
    specimen.expect(span.hash).toBe(null);
    span.begin();
    specimen.expect(span.hash).toBeTruthy();
  });

  specimen.it("hash differs by parent", () => {
    const parentA = new Span("a").begin();
    const parentB = new Span("b").begin();
    const childA = parentA.branch("x").begin();
    const childB = parentB.branch("x").begin();
    specimen.expect(childA.hash).not.toBe(childB.hash);
  });

  specimen.it("json serializes tree, omits null facets", () => {
    const root = new Span("req");
    root.timing = new Timed({ begun: 100, sealed: 145 });
    root.track.transport().send({ url: "/test", method: "GET" });
    const child = root.branch("sub");
    child.timing = new Timed({ begun: 101, sealed: 144 });

    const json = root.json;
    specimen.expect(json.nature).toBe("req");
    specimen.expect(json.timing).toEqual({ begun: 100, sealed: 145 });
    specimen.expect(json.transport.request).toEqual({ url: "/test", method: "GET" });
    specimen.expect(json.transition).toBe(undefined);
    specimen.expect(json.children.length).toBe(1);
  });
});

specimen.describe("Span: drain", () => {
  specimen.it("drain seals and emits root to pipe", () => {
    const collected = [];
    const pipe = (span) => collected.push(span);

    const span = new Span("test").begin();
    span.drain(pipe);

    specimen.expect(span.complete).toBe(true);
    specimen.expect(collected.length).toBe(1);
    specimen.expect(collected[0]).toBe(span);
  });

  specimen.it("drain uses bound pipe from to()", () => {
    const collected = [];
    const pipe = (span) => collected.push(span);

    const span = new Span("test").to(pipe).begin();
    span.drain();

    specimen.expect(collected.length).toBe(1);
    specimen.expect(collected[0]).toBe(span);
  });

  specimen.it("drain argument overrides bound pipe", () => {
    const bound = [];
    const override = [];

    const span = new Span("test").to((s) => bound.push(s)).begin();
    span.drain((s) => override.push(s));

    specimen.expect(bound.length).toBe(0);
    specimen.expect(override.length).toBe(1);
  });

  specimen.it("child spans do not emit on drain — only root", () => {
    const collected = [];
    const pipe = (span) => collected.push(span);

    const root = new Span("root").to(pipe).begin();
    const child = root.branch("child").begin();
    child.drain();

    specimen.expect(collected.length).toBe(0);

    root.drain();
    specimen.expect(collected.length).toBe(1);
    specimen.expect(collected[0]).toBe(root);
  });

  specimen.it("to() chains with begin()", () => {
    const collected = [];
    const pipe = (span) => collected.push(span);

    const span = new Span("chained").to(pipe).begin();
    span.track.transport().send({ url: "/test", method: "GET" });
    span.drain();

    specimen.expect(collected.length).toBe(1);
    specimen.expect(collected[0].transport.request.url).toBe("/test");
  });
});

specimen.describe("Span: vector pipeline", () => {
  function traceMiddleware(name, pipe) {
    return async (ctx, next) => {
      const parent = ctx.span;
      ctx.span = parent ? parent.branch(name).begin() : new Span(name).to(pipe).begin();
      try { await next(); }
      finally { ctx.span.drain(); ctx.span = parent ?? ctx.span; }
    };
  }

  specimen.it("span tree mirrors middleware nesting and drains to pipe", async () => {
    const collected = [];
    const pipe = (span) => collected.push(span);

    const vector = new Vector();
    vector.use(traceMiddleware("request", pipe));
    vector.use(traceMiddleware("authorize"));
    vector.use(traceMiddleware("dispatch"));

    vector.open("ping", () => "pong");

    const handler = http(vector);
    await handler(new Request("http://localhost/ping"));

    specimen.expect(collected.length).toBe(1);
    specimen.expect(collected[0].nature).toBe("request");
    specimen.expect(collected[0].complete).toBe(true);
    const json = collected[0].json;
    specimen.expect(json.children[0].nature).toBe("authorize");
    specimen.expect(json.children[0].children[0].nature).toBe("dispatch");
  });
});

specimen.describe("Span: connection scenario", () => {
  specimen.it("auth retry with token expiry", () => {
    const collected = [];
    const pipe = (span) => collected.push(span);

    const root = new Span("connection.fetch").to(pipe).begin();
    root.track.transport().send({ url: "/emit/literal", method: "POST" });

    const auth = root.branch("authorize").begin();
    auth.track.transition({ from: "VALID" }).arrive("EXPIRED");
    auth.track.fault().raise("token expired", "TOKEN_EXPIRED");
    auth.seal();

    const refresh = root.branch("refresh").begin();
    refresh.track.transport().send({ url: "/auth/refresh", method: "POST" });
    refresh.track.transition({ from: "EXPIRED" }).arrive("REFRESHED");
    refresh.track.transport().receive({ status: 200, headers: new Map() });
    refresh.seal();

    const retry = root.branch("retry").begin();
    retry.track.transport().send({ url: "/emit/literal", method: "POST" });
    retry.track.transport().receive({ status: 200, headers: new Map() });
    retry.track.subject().target("buffer", "buf-789");
    retry.seal();

    root.track.transport().receive({ status: 200, headers: new Map() });
    root.drain();

    specimen.expect(collected.length).toBe(1);
    specimen.expect(root.complete).toBe(true);
    const json = collected[0].json;
    specimen.expect(json.children[0].fault).toEqual({ message: "token expired", code: "TOKEN_EXPIRED" });
    specimen.expect(json.children[1].transition).toEqual({ from: "EXPIRED", to: "REFRESHED" });
    specimen.expect(json.children[2].subject).toEqual({ schema: "buffer", id: "buf-789" });
  });

  specimen.it("stall pull with exhaustion", () => {
    const collected = [];
    const pipe = (span) => collected.push(span);

    const pull = new Span("stall.pull").to(pipe).begin();
    pull.track.transition({ from: "IDLE" });
    pull.track.subject({ schema: "buffer" });

    const emit = pull.branch("emit").begin();
    emit.track.transport().send({ url: "/emit/literal", method: "POST" });
    emit.track.transport().receive({ status: 200, headers: new Map() });
    emit.seal();

    const merge = pull.branch("merge").begin();
    merge.track.subject().target("buffer", "buf-001");
    merge.seal();

    pull.track.transition().arrive("EXHAUSTED");
    pull.track.fault().raise("no buffers returned", "EXHAUSTED");
    pull.drain();

    specimen.expect(collected.length).toBe(1);
    specimen.expect(pull.complete).toBe(true);
    specimen.expect(pull.transition.json).toEqual({ from: "IDLE", to: "EXHAUSTED" });
    specimen.expect(pull.fault.json).toEqual({ message: "no buffers returned", code: "EXHAUSTED" });
    specimen.expect(emit.transport.response.status).toBe(200);
    specimen.expect(merge.subject.id).toBe("buf-001");
  });
});
