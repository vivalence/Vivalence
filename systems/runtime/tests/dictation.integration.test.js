import { specimen, sleep, shape, shard, Url, Connection, Vector } from "@vivalence/typology";
import { create } from "./scenarios/cortex.js";
import { verbatimFaculty } from "./scenarios/fixtures.js";

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

async function* frames(chunks) {
  for (const chunk of chunks) yield { event: "/audio/packet", audio: chunk, rate: 16000 };
}

async function drain(source) {
  const events = [];
  for await (const event of source) events.push(event);
  return events;
}

const kinds = (events) => events.map((event) => event.event);
const commits = (events) => events.filter((e) => e.event === "/verbatim/commit").map((e) => e.text);

let scenario;
let world;
let transport;
let connection;
let harness;

specimen.describe("dictation integration — duplex verbatim over one socket, through a mode with a ROOT harness middleware", () => {
  specimen.beforeAll(async () => {
    const persona = new Vector().use(async (ctx, next) => {
      ctx.hallucination.policy.tune ??= "fast";
      ctx.hallucination.system.persona = "You are Dewey.";
      await next();
    });
    scenario = await create({ harness: persona });
    scenario.cortex.register([verbatimFaculty()]);
    world = launch(scenario.daemon.aperture);
    await sleep.ms(100);
    transport = shard.transmitter.multiplex({ authority: { get: () => ({ access: "probe" }) } });
    connection = new Connection(world.url, transport);
    const mode = connection.branch(scenario.dewey.mount.absolute);
    harness = shape.connection.wire(
      mode.branch("/harness"),
      shape.strip(scenario.dewey.aperture.branch("/harness")),
    );
  });

  specimen.afterAll(async () => {
    transport.close();
    await sleep.ms(200);
    world.abort.abort();
    await sleep.ms(20);
    await scenario.orm.close();
  });

  specimen.it("audio frames up, harmonized events down, polish after turn/close — the mirror compiles the leaf", async () => {
    const thread = await scenario.createThread();
    const events = await drain(harness.verbatim.stream(frames(["one", "two", "three"]), { input: { thread: thread.id } }));

    const order = kinds(events);
    specimen.expect(order[0]).toBe("/turn/open");
    specimen.expect(order.filter((kind) => kind === "/verbatim/partial").length).toBe(3);
    specimen.expect(commits(events).join(" ")).toBe("one two three");
    const final = events.find((event) => event.event === "/verbatim/final");
    specimen.expect(final.transcript).toBe("one two three");
    specimen.expect(final.segment).toBe(0);
    specimen.expect(order.indexOf("/verbatim/polish")).toBeGreaterThan(order.indexOf("/turn/close"));
    const polish = events.find((event) => event.event === "/verbatim/polish");
    specimen.expect(polish.segments).toEqual([0]);
  });

  specimen.it("thread.trait.VOCAL projects into the pipeline", async () => {
    const thread = await scenario.createThread();
    thread.traits = ["VOCAL"];
    thread.trait = { VOCAL: { harmonize: { tail: 1 }, polish: false } };
    await scenario.em.flush();

    const events = await drain(
      connection.branch(scenario.dewey.mount.absolute).converse("/harness/verbatim/stream", frames(["alpha", "beta", "gamma"]), {
        input: { thread: thread.id },
      }),
    );
    for (const event of events.filter((e) => e.event === "/verbatim/partial")) {
      specimen.expect(event.transcript.split(" ").filter(Boolean).length <= 1).toBe(true);
    }
    specimen.expect(events.some((event) => event.event === "/verbatim/polish")).toBe(false);
  });

  specimen.it("abort mid-stream leaves no orphan frames on the socket", async () => {
    const thread = await scenario.createThread();
    const controller = new AbortController();

    async function* trickle() {
      yield { event: "/audio/packet", audio: "only", rate: 16000 };
      await sleep.ms(30);
      controller.abort();
      await sleep.ms(1000);
    }

    try {
      await drain(
        connection.branch(scenario.dewey.mount.absolute).converse("/harness/verbatim/stream", trickle(), {
          input: { thread: thread.id },
          signal: controller.signal,
        }),
      );
    } catch {}
    await sleep.ms(200);
    for (const socket of world.gate.sockets) {
      specimen.expect(socket.lines.size).toBe(0);
    }
  });
});
