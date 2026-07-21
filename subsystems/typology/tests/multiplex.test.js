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

async function traverse(connection, heard) {
  const echoed = await connection.call("/echo", { hello: "mux" });
  specimen.expect(echoed.echoed).toEqual({ hello: "mux" });

  const pinged = await connection.call("/ping", {}, { method: "GET" });
  specimen.expect(pinged).toEqual({ pong: true });

  const mirrored = await connection.call("/mirror", { deep: true }, { method: "GET" });
  specimen.expect(mirrored.mirrored).toEqual({ deep: true });

  const identified = await connection.call("/whoami", {}, { method: "GET" });
  specimen.expect(identified.bearer).toBe("Bearer sesame");

  const events = [];
  for await (const event of connection.stream("/feed")) events.push(event);
  specimen.expect(events).toEqual([{ beat: 1 }, { beat: 2 }, { beat: 3 }]);

  const drained = (async () => {
    const seen = [];
    for await (const event of connection.stream("/feed")) seen.push(event);
    return seen;
  })();
  await sleep.ms(60);
  const during = await connection.call("/echo", { probe: true });
  specimen.expect(during.echoed).toEqual({ probe: true });
  const interleaved = await drained;
  specimen.expect(interleaved.length).toBe(3);

  async function* source() {
    yield { up: 1 };
    yield { up: 2 };
  }
  const published = await connection.publish("/ingest", source());
  specimen.expect(published.received).toEqual([{ up: 1 }, { up: 2 }]);

  const answered = await connection.call("/marco", {});
  specimen.expect(answered).toEqual({ ok: true });
  await sleep.ms(50);
  specimen.expect(heard.at(-1)).toEqual({ pong: true });
}

async function until(predicate, limit = 5000) {
  const start = Date.now();
  while (!predicate()) {
    if (Date.now() - start > limit) throw new Error("condition timeout");
    await sleep.ms(50);
  }
}

specimen.describe("multiplex", () => {
  specimen.it("a connection crosses the live wire", async () => {
    const world = boot();
    await sleep.ms(50);
    const { heard, vector } = inbound();
    const transport = shard.transmitter.multiplex({
      authority: { get: () => ({ access: "sesame" }) },
      vector,
    });
    const connection = new Connection(world.url, transport);

    await traverse(connection, heard);

    const guarded = new Connection(world.url, transport).use(shard.connection.timeout(80));
    let fallen = null;
    try {
      await guarded.call("/slow", {}, { method: "GET" });
    } catch (error) {
      fallen = error;
    }
    specimen.expect(fallen?.type).toBe("TIMEOUT");
    await sleep.ms(250);

    transport.close();
    await sleep.ms(300);
    world.abort.abort();
    await sleep.ms(20);
  });

  specimen.it("a stubbed pair carries the same traffic", async () => {
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
    const connection = new Connection(new Url("http://stub-mux"), transport);

    await traverse(connection, heard);

    transport.close();
    await sleep.ms(300);
  });

  specimen.it("a drop fails the in-flight stream and the next call heals", async () => {
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

  specimen.it("a retry shard re-sends across a server restart", async () => {
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

  specimen.it("a subscription resubscribes across drops and fires resumed", async () => {
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
