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
    const instance = await factories.instance(lifecycle.paladin.instance(paladin));
    await paladin.ledger.registry.supply();
    const mask = instance.clients.find((client) => client.manifest.slug === "ghost");
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
    specimen.expect(row.url).toMatch(/\/attached\/file\/[0-9a-f-]+$/);
    specimen.expect(clientDie.runtime.entities.mode.$entities.get()).toContain(row.mode);
    specimen.expect(clientDie.runtime.entities.daemon.$entities.get()).toContain(row.mode.daemon);
    const response = await fetch(row.url);
    const bytes = new Uint8Array(await response.arrayBuffer());
    specimen.expect(response.status).toBe(200);
    specimen.expect(bytes.length).toBe(row.bytes);
    specimen.expect(response.headers.get("x-viva-integrity")).toBe(row.integrity);
    specimen.expect(clientDie.runtime.entities.file.$entities.get().every((file) => typeof file.path === "string")).toBe(true);
  });
});
