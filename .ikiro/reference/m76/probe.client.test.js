// TODO temporary — m76 probe: deliverables d · e — anima consumes the Terminal through the remote repository and its subscription
import { atom, map } from "nanostores";
import { assertEquals, assert } from "jsr:@std/assert";
import { RemoteRepository, shard } from "@vivalence/typology";
import { lighthouse as rig } from "./rig.js";
import { Dataspace } from "./systems/anima/src/typology/prototypes/dataspace.js";
import { Terminal, TerminalDossier } from "./systems/anima/src/typology/entities/terminal.js";
import { Terminals } from "./systems/anima/src/typology/stores/terminals.js";
import { setDockSide } from "./systems/anima/src/typology/stores/bridge/dock.js";

class DaemonDouble {
  status = { code: "mounting", is: (code) => this.status.code === code, $transient: atom(0) };
  entities = { thread: { $entities: atom([]), findOneLocal: ({ id }) => this.entities.thread.$entities.get().find((t) => t.id === id) ?? null } };
  healthy(code = "healthy") {
    this.status.code = code;
    this.status.$transient.set(this.status.$transient.get() + 1);
  }
}
const DaemonDossierDouble = {
  name: "daemon",
  kind: () => DaemonDouble,
  repository: (schema, dataspace) => new RemoteRepository(schema.kind()).connect(dataspace.connection.branch("/entities/daemon")),
};

const threadDouble = (id, daemon) => ({ id, daemon, $buffers: atom([]), $phase: atom("manual"), trait: { QUEUEING: { depth: 1 } } });
const tick = (ms = 0) => new Promise((resolve) => setTimeout(resolve, ms));
const settled = async () => { for (let i = 0; i < 12; i++) await tick(0); };
const until = async (predicate, ms = 1500) => {
  const start = Date.now();
  while (!predicate()) {
    if (Date.now() - start > ms) throw new Error("until: timed out");
    await tick(5);
  }
};

async function client(house, username, access = null) {
  let identity;
  if (!access) ({ identity, access } = await house.signup(username));
  else identity = (await house.connect(access).call("/auth/verify", { access })).identity;
  const lighthouse = { $identity: map(identity), $daemons: atom([]), get identity() { return this.$identity.get(); } };
  const connection = house.connect(access);
  const dataspace = new Dataspace({
    entities: [DaemonDossierDouble, TerminalDossier],
    connection,
    seed: (vector) => vector.use(shard.context.bind("lighthouse", lighthouse)),
  });
  await dataspace.init();
  await dataspace.populate(["daemon", "terminal"]);
  const terminals = new Terminals(dataspace.terminal);
  return { identity, access, lighthouse, connection, dataspace, terminals };
}

Deno.test("d · e — the client over the remote repository and its subscription", async (t) => {
  const house = await rig();
  const finn = await client(house, "finn");
  const row = (terminal) => finn.connection.call("/entities/terminal/findOne", { where: { id: terminal.id } });

  await t.step("init reads /metadata/datamap into the remote em schema", () => {
    assert(finn.dataspace.em.schema.terminal?.properties?.daemon?.kind === "m:1");
    assert(finn.dataspace.em.schema.terminal?.properties?.identity?.kind === "m:1");
  });

  await t.step("create seats index 0 then 1; the store sorts by index; active follows; the entity knows its repository", async () => {
    const first = await finn.terminals.create();
    const second = await finn.terminals.create();
    assert(first instanceof Terminal);
    assertEquals([first.index, second.index], [0, 1]);
    assertEquals(finn.terminals.entities.map((terminal) => terminal.index), [0, 1]);
    assertEquals(finn.terminals.active, second);
    assertEquals(first.repository, finn.dataspace.terminal);
  });

  await t.step("the row carries no authentication (hidden on the wire)", async () => {
    const rows = await finn.connection.call("/entities/terminal/find", { options: { populate: ["identity"] } });
    assertEquals(rows[0].identity.authentication, undefined);
    assertEquals(rows[0].identity.slug, "finn");
  });

  await t.step("two walls: another identity sees none of finn's rows, cannot widen with where.identity, its own index starts at 0", async () => {
    const beef = await client(house, "beef");
    assertEquals(beef.terminals.entities.length, 0);
    const widened = await beef.connection.call("/entities/terminal/find", { where: { identity: finn.identity.id } });
    assertEquals(widened.length, 0);
    const own = await beef.terminals.create();
    assertEquals(own.index, 0);
    assertEquals((await finn.connection.call("/entities/terminal/find")).length, 2);
  });

  await t.step("DOCKED: the identity's trait, else the row's; a drag persists after the debounce; an idle row stays untouched", async () => {
    const [first, second] = finn.terminals.entities;
    assertEquals(first.dock.side, "right");
    finn.lighthouse.$identity.setKey("trait", { DOCKED: { side: "left", share: 0.5, collapsed: false, full: false } });
    const third = await finn.terminals.create();
    assertEquals(third.dock.side, "left");
    await finn.terminals.remove(third.id);
    setDockSide(first.$dock, "bottom");
    await tick(50);
    assertEquals((await row(first)).traits, []);
    await until(() => first.trait.DOCKED?.side === "bottom");
    assertEquals((await row(first)).trait.DOCKED.side, "bottom");
    assertEquals((await row(second)).traits, []);
  });

  const brazilian = await house.seedDaemon("brazilian", [finn.identity.id]);
  await finn.dataspace.populate(["daemon"]);
  const daemonEntity = finn.dataspace.daemon.$entities.get()[0];

  await t.step("the pivot: finn's daemon arrives as a DaemonDouble through /entities/daemon", () => {
    assert(daemonEntity instanceof DaemonDouble);
    assertEquals(daemonEntity.slug, "brazilian");
  });

  const seated = threadDouble("0192-thread", daemonEntity);
  seated.$buffers.set([{ id: "b1", on: { release: () => {} } }]);
  daemonEntity.entities.thread.$entities.set([seated]);
  daemonEntity.healthy();

  await t.step("seat writes the row; $thread derives from the daemon's thread store; the m:1 resolves back to the double", async () => {
    const [first] = finn.terminals.entities;
    await first.seat(seated);
    assertEquals([first.thread, first.daemon instanceof DaemonDouble], ["0192-thread", true]);
    assertEquals((await row(first)).daemon, brazilian.id);
    assertEquals(first.$thread.get(), seated);
    assertEquals(first.$buffer.get()?.id, "b1");
    assertEquals(first.settling, null);
  });

  await t.step("subscription: a second client of the same identity sees the seat move without a reload", async () => {
    const twin = await client(house, "finn", finn.access);
    const offSubscription = twin.dataspace.terminal.subscribe();
    await settled();
    const [first] = finn.terminals.entities;
    const mirror = twin.terminals.entities.find((terminal) => terminal.id === first.id);
    assertEquals(mirror.thread, "0192-thread");
    await first.seat(null);
    await until(() => mirror.thread === null);
    assertEquals(mirror.daemon, null);
    await first.seat(seated);
    await until(() => mirror.thread === "0192-thread");
    setDockSide(first.$dock, "top");
    await until(() => mirror.trait.DOCKED?.side === "top");
    assertEquals(mirror.dock.side, "top");
    offSubscription();
  });

  await t.step("settling: an unhealthy daemon → $settling { thread }, $thread null; healthy again → mounted", async () => {
    const [first] = finn.terminals.entities;
    daemonEntity.healthy("mounting");
    assertEquals(first.settling, { thread: "0192-thread" });
    assertEquals(first.$thread.get(), null);
    daemonEntity.healthy("healthy");
    assertEquals(first.$thread.get(), seated);
    assertEquals(first.settling, null);
  });

  await t.step("ABSENT: the thread leaves the daemon's store → the row unseats (daemon null · thread null)", async () => {
    const [first] = finn.terminals.entities;
    daemonEntity.entities.thread.$entities.set([]);
    assertEquals(first.$thread.get(), null);
    await until(() => first.thread === null);
    assertEquals([(await row(first)).daemon, (await row(first)).thread], [null, null]);
  });

  await t.step("remove: active moves to the last remaining; the row is gone", async () => {
    const [first, second] = finn.terminals.entities;
    finn.terminals.activate(second.id);
    await finn.terminals.remove(second.id);
    assertEquals(finn.terminals.active, first);
    assertEquals(await finn.connection.call("/entities/terminal/count"), 1);
  });

  await t.step("toJSON: no $ keys, no stall, no repository", () => {
    const [first] = finn.terminals.entities;
    const json = JSON.parse(JSON.stringify(first));
    assertEquals(Object.keys(json).filter((key) => key.startsWith("$") || ["stall", "repository", "docking"].includes(key)), []);
    assertEquals(json.index, 0);
  });

  await house.close();
});
