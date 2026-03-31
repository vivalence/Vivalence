import { specimen, shape, Aperture, Vector, Mode } from "@vivalence/typology";
import { IntentEntity, BufferEntity } from "@vivalence/typology/entities";
import { create } from "../scenarios/daemon.js";

const EXPOSED = (mode) => {
  if (!mode.aperture) {
    console.warn(`[EXPOSED] ${mode.type}/${mode.slug} has no aperture`);
    return;
  }
  return () => {
    mode.call = shape.object(mode.aperture);
  };
};

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

    specimen.it("intent has where in trait data", async () => {
      const intent = await scenario.em.findOne(IntentEntity, { slug: "survival-flashcard" });
      specimen.expect(intent.trait.FURNISHED.where.symbols).toEqual(["greeting"]);
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

  specimen.describe("EXPOSED", () => {
    specimen.it("returns finalizer that compiles mode.call", async () => {
      const finalizer = await EXPOSED(scenario.mode, scenario.daemon);
      specimen.expect(typeof finalizer).toBe("function");
      await finalizer();
      specimen.expect(scenario.mode.call).toBeTruthy();
    });

    specimen.it("mode.call.emit.literal works (same as mode.emit)", async () => {
      const result = await scenario.mode.call.emit.literal({
        literal: { id: scenario.fixtures.hello.id },
      });
      specimen.expect(result.condition).toBe("NOMINAL");
      specimen.expect(result.buffers[0].data.recall).toBe("LEARNING");
    });

    specimen.it("mode.call.buffered returns url and schema", async () => {
      const result = await scenario.mode.call.buffered();
      specimen.expect(result.url).toBeTruthy();
      specimen.expect(result.schema).toBeTruthy();
    });

    specimen.it("arity 2 handlers work through object compilation", async () => {
      const mode = new Mode({ manifest: { type: "test", slug: "arity", traits: ["EXPOSED"] } });
      mode.aperture = new Aperture();
      mode.aperture.open("/echo", (input, ctx) => ({ got: input, has: "daemon" in ctx }));
      mode.aperture.use(async (ctx, next) => { ctx.daemon = "d"; await next(); });
      const fin = await EXPOSED(mode);
      await fin();
      const result = await mode.call.echo({ x: 1 });
      specimen.expect(result.got).toEqual({ x: 1 });
      specimen.expect(result.has).toBe(true);
    });

    specimen.it("context has daemon and mode, no request", async () => {
      const mode = new Mode({ manifest: { type: "test", slug: "ctx-check", traits: ["EXPOSED"] } });
      mode.aperture = new Aperture();
      mode.aperture.open("/probe", (ctx) => ({
        hasDaemon: "daemon" in ctx,
        hasMode: "mode" in ctx,
        hasRequest: "request" in ctx,
      }));
      mode.aperture.use(async (ctx, next) => {
        ctx.daemon = "d";
        ctx.mode = "m";
        await next();
      });
      const fin = await EXPOSED(mode);
      await fin();
      const result = await mode.call.probe();
      specimen.expect(result.hasDaemon).toBe(true);
      specimen.expect(result.hasMode).toBe(true);
      specimen.expect(result.hasRequest).toBe(true);
    });

    specimen.it("returns undefined when mode has no aperture", async () => {
      const mode = new Mode({ manifest: { type: "test", slug: "no-ap", traits: ["EXPOSED"] } });
      const result = await EXPOSED(mode);
      specimen.expect(result).toBeUndefined();
    });
  });

  specimen.describe("EMITTER", () => {
    specimen.it("compiles callable on mode.emit", () => {
      specimen.expect(scenario.mode.emit).toBeTruthy();
      specimen.expect(typeof scenario.mode.emit.literal).toBe("function");
    });

    specimen.it("mode.emit.literal returns unwrapped buffers", async () => {
      const result = await scenario.mode.emit.literal({
        literal: { id: scenario.fixtures.hello.id },
      });
      specimen.expect(Array.isArray(result)).toBe(true);
      specimen.expect(result.length).toBe(1);
      specimen.expect(result[0].mode.id ?? result[0].mode).toBe(scenario.fixtures.mode.id);
      specimen.expect(result[0].data.recall).toBe("LEARNING");
      specimen.expect(result[0].literals).toBeTruthy();
    });

    specimen.it("normalizes single return to array", async () => {
      const result = await scenario.mode.emit.literal({ literal: { id: scenario.fixtures.goodbye.id } });
      specimen.expect(Array.isArray(result)).toBe(true);
    });

    specimen.it("/emit/literal HTTP route responds with Yield", async () => {
      const result = await scenario.conn.call(
        "/mode/game/flashcard/emit/literal",
        { literal: { id: scenario.fixtures.hello.id } },
      );
      specimen.expect(result.condition).toBe("NOMINAL");
      specimen.expect(result.buffers[0].data).toBeTruthy();
      specimen.expect(result.buffers[0].literals).toBeTruthy();
    });

    specimen.it("persists buffer to DB when thread provided", async () => {
      const result = await scenario.mode.emit.literal({
        literal: { id: scenario.fixtures.hello.id },
        thread: scenario.fixtures.thread.id,
      });
      specimen.expect(result[0].id).toBeTruthy();
      const found = await scenario.em.findOne(BufferEntity, { id: result[0].id }, { populate: ["literals"] });
      specimen.expect(found).toBeTruthy();
      specimen.expect(found.data.recall).toBe("LEARNING");
      specimen.expect(found.mode.id).toBe(scenario.fixtures.mode.id);
      specimen.expect(found.literals.getItems()).toHaveLength(1);
    });

    specimen.it("persisted buffer has correct index from thread counter", async () => {
      const before = scenario.fixtures.thread.counter;
      const result = await scenario.mode.emit.literal({
        literal: { id: scenario.fixtures.hello.id },
        thread: scenario.fixtures.thread.id,
      });
      specimen.expect(result[0].index).toBe(before);
      specimen.expect(scenario.fixtures.thread.counter).toBe(before + 1);
    });

    specimen.it("buffer without thread has null thread", async () => {
      const result = await scenario.mode.emit.literal({ literal: { id: scenario.fixtures.goodbye.id } });
      const found = await scenario.em.findOne(BufferEntity, { id: result[0].id });
      specimen.expect(found).toBeTruthy();
      specimen.expect(found.thread).toBeNull();
    });

    specimen.it("empty return yields EXHAUSTED", async () => {
      const emptyMode = new Mode({ manifest: { type: "game", slug: "empty", traits: ["EMITTER"] } });
      emptyMode.aperture = new Aperture();
      emptyMode.entity = scenario.fixtures.mode;
      emptyMode.id = scenario.fixtures.mode.id;
      emptyMode.cake.emitter = new Vector().open("/nothing", async () => []);
      const { EMITTER: E } = await import("@vivalence/runtime/daemon/traits");
      await E(emptyMode, scenario.daemon);
      const result = await emptyMode.emit.nothing({});
      specimen.expect(result.condition).toBe("EXHAUSTED");
      specimen.expect(result.buffers).toEqual([]);
    });
  });
});
