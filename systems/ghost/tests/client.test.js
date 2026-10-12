import { Controller, Path, Span, mime, specimen, steer } from "@vivalence/typology";
import { Paladin, factories, lifecycle } from "@vivalence/paladin/typology";
import * as ghost from "@vivalence/ghost";
import { boot, DEMO } from "./scenarios/hello.js";

const mounted = async (world) => {
  const paladin = new Paladin();
  paladin.assign(world.env, "flag");
  await lifecycle.paladin.scopes(paladin);
  const instance = await factories.instance(lifecycle.paladin.instance(paladin));
  await paladin.ledger.registry.supply();
  return { paladin, instance };
};

const spoken = (clientDie) => clientDie.controller.stdout.tail("message").get().map((record) => record.data);
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
    world = await boot({ recipe: DEMO, prefix: "viva-ring-" });
    const { paladin, instance } = await mounted(world);
    const mask = instance.clients.find((client) => client.manifest.slug === "ghost");
    const root = new Controller({ stdout: new Span("ghost") });
    clientDie = new ghost.Client({ controller: root.branch("client"), mask, register: await paladin.ledger.registry.wire(mask), instance, surface: () => () => {} });
    steer.dispatch.execute(ghost.lifecycle.client.execution, clientDie);
  });
  specimen.afterAll(async () => {
    await clientDie.dispatch("/quit");
    await clientDie.controller.settled;
    await world.stop();
  });

  specimen.it("boots: lighthouse · signed in · runtime, in order", async () => {
    await eventually(() => spoken(clientDie).some((data) => data.runtime !== undefined), 30000);
    specimen.expect(spoken(clientDie).slice(0, 3).map((data) => Object.keys(data)[0])).toEqual(["lighthouse", "user", "runtime"]);
    specimen.expect(spoken(clientDie)[2]).toEqual({ runtime: "/runtime/house" });
  });

  specimen.it("a terminal lands on HOME; /modes lists the hosts' modes; /mode srs/memo sets the memo thread; many matches answer the candidates", async () => {
    await eventually(() => clientDie.active !== null && clientDie.active.thread !== null, 30000);
    specimen.expect(clientDie.active.mode.reference.absolute).toBe("/runtime/house/mode/home/probe");
    specimen.expect((await clientDie.dispatch("/modes")).map((row) => row.reference)).toEqual(specimen.expect.arrayContaining(["/runtime/house/mode/home/probe", "/daemon/memo/mode/srs/memo"]));
    specimen.expect(await clientDie.dispatch("/mode srs/memo")).toMatch(/^\/daemon\/memo\/mode\/srs\/memo · thread #/);
    specimen.expect(await clientDie.dispatch("/mode mode")).toEqual({ which: specimen.expect.arrayContaining(["/runtime/house/mode/home/probe", "/daemon/memo/mode/srs/memo"]) });
  });

  specimen.it("a bare line on a harnessed thread lands two turns on the thread's span; /mode/memo/harness reaches memo by name; on another thread the bare line faults", async () => {
    await clientDie.dispatch("ciao");
    await eventually(() => clientDie.controller.stdout.tail("turn").get().length >= 2, 30000);
    specimen.expect(clientDie.controller.stdout.tail("turn").get().map((record) => record.data.role)).toEqual(["user", "assistant"]);
    specimen.expect(clientDie.controller.stdout.tail("stream").get().at(-1).data.open).toBe(null);
    await clientDie.dispatch("/mode/memo/harness ciao");
    await eventually(() => clientDie.controller.stdout.tail("turn").get().length >= 4, 30000);
    await clientDie.dispatch("/mode probe");
    await clientDie.dispatch("ciao").catch(() => {});
    specimen.expect(clientDie.controller.stdout.tail("fault").get().at(-1).data.code).toBe("NOT_FOUND");
  });

  specimen.it("/application/start on a mode without APPLICATION faults loud, mints nothing; on memo it sets the terminal's buffer; /application/stop clears it", async () => {
    await clientDie.dispatch("/mode probe");
    await clientDie.dispatch("/application/start");
    specimen.expect(clientDie.controller.stdout.tail("fault").get().at(-1).data.message).toMatch(/not an APPLICATION — its traits: RUNTIME · EXPOSED · TOOLING · DATASET/);
    specimen.expect(clientDie.active.buffer).toBe(null);
    await clientDie.dispatch("/mode srs/memo");
    specimen.expect(await clientDie.dispatch("/application/start")).toMatch(/^application \/daemon\/memo\/mode\/srs\/memo · buffer #/);
    specimen.expect(clientDie.active.buffer).not.toBe(null);
    specimen.expect(clientDie.active.mode.application.bundle.entries.map((entry) => entry.mime)).toContain(mime.tty.solid);
    specimen.expect(await clientDie.dispatch("/application/stop")).toBe("frame closed");
    specimen.expect(clientDie.active.buffer).toBe(null);
  });
});
