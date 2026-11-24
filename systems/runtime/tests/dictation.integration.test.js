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
  for (const chunk of chunks) yield { event: "/audio/packet", audio: { data: chunk, mime: "audio/pcm" } };
}

async function drain(source) {
  const events = [];
  for await (const event of source) events.push(event);
  return events;
}

const kinds = (events) => events.map((event) => event.event);
const settled = (events) => events.filter((e) => e.event === "/part/delta").map((e) => e.part.text.trim());

let scenario;
let world;
let transport;
let connection;
let harness;

specimen.describe("dictation integration — duplex verbatim over one socket, through a mode with a ROOT harness middleware", () => {
  specimen.beforeAll(async () => {
    const persona = new Vector().use(async (ctx, next) => {
      ctx.hallucination.policy.tier ??= "fast";
      ctx.hallucination.primer.open("persona", "You are Dewey.");
      await next();
    });
    scenario = await create({ harness: persona, faculties: [verbatimFaculty()] });
    world = launch(scenario.daemon.aperture);
    await sleep.ms(100);
    transport = shard.transmitter.multiplex({ authority: { get: () => ({ access: "probe" }) } });
    connection = new Connection(world.url, transport);
    const mode = connection.branch(scenario.dewey.reference.absolute);
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

  specimen.it("audio frames up, the one grammar down, the polish after turn/close addressed to its turn — the mirror compiles the leaf", async () => {
    const thread = await scenario.createThread();
    const events = await drain(harness.verbatim.stream(frames(["one", "two", "three"]), { input: { thread: thread.id } }));

    const order = kinds(events);
    specimen.expect(order[0]).toBe("/turn/open");
    specimen.expect(order.filter((kind) => kind === "/part/draft").length).toBe(3);
    specimen.expect(settled(events).join(" ")).toBe("one two three");
    specimen.expect(order.indexOf("/part/full")).toBeGreaterThan(order.indexOf("/turn/close"));
    const polish = events.find((event) => event.event === "/part/full");
    specimen.expect(polish.turn).toBe(events[0].turn.id);
  });

  specimen.it("thread.trait.CONVERSATIONAL projects into the pipeline", async () => {
    const thread = await scenario.createThread();
    thread.traits = ["CONVERSATIONAL"];
    thread.trait = { CONVERSATIONAL: { harmonize: { tail: 1 }, polish: { engaged: false } } };
    await scenario.em.flush();

    const events = await drain(
      connection.branch(scenario.dewey.reference.absolute).converse("/harness/verbatim/stream", frames(["alpha", "beta", "gamma"]), {
        input: { thread: thread.id },
      }),
    );
    for (const event of events.filter((e) => e.event === "/part/draft")) {
      specimen.expect(event.part.text.split(" ").filter(Boolean).length <= 1).toBe(true);
    }
    specimen.expect(events.some((event) => event.event === "/part/full")).toBe(false);
  });

  specimen.it("abort mid-stream leaves no orphan frames on the socket", async () => {
    const thread = await scenario.createThread();
    const controller = new AbortController();

    async function* trickle() {
      yield { event: "/audio/packet", audio: { data: "only", mime: "audio/pcm" } };
      await sleep.ms(30);
      controller.abort();
      await sleep.ms(1000);
    }

    try {
      await drain(
        connection.branch(scenario.dewey.reference.absolute).converse("/harness/verbatim/stream", trickle(), {
          input: { thread: thread.id },
          signal: controller.signal,
        }),
      );
    } catch {}
    await sleep.ms(200);
    for (const socket of world.gate.sockets) {
      specimen.expect(socket.answers.size).toBe(0);
    }
  });
});

specimen.describe("dictation integration — no ear, no route", () => {
  specimen.it("a cortex without a verbatim stream grafts no /verbatim; the harness answers its siblings", async () => {
    const deaf = await create();
    const branches = shape.strip(deaf.dewey.aperture.branch("/harness")).branches;
    specimen.expect(Object.keys(branches)).not.toContain("verbatim");
    specimen.expect(Object.keys(branches)).toContain("dialogue");
    await deaf.orm.close();
  });
});
