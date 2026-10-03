// commons/lighthouses/multiplayer/tests/shape.test.js:1
import { Aperture, Status, specimen, shard } from "@vivalence/typology";
import { gestalten, lifecycle } from "@vivalence/runtime";
import { lighthouse } from "@vivalence/runtime/scenarios";
import { provider } from "../multiplayer.viva.js";

const owner = (row) => row?.identity?.id ?? row?.identity;

specimen.describe("lighthouse shape (the package attachment, in-process)", () => {
  let scenario;
  let finn;
  let kiro;
  let finnConnection;
  let kiroConnection;
  let login;
  let firstTerminal;
  let seatedDaemon;

  specimen.beforeAll(async () => {
    scenario = await lighthouse.create();
  });

  specimen.afterAll(async () => {
    await scenario.close();
  });

  specimen.it("schema · graft · stagger", async () => {
    const entities = Object.values(scenario.orm.getMetadata().getAll()).map((meta) => meta.className);
    const expected = ["IdentityEntity", "DaemonEntity", "TerminalEntity"];
    specimen.assert(expected.every((name) => entities.includes(name)), entities.join(","));
    const branches = [...scenario.service.attachment.trie.keys()];
    specimen.assert(["auth", "daemons", "entities", "metadata"].every((name) => branches.includes(name)), branches.join(","));
    const subject = {
      manifest: { traits: ["SERVICE", "PROVIDER", "DATAMAP", "ATTACHED"] },
      attachment: new Aperture(),
      controller: { status: "RUNNING" },
    };
    const traits = {
      ...lifecycle.service.traits,
      DATAMAP: async (service) => {
        service.datamap = scenario.datamap;
        service.attachment.use(shard.datamap.inject(scenario.datamap));
        return { terminate: () => {} };
      },
    };
    const mask = { attachment: scenario.mask.attachment, statics: {} };
    const finalizers = await gestalten.belt.stagger(subject, mask, traits);
    const grafted = [...subject.attachment.trie.keys()];
    specimen.assert(
      subject.terminators?.length === 1 && finalizers.length === 0 && grafted.includes("auth"),
      `terminators ${subject.terminators?.length} finalizers ${finalizers.length} trie ${grafted.join(",")}`,
    );
  });

  specimen.it("metadata", async () => {
    specimen.assert(scenario.service.jwt === undefined && scenario.service.release === undefined, "the service carries jwt state");
    const datamap = await scenario.conn.call("/metadata/datamap");
    specimen.assert(datamap?.terminal && datamap?.identity && datamap?.daemon, Object.keys(datamap ?? {}).join(","));
    specimen.assert(
      datamap?.terminal?.properties?.identity?.kind === "m:1" && datamap?.terminal?.properties?.daemon?.kind === "m:1",
      JSON.stringify(datamap?.terminal?.properties),
    );
    specimen.assert((await scenario.conn.call("/metadata/manifest"))?.slug === "multiplayer", "/metadata/manifest");
    specimen.assert(typeof (await scenario.conn.call("/metadata/statics")) === "object", "/metadata/statics");
    const stripped = await scenario.conn.call("/metadata/attachment");
    specimen.assert(JSON.stringify(stripped).includes("auth"), JSON.stringify(stripped).slice(0, 160));
    const root = await scenario.conn.fetch("/datamap");
    specimen.assert(root.status === 404 || root.body == null, "root /datamap answered");
  });

  specimen.it("auth routes", async () => {
    finn = await scenario.conn.call("/auth/signup", { username: "finn", password: "hunter22" });
    specimen.assert(
      finn?.status === "SUCCESS" && finn.identity?.id && finn.authority?.access,
      JSON.stringify(finn?.identity),
    );
    specimen.assert(Array.isArray(finn?.identity?.traits), JSON.stringify(finn?.identity?.traits));
    kiro = await scenario.signup("kiro");
    login = await scenario.conn.call("/auth/login", { username: "finn", password: "hunter22" });
    specimen.assert(login?.status === "SUCCESS" && login.authority?.access, JSON.stringify(login));
    const rejected = (await scenario.conn.fetch("/auth/login", { username: "finn", password: "nope" })).body;
    specimen.assert(
      rejected?.status === "ERROR" && rejected.error?.code === "INVALID_CREDENTIALS",
      JSON.stringify(rejected),
    );
    const verified = await scenario.conn.call("/auth/verify", { access: login.authority.access });
    specimen.assert(
      verified?.identity?.id === finn.identity.id && "trait" in verified.identity,
      JSON.stringify(verified),
    );
    const refreshed = await scenario.conn.call("/auth/refresh", { refresh: login.authority.refresh });
    specimen.assert(refreshed?.status === "SUCCESS" && refreshed.access, JSON.stringify(refreshed));
    finnConnection = scenario.connect(login.authority.access);
    kiroConnection = scenario.connect(kiro.access);
  });

  specimen.it("terminal scoping", async () => {
    const anonymous = (await scenario.conn.fetch("/entities/terminal/find", { where: {} })).body;
    specimen.assert(
      anonymous?.status === "ERROR" && anonymous.error?.code === "MISSING_TOKEN",
      JSON.stringify(anonymous),
    );
    firstTerminal = await finnConnection.call("/entities/terminal/create", { data: {} });
    specimen.assert(
      owner(firstTerminal) === finn.identity.id,
      JSON.stringify({ id: firstTerminal?.id, identity: owner(firstTerminal) }),
    );
    specimen.assert(firstTerminal?.index === 0, String(firstTerminal?.index));
    specimen.assert(
      firstTerminal?.identity?.authentication === undefined,
      JSON.stringify(Object.keys(firstTerminal?.identity ?? {})),
    );
    specimen.assert(login?.status === "SUCCESS", "hidden is serialization only: /auth/login still reads credentials");
    const secondTerminal = await finnConnection.call("/entities/terminal/create", {
      data: { traits: ["LABELED"], trait: { LABELED: { name: "grammar" } } },
    });
    specimen.assert(
      secondTerminal?.index === 1 && secondTerminal?.trait?.LABELED?.name === "grammar",
      JSON.stringify({ index: secondTerminal?.index, trait: secondTerminal?.trait }),
    );
    const otherTerminal = await kiroConnection.call("/entities/terminal/create", { data: {} });
    specimen.assert(otherTerminal?.index === 0, String(otherTerminal?.index));
    const mine = await finnConnection.call("/entities/terminal/find", { where: {} });
    specimen.assert(Array.isArray(mine) && mine.length === 2, String(mine?.length));
    const theirs = await kiroConnection.call("/entities/terminal/find", { where: {} });
    specimen.assert(Array.isArray(theirs) && theirs.length === 1, String(theirs?.length));
    const widened = await finnConnection.call("/entities/terminal/find", { where: { identity: kiro.identity.id } });
    specimen.assert(
      Array.isArray(widened) && widened.length === 2 && widened.every((row) => owner(row) === finn.identity.id),
      `returned ${widened?.length} rows, owners ${JSON.stringify([...new Set(widened?.map(owner))])}`,
    );
  });

  specimen.it("daemon pivot", async () => {
    seatedDaemon = await scenario.seedDaemon("brazilian", [finn.identity.id]);
    const visible = await finnConnection.call("/entities/daemon/find", { where: {} });
    specimen.assert(visible?.some((daemon) => daemon.slug === "brazilian"), JSON.stringify(visible?.map((daemon) => daemon.slug)));
    const shared = await kiroConnection.call("/entities/daemon/find", { where: {} });
    specimen.assert(
      shared?.length === visible?.length && shared.some((daemon) => daemon.slug === "brazilian"),
      JSON.stringify(shared?.map((daemon) => daemon.slug)),
    );
    const anonymous = (await scenario.conn.fetch("/entities/daemon/find", { where: {} })).body;
    specimen.assert(anonymous?.status === "ERROR" && anonymous?.error?.code === "MISSING_TOKEN", JSON.stringify(anonymous));
    const write = (await finnConnection.fetch("/entities/daemon/create", { data: { slug: "x", remote: "http://x" } })).body;
    specimen.assert(
      write == null || write?.code === "NOT_FOUND" || write?.status === "ERROR" || write?.error,
      JSON.stringify(write),
    );
    const seated = await finnConnection.call("/entities/terminal/updateOne", {
      where: { id: firstTerminal.id },
      data: { daemon: seatedDaemon.id, thread: "0192-thread" },
    });
    specimen.assert(
      (seated?.daemon?.id ?? seated?.daemon) === seatedDaemon.id && seated?.thread === "0192-thread",
      JSON.stringify({ daemon: seated?.daemon, thread: seated?.thread }),
    );
    await scenario.datamap.entities.daemon.removeOne({ id: seatedDaemon.id });
    const unseated = await finnConnection.call("/entities/terminal/findOne", { where: { id: firstTerminal.id } });
    specimen.assert(
      (unseated?.daemon ?? null) === null && unseated?.thread === "0192-thread",
      JSON.stringify({ daemon: unseated?.daemon, thread: unseated?.thread }),
    );
    const tables = await scenario.orm.em
      .getConnection()
      .execute(`select name from sqlite_master where type='table' order by name`);
    specimen.assert(tables.some((table) => table.name === "Identity_daemons"), tables.map((table) => table.name).join(","));
  });

  specimen.it("announce · enroll — no prune", async () => {
    const announced = await scenario.conn.call("/daemons/announce", { slug: "rhythm", remote: "http://localhost:2501", reported: "MOUNTING" });
    specimen.assert(announced?.slug === "rhythm" && announced?.reported === "MOUNTING" && typeof announced?.id === "string", JSON.stringify(announced));
    const reannounced = await scenario.conn.call("/daemons/announce", { slug: "rhythm", remote: "http://localhost:2502", reported: "RUNNING" });
    specimen.assert(reannounced?.id === announced?.id && reannounced?.remote === "http://localhost:2502" && reannounced?.reported === "RUNNING", JSON.stringify(reannounced));
    const users = {
      rows: [],
      upsert: async (row) => {
        users.rows.push(row);
      },
      findOne: async ({ id }) => users.rows.find((row) => row.id === id) ?? null,
    };
    const status = new Status("RUNNING");
    const lighthouse = provider({ statics: {} }, { users, connection: scenario.conn, status, daemon: "rhythm", remote: "http://localhost:2502" });
    await lighthouse.listen();
    const handle = await lighthouse.authenticate(finn.authority.access);
    const enrolled = await handle.enroll();
    const granted = await finnConnection.call("/entities/daemon/find", { where: {} });
    specimen.assert(
      enrolled?.id === finn.identity.id && granted?.some((daemon) => daemon.slug === "rhythm" && daemon.reported === "RUNNING"),
      JSON.stringify({ user: enrolled, daemons: granted?.map((daemon) => [daemon.slug, daemon.reported]) }),
    );
    await handle.enroll();
    const again = await finnConnection.call("/entities/daemon/find", { where: {} });
    specimen.assert(
      again?.filter((daemon) => daemon.slug === "rhythm").length === 1,
      JSON.stringify(again?.map((daemon) => daemon.slug)),
    );
    const stale = (await scenario.conn.fetch("/auth/enroll", { access: "not-a-token", daemon: "rhythm" })).body;
    specimen.assert(stale?.status === "ERROR" && stale?.error?.code === "INVALID_TOKEN", JSON.stringify(stale));
    const unknown = (await scenario.conn.fetch("/auth/enroll", { access: finn.authority.access, daemon: "ghost" })).body;
    specimen.assert(unknown?.status === "ERROR" && unknown?.error?.code === "DAEMON_NOT_FOUND", JSON.stringify(unknown));
    const pruned = (await scenario.conn.fetch("/daemons/prune", { origin: "http://localhost:2502", keep: [] })).body;
    specimen.assert(pruned == null || pruned?.status === "ERROR" || pruned?.error, JSON.stringify(pruned));
  });
});
