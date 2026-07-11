import { specimen, sleep, shape, shard, Url, Connection, Vector, Aperture } from "@vivalence/typology";

function build() {
  const app = new Aperture();

  app.post("/echo", (input, ctx) => ({ echoed: input }));
  app.get("/ping", () => ({ pong: true }));
  app.get("/mirror", (input, ctx) => ({ mirrored: input }));
  app.get("/whoami", (ctx) => ({ bearer: ctx.request.headers.get("authorization") ?? null }));

  app.open("/feed", async function* (ctx) {
    yield { beat: 1 };
    await sleep.ms(120);
    yield { beat: 2 };
    await sleep.ms(120);
    yield { beat: 3 };
  });

  app.get("/slow", async (ctx) => {
    await sleep.ms(250);
    return { late: true };
  });

  app.post("/ingest", async (ctx) => {
    const received = [];
    for await (const item of ctx.request.subscribe()) received.push(item);
    return { received };
  });

  app.open("/marco", (ctx) => {
    ctx.socket.push("/polo", { pong: true });
    return { ok: true };
  });

  const gate = shard.serve.multiplex(app);
  app.open("/multiplex", gate);

  return { app, gate };
}

function boot(port = 0) {
  const { app, gate } = build();
  const abort = new AbortController();
  const server = Deno.serve({ port, signal: abort.signal, onListen() {} }, shape.http(app));
  return { app, gate, abort, port: server.addr.port, url: new Url(`http://localhost:${server.addr.port}`) };
}

function inbound() {
  const heard = [];
  const vector = new Vector();
  vector.open("/polo", (ctx) => {
    heard.push(ctx.input);
  });
  return { heard, vector };
}

class StubSocket extends EventTarget {
  readyState = 0;
  peer = null;

  wire(peer) {
    this.peer = peer;
  }

  send(data) {
    queueMicrotask(() => this.peer.dispatchEvent(new MessageEvent("message", { data })));
  }

  close() {
    queueMicrotask(() => {
      this.settle();
      this.peer.settle();
    });
  }

  settle() {
    if (this.readyState === 3) return;
    this.readyState = 3;
    this.dispatchEvent(new CloseEvent("close", { code: 1000 }));
  }

  arrive() {
    if (this.readyState !== 0) return;
    this.readyState = 1;
    this.dispatchEvent(new Event("open"));
  }
}

function stubPair() {
  const west = new StubSocket();
  const east = new StubSocket();
  west.wire(east);
  east.wire(west);
  east.arrive();
  queueMicrotask(() => west.arrive());
  return { west, east };
}

function exercises(scenario) {
  specimen.it("unary POST crosses the multiplex", async () => {
    const result = await scenario().connection.call("/echo", { hello: "mux" });
    specimen.expect(result.echoed).toEqual({ hello: "mux" });
  });

  specimen.it("unary GET crosses the multiplex", async () => {
    const result = await scenario().connection.call("/ping", {}, { method: "GET" });
    specimen.expect(result).toEqual({ pong: true });
  });

  specimen.it("GET carries input over frames", async () => {
    const result = await scenario().connection.call("/mirror", { deep: true }, { method: "GET" });
    specimen.expect(result.mirrored).toEqual({ deep: true });
  });

  specimen.it("per-open token crosses as the authorization header", async () => {
    const result = await scenario().connection.call("/whoami", {}, { method: "GET" });
    specimen.expect(result.bearer).toBe("Bearer sesame");
  });

  specimen.it("stream flows through one frame", async () => {
    const events = [];
    for await (const event of scenario().connection.stream("/feed")) events.push(event);
    specimen.expect(events).toEqual([{ beat: 1 }, { beat: 2 }, { beat: 3 }]);
  });

  specimen.it("stream and unary interleave on one socket", async () => {
    const drained = (async () => {
      const seen = [];
      for await (const event of scenario().connection.stream("/feed")) seen.push(event);
      return seen;
    })();

    await sleep.ms(60);
    const during = await scenario().connection.call("/echo", { probe: true });
    specimen.expect(during.echoed).toEqual({ probe: true });

    const seen = await drained;
    specimen.expect(seen.length).toBe(3);
  });

  specimen.it("upstream publish crosses the multiplex", async () => {
    async function* source() {
      yield { up: 1 };
      yield { up: 2 };
    }
    const result = await scenario().connection.publish("/ingest", source());
    specimen.expect(result.received).toEqual([{ up: 1 }, { up: 2 }]);
  });

  specimen.it("server push reaches the inbound vector", async () => {
    const answer = await scenario().connection.call("/marco", {});
    specimen.expect(answer).toEqual({ ok: true });
    await sleep.ms(50);
    specimen.expect(scenario().heard.at(-1)).toEqual({ pong: true });
  });
}

specimen.describe("multiplex", () => {
  specimen.describe("networked", () => {
    let world;
    let scenario;

    specimen.beforeAll(async () => {
      world = boot();
      await sleep.ms(50);
      const { heard, vector } = inbound();
      const transport = shard.transmitter.multiplex({
        authority: { get: () => ({ access: "sesame" }) },
        vector,
      });
      scenario = { connection: new Connection(world.url, transport), transport, heard };
    });

    specimen.afterAll(async () => {
      scenario.transport.close();
      await sleep.ms(300);
      world.abort.abort();
      await sleep.ms(20);
    });

    exercises(() => scenario);

    specimen.it("timeout shard aborts a slow unary", async () => {
      const guarded = new Connection(world.url, scenario.transport).use(
        shard.connection.timeout(80),
      );
      let fallen = null;
      try {
        await guarded.call("/slow", {}, { method: "GET" });
      } catch (error) {
        fallen = error;
      }
      specimen.expect(fallen?.type).toBe("TIMEOUT");
      await sleep.ms(250);
    });
  });

  specimen.describe("stubbed", () => {
    let scenario;

    specimen.beforeAll(() => {
      const { gate } = build();
      const { heard, vector } = inbound();
      const transport = shard.transmitter.multiplex({
        authority: { get: () => ({ access: "sesame" }) },
        vector,
        connect: () => {
          const { west, east } = stubPair();
          gate.attend(east);
          return west;
        },
      });
      scenario = { connection: new Connection(new Url("http://stub-mux"), transport), transport, heard };
    });

    specimen.afterAll(async () => {
      scenario.transport.close();
      await sleep.ms(300);
    });

    exercises(() => scenario);
  });

  specimen.describe("reconnect", () => {
    async function until(predicate, limit = 5000) {
      const start = Date.now();
      while (!predicate()) {
        if (Date.now() - start > limit) throw new Error("condition timeout");
        await sleep.ms(50);
      }
    }

    specimen.it("drop fails in-flight retryable, next call re-establishes", async () => {
      const world = boot();
      await sleep.ms(50);
      const transport = shard.transmitter.multiplex({ authority: { get: () => ({ access: "sesame" }) } });
      const connection = new Connection(world.url, transport);

      const first = await connection.call("/echo", { round: 1 });
      specimen.expect(first.echoed).toEqual({ round: 1 });

      const streaming = (async () => {
        try {
          const seen = [];
          for await (const event of connection.stream("/feed")) seen.push(event);
          return null;
        } catch (error) {
          return error;
        }
      })();

      await sleep.ms(60);
      for (const socket of world.gate.sockets) socket.close();

      const fallen = await streaming;
      specimen.expect(fallen?.type).toBe("NETWORK");
      specimen.expect(fallen?.isRetryable).toBe(true);

      await sleep.ms(50);
      const second = await connection.call("/echo", { round: 2 });
      specimen.expect(second.echoed).toEqual({ round: 2 });

      transport.close();
      await sleep.ms(300);
      world.abort.abort();
      await sleep.ms(20);
    });

    specimen.it("retry shard re-sends across a server restart", async () => {
      let world = boot();
      await sleep.ms(50);
      const transport = shard.transmitter.multiplex({ authority: { get: () => ({ access: "sesame" }) } });
      const connection = new Connection(
        world.url,
        shard.transmitter.retry(transport, { maxRetries: 3, baseDelay: 300 }),
      );

      const first = await connection.call("/echo", { round: 1 });
      specimen.expect(first.echoed).toEqual({ round: 1 });

      for (const socket of world.gate.sockets) socket.close();
      world.abort.abort();
      await sleep.ms(50);

      const pending = connection.call("/echo", { round: 2 });
      await sleep.ms(50);
      world = boot(world.port);

      const second = await pending;
      specimen.expect(second.echoed).toEqual({ round: 2 });

      transport.close();
      await sleep.ms(300);
      world.abort.abort();
      await sleep.ms(20);
    });

    specimen.it("subscribe resubscribes across drops and fires resumed", async () => {
      const world = boot();
      await sleep.ms(50);
      const transport = shard.transmitter.multiplex({ authority: { get: () => ({ access: "sesame" }) } });
      const connection = new Connection(world.url, transport);

      const seen = [];
      let healed = 0;
      const unsubscribe = connection.subscribe("/feed", (event) => seen.push(event), {
        backoff: 50,
        resumed: () => healed++,
      });

      await until(() => seen.length >= 6);

      for (const socket of world.gate.sockets) socket.close();
      await until(() => seen.length >= 9);
      specimen.expect(healed).toBeGreaterThan(0);

      unsubscribe();
      await sleep.ms(400);
      const frozen = seen.length;
      await sleep.ms(300);
      specimen.expect(seen.length).toBe(frozen);

      transport.close();
      await sleep.ms(300);
      world.abort.abort();
      await sleep.ms(20);
    });
  });
});
