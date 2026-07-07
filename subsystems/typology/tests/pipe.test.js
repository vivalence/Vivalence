import { specimen, Pipe } from "@vivalence/typology";

// Pipe = a synchronous fanout bus with an async-iterable bridge. send(v) fires
// every tap inline; observe()/stream() exposes the same feed as an async iterator
// that taps lazily and buffers between pulls. Real sinks:
//   src/telemetry.js              — tap → circular buffer of the last N spans
//   decks/box/device/microphone   — in = new Pipe(); in.send(event.data)
//   paladin system.js             — pipe.tap((span) => log.append(span))
//   Span.drain                    — emits the trace tree via pipe.send(root)

// ── 1. BASICS — synchronous fanout ───────────────────────────────────────────
specimen.describe("Pipe: basics", () => {
  specimen.it("send fans out to every tap; unsubscribe stops delivery", () => {
    const pipe = new Pipe();
    const a = [];
    const b = [];
    pipe.tap((v) => a.push(v));
    const untap = pipe.tap((v) => b.push(v));
    pipe.send("x");
    untap();
    pipe.send("y");
    specimen.expect(a).toEqual(["x", "y"]);
    specimen.expect(b).toEqual(["x"]); // untapped before "y"
    specimen.expect(pipe.listeners.size).toBe(1);
  });

  specimen.it("subscribe aliases tap; send to no listeners is a no-op", () => {
    const pipe = new Pipe();
    const seen = [];
    const unsub = pipe.subscribe((v) => seen.push(v));
    pipe.send("v");
    unsub();
    pipe.send("dropped");
    specimen.expect(seen).toEqual(["v"]);

    const empty = new Pipe();
    empty.send("ignored"); // must not throw
    specimen.expect(empty.listeners.size).toBe(0);
  });
});

// ── 2. ASYNC BRIDGE — observe()/stream() (the other face) ────────────────────
specimen.describe("Pipe: async bridge", () => {
  specimen.it("observe() streams live sends and buffers between pulls", async () => {
    const pipe = new Pipe();
    const stream = pipe.observe();
    const pending = stream.next(); // taps lazily on first pull, then awaits
    await Promise.resolve();
    pipe.send("a");
    pipe.send("b"); // buffered while the consumer hasn't pulled again
    const first = await pending;
    const second = await stream.next();
    specimen.expect(first.value).toBe("a");
    specimen.expect(second.value).toBe("b");
    await stream.return();
  });

  specimen.it("unsubscribe aborts the stream and untaps", async () => {
    const pipe = new Pipe();
    const stream = pipe.observe();
    const pending = stream.next();
    await Promise.resolve();
    specimen.expect(pipe.listeners.size).toBe(1);
    stream.unsubscribe();
    await pending; // abort resolves the pull as done
    specimen.expect(pipe.listeners.size).toBe(0);
  });
});

// ── 3. EDGE CASE — one send, heterogeneous sinks (telemetry fanout) ──────────
specimen.describe("Pipe: telemetry fanout", () => {
  // A single send reaches plain sinks, a circular buffer (real telemetry keeps the
  // last N), AND a live async observer — all from one bus, no extra wiring.
  specimen.it("fans one send to many sync sinks and a live async observer", async () => {
    const pipe = new Pipe();
    const log = [];
    const ring = []; // circular buffer, keep last 2
    pipe.tap((v) => log.push(v));
    pipe.tap((v) => { ring.push(v); if (ring.length > 2) ring.shift(); });

    const seen = [];
    const stream = pipe.observe();
    const consumer = (async () => {
      for await (const v of stream) {
        seen.push(v);
        if (seen.length === 3) stream.unsubscribe();
      }
    })();
    await Promise.resolve(); // let the observer register its tap

    pipe.send("a");
    pipe.send("b");
    pipe.send("c");
    await consumer;

    specimen.expect(log).toEqual(["a", "b", "c"]); // every sync tap saw all
    specimen.expect(ring).toEqual(["b", "c"]);     // circular buffer kept the last 2
    specimen.expect(seen).toEqual(["a", "b", "c"]); // async observer saw all
  });
});

specimen.describe("Pipe: reactive (scan/hold)", () => {
  specimen.it("default step holds the latest value; a fold step accumulates history", () => {
    const pipe = new Pipe();
    const latest = pipe.reactive();
    const history = pipe.reactive([], (list, value) => [...list, value]);

    const seen = [];
    latest.subscribe((value) => seen.push(value));

    pipe.send("a");
    pipe.send("b");
    pipe.send("c");

    specimen.expect(latest.get()).toBe("c");
    specimen.expect(history.get()).toEqual(["a", "b", "c"]);
    specimen.expect(seen).toEqual([null, "a", "b", "c"]);
  });
});
