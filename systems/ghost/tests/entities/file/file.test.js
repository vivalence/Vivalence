import { Controller, Span, belt, specimen } from "@vivalence/typology";
import paladin, { factories, lifecycle } from "@vivalence/paladin";
import * as ghost from "@vivalence/ghost";
import { hello } from "@vivalence/ghost/scenarios";

specimen.describe("the client's File rows — every row at boot, each url serving its own bytes", { sanitizeOps: false, sanitizeResources: false }, () => {
  let world = null;
  let clientDie = null;
  specimen.beforeAll(async () => {
    world = await hello.boot({ recipe: hello.DEMO, prefix: "viva-file-" });
    paladin.assign(world.env, "flag");
    lifecycle.paladin.instance(paladin);
    const instance = await factories.instance(paladin);
    await paladin.ledger.registry.supply();
    const mask = instance.client("ghost");
    clientDie = await ghost.client.factory({ controller: new Controller({ stdout: new Span("ghost") }), mask, register: await paladin.ledger.registry.wire(mask), instance });
  });
  specimen.afterAll(async () => {
    clientDie.controller.kill("SIGTERM", "test over");
    await clientDie.controller.settled;
    await world.stop();
  });

  specimen.it("a row carries /attached/file/:id and the client's own Mode, its Daemon beside; the bytes there are the row's, by length and integrity; every row carries a path", async () => {
    await belt.atom.until(clientDie.runtime.entities.file.$entities, (files) => files.length > 0, AbortSignal.timeout(30000));
    const [row] = clientDie.runtime.entities.file.$entities.get();
    specimen.expect(row.url).toMatch(/\/attached\/file\/[0-9a-f-]+\?token=[\w.-]+$/);
    specimen.expect(clientDie.runtime.entities.mode.$entities.get()).toContain(row.mode);
    specimen.expect(clientDie.runtime.entities.daemon.$entities.get()).toContain(row.mode.daemon);
    specimen.expect(Object.keys(row.toJSON()).filter((key) => key.endsWith("url"))).toEqual([]);
    const response = await fetch(row.url);
    const bytes = new Uint8Array(await response.arrayBuffer());
    specimen.expect(response.status).toBe(200);
    specimen.expect(bytes.length).toBe(row.bytes);
    specimen.expect(response.headers.get("x-viva-integrity")).toBe(row.integrity);
    specimen.expect(clientDie.runtime.entities.file.$entities.get().every((file) => typeof file.path === "string")).toBe(true);
  });

  specimen.it("an owner lists its files: a mode the Files naming it, a daemon those of its modes; a File naming nobody is the runtime's and no daemon's", async () => {
    const stored = () => clientDie.runtime.entities.file.$entities.get();
    const [row] = stored();
    specimen.expect(row.mode.files).toEqual(stored().filter((file) => file.mode === row.mode));
    specimen.expect(row.mode.daemon.files).toEqual(stored().filter((file) => file.mode !== null && file.mode.daemon === row.mode.daemon));
    let loose = null;
    const body = new Blob([new Uint8Array([1, 2, 3])]).stream();
    for await (const packet of clientDie.runtime.entities.file.upload({ path: "loose.bin", mime: "application/octet-stream", body }))
      if (packet.event === "/file") loose = packet.file;
    specimen.expect(loose.mode).toBe(null);
    specimen.expect(loose.daemon).toBe(null);
    specimen.expect(clientDie.runtime.files).toContain(loose);
    for (const daemon of clientDie.runtime.entities.daemon.$entities.get()) specimen.expect(daemon.files).not.toContain(loose);
    specimen.expect(row.mode.daemon.files).toEqual(stored().filter((file) => file.mode !== null && file.mode.daemon === row.mode.daemon));
  });
});
