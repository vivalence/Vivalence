import { specimen, Vector, shape, steer } from "@vivalence/typology";
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
      raw: { id: "m1", type: "conversational", slug: "practice", traits: ["BUFFERED"] },
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

// ── dataspace + mode schema (integration) ──────────────────────────

specimen.describe("dataspace mode lifecycle", () => {
  const ModeDossier = {
    name: "mode",
    kind: () => Mode,
    remote: { endpoint: "/entities/mode" },
    use: [
      async (ctx, next) => {
        await next();
        if (ctx.entity.implements("BUFFERED")) {
          ctx.entity.buffered = await ctx.entity.connection.call("/buffered");
          ctx.entity.buffer = (desc = {}) => ({
            mode: ctx.entity.id,
            data: { ...(ctx.entity.buffered?.schema?.data ?? {}), ...(desc.data ?? {}) },
          });
        }
      },
      async (ctx, next) => {
        await next();
        ctx.entity.daemon = { slug: ctx.daemon };
        ctx.entity.mount = ctx.mount.branch(`/mode/${ctx.entity.type}/${ctx.entity.slug}`);
        ctx.entity.connection = ctx.connection.branch(ctx.entity.mount.nature);
        ctx.entity.call = ctx.entity.connection.call.bind(ctx.entity.connection);
        ctx.entity.link = ctx.link.branch(`/${ctx.entity.type}/${ctx.entity.slug}`);
        ctx.entity.intents = new Set();
      },
    ],
  };

  const modeFixtures = [
    { id: "m1", type: "conversational", slug: "practice", traits: ["BUFFERED"] },
    { id: "m2", type: "applicative", slug: "review", traits: [] },
  ];

  const connection = mockConnection({
    "/datamap": () => ({}),
    "/entities/mode/find": () => modeFixtures,
    "/buffered": () => ({ schema: { data: { language: "de" } } }),
  });

  const factory = (carry, effect) => async (raw) => {
    const ctx = {
      raw,
      entity: raw,
      daemon: "test-daemon",
      mount: mockPath("/daemon/test-daemon"),
      link: mockPath("/viva/finn/test-daemon"),
      connection,
    };
    await carry(ctx, async () => await effect(ctx));
    return ctx.entity;
  };

  let dataspace;

  specimen.beforeAll(async () => {
    dataspace = new Dataspace({
      entities: [ModeDossier],
      connection,
      factory,
    });
    await dataspace.init();
  });

  specimen.it("repo registered on dataspace", () => {
    specimen.expect(dataspace.mode).toBeDefined();
    specimen.expect(dataspace.schemas.has("mode")).toBe(true);
  });

  specimen.it("repo.hydrate is compiled lifecycle", () => {
    specimen.expect(typeof dataspace.mode.hydrate).toBe("function");
  });

  specimen.it("lifecycle wires mode from raw pojo", async () => {
    const raw = { id: "m1", type: "conversational", slug: "practice", traits: ["BUFFERED"] };
    const entity = await dataspace.mode.hydrate(raw);

    specimen.expect(entity).toBeInstanceOf(Mode);
    specimen.expect(entity.slug).toBe("practice");
    specimen.expect(entity.daemon.slug).toBe("test-daemon");
    specimen.expect(entity.mount.nature).toBe("/daemon/test-daemon/mode/conversational/practice");
    specimen.expect(entity.link.nature).toBe("/viva/finn/test-daemon/conversational/practice");
    specimen.expect(entity.connection).toBeDefined();
    specimen.expect(typeof entity.call).toBe("function");
    specimen.expect(entity.intents).toBeInstanceOf(Set);
  });

  specimen.it("BUFFERED trait fetches config and creates factory", async () => {
    const raw = { id: "m1", type: "conversational", slug: "practice", traits: ["BUFFERED"] };
    const entity = await dataspace.mode.hydrate(raw);

    specimen.expect(entity.buffered).toBeDefined();
    specimen.expect(entity.buffered.schema.data.language).toBe("de");
    specimen.expect(typeof entity.buffer).toBe("function");

    const descriptor = entity.buffer({ data: { level: 3 } });
    specimen.expect(descriptor.mode).toBe("m1");
    specimen.expect(descriptor.data.language).toBe("de");
    specimen.expect(descriptor.data.level).toBe(3);
  });

  specimen.it("non-BUFFERED mode skips config fetch", async () => {
    const raw = { id: "m2", type: "applicative", slug: "review", traits: [] };
    const entity = await dataspace.mode.hydrate(raw);

    specimen.expect(entity.buffered).toBeUndefined();
    specimen.expect(entity.buffer).toBeUndefined();
    specimen.expect(entity.daemon.slug).toBe("test-daemon");
  });

  specimen.it("dataspace-injected middleware sets schema and name on ctx", async () => {
    const trace = {};
    const TracingSchema = {
      name: "traced",
      kind: () => Entity,
      remote: { endpoint: "/entities/traced" },
      use: [
        async (ctx, next) => {
          await next();
          trace.name = ctx.name;
          trace.hasEntityManager = !!ctx.em;
          trace.hasDataspace = !!ctx.dataspace;
          trace.schemaName = ctx.schema?.name;
        },
      ],
    };

    const tracedDataspace = new Dataspace({
      entities: [TracingSchema],
      connection,
      factory,
    });

    await tracedDataspace.traced.hydrate({ id: "t1" });
    specimen.expect(trace.name).toBe("traced");
    specimen.expect(trace.hasEntityManager).toBe(true);
    specimen.expect(trace.hasDataspace).toBe(true);
    specimen.expect(trace.schemaName).toBe("traced");
  });
});
