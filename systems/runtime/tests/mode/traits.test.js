import { specimen, shape, Aperture, Vector, Mode } from "@vivalence/typology";
import { IntentEntity, BufferEntity, ThreadEntity } from "@vivalence/runtime";
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

    specimen.it("intent has correct traits", async () => {
      const intent = await scenario.em.findOne(IntentEntity, { slug: "survival-flashcard" });
      specimen.expect(intent.traits).toEqual(["MASKED"]);
    });

    specimen.it("intent has where in trait data", async () => {
      const intent = await scenario.em.findOne(IntentEntity, { slug: "survival-flashcard" });
      specimen.expect(intent.trait.MASKED.where.symbols).toEqual(["greeting"]);
    });

    specimen.it("intent queryable via datamap", async () => {
      const result = await scenario.authedConn.call("/userspace/entities/intent/findOne", {
        where: { slug: "survival-flashcard" },
      });
      specimen.expect(result.slug).toBe("survival-flashcard");
    });
  });

  specimen.describe("APPLICATION", () => {
    specimen.it("mode.app.buffer() returns entity with data and literals", () => {
      const result = scenario.mode.app.buffer({
        data: { recall: "KNOWN" },
        literals: [scenario.fixtures.hello.id],
      });
      specimen.expect(result).toBeInstanceOf(BufferEntity);
      specimen.expect(result.data.recall).toBe("KNOWN");
      specimen.expect(result.literals.getItems()).toHaveLength(1);
    });

    specimen.it("mode.app.buffer() fills defaults from schema", () => {
      const result = scenario.mode.app.buffer({
        literals: [scenario.fixtures.hello.id],
      });
      specimen.expect(result.data.recall).toBe("LEARNING");
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
      specimen.expect(result.output.buffer[0].data.recall).toBe("LEARNING");
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

    specimen.it("mode.emit.literal returns yield envelope", async () => {
      await scenario.scoped(async () => {
        const result = await scenario.mode.emit.literal({
          literal: { id: scenario.fixtures.hello.id },
        });
        specimen.expect(result.condition).toBe("NOMINAL");
        specimen.expect(result.output.buffer).toHaveLength(1);
        specimen.expect(result.output.buffer[0].mode.id ?? result.output.buffer[0].mode).toBe(scenario.fixtures.mode.id);
        specimen.expect(result.output.buffer[0].data.recall).toBe("LEARNING");
        specimen.expect(result.output.buffer[0].literals).toBeTruthy();
      });
    });

    specimen.it("single return wrapped in yield envelope", async () => {
      await scenario.scoped(async () => {
        const result = await scenario.mode.emit.literal({ literal: { id: scenario.fixtures.goodbye.id } });
        specimen.expect(result.condition).toBe("NOMINAL");
        specimen.expect(result.output.buffer).toHaveLength(1);
      });
    });

    specimen.it("/emit/literal HTTP route responds with Yield", async () => {
      const result = await scenario.conn.call(
        "/mode/game/flashcard/emit/literal",
        { literal: { id: scenario.fixtures.hello.id } },
      );
      specimen.expect(result.condition).toBe("NOMINAL");
      specimen.expect(result.output.buffer[0].data).toBeTruthy();
      specimen.expect(result.output.buffer[0].literals).toBeTruthy();
    });

    specimen.it("persists buffer to DB when thread provided", async () => {
      await scenario.scoped(async (em) => {
        const result = await scenario.mode.emit.literal({
          literal: { id: scenario.fixtures.hello.id },
          thread: scenario.fixtures.thread.id,
        });
        specimen.expect(result.output.buffer[0].id).toBeTruthy();
        const found = await em.findOne(BufferEntity, { id: result.output.buffer[0].id }, { populate: ["literals"] });
        specimen.expect(found).toBeTruthy();
        specimen.expect(found.data.recall).toBe("LEARNING");
        specimen.expect(found.mode.id).toBe(scenario.fixtures.mode.id);
        specimen.expect(found.literals.getItems()).toHaveLength(1);
      });
    });

    specimen.it("persisted buffer has correct index from thread counter", async () => {
      await scenario.scoped(async (em) => {
        const thread = await em.findOne(ThreadEntity, { id: scenario.fixtures.thread.id });
        const before = thread.counter;
        const result = await scenario.mode.emit.literal({
          literal: { id: scenario.fixtures.hello.id },
          thread: scenario.fixtures.thread.id,
        });
        specimen.expect(result.output.buffer[0].index).toBe(before);
        await em.refresh(thread);
        specimen.expect(thread.counter).toBe(before + 1);
      });
    });

    specimen.it("buffer without thread has null thread", async () => {
      await scenario.scoped(async (em) => {
        const result = await scenario.mode.emit.literal({ literal: { id: scenario.fixtures.goodbye.id } });
        const found = await em.findOne(BufferEntity, { id: result.output.buffer[0].id }, { filters: false });
        specimen.expect(found).toBeTruthy();
        specimen.expect(found.thread).toBeNull();
      });
    });

    specimen.it("empty return yields EXHAUSTED", async () => {
      await scenario.scoped(async () => {
        const emptyMode = new Mode({ manifest: { type: "game", slug: "empty", traits: ["EMITTER"] } });
        emptyMode.aperture = new Aperture();
        emptyMode.entity = scenario.fixtures.mode;
        emptyMode.id = scenario.fixtures.mode.id;
        emptyMode.module.emitter = new Vector().open("/nothing", async () => []);
        const traits = await import("@vivalence/runtime/daemon/traits");
        for (const finalize of await traits.stagger(emptyMode, scenario.daemon, traits)) await finalize();
        const result = await emptyMode.emit.nothing({});
        specimen.expect(result.condition).toBe("EXHAUSTED");
        specimen.expect(result.output.buffer).toEqual([]);
      });
    });
  });
});

specimen.describe("BOOTED", () => {
  specimen.it("finalize runs boot with (daemon, mode); terminate calls the returned teardown", async () => {
    const { BOOTED } = await import("@vivalence/runtime/daemon/traits");
    const calls = [];
    const mode = {
      type: "probe",
      slug: "booted",
      module: {
        boot: async (daemon, self) => {
          calls.push(["boot", daemon, self]);
          return () => calls.push(["teardown"]);
        },
      },
    };
    const daemon = { marker: "daemon" };
    const wired = BOOTED(mode, daemon);
    specimen.expect(calls.length).toBe(0);
    await wired.finalize();
    specimen.expect(calls[0]).toEqual(["boot", daemon, mode]);
    await wired.terminate();
    specimen.expect(calls[1]).toEqual(["teardown"]);
  });

  specimen.it("a BOOTED declaration without a boot export wires nothing", async () => {
    const { BOOTED } = await import("@vivalence/runtime/daemon/traits");
    specimen.expect(BOOTED({ type: "probe", slug: "hollow", module: {} }, {})).toBe(undefined);
  });
});
