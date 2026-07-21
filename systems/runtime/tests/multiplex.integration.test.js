import { specimen, sleep, shape, shard, Url, Connection } from "@vivalence/typology";
import { create } from "./scenarios/cortex.js";
import { tiers } from "./scenarios/fixtures.js";

function launch(aperture, port = 0) {
  const gate = shard.serve.multiplex(aperture);
  aperture.open("/multiplex", gate);
  const abort = new AbortController();
  const server = Deno.serve({ port, signal: abort.signal, onListen() {} }, shape.http(aperture));
  return {
    gate,
    abort,
    port: server.addr.port,
    url: new Url(`http://localhost:${server.addr.port}`),
  };
}

async function drain(source) {
  const frames = [];
  for await (const frame of source) frames.push(frame);
  return frames;
}

let scenario;
let world;
let transport;
let connection;

specimen.describe("multiplex integration — dewey harness over one socket", () => {
  specimen.beforeAll(async () => {
    scenario = await create();
    world = launch(scenario.dewey.aperture);
    await sleep.ms(100);
    transport = shard.transmitter.multiplex({ authority: { get: () => ({ access: "probe" }) } });
    connection = new Connection(world.url, transport);
  });

  specimen.afterAll(async () => {
    transport.close();
    await sleep.ms(200);
    world.abort.abort();
    await sleep.ms(20);
    await scenario.orm.close();
  });

  specimen.it("unary render crosses the multiplex and persists turns", async () => {
    const thread = await scenario.createThread();
    const folded = await connection.call("/harness/dialogue/render", {
      thread: thread.id,
      parts: [{ type: "text", text: "render ping" }],
    });

    specimen.expect(folded.state).toBe("complete");
    specimen.expect(folded.message).toContain("render ping");
  });

  specimen.it("dialogue streams through one frame with full turn grammar", async () => {
    const thread = await scenario.createThread();
    const frames = await drain(
      connection.stream("/harness/dialogue/stream", undefined, {
        method: "POST",
        body: { thread: thread.id, parts: [{ type: "text", text: "stream ping" }] },
      }),
    );

    const opens = frames.filter((frame) => frame.event === "/turn/open");
    const deltas = frames.filter((frame) => frame.event === "/part/delta");
    const closes = frames.filter((frame) => frame.event === "/turn/close");

    specimen.expect(opens.length).toBe(1);
    specimen.expect(closes.length).toBe(1);
    specimen.expect(deltas.length).toBeGreaterThan(0);
  });

  specimen.it("streamed dialogue persists turns inside the onion", async () => {
    const thread = await scenario.createThread();
    await drain(
      connection.stream("/harness/dialogue/stream", undefined, {
        method: "POST",
        body: { thread: thread.id, parts: [{ type: "text", text: "persist me" }] },
      }),
    );

    const turns = await scenario.em.find(tiers.turn.entity, { thread: thread.id });
    specimen.expect(turns.length).toBeGreaterThan(1);
  });

  specimen.it("multiplex stream matches the direct fetcher stream", async () => {
    const thread = await scenario.createThread();
    const ask = (transport) =>
      drain(
        new Connection(world.url, transport).stream("/harness/dialogue/stream", undefined, {
          method: "POST",
          body: { thread: thread.id, parts: [{ type: "text", text: "parity ping" }] },
        }),
      );

    const muxed = await ask(transport);
    const direct = await ask(shard.transmitter.fetcher);

    specimen.expect(muxed.map((frame) => frame.event)).toEqual(direct.map((frame) => frame.event));
  });

  specimen.it("retry heals a unary across a daemon restart", async () => {
    const thread = await scenario.createThread();
    const healing = new Connection(
      world.url,
      shard.transmitter.retry(transport, { maxRetries: 3, baseDelay: 300 }),
    );

    const first = await healing.call("/harness/dialogue/render", {
      thread: thread.id,
      parts: [{ type: "text", text: "before restart" }],
    });
    specimen.expect(first.state).toBe("complete");

    for (const socket of world.gate.sockets) socket.close();
    world.abort.abort();
    await sleep.ms(50);

    const pending = healing.call("/harness/dialogue/render", {
      thread: thread.id,
      parts: [{ type: "text", text: "after restart" }],
    });
    await sleep.ms(50);
    world = launch(scenario.dewey.aperture, world.port);

    const second = await pending;
    specimen.expect(second.state).toBe("complete");
    specimen.expect(second.message).toContain("after restart");
  });
});
