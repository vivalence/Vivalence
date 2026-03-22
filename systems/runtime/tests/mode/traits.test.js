import { specimen } from "@vivalence/typology";
import { IntentEntity, BufferEntity } from "@vivalence/typology/entities";
import { create } from "../scenarios/daemon.js";

specimen.describe("mode traits", () => {
  let scenario;

  specimen.beforeAll(async () => {
    scenario = await create();
  });

  specimen.afterAll(async () => {
    await scenario.orm.close();
  });

  specimen.describe("INTENTED", () => {
    specimen.it("upserts intents from dataset", async () => {
      const intents = await scenario.em.find(IntentEntity, {});
      const traitIntent = intents.find((i) => i.slug === "survival-flashcard");
      specimen.expect(traitIntent).toBeTruthy();
    });

    specimen.it("intent has correct type and traits", async () => {
      const intent = await scenario.em.findOne(IntentEntity, { slug: "survival-flashcard" });
      specimen.expect(intent.type).toBe("SELFEVIDENT");
      specimen.expect(intent.traits).toEqual(["FURNISHED"]);
    });

    specimen.it("intent has seek in trait data", async () => {
      const intent = await scenario.em.findOne(IntentEntity, { slug: "survival-flashcard" });
      specimen.expect(intent.trait.FURNISHED.seek.symbols).toEqual(["greeting"]);
    });

    specimen.it("intent queryable via datamap", async () => {
      const result = await scenario.conn.call("/entities/intent/findOne", {
        where: { slug: "survival-flashcard" },
      });
      specimen.expect(result.slug).toBe("survival-flashcard");
    });
  });

  specimen.describe("BUFFERED", () => {
    specimen.it("mode.buffer() returns entity with data and literals", () => {
      const result = scenario.mode.buffer({
        data: { recall: "KNOWN" },
        literals: [scenario.fixtures.hello.id],
      });
      specimen.expect(result).toBeInstanceOf(BufferEntity);
      specimen.expect(result.data.recall).toBe("KNOWN");
      specimen.expect(result.literals.getItems()).toHaveLength(1);
    });

    specimen.it("mode.buffer() fills defaults from schema", () => {
      const result = scenario.mode.buffer({
        literals: [scenario.fixtures.hello.id],
      });
      specimen.expect(result.data.recall).toBe("LEARNING");
    });

    specimen.it("/buffered endpoint serves url and schema", async () => {
      const result = await scenario.conn.call("/mode/game/flashcard/buffered");
      specimen.expect(result.url).toBeTruthy();
      specimen.expect(result.schema).toBeTruthy();
    });
  });

  specimen.describe("EMITTER", () => {
    specimen.it("compiles callable on mode.emit", () => {
      specimen.expect(scenario.mode.emit).toBeTruthy();
      specimen.expect(typeof scenario.mode.emit.literal).toBe("function");
    });

    specimen.it("mode.emit.literal returns wire format", async () => {
      const result = await scenario.mode.emit.literal({
        literal: { id: scenario.fixtures.hello.id },
      });
      specimen.expect(Array.isArray(result)).toBe(true);
      specimen.expect(result.length).toBe(1);
      specimen.expect(result[0].mode).toBe(scenario.fixtures.mode.id);
      specimen.expect(result[0].data.recall).toBe("LEARNING");
      specimen.expect(result[0].literals).toBeTruthy();
    });

    specimen.it("normalizes single return to array", async () => {
      const result = await scenario.mode.emit.literal({ literal: { id: scenario.fixtures.goodbye.id } });
      specimen.expect(Array.isArray(result)).toBe(true);
    });

    specimen.it("/emit/literal HTTP route responds with wire format", async () => {
      const result = await scenario.conn.call(
        "/mode/game/flashcard/emit/literal",
        { literal: { id: scenario.fixtures.hello.id } },
      );
      specimen.expect(Array.isArray(result)).toBe(true);
      specimen.expect(result[0].data).toBeTruthy();
      specimen.expect(result[0].literals).toBeTruthy();
    });

    specimen.it("persists buffer to DB when session provided", async () => {
      const result = await scenario.mode.emit.literal({
        literal: { id: scenario.fixtures.hello.id },
        session: scenario.fixtures.session.id,
      });
      specimen.expect(result[0].id).toBeTruthy();
      const found = await scenario.em.findOne(BufferEntity, { id: result[0].id }, { populate: ["literals"] });
      specimen.expect(found).toBeTruthy();
      specimen.expect(found.data.recall).toBe("LEARNING");
      specimen.expect(found.mode.id).toBe(scenario.fixtures.mode.id);
      specimen.expect(found.literals.getItems()).toHaveLength(1);
    });

    specimen.it("persisted buffer has correct index from session counter", async () => {
      const before = scenario.fixtures.session.counter;
      const result = await scenario.mode.emit.literal({
        literal: { id: scenario.fixtures.hello.id },
        session: scenario.fixtures.session.id,
      });
      specimen.expect(result[0].index).toBe(before);
      specimen.expect(scenario.fixtures.session.counter).toBe(before + 1);
    });

    specimen.it("buffer without session has null session", async () => {
      const result = await scenario.mode.emit.literal({ literal: { id: scenario.fixtures.goodbye.id } });
      const found = await scenario.em.findOne(BufferEntity, { id: result[0].id });
      specimen.expect(found).toBeTruthy();
      specimen.expect(found.session).toBeNull();
    });
  });
});

// specimen.describe("BUFFERED (old)", () => {
//   specimen.it("mode.buffer() produces correct shape", () => {
//     const result = scenario.mode.buffer({ literal: { id: "test-literal" } });
//     specimen.expect(result.mode).toBe(scenario.fixtures.mode.id);
//     specimen.expect(result.props.literal).toEqual({ id: "test-literal" });
//     specimen.expect(result.props.recall).toBe("LEARNING");
//   });
//   specimen.it("/buffered endpoint serves url and schema", async () => {
//     const result = await scenario.conn.call("/mode/game/flashcard/buffered");
//     specimen.expect(result.schema).toEqual({ literal: null, recall: "LEARNING" });
//   });
// });
// specimen.describe("EMITTER (old)", () => {
//   specimen.it("mode.emit.literal returns {mode, props} shape", async () => {
//     const result = await scenario.mode.emit.literal({ literal: { id: scenario.fixtures.hello.id } });
//     specimen.expect(result[0].props.literal).toEqual({ id: scenario.fixtures.hello.id });
//     specimen.expect(result[0].props.recall).toBe("LEARNING");
//   });
//   specimen.it("persists buffer to DB when session provided", async () => {
//     const found = await scenario.em.findOne(BufferEntity, { id: result[0].id });
//     specimen.expect(found.props.literal).toEqual({ id: scenario.fixtures.hello.id });
//   });
// });
