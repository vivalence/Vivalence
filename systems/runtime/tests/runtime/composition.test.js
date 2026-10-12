import paladin from "@vivalence/paladin";
import { specimen, Url, Connection, shard, Path, shape, Aperture } from "@vivalence/typology";
import { lifecycle, sets } from "@vivalence/runtime";
import { assemble } from "../../gestalten/belt/assemble.js";
import { provider } from "../../../../commons/datamaps/libsql/libsql.viva.js";
import { create, SECRET } from "../scenarios/daemon.js";
import { signer } from "../../lighthouse/signer.js";

specimen.describe("runtime composition", () => {
  let scenario;
  let runtimeHandler;
  let runtimeConn;

  specimen.beforeAll(async () => {
    scenario = await create();

    const runtime = new Aperture();
    runtime.open("/status", () => ({ code: "RUNNING" }));
    runtime.branch("/metadata").open("/manifest", () => ({ slug: "test-runtime" }));

    runtime
      .branch(scenario.daemon.reference.nature)
      .open("/status", () => ({ code: "RUNNING" }))
      .graft(scenario.daemon.aperture);

    runtimeHandler = shape.http(runtime);
    const access = await signer(SECRET).access(scenario.fixtures.user);
    runtimeConn = new Connection(new Url("http://test"), shard.transmitter.inline(runtimeHandler)).use(async (ctx, next) => {
      ctx.request.headers.set("authorization", `Bearer ${access}`);
      await next();
    });
  });

  specimen.it("the daemon branch refuses a bare request — the lighthouse sits on /daemon/*", async () => {
    const bare = new Connection(new Url("http://test"), shard.transmitter.inline(runtimeHandler));
    specimen.expect((await bare.fetch("/daemon/test-daemon/status")).status).toBe(401);
    specimen.expect((await bare.fetch("/status")).status).toBe(200);
  });

  specimen.afterAll(async () => {
    await scenario.orm.close();
  });

  specimen.it("runtime status", async () => {
    const result = await runtimeConn.call("/status");
    specimen.expect(result.code).toBe("RUNNING");
  });

  specimen.it("runtime manifest", async () => {
    const result = await runtimeConn.call("/metadata/manifest");
    specimen.expect(result.slug).toBe("test-runtime");
  });

  specimen.it("daemon status via runtime path", async () => {
    const result = await runtimeConn.call("/daemon/test-daemon/status");
    specimen.expect(result.code).toBe("RUNNING");
  });

  specimen.it("daemon cargo via runtime path", async () => {
    const result = await runtimeConn.call("/daemon/test-daemon/cargo");
    specimen.expect(result.test).toBe(true);
  });

  specimen.it("daemon datamap via runtime path", async () => {
    const result = await runtimeConn.call(
      "/daemon/test-daemon/entities/literal/find",
      { where: {}, options: { limit: 10 } },
    );
    specimen.expect(result.length).toBe(9);
  });

  specimen.it("unmatched route returns 404", async () => {
    const response = await runtimeConn.fetch("/nonexistent/deep/path");
    specimen.expect(response.status).toBe(404);
  });
});

specimen.describe("reconcile at boot — population.daemons reads the file against the rows", () => {
  const FILE = "composition.viva.db";
  const raw = {
    hello: { manifest: { type: "daemon", slug: "hello" }, modes: ["@commons/demo/hello-world"] },
    extra: {
      manifest: { type: "daemon", slug: "extra", traits: ["CHESS"] },
      modes: ["@chess/game/board"],
      consume: { stockfish: { module: "@chess/service/stockfish", statics: { remote: "${VIVA_STOCKFISH_REMOTE}" } } },
    },
  };
  const expanded = (entry) => ({
    ...entry,
    manifest: { ...entry.manifest, traits: entry.manifest.traits ?? [] },
    reference: new Path(`/daemon/${entry.manifest.slug}`),
    consume: Object.fromEntries(Object.entries(entry.consume ?? {}).map(([slug, query]) => [slug, { ...query, statics: { remote: "http://localhost:9090" } }])),
  });
  const schemas = assemble([sets.identity, sets.composition, sets.traits, sets.userspace, sets.transient]).entities.map((descriptor) => descriptor.schema);
  let home;

  const boot = async (slugs, { prune = false } = {}) => {
    if (prune) paladin.env.set("VIVA_RUNTIME_PRUNE", "1");
    else paladin.env.delete("VIVA_RUNTIME_PRUNE");
    const datamap = await provider({ mountpoint: new Path(home), statics: { db: { file: FILE } } }, { entities: schemas });
    const created = [];
    const die = {
      controller: { branch: () => null },
      runtime: {
        datamap,
        entities: datamap.entities,
        instance: { daemons: slugs.map((slug) => expanded(raw[slug])), raw: { daemons: slugs.map((slug) => raw[slug]) } },
        processes: { datamap: { shard: { scope: (task) => task() } }, daemon: { create: async (data) => created.push(data.slug), remove: async () => {} } },
      },
    };
    try {
      await lifecycle.runtime.population.daemons(die, async () => {});
      return { datamap, created };
    } catch (error) {
      await datamap.close();
      throw error;
    }
  };

  const census = async (datamap) =>
    datamap.shard.scope(async () => {
      const connection = datamap.entities.em.getConnection();
      const count = async (table) => (await connection.execute(`select daemon_slug as daemon from \`${table}\` order by daemon_slug`)).map((row) => row.daemon);
      return {
        daemon: (await datamap.entities.daemon.find({}, { orderBy: { slug: "asc" } })).map((row) => row.slug),
        mode: await count("Mode"),
        literal: await count("Literal"),
        symbol: await count("Symbol"),
        note: await count("Note"),
        members: (await connection.execute("select daemon_entity_slug as daemon from User_daemons order by daemon_entity_slug")).map((row) => row.daemon),
      };
    });

  specimen.beforeAll(async () => {
    home = await Deno.makeTempDir({ prefix: "viva-composition-" });
  });

  specimen.afterAll(async () => {
    paladin.env.delete("VIVA_RUNTIME_PRUNE");
    await Deno.remove(home, { recursive: true });
  });

  specimen.it("a daemon in the file → its row and its process on boot", async () => {
    const { datamap, created } = await boot(["hello"]);
    specimen.expect(created).toEqual(["hello"]);
    specimen.expect((await census(datamap)).daemon).toEqual(["hello"]);
    await datamap.close();
  });

  specimen.it("a daemon added to the file → its row on the next boot; Daemon.mask is the raw entry, ${KEY} intact", async () => {
    const { datamap, created } = await boot(["hello", "extra"]);
    specimen.expect(created).toEqual(["hello", "extra"]);
    specimen.expect((await census(datamap)).daemon).toEqual(["extra", "hello"]);
    const row = await datamap.shard.scope(() => datamap.entities.daemon.findOneOrFail({ slug: "extra" }));
    specimen.expect(row.mask).toEqual(raw.extra);
    specimen.expect(row.mask.consume.stockfish.statics.remote).toBe("${VIVA_STOCKFISH_REMOTE}");
    specimen.expect(row.traits).toEqual(["CHESS"]);
    await datamap.shard.scope(async () => {
      const em = datamap.entities.em;
      const user = datamap.entities.user.create({ slug: "finn" });
      for (const slug of ["hello", "extra"]) {
        const mode = datamap.entities.mode.create({ daemon: slug, type: "game", slug: "board" });
        const literal = datamap.entities.literal.create({ daemon: slug, mode, slug: "casa" });
        datamap.entities.symbol.create({ daemon: slug, mode, slug: "noun" });
        datamap.entities.note.create({ daemon: slug, mode, slug: "preset.meet" });
        user.daemons.add(em.getReference("DaemonEntity", slug));
        literal.traits = [];
      }
      await em.flush();
    });
    specimen.expect(await census(datamap)).toEqual({
      daemon: ["extra", "hello"],
      mode: ["extra", "hello"],
      literal: ["extra", "hello"],
      symbol: ["extra", "hello"],
      note: ["extra", "hello"],
      members: ["extra", "hello"],
    });
    await datamap.close();
  });

  specimen.it("a daemon dropped from the file → the boot refuses and names the row; nothing is touched", async () => {
    await specimen.expect(boot(["hello"])).rejects.toThrow(/extra held in the datamap but absent/);
    const datamap = await provider({ mountpoint: new Path(home), statics: { db: { file: FILE } } }, { entities: schemas });
    specimen.expect((await census(datamap)).daemon).toEqual(["extra", "hello"]);
    await datamap.close();
  });

  specimen.it("VIVA_RUNTIME_PRUNE=1 drops the row and its cascade — modes · literals · symbols · notes · User_daemons", async () => {
    const { datamap, created } = await boot(["hello"], { prune: true });
    specimen.expect(created).toEqual(["hello"]);
    specimen.expect(await census(datamap)).toEqual({
      daemon: ["hello"],
      mode: ["hello"],
      literal: ["hello"],
      symbol: ["hello"],
      note: ["hello"],
      members: ["hello"],
    });
    await datamap.close();
  });
});
