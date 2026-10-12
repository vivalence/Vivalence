import { specimen, Vector, shape, steer, shard, RemoteRepository } from "@vivalence/typology";
import { lighthouse as scenario } from "@vivalence/runtime/scenarios";
import { Entity } from "../../prototypes/entity.js";
import { Mode } from "../../prototypes/mode.js";
import { Dataspace } from "../../prototypes/dataspace.js";
import { TerminalDossier } from "../../prototypes/terminal.js";
import { IntentDossier } from "../../prototypes/intent.js";
import { ThreadDossier } from "../../prototypes/thread/index.js";
import { BufferDossier } from "../../prototypes/buffer.js";
import { TurnDossier } from "../../prototypes/turn.js";
import { ActivityDossier } from "../../prototypes/activity.js";

const { describe, it, expect } = specimen;

const unseeded = (vector) => vector;

function compileSchema(schema) {
  const vector = new Vector();
  for (const middleware of schema.use) vector.use(middleware);
  vector.affect(
    schema.cast ??
      ((ctx) => {
        ctx.entity = new (schema.kind())();
        Object.assign(ctx.entity, ctx.raw);
      }),
  );
  return shape.selbstbestimmt(vector, steer.strategy.direct);
}

function mockConnection(responses = {}) {
  return {
    call: async (endpoint, body) => responses[endpoint]?.(body) ?? null,
    branch: () => mockConnection(responses),
    clone: () => mockConnection(responses),
  };
}

describe("lifecycle vector", () => {
  it("cast creates entity from raw pojo", async () => {
    const lifecycle = compileSchema({ kind: () => Entity, use: [] });
    const ctx = { raw: { id: "abc", name: "test" } };
    await lifecycle(ctx);
    expect(ctx.entity).toBeInstanceOf(Entity);
    expect(ctx.entity.id).toBe("abc");
  });

  it("middleware wires entity after cast", async () => {
    const lifecycle = compileSchema({
      kind: () => Mode,
      use: [
        async (ctx, next) => {
          await next();
          ctx.entity.daemon = ctx.daemon;
          ctx.entity.intents = new Set();
        },
      ],
    });
    const ctx = { daemon: { slug: "deutsch" }, raw: { id: "m1", type: "conversational", slug: "practice", traits: ["APPLICATION"] } };
    await lifecycle(ctx);
    expect(ctx.entity).toBeInstanceOf(Mode);
    expect(ctx.entity.daemon.slug).toBe("deutsch");
    expect(ctx.entity.intents).toBeInstanceOf(Set);
  });

  it("middleware chain unwinds inner-first", async () => {
    const trace = [];
    const schema = {
      kind: () => Entity,
      use: [
        async (ctx, next) => (trace.push("before-a"), await next(), trace.push("after-a")),
        async (ctx, next) => (trace.push("before-b"), await next(), trace.push("after-b")),
      ],
    };
    await compileSchema(schema)({ raw: { id: "1" } });
    expect(trace).toEqual(["before-a", "before-b", "after-b", "after-a"]);
  });

  it("custom cast overrides default", async () => {
    const schema = {
      kind: () => Mode,
      use: [],
      cast: (ctx) => {
        ctx.entity = new Mode();
        Object.assign(ctx.entity, ctx.raw);
        ctx.entity.custom = true;
      },
    };
    const ctx = { raw: { id: "m2", slug: "custom" } };
    await compileSchema(schema)(ctx);
    expect(ctx.entity.custom).toBe(true);
  });
});

describe("dataspace integrate", () => {
  const connection = mockConnection({ "/metadata/datamap": () => ({}) });

  it("repo registered on dataspace, integrator stored on EM", async () => {
    const dossier = { name: "mode", kind: () => Mode, repository: (_, dataspace) => new RemoteRepository(Mode).connect(dataspace.connection), use: [] };
    const dataspace = new Dataspace({ entities: [dossier], connection, seed: unseeded });
    await dataspace.init();
    expect(dataspace.mode).toBeDefined();
    expect(typeof dataspace.em.integrators.mode).toBe("function");
    expect(dataspace.schemas.get("mode")).toBe(dossier);
  });

  it("use[] middleware runs on first-sight only", async () => {
    let count = 0;
    const dossier = {
      name: "traced",
      kind: () => Entity,
      repository: (_, dataspace) => new RemoteRepository(Entity).connect(dataspace.connection),
      use: [async (ctx, next) => ((count += 1), await next())],
    };
    const dataspace = new Dataspace({ entities: [dossier], connection, seed: unseeded });
    await dataspace.init();
    await dataspace.traced.merge({ id: "t1" });
    await dataspace.traced.merge({ id: "t1" });
    await dataspace.traced.merge({ id: "t1" });
    expect(count).toBe(1);
    await dataspace.traced.merge({ id: "t2" });
    expect(count).toBe(2);
  });

  it("init reads the datamap off the connection rung, never the runtime rung", async () => {
    const asked = [];
    const rung = (name) => ({ call: async (endpoint) => (asked.push(`${name}${endpoint}`), {}), branch: () => rung(name) });
    const dataspace = new Dataspace({ entities: [], connection: rung("connection"), runtime: rung("runtime"), seed: unseeded });
    await dataspace.init();
    expect(asked).toEqual(["connection/metadata/datamap"]);
  });

  it("ctx carries entity, raw, dossier, repository, dataspace and whatever the seed binds", async () => {
    const trace = {};
    const runtime = { slug: "house" };
    const dossier = {
      name: "traced",
      kind: () => Entity,
      repository: (_, dataspace) => new RemoteRepository(Entity).connect(dataspace.connection),
      use: [
        async (ctx, next) => {
          await next();
          Object.assign(trace, {
            dossier: ctx.dossier === dossier,
            repository: ctx.repository === dataspace.traced,
            dataspace: ctx.dataspace === dataspace,
            raw: ctx.raw.id === "t1",
            entity: ctx.entity instanceof Entity,
            runtime: ctx.runtime === runtime,
          });
        },
      ],
    };
    const dataspace = new Dataspace({ entities: [dossier], connection, seed: (boot) => boot.use(shard.context.bind("runtime", runtime)) });
    await dataspace.init();
    await dataspace.traced.merge({ id: "t1" });
    expect(trace).toEqual({ dossier: true, repository: true, dataspace: true, raw: true, entity: true, runtime: true });
  });
});

describe("dataspace over two rungs — the runtime host's /metadata on the connection, /userspace/entities on the root", { sanitizeOps: false, sanitizeResources: false }, () => {
  let house;
  let root;
  let runtime;
  const kinds = [TerminalDossier, IntentDossier, ThreadDossier, BufferDossier, TurnDossier, ActivityDossier];

  specimen.beforeAll(async () => {
    house = await scenario.create();
    house.aperture.branch("/runtime/runtime").branch("/metadata").open("/datamap", () => shard.datamap.strip(house.datamap.orm.getMetadata()));
    const { access } = await house.signup("finn");
    root = house.connect(access);
    runtime = { slug: "runtime", daemon: null, daemons: [], entities: null };
    runtime.entities = new Dataspace({
      connection: root.branch("/runtime/runtime"),
      runtime: root,
      entities: kinds,
      seed: (boot) => boot.use(shard.context.bind("runtime", runtime)),
    });
  });
  specimen.afterAll(async () => {
    await house.close();
  });

  it("every userspace kind is a repository on /userspace/entities/<kind> of the runtime rung", () => {
    const paths = Object.fromEntries(kinds.map((dossier) => [dossier.name, runtime.entities[dossier.name].connection.url.pathname]));
    expect(paths).toEqual(Object.fromEntries(kinds.map((dossier) => [dossier.name, `/userspace/entities/${dossier.name}`])));
    for (const dossier of kinds) expect(runtime.entities[dossier.name]).toBeInstanceOf(RemoteRepository);
    expect(Object.keys(runtime.entities.em.repositoryMap)).toEqual(["terminal", "intent", "thread", "buffer", "turn", "activity"]);
  });

  it("init reads /runtime/runtime/metadata/datamap into the remote em schema", async () => {
    await runtime.entities.init();
    expect(runtime.entities.em.schema).toBe(runtime.entities.datamap);
    expect(runtime.entities.em.schema.terminal.properties.thread.kind).toBe("m:1");
    expect(runtime.entities.em.schema.thread.properties.mode.kind).toBe("m:1");
  });

  it("populate fills each named store from the wire and skips a name no repository answers", async () => {
    const thread = await root.call("/userspace/entities/thread/create", { data: { trait: {} } });
    await root.call("/userspace/entities/terminal/create", { data: { thread: thread.id } });
    await root.call("/userspace/entities/buffer/create", { data: { thread: thread.id, data: { word: "ciao" } } });
    await runtime.entities.populate(["thread", "terminal", "buffer", "turn", "nothing"]);
    expect(runtime.entities.thread.$entities.get().map((row) => row.id)).toEqual([thread.id]);
    expect(runtime.entities.terminal.$entities.get().length).toBe(1);
    expect(runtime.entities.buffer.$entities.get().map((row) => row.data)).toEqual([{ word: "ciao" }]);
    expect(runtime.entities.turn.$entities.get()).toEqual([]);
  });

  it("a relation between two userspace kinds resolves to the managed entity", () => {
    const [thread] = runtime.entities.thread.$entities.get();
    const [terminal] = runtime.entities.terminal.$entities.get();
    const [buffer] = runtime.entities.buffer.$entities.get();
    expect(terminal.thread).toBe(thread);
    expect(buffer.thread).toBe(thread);
    expect(thread.buffers.map((row) => row.id)).toEqual([buffer.id]);
  });
});
