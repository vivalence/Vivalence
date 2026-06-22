import { specimen, shard, RemoteRepository, RemoteEntityManager } from "@vivalence/typology";
import { create } from "../scenarios/daemon.js";

specimen.describe("daemon routes", () => {
  let scenario;

  specimen.beforeAll(async () => {
    scenario = await create();
  });

  specimen.afterAll(async () => {
    await scenario.orm.close();
  });

  specimen.it("intent has mode relation", async () => {
    const result = await scenario.conn.call("/entities/intent/findOne", {
      where: { slug: "survival-flashcard" },
    });
    specimen.expect(result.mode).toBeTruthy();
  });

  specimen.it("/datamap returns stripped schema", async () => {
    const schema = await scenario.conn.call("/datamap");
    specimen.expect(schema).toBeTruthy();
    specimen.expect(schema.literal).toBeTruthy();
    specimen.expect(schema.literal.properties).toBeTruthy();
    specimen.expect(schema.thread).toBeTruthy();
    specimen.expect(schema.thread.properties.mode).toBeTruthy();
    specimen.expect(schema.thread.properties.mode.kind).toBe("m:1");
  });

  specimen.it("wire repos from schema enables cross-repo hydration", async () => {
    const schema = await scenario.conn.call("/datamap");
    const entityManager = new RemoteEntityManager(scenario.conn, schema);
    const mode = entityManager.register("mode", new RemoteRepository());
    mode.connect(scenario.conn.branch("/entities/mode"));
    const intent = entityManager.register("intent", new RemoteRepository());
    intent.connect(scenario.conn.branch("/entities/intent"));
    const thread = entityManager.register("thread", new RemoteRepository());
    thread.connect(scenario.authedConn.branch("/userspace/entities/thread"));
    shard.datamap.wire({ mode, intent, thread }, schema);

    specimen.expect(thread.schema.stores.mode).toBe(mode);
    specimen.expect(intent.schema.stores.mode).toBe(mode);

    await mode.find();
    const intents = await intent.find({}, { populate: ["mode"] });
    specimen.expect(intents[0].mode).toBe(mode.$entities.get()[0]);
  });

  specimen.it("modes findOne by slug", async () => {
    const result = await scenario.conn.call("/modes/game/findOne", {
      where: { slug: "flashcard" },
    });
    specimen.expect(result.manifest.slug).toBe("flashcard");
  });

  specimen.it("APPLICATION mode includes buffered url and schema", async () => {
    const result = await scenario.conn.call("/modes/game/findOne", {
      where: { slug: "flashcard" },
    });
    specimen.expect(result.buffered.url).toBeTruthy();
    specimen.expect(result.buffered.schema.allOf).toBeTruthy();
  });

  specimen.it("mode has traits", async () => {
    const result = await scenario.conn.call("/modes/game/findOne", {
      where: { slug: "flashcard" },
    });
    specimen.expect(result.manifest.traits).toContain("INTENTED");
    specimen.expect(result.manifest.traits).toContain("EMITTER");
    specimen.expect(result.manifest.traits).toContain("APPLICATION");
  });
});
