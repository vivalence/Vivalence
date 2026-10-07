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
    const result = await scenario.userspace.call("/userspace/entities/intent/findOne", {
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
    intent.connect(scenario.userspace.branch("/userspace/entities/intent"));
    const thread = entityManager.register("thread", new RemoteRepository());
    thread.connect(scenario.userspace.branch("/userspace/entities/thread"));
    shard.datamap.wire({ mode, intent, thread }, schema);

    specimen.expect(thread.schema.stores.mode).toBe(mode);
    specimen.expect(intent.schema.stores.mode).toBe(mode);

    await mode.find();
    const intents = await intent.find({}, { populate: ["mode"] });
    specimen.expect(intents[0].mode).toBe(mode.$entities.get()[0]);
  });

  specimen.it("a mode's record reads through /entities/mode, like any entity — no /modes route", async () => {
    const result = await scenario.conn.call("/entities/mode/findOne", { where: { id: scenario.mode.entity.id } });
    specimen.expect(result.id).toBe(scenario.mode.entity.id);
    specimen.expect(result.slug).toBe(scenario.mode.entity.slug);
    specimen.expect(result.traits).toEqual(scenario.mode.entity.traits);
  });
});
