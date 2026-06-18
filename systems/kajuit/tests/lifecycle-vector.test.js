import { specimen, Vector, shape, steer, RemoteRepository } from "@vivalence/typology";
import { Entity } from "../src/typology/prototypes/entity.js";
import { Mode } from "../src/typology/entities/mode.js";
import { Dataspace } from "../src/typology/prototypes/dataspace.js";

// ── helpers ────────────────────────────────────────────────────────

function compileSchema(schema) {
  const vector = new Vector();
  for (const middleware of schema.use ?? []) vector.use(middleware);
  vector.affect(
    schema.cast ??
      ((ctx) => {
        ctx.entity = new (schema.kind())();
        Object.assign(ctx.entity, ctx.raw);
      }),
  );
  return shape.selbstbestimmt(vector, steer.direct);
}

function mockConnection(responses = {}) {
  const connection = {
    call: async (endpoint, body) => responses[endpoint]?.(body) ?? null,
    branch: (path) => mockConnection(responses),
    clone: () => mockConnection(responses),
  };
  return connection;
}

function mockPath(base = "") {
  return {
    nature: base,
    branch: (segment) => mockPath(base + segment),
  };
}

// ── vector lifecycle (unit) ────────────────────────────────────────

specimen.describe("lifecycle vector", () => {
  specimen.it("cast creates entity from raw pojo", async () => {
    const lifecycle = compileSchema({ kind: () => Entity });
    const ctx = { raw: { id: "abc", name: "test" } };
    await lifecycle(ctx);

    specimen.expect(ctx.entity).toBeInstanceOf(Entity);
    specimen.expect(ctx.entity.id).toBe("abc");
  });

  specimen.it("middleware wires entity after cast", async () => {
    const schema = {
      kind: () => Mode,
      use: [
        async (ctx, next) => {
          await next();
          ctx.entity.daemon = ctx.daemon;
          ctx.entity.intents = new Set();
        },
      ],
    };

    const lifecycle = compileSchema(schema);
    const ctx = {
      daemon: { slug: "deutsch" },
      raw: { id: "m1", type: "conversational", slug: "practice", traits: ["VIEWABLE"] },
    };
    await lifecycle(ctx);

    specimen.expect(ctx.entity).toBeInstanceOf(Mode);
    specimen.expect(ctx.entity.daemon.slug).toBe("deutsch");
    specimen.expect(ctx.entity.intents).toBeInstanceOf(Set);
  });

  specimen.it("middleware chain unwinds inner-first", async () => {
    const trace = [];
    const schema = {
      kind: () => Entity,
      use: [
        async (ctx, next) => {
          trace.push("before-a");
          await next();
          trace.push("after-a");
        },
        async (ctx, next) => {
          trace.push("before-b");
          await next();
          trace.push("after-b");
        },
      ],
    };

    await compileSchema(schema)({ raw: { id: "1" } });
    specimen.expect(trace).toEqual(["before-a", "before-b", "after-b", "after-a"]);
  });

  specimen.it("custom cast overrides default", async () => {
    const schema = {
      kind: () => Mode,
      cast: (ctx) => {
        ctx.entity = new Mode();
        Object.assign(ctx.entity, ctx.raw);
        ctx.entity.custom = true;
      },
    };

    const ctx = { raw: { id: "m2", slug: "custom" } };
    await compileSchema(schema)(ctx);
    specimen.expect(ctx.entity.custom).toBe(true);
  });
});

// ── dataspace + integrate (integration) ───────────────────────────

specimen.describe("dataspace integrate", () => {
  const connection = mockConnection({ "/datamap": () => ({}) });

  specimen.it("repo registered on dataspace, integrator stored on EM", async () => {
    const dossier = {
      name: "mode",
      kind: () => Mode,
      repository: (_, ds) => new RemoteRepository(Mode).connect(ds.connection),
      use: [],
    };
    const dataspace = new Dataspace({ entities: [dossier], connection });
    await dataspace.init();
    specimen.expect(dataspace.mode).toBeDefined();
    specimen.expect(typeof dataspace.em.integrators.mode).toBe("function");
  });

  specimen.it("use[] middleware runs on first-sight only", async () => {
    let count = 0;
    const dossier = {
      name: "traced",
      kind: () => Entity,
      repository: (_, ds) => new RemoteRepository(Entity).connect(ds.connection),
      use: [async (ctx, next) => { count += 1; await next(); }],
    };
    const dataspace = new Dataspace({ entities: [dossier], connection });
    await dataspace.init();

    await dataspace.traced.merge({ id: "t1" });
    await dataspace.traced.merge({ id: "t1" });
    await dataspace.traced.merge({ id: "t1" });
    specimen.expect(count).toBe(1);

    await dataspace.traced.merge({ id: "t2" });
    specimen.expect(count).toBe(2);
  });

  specimen.it("ctx carries entity, raw, dossier, repository, dataspace", async () => {
    const trace = {};
    const dossier = {
      name: "traced",
      kind: () => Entity,
      repository: (_, ds) => new RemoteRepository(Entity).connect(ds.connection),
      use: [
        async (ctx, next) => {
          await next();
          trace.hasDossier = !!ctx.dossier;
          trace.hasRepository = !!ctx.repository;
          trace.hasDataspace = !!ctx.dataspace;
          trace.hasRaw = !!ctx.raw;
          trace.entityIsInstance = ctx.entity instanceof Entity;
        },
      ],
    };
    const dataspace = new Dataspace({ entities: [dossier], connection });
    await dataspace.init();
    await dataspace.traced.merge({ id: "t1" });

    specimen.expect(trace.hasDossier).toBe(true);
    specimen.expect(trace.hasRepository).toBe(true);
    specimen.expect(trace.hasDataspace).toBe(true);
    specimen.expect(trace.hasRaw).toBe(true);
    specimen.expect(trace.entityIsInstance).toBe(true);
  });
});
