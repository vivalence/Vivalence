import { specimen, steer, RemoteRepository, shard, shape, Connection, Url } from "@vivalence/typology";
import { daemon as daemonScenario } from "@vivalence/runtime/scenarios";
import { Daemon } from "../../src/daemon/daemon.js";
import { Dataspace } from "../../src/daemon/dataspace.js";
import { daemon as daemonWafer } from "../../src/daemon/daemon.wafer.js";
import { Mode } from "../../src/entities/mode.js";
import { Intent } from "../../src/entities/intent.js";

const castDaemon = steer.invoke(daemonWafer, "/construct/populate/resolve/full",
  (carry, effect) => async (die) => {
    await carry(die, async () => { die.output = await effect(die) })
    return die.output
  },
)

specimen.describe("daemon wafer (Dataspace)", { sanitizeResources: false, sanitizeOps: false }, () => {
let scenario;
let result;

specimen.beforeAll(async () => {
  localStorage.clear();
  scenario = await daemonScenario.create();

  scenario.daemon.aperture.open("/manifest", () => scenario.daemon.manifest);
  scenario.daemon.aperture.open("/cargo", () => scenario.daemon.cargo);

  const lighthouse = {
    manifest: { slug: "test-lighthouse" },
    $authority: { get: () => ({}) },
    daemons: new Map(),
  };

  result = await castDaemon({
    good: new Daemon(scenario.conn),
    variant: { lighthouse },
  });
});

specimen.afterAll(async () => {
  await scenario.orm.close();
});

  specimen.describe("construct", () => {
    specimen.it("manifest populated from daemon", () => {
      specimen.expect(result.manifest).toBeDefined();
      specimen.expect(result.slug).toBe("test-daemon");
    });

    specimen.it("mount path set from slug", () => {
      specimen.expect(result.mount.nature).toBe("/daemon/test-daemon");
    });

    specimen.it("link path set from lighthouse + daemon slug", () => {
      specimen.expect(result.link.nature).toContain("test-lighthouse");
      specimen.expect(result.link.nature).toContain("test-daemon");
    });

    specimen.it("cargo fetched", () => {
      specimen.expect(result.cargo).toBeDefined();
      specimen.expect(result.cargo.version).toBe("0.0.1");
    });
  });

  specimen.describe("populate (Dataspace)", () => {
    specimen.it("dataspace created", () => {
      specimen.expect(result.entities).toBeInstanceOf(Dataspace);
    });

    specimen.it("repos registered on dataspace", () => {
      specimen.expect(result.entities.mode).toBeInstanceOf(RemoteRepository);
      specimen.expect(result.entities.intent).toBeInstanceOf(RemoteRepository);
      specimen.expect(result.entities.thread).toBeInstanceOf(RemoteRepository);
      specimen.expect(result.entities.buffer).toBeInstanceOf(RemoteRepository);
      specimen.expect(result.entities.literal).toBeInstanceOf(RemoteRepository);
    });

    specimen.it("mode and intent repos eagerly populated", () => {
      specimen.expect(result.entities.mode.$entities.get().length).toBeGreaterThan(0);
      specimen.expect(result.entities.intent.$entities.get().length).toBeGreaterThan(0);
    });

    specimen.it("repos are managed by shared EM", () => {
      const modeRepo = result.entities.mode;
      const intentRepo = result.entities.intent;
      specimen.expect(modeRepo.entityManager).toBe(result.entities.entityManager);
      specimen.expect(intentRepo.entityManager).toBe(result.entities.entityManager);
    });
  });

  specimen.describe("resolve", () => {
    specimen.it("modes enriched with daemon, mount, connection", () => {
      const modes = result.entities.mode.$entities.get();
      specimen.expect(modes.length).toBeGreaterThan(0);
      specimen.expect(modes[0]).toBeInstanceOf(Mode);
      specimen.expect(modes[0].daemon).toBe(result);
      specimen.expect(modes[0].mount).toBeDefined();
      specimen.expect(modes[0].connection).toBeDefined();
      specimen.expect(typeof modes[0].call).toBe("function");
    });

    specimen.it("BUFFERED modes have buffer factory", () => {
      const modes = result.entities.mode.$entities.get();
      const buffered = modes.find((mode) => mode.implements("BUFFERED"));
      specimen.expect(buffered).toBeDefined();
      specimen.expect(typeof buffered.buffer).toBe("function");
      specimen.expect(buffered.buffered).toBeDefined();
    });

    specimen.it("intents linked to modes", () => {
      const modes = result.entities.mode.$entities.get();
      const mode = modes[0];
      specimen.expect(mode.intents).toBeInstanceOf(Set);
      specimen.expect(mode.intents.size).toBeGreaterThan(0);
    });

    specimen.it("intent.mode is same reference as mode from repo", () => {
      const intents = result.entities.intent.$entities.get();
      const intent = intents[0];
      const modeFromRepo = result.entities.entityManager.identity("mode", intent.mode.id ?? intent.mode);
      specimen.expect(intent.mode).toBe(modeFromRepo);
    });

    specimen.it("mode resolve hook enriches on re-fetch", async () => {
      const fresh = await result.entities.mode.find();
      specimen.expect(fresh[0].daemon).toBe(result);
      specimen.expect(fresh[0].mount).toBeDefined();
    });

    // thread resolve tested via full client integration (needs auth context + RequestContext scoping)
  });
});
