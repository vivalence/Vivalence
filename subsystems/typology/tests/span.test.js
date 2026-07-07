import { specimen, Span, Pipe, tracks } from "@vivalence/typology";

const { Timed, Transported, Transitioned, Subjected, Faulted, Objected } = tracks;

// Span = a trace trie (Signature: nature + parent/child gauges) carrying a Timed
// clock plus four lazy "tracks": Transported (wire), Transitioned (state machine),
// Subjected (entity target), Faulted (error). Drain seals + emits the root.

// ── 1. BASICS — lifecycle, tree, json, drain, identity ───────────────────────
specimen.describe("Span: basics", () => {
  specimen.it("clocks a tree and drains only the root through its pipe", () => {
    const drained = [];
    const root = new Span("request").to((s) => drained.push(s)).begin();
    specimen.expect(root.complete).toBe(false);

    const auth = root.branch("auth").begin();
    specimen.expect(auth.absolute).toEqual("/request/auth");
    auth.seal();

    // a child draining is a no-op; only the root reaches the pipe
    auth.drain();
    specimen.expect(drained.length).toBe(0);

    root.drain();
    specimen.expect(root.complete).toBe(true);
    specimen.expect(root.duration).toBeTruthy();
    specimen.expect(drained).toEqual([root]);

    // json serializes the tree and omits the null facets
    const json = root.json;
    specimen.expect(json.nature).toBe("request");
    specimen.expect(json.transport).toBe(undefined);
    specimen.expect(json.children[0].nature).toBe("auth");
  });

  specimen.it("hash is null before begin, unique per parent after", () => {
    const orphan = new Span("x");
    specimen.expect(orphan.hash).toBe(null);
    orphan.begin();
    specimen.expect(orphan.hash).toBeTruthy();

    const childOfA = new Span("a").begin().branch("x").begin();
    const childOfB = new Span("b").begin().branch("x").begin();
    specimen.expect(childOfA.hash).not.toBe(childOfB.hash);
  });
});

// ── 2. TRACKS — scout each facet and its verbs ───────────────────────────────
specimen.describe("Span: tracks", () => {
  specimen.it("Timed: begin/seal gate duration and completeness", () => {
    const span = new Span("x");
    specimen.expect(span.timing).toBeInstanceOf(Timed);
    specimen.expect(span.timing.complete).toBe(false);
    span.begin();
    specimen.expect(span.duration).toBe(null); // begun, not yet sealed
    span.seal();
    specimen.expect(span.timing.complete).toBe(true);
    specimen.expect(span.duration).toBeTruthy();
  });

  specimen.it("Transported: send/receive the wire, fan server-timing into gauges", () => {
    const span = new Span("fetch").begin();
    const transport = span.track.transport();
    specimen.expect(transport).toBeInstanceOf(Transported);
    specimen.expect(span.track.transport()).toBe(transport); // lazy singleton

    transport.send({ url: "/emit", method: "POST", json: { url: "/emit" } });
    transport.receive({
      status: 200,
      headers: new Map([["server-timing", "db;dur=12.3, render;dur=5.1"]]),
    });

    specimen.expect(span.transport.json.request).toEqual({ url: "/emit" }); // .json delegation
    specimen.expect(span.transport.response.status).toBe(200);
    specimen.expect(span.gauges.map((g) => g.nature)).toEqual(["db", "render"]);
    specimen.expect(span.gauges[1].timing.sealed).toBe(5.1);
  });

  specimen.it("Transitioned: depart/arrive walks a state machine", () => {
    const span = new Span("auth").begin();
    span.track.transition().depart("IDLE");
    span.track.transition().arrive("OK"); // lazy reuse of the same facet
    specimen.expect(span.transition).toBeInstanceOf(Transitioned);
    specimen.expect(span.transition.json).toEqual({ from: "IDLE", to: "OK" });
  });

  specimen.it("Subjected: target names the entity, options seed the schema", () => {
    const span = new Span("merge").begin();
    span.track.subject({ schema: "buffer" }).target("buffer", "buf-123");
    specimen.expect(span.subject).toBeInstanceOf(Subjected);
    specimen.expect(span.subject.json).toEqual({ schema: "buffer", id: "buf-123" });
  });

  specimen.it("Faulted: raise records message + code", () => {
    const span = new Span("pull").begin();
    span.track.fault().raise("no buffers returned", "EXHAUSTED");
    specimen.expect(span.fault).toBeInstanceOf(Faulted);
    specimen.expect(span.fault.json).toEqual({ span: "/pull", message: "no buffers returned", code: "EXHAUSTED" });
  });

  specimen.it("Objected: set records a payload and an optional schema", () => {
    const span = new Span("render").begin();
    span.track.object({ answer: "42" }, "string");
    specimen.expect(span.object).toBeInstanceOf(Objected);
    specimen.expect(span.object.json).toEqual({ payload: { answer: "42" }, schema: "string" });
  });
});

// ── 3. EDGE CASE — the drainage manifold (testament/temp.js) ─────────────────
specimen.describe("Span: drainage manifold", () => {
  // One long-lived root forks a track each tick and streams the GROWING tree
  // through a Pipe whose taps fan out synchronously to many sinks. One send fills
  // every sink, no extra wiring; drain() is the terminal beat (seal + final send).
  specimen.it("one send fans to every tap; snapshots grow; drain is terminal", () => {
    const console_ = [];
    const file = [];
    const pipe = new Pipe();
    pipe.tap((span) => console_.push(span.gauges.length)); // sink A
    pipe.tap((span) => file.push(span.gauges.length));     // sink B

    const root = new Span("boot").to(pipe).begin();
    root.track.subject().target("session", "6d0eac24");

    for (let tick = 1; tick <= 5; tick++) {
      const beat = root.branch(`tick/${tick}`).begin();
      beat.track.subject().target("beat", tick);
      beat.seal();
      pipe.send(root); // both taps fire on the growing tree
    }
    root.drain(); // Pipe-object drain arm: target.send(root)

    // 5 streamed snapshots + 1 terminal drain, fanned to BOTH sinks identically
    specimen.expect(console_).toEqual([1, 2, 3, 4, 5, 5]);
    specimen.expect(file).toEqual(console_);
    specimen.expect(root.complete).toBe(true);
    specimen.expect(root.gauges.length).toBe(5);
  });
});

specimen.describe("Span: reactive emit", () => {
  specimen.it("branch inherits the root pipe down the whole tree", () => {
    const pipe = new Pipe();
    const root = new Span().to(pipe);
    const child = root.branch("x");
    const grandchild = child.branch("y");
    specimen.expect(child.pipe).toBe(pipe);
    specimen.expect(grandchild.pipe).toBe(pipe);
  });

  specimen.it("track.object emits the record locally; foldp accumulates, absolute annotates", () => {
    const pipe = new Pipe();
    const root = new Span().to(pipe);
    const log = pipe.reactive([], (list, record) => [...list, record]);

    root.branch("a/one").track.object({ n: 1 });
    root.branch("a/two").track.object({ n: 2 }, "schema");

    const records = log.get();
    specimen.expect(records.map((record) => record.absolute)).toEqual(["/a/one", "/a/two"]);
    specimen.expect(records[0].object).toEqual({ payload: { n: 1 }, schema: null });
    specimen.expect(records[1].object).toEqual({ payload: { n: 2 }, schema: "schema" });
  });

  specimen.it("fault.raise emits too; a span with no pipe is inert", () => {
    const pipe = new Pipe();
    const root = new Span().to(pipe);
    const latest = pipe.reactive();
    root.branch("pull").track.fault().raise("empty", "EXHAUSTED");
    specimen.expect(latest.get().fault).toEqual({ span: "/pull", message: "empty", code: "EXHAUSTED" });

    const orphan = new Span();
    orphan.branch("b").track.object({ n: 3 });
    specimen.expect(orphan.gauges[0].object.payload).toEqual({ n: 3 });
  });

  specimen.it("log sniffs the prop name as nature; an Error value routes to the fault rail", () => {
    const pipe = new Pipe();
    const root = new Span().to(pipe);
    const log = pipe.reactive([], (list, record) => [...list, record]);

    const input = { user: "hi" };
    root.log({ input });
    root.log("/explicit", { n: 1 });
    root.log({ render: new Error("boom") });

    const records = log.get();
    specimen.expect(records.map((record) => record.absolute)).toEqual(["/input", "/explicit", "/render"]);
    specimen.expect(records[0].object.payload).toEqual({ user: "hi" });
    specimen.expect(records[1].object.payload).toEqual({ n: 1 });
    specimen.expect(records[2].fault.message).toBe("boom");
  });
});
