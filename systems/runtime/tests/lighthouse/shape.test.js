import { sleep, specimen } from "@vivalence/typology";
import { lighthouse } from "../scenarios/index.js";

const owner = (row) => row?.user?.id ?? row?.user;

specimen.describe("lighthouse shape (the runtime aperture, in-process)", () => {
  let scenario;
  let finn;
  let kiro;
  let finnConnection;
  let kiroConnection;
  let login;
  let firstTerminal;
  let thread;

  specimen.beforeAll(async () => {
    scenario = await lighthouse.create();
  });

  specimen.afterAll(async () => {
    await scenario.close();
  });

  specimen.it("schema · branches", () => {
    const entities = [...scenario.orm.getMetadata().getAll().values()].map((meta) => meta.className);
    const expected = ["UserEntity", "DaemonEntity", "TerminalEntity", "NoteEntity"];
    specimen.assert(expected.every((name) => entities.includes(name)), entities.join(","));
    specimen.assert(!entities.includes("IdentityEntity"), entities.join(","));
    const branches = [...scenario.aperture.trie.keys()];
    specimen.assert(["lighthouse", "userspace", "status"].every((name) => branches.includes(name)), branches.join(","));
  });

  specimen.it("lighthouse routes", async () => {
    finn = await scenario.conn.call("/lighthouse/signup", { username: "finn", password: "hunter22" });
    specimen.assert(finn?.status === "SUCCESS" && finn.user?.id && finn.authority?.access, JSON.stringify(finn?.user));
    specimen.assert(Array.isArray(finn?.user?.traits), JSON.stringify(finn?.user?.traits));
    kiro = await scenario.signup("kiro");
    login = await scenario.conn.call("/lighthouse/login", { username: "finn", password: "hunter22" });
    specimen.assert(login?.status === "SUCCESS" && login.authority?.access, JSON.stringify(login));
    const rejected = (await scenario.conn.fetch("/lighthouse/login", { username: "finn", password: "nope" })).body;
    specimen.assert(rejected?.status === "ERROR" && rejected.error?.code === "INVALID_CREDENTIALS", JSON.stringify(rejected));
    const verified = await scenario.conn.call("/lighthouse/verify", { access: login.authority.access });
    specimen.assert(verified?.user?.id === finn.user.id && "trait" in verified.user, JSON.stringify(verified));
    const refreshed = await scenario.conn.call("/lighthouse/refresh", { refresh: login.authority.refresh });
    specimen.assert(refreshed?.status === "SUCCESS" && refreshed.access, JSON.stringify(refreshed));
    const enroll = await scenario.conn.fetch("/lighthouse/enroll", { access: login.authority.access, daemon: "x" });
    specimen.assert(enroll.status === 404, String(enroll.status));
    finnConnection = scenario.connect(login.authority.access);
    kiroConnection = scenario.connect(kiro.access);
  });

  specimen.it("/userspace refuses without a token", async () => {
    for (const path of ["/userspace/entities/thread/find", "/userspace/entities/terminal/find", "/userspace/entities/note/find"]) {
      const anonymous = (await scenario.conn.fetch(path, { where: {} })).body;
      specimen.assert(anonymous?.status === "ERROR" && anonymous.error?.code === "MISSING_TOKEN", `${path} ${JSON.stringify(anonymous)}`);
    }
  });

  specimen.it("terminal scoping — a user is born holding terminal 0, index per user", async () => {
    [firstTerminal] = await finnConnection.call("/userspace/entities/terminal/find", { where: {} });
    specimen.assert(owner(firstTerminal) === finn.user.id, JSON.stringify({ id: firstTerminal?.id, user: owner(firstTerminal) }));
    specimen.assert(firstTerminal?.index === 0, String(firstTerminal?.index));
    specimen.assert(firstTerminal?.user?.authentication === undefined, JSON.stringify(Object.keys(firstTerminal?.user ?? {})));
    const secondTerminal = await finnConnection.call("/userspace/entities/terminal/create", {
      data: { traits: ["LABELED"], trait: { LABELED: { name: "grammar" } } },
    });
    specimen.assert(
      secondTerminal?.index === 1 && secondTerminal?.trait?.LABELED?.name === "grammar",
      JSON.stringify({ index: secondTerminal?.index, trait: secondTerminal?.trait }),
    );
    const [otherTerminal] = await kiroConnection.call("/userspace/entities/terminal/find", { where: {} });
    specimen.assert(otherTerminal?.index === 0, String(otherTerminal?.index));
    const mine = await finnConnection.call("/userspace/entities/terminal/find", { where: {} });
    specimen.assert(Array.isArray(mine) && mine.length === 2, String(mine?.length));
    const theirs = await kiroConnection.call("/userspace/entities/terminal/find", { where: {} });
    specimen.assert(Array.isArray(theirs) && theirs.length === 1, String(theirs?.length));
    const widened = await finnConnection.call("/userspace/entities/terminal/find", { where: { user: kiro.user.id } });
    specimen.assert(
      Array.isArray(widened) && widened.length === 2 && widened.every((row) => owner(row) === finn.user.id),
      `returned ${widened?.length} rows, owners ${JSON.stringify([...new Set(widened?.map(owner))])}`,
    );
  });

  specimen.it("an index outlives a closed terminal — the next one counts past the highest", async () => {
    const middle = await finnConnection.call("/userspace/entities/terminal/create", { data: {} });
    const top = await finnConnection.call("/userspace/entities/terminal/create", { data: {} });
    await finnConnection.call("/userspace/entities/terminal/removeOne", { where: { id: middle.id } });
    const next = await finnConnection.call("/userspace/entities/terminal/create", { data: {} });
    specimen.assert(next?.index === top.index + 1, JSON.stringify({ middle: middle.index, top: top.index, next: next?.index }));
    for (const made of [top, next]) await finnConnection.call("/userspace/entities/terminal/removeOne", { where: { id: made.id } });
  });

  specimen.it("closing a user's last terminal hands them a fresh one", async () => {
    const [closed] = await kiroConnection.call("/userspace/entities/terminal/find", { where: {} });
    await kiroConnection.call("/userspace/entities/terminal/removeOne", { where: { id: closed.id } });
    await sleep.ms(50);
    const kept = await kiroConnection.call("/userspace/entities/terminal/find", { where: {} });
    specimen.assert(kept.length === 1 && kept[0].id !== closed.id && kept[0].index === 0, JSON.stringify(kept.map((terminal) => [terminal.id === closed.id, terminal.index])));
  });

  specimen.it("a runtime-level thread — mode null", async () => {
    thread = await finnConnection.call("/userspace/entities/thread/create", { data: {} });
    specimen.assert(thread?.id && owner(thread) === finn.user.id, JSON.stringify(thread));
    specimen.assert((thread.mode ?? null) === null, JSON.stringify(thread.mode));
    const theirs = await kiroConnection.call("/userspace/entities/thread/find", { where: {} });
    specimen.assert(Array.isArray(theirs) && theirs.length === 0, JSON.stringify(theirs));
  });

  specimen.it("a turn on the runtime-level thread", async () => {
    const turn = await finnConnection.call("/userspace/entities/turn/create", {
      data: { thread: thread.id, role: "user", parts: [{ type: "text", text: "hello" }] },
    });
    specimen.assert(turn?.id && (turn.thread?.id ?? turn.thread) === thread.id && (turn.mode ?? null) === null, JSON.stringify(turn));
    const history = await finnConnection.call("/userspace/entities/turn/find", { where: { thread: thread.id } });
    specimen.assert(history?.length === 1, JSON.stringify(history));
  });

  specimen.it("terminal — a daemon and a thread as FKs, the daemon's removal nulls the daemon", async () => {
    const daemon = await scenario.seedDaemon("brazilian", [finn.user.id]);
    const written = await finnConnection.call("/userspace/entities/terminal/updateOne", {
      where: { id: firstTerminal.id },
      data: { daemon: daemon.slug, thread: thread.id },
    });
    specimen.assert(
      (written?.daemon?.slug ?? written?.daemon) === "brazilian" && (written?.thread?.id ?? written?.thread) === thread.id,
      JSON.stringify({ daemon: written?.daemon, thread: written?.thread }),
    );
    await scenario.datamap.shard.scope(() => scenario.datamap.entities.daemon.removeOne({ slug: "brazilian" }));
    const orphaned = await finnConnection.call("/userspace/entities/terminal/findOne", { where: { id: firstTerminal.id } });
    specimen.assert(
      (orphaned?.daemon ?? null) === null && (orphaned?.thread?.id ?? orphaned?.thread) === thread.id,
      JSON.stringify({ daemon: orphaned?.daemon, thread: orphaned?.thread }),
    );
    const tables = await scenario.datamap.shard.scope(() =>
      scenario.orm.em.getConnection().execute(`select name from sqlite_master where type='table' order by name`),
    );
    specimen.assert(tables.some((table) => table.name === "User_daemons"), tables.map((table) => table.name).join(","));
  });
});
