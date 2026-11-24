import { Controller, Path, Span, mime, specimen } from "@vivalence/typology";
import paladin, { factories, lifecycle } from "@vivalence/paladin";
import * as ghost from "@vivalence/ghost";
import { hello } from "@vivalence/ghost/scenarios";
import { chrome } from "../../../skins/index.js";

const mounted = async (world) => {
  paladin.assign(world.env, "flag");
  lifecycle.paladin.instance(paladin);
  const instance = await factories.instance(paladin);
  await paladin.ledger.registry.supply();
  return { paladin, instance };
};

const first = (clientDie) => clientDie.runtime.entities.terminal.$entities.get()[0];
const spoken = (clientDie) => clientDie.controller.stdout.history.filter((record) => ["log"].includes(record.track)).map((record) => record.data);
const eventually = async (predicate, ms) => {
  const deadline = Date.now() + ms;
  while (!predicate()) {
    if (Date.now() > deadline) throw new Error(`timed out waiting ${ms}ms`);
    await new Promise((wake) => setTimeout(wake, 25));
  }
};

specimen.describe("the client against a world — attach, sign in, see the runtime, sit on HOME, chat, open the frame", { sanitizeOps: false, sanitizeResources: false }, () => {
  let world = null;
  let clientDie = null;
  specimen.beforeAll(async () => {
    world = await hello.boot({ recipe: hello.DEMO, prefix: "viva-ring-" });
    const { paladin, instance } = await mounted(world);
    const mask = instance.client("ghost");
    const root = new Controller({ stdout: new Span("ghost") });
    clientDie = await ghost.client.factory({ controller: root, mask, register: await paladin.ledger.registry.wire(mask), instance });
  });
  specimen.afterAll(async () => {
    clientDie.controller.kill("SIGTERM", "test over");
    await clientDie.controller.settled;
    await world.stop();
  });

  specimen.it("boots: lighthouse · signed in · runtime, in order", async () => {
    await eventually(() => spoken(clientDie).some((data) => data.runtime !== undefined), 30000);
    specimen.expect(spoken(clientDie).slice(0, 3).map((data) => Object.keys(data)[0])).toEqual(["lighthouse", "user", "runtime"]);
    specimen.expect(spoken(clientDie)[2]).toEqual({ runtime: "/runtime/house" });
  });

  specimen.it("a terminal lands on HOME; /modes lists the hosts' modes; /mode srs/memo sets the memo thread; many matches answer the candidates", async () => {
    await eventually(() => clientDie.runtime !== null && first(clientDie) !== undefined && first(clientDie).thread !== null, 30000);
    specimen.expect(first(clientDie).mode.reference.absolute).toBe("/runtime/house/mode/home/probe");
    specimen.expect((await first(clientDie).repl.dispatch("/modes")).split("\n\n").map((hosted) => hosted.trim().split("\n"))).toEqual(specimen.expect.arrayContaining([
      specimen.expect.arrayContaining(["/runtime/house", "/home/probe"]),
      specimen.expect.arrayContaining(["/daemon/memo", "/srs/memo"]),
    ]));
    specimen.expect(await first(clientDie).repl.dispatch("/mode /srs/memo")).toMatch(/^\/daemon\/memo\/mode\/srs\/memo · thread #/);
    specimen.expect(await first(clientDie).repl.dispatch("/mode mode")).toEqual({ which: specimen.expect.arrayContaining(["/runtime/house/mode/home/probe", "/daemon/memo/mode/srs/memo"]) });
  });

  specimen.it("a bare line on a harnessed thread lands two turns in the thread's $turns — the reply merged as it streams, the persisted row landing under the same id; /harness reaches the attached mode, memo; on another thread the bare line faults", async () => {
    const thread = first(clientDie).thread;
    const landed = () => thread.$turns.get().filter((turn) => turn.createdAt !== undefined);
    clientDie.app = new ghost.app.App({ client: clientDie });
    await first(clientDie).repl.dispatch("ciao");
    await eventually(() => landed().length >= 2, 30000);
    specimen.expect(thread.$turns.get().map((turn) => turn.role)).toEqual(["user", "assistant"]);
    specimen.expect(clientDie.controller.stdout.history.filter((record) => ["turn", "stream"].includes(record.track))).toEqual([]);
    await first(clientDie).repl.dispatch("/harness ciao");
    await eventually(() => landed().length >= 4, 30000);
    specimen.expect(thread.$turns.get().map((turn) => turn.role)).toEqual(["user", "assistant", "user", "assistant"]);
    clientDie.app = null;
    await first(clientDie).repl.dispatch("/mode probe");
    const faults = () => clientDie.controller.stdout.history.filter((record) => ["fault"].includes(record.track));
    const before = faults().length;
    await first(clientDie).repl.dispatch("ciao").catch(() => {});
    specimen.expect(faults()).toHaveLength(before + 1);
    specimen.expect(faults().at(-1).path.at(-1)).toBe("/*");
  });

  specimen.it("a memo buffer with no pinned surface frames memo's own surfaces from the store, the tty one the pick, its compile served", async () => {
    await first(clientDie).repl.dispatch("/mode srs/memo");
    const memo = first(clientDie).mode;
    const buffer = await clientDie.runtime.entities.buffer.create({ mode: memo.id, thread: first(clientDie).thread.id, data: {} });
    specimen.expect(buffer.surfaces).toEqual([]);
    const surfaces = ghost.belt.surface.candidates(buffer.$surfaces, buffer.mode.$surfaces).get();
    specimen.expect(surfaces.map((surface) => surface.mime).sort()).toEqual([mime.dom.svelte, mime.tty.solid].sort());
    specimen.expect(surfaces.every((surface) => surface.slug === "memo")).toBe(true);
    const picked = ghost.belt.surface.pick(surfaces.filter(chrome.runs));
    specimen.expect(picked.mime).toBe(mime.tty.solid);
    const served = await fetch(clientDie.runtime.attached(`/surface/${picked.id}`));
    specimen.expect(served.status).toBe(200);
    specimen.expect(await served.text()).toContain("export");
  });
  specimen.it("a file goes up over the socket: its bytes landed count up WHILE the body is still coming, then its File, in the client's store and on its thread", async () => {
    const thread = first(clientDie).thread;
    const began = Date.now();
    let pieces = 0;
    let ended = null;
    const body = new ReadableStream({
      async pull(controller) {
        await new Promise((wake) => setTimeout(wake, 60));
        if (pieces === 5) {
          ended = Date.now() - began;
          return controller.close();
        }
        pieces++;
        controller.enqueue(new Uint8Array(1024).fill(pieces));
      },
    });
    const arrived = [];
    for await (const packet of clientDie.runtime.entities.file.upload({ path: "slow.bin", mime: "application/octet-stream", body, thread: thread.id }))
      arrived.push({ at: Date.now() - began, packet });
    specimen.expect(arrived.map((held) => held.packet.event)).toEqual(["/landed", "/landed", "/landed", "/landed", "/landed", "/file"]);
    specimen.expect(arrived.slice(0, 5).map((held) => held.packet.landed)).toEqual([1024, 2048, 3072, 4096, 5120]);
    specimen.expect(arrived[0].at).toBeLessThan(ended);
    specimen.expect(arrived[2].at).toBeLessThan(ended);
    const file = arrived.at(-1).packet.file;
    specimen.expect(clientDie.runtime.entities.file.$entities.get().includes(file)).toBe(true);
    specimen.expect([file.bytes, file.path]).toEqual([5120, specimen.expect.stringMatching(/^files\/slow\.[0-9a-f]{8}\.bin$/)]);
    specimen.expect(file.url).toMatch(/\/attached\/file\/[0-9a-f-]+\?token=/);
  });
});
