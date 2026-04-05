import { specimen, shard, shape, Connection, Url, RemoteEntityManager, RemoteRepository } from "@vivalence/typology";
import { daemon as daemonScenario } from "@vivalence/runtime/scenarios";
import { Dataspace } from "../../src/daemon/dataspace.js";
import { Mode } from "../../src/entities/mode.js";
import { Intent } from "../../src/entities/intent.js";
import { Thread } from "../../src/entities/thread.js";

let scenario;
let authedConnection;
let schema;

specimen.beforeAll(async () => {
  scenario = await daemonScenario.create();

  scenario.daemon.aperture.open("/manifest", () => scenario.daemon.manifest);
  scenario.daemon.aperture.open("/cargo", () => scenario.daemon.cargo);

  const handler = shape.http(scenario.daemon.aperture);
  authedConnection = new Connection(new Url("http://test"), shard.transmitter.inline(handler));
  authedConnection.use(async (ctx, next) => {
    ctx.request.headers.set("authorization", "Bearer test-token");
    await next();
  });

  schema = await authedConnection.call("/datamap");
});

specimen.afterAll(async () => {
  await scenario.orm.close();
});

specimen.describe("Dataspace", { sanitizeResources: false, sanitizeOps: false }, () => {

  specimen.it("creates EM and registers repos from endpoints", () => {
    const endpoints = {
      mode: "/entities/mode",
      intent: "/entities/intent",
    };

    const daemon = { connection: authedConnection };
    const dataspace = new Dataspace(daemon, schema, endpoints);

    specimen.expect(dataspace.entityManager).toBeInstanceOf(RemoteEntityManager);
    specimen.expect(dataspace.mode).toBeInstanceOf(RemoteRepository);
    specimen.expect(dataspace.intent).toBeInstanceOf(RemoteRepository);
  });

  specimen.it("repos are typed from entity registry", () => {
    const endpoints = { mode: "/entities/mode", intent: "/entities/intent" };
    const daemon = { connection: authedConnection };
    const dataspace = new Dataspace(daemon, schema, endpoints);

    specimen.expect(dataspace.mode.kind).toBe(Mode);
    specimen.expect(dataspace.intent.kind).toBe(Intent);
  });

  specimen.it("repos are managed by the EM", () => {
    const endpoints = { mode: "/entities/mode" };
    const daemon = { connection: authedConnection };
    const dataspace = new Dataspace(daemon, schema, endpoints);

    specimen.expect(dataspace.mode.entityManager).toBe(dataspace.entityManager);
    specimen.expect(dataspace.mode.$entities).toBe(dataspace.entityManager.stores.mode);
  });

  specimen.it("populate eagerly loads repos", async () => {
    const endpoints = { mode: "/entities/mode", intent: "/entities/intent" };
    const daemon = { connection: authedConnection };
    const dataspace = new Dataspace(daemon, schema, endpoints);

    await dataspace.populate(["mode", "intent"]);

    specimen.expect(dataspace.mode.$entities.get().length).toBeGreaterThan(0);
    specimen.expect(dataspace.intent.$entities.get().length).toBeGreaterThan(0);
  });

  specimen.it("entities are instances of their Kind", async () => {
    const endpoints = { mode: "/entities/mode", intent: "/entities/intent" };
    const daemon = { connection: authedConnection };
    const dataspace = new Dataspace(daemon, schema, endpoints);

    await dataspace.populate(["mode", "intent"]);

    specimen.expect(dataspace.mode.$entities.get()[0]).toBeInstanceOf(Mode);
    specimen.expect(dataspace.intent.$entities.get()[0]).toBeInstanceOf(Intent);
  });

  specimen.it("identity holds across repos through shared EM", async () => {
    const endpoints = { mode: "/entities/mode", intent: "/entities/intent" };
    const daemon = { connection: authedConnection };
    const dataspace = new Dataspace(daemon, schema, endpoints);

    await dataspace.populate(["mode", "intent"]);

    // intent.mode should be the same Mode from the mode repo
    const intents = dataspace.intent.$entities.get();
    const intent = intents[0];
    if (typeof intent.mode === "object" && intent.mode?.id) {
      const modeFromRepo = dataspace.entityManager.identity("mode", intent.mode.id);
      specimen.expect(intent.mode).toBe(modeFromRepo);
    }
  });

  specimen.it("same reference on repeated find", async () => {
    const endpoints = { mode: "/entities/mode" };
    const daemon = { connection: authedConnection };
    const dataspace = new Dataspace(daemon, schema, endpoints);

    const first = await dataspace.mode.find();
    const second = await dataspace.mode.find();

    specimen.expect(first[0]).toBe(second[0]);
  });

  specimen.it("fork produces fresh EM", async () => {
    const endpoints = { mode: "/entities/mode" };
    const daemon = { connection: authedConnection };
    const dataspace = new Dataspace(daemon, schema, endpoints);

    await dataspace.populate(["mode"]);
    const forked = dataspace.fork();

    specimen.expect(forked).toBeInstanceOf(RemoteEntityManager);
    specimen.expect(forked.identities.size).toBe(0);
    specimen.expect(forked.connection).toBe(authedConnection);
  });
});
