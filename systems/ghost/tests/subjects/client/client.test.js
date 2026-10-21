import { Controller, Path, Span, mime, specimen } from "@vivalence/typology";
import paladin, { factories, lifecycle } from "@vivalence/paladin";
import * as ghost from "@vivalence/ghost";
import { hello } from "@vivalence/ghost/scenarios";
import { chrome } from "../../../surfaces/index.js";

const mounted = async (world) => {
  paladin.assign(world.env, "flag");
  const instance = await factories.instance(lifecycle.paladin.instance(paladin));
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
    const mask = instance.clients.find((client) => client.manifest.slug === "ghost");
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
    specimen.expect((await first(clientDie).repl.dispatch("/modes")).map((row) => row.reference)).toEqual(specimen.expect.arrayContaining(["/runtime/house/mode/home/probe", "/daemon/memo/mode/srs/memo"]));
    specimen.expect(await first(clientDie).repl.dispatch("/mode srs/memo")).toMatch(/^\/daemon\/memo\/mode\/srs\/memo · thread #/);
    specimen.expect(await first(clientDie).repl.dispatch("/mode mode")).toEqual({ which: specimen.expect.arrayContaining(["/runtime/house/mode/home/probe", "/daemon/memo/mode/srs/memo"]) });
  });

  specimen.it("a bare line on a harnessed thread lands two turns in the thread's $turns — the reply merged as it streams, the persisted row landing under the same id; /harness reaches the attached mode, memo; on another thread the bare line faults", async () => {
    const thread = first(clientDie).thread;
    const landed = () => thread.$turns.get().filter((turn) => turn.createdAt !== undefined);
    await first(clientDie).repl.dispatch("ciao");
    await eventually(() => landed().length >= 2, 30000);
    specimen.expect(thread.$turns.get().map((turn) => turn.role)).toEqual(["user", "assistant"]);
    specimen.expect(clientDie.controller.stdout.history.filter((record) => ["turn", "stream"].includes(record.track))).toEqual([]);
    await first(clientDie).repl.dispatch("/harness ciao");
    await eventually(() => landed().length >= 4, 30000);
    specimen.expect(thread.$turns.get().map((turn) => turn.role)).toEqual(["user", "assistant", "user", "assistant"]);
    await first(clientDie).repl.dispatch("/mode probe");
    await first(clientDie).repl.dispatch("ciao").catch(() => {});
    specimen.expect(clientDie.controller.stdout.history.filter((record) => ["fault"].includes(record.track)).at(-1).data.code).toBe("NOT_FOUND");
  });

  specimen.it("a memo buffer with no pinned view frames memo's own views from the store, the tty one the pick, its compile served", async () => {
    await first(clientDie).repl.dispatch("/mode srs/memo");
    const memo = first(clientDie).mode;
    const buffer = await clientDie.runtime.entities.buffer.create({ mode: memo.id, thread: first(clientDie).thread.id, data: {} });
    specimen.expect(buffer.views).toEqual([]);
    const views = await ghost.belt.view.candidates(buffer, clientDie.runtime.attach);
    specimen.expect(views.map((view) => view.mime).sort()).toEqual([mime.dom.svelte, mime.tty.solid].sort());
    specimen.expect(views.every((view) => view.slug === "memo")).toBe(true);
    const picked = ghost.belt.view.pick(views.filter(chrome.runs));
    specimen.expect(picked.mime).toBe(mime.tty.solid);
    specimen.expect(await ghost.belt.view.bytes(ghost.belt.view.entry(picked), clientDie.runtime.attach)).toContain("export");
  });
});
