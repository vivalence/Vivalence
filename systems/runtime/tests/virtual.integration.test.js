import { specimen, sleep, shard, Connection, RemoteRepository, RemoteEntityManager } from "@vivalence/typology";
import { create } from "./scenarios/virtual.js";

class Probe { id; user; thread; status; payload; }

async function consumer(url) {
  const transport = shard.transmitter.multiplex({ authority: { get: () => ({ access: "probe" }) } });
  const connection = new Connection(url, transport);
  const em = new RemoteEntityManager(connection, await connection.call("/datamap"));
  const repository = em.register("probe", new RemoteRepository(Probe).connect(connection.branch("/probe")));
  return { transport, connection, em, repository };
}

const until = async (predicate, ms = 1000) => { const t = Date.now(); while (!predicate()) { if (Date.now() - t > ms) throw new Error("timeout"); await sleep.ms(10); } };

let world, client, user, thread;
specimen.beforeAll(async () => {
  world = await create();
  ({ user, thread } = world.fixtures);
  client = await consumer(world.url);
});
specimen.afterAll(async () => { client.transport.close(); await sleep.ms(50); await world.close(); });
specimen.afterEach(() => world.as(user, () => world.entities.probe.remove({})));

specimen.describe("virtual over the wire — the datamap spine, untouched", () => {
  specimen.it("/datamap carries the virtual schema", () => {
    specimen.expect(client.em.schema.probe.properties.user).toEqual({ kind: "m:1", target: "user", owner: true });
  });
  specimen.it("find over the socket is scoped to the caller's user and casts to the client kind", async () => {
    await world.as(user, () => world.entities.probe.create({ user: user.id, thread: thread.id }));
    const found = await client.repository.find();
    specimen.expect(found.length).toBe(1);
    specimen.expect(found[0]).toBeInstanceOf(Probe);
  });
  specimen.it("create/updateOne/removeOne through the routes hit the held store", async () => {
    const made = await client.repository.create({ user: user.id });
    specimen.expect(await world.entities.probe.findOne({ id: made.id })).not.toBe(null);
    await client.repository.updateOne({ id: made.id }, { status: "HOT" });
    specimen.expect((await world.entities.probe.findOne({ id: made.id })).status).toBe("HOT");
    await client.repository.removeOne({ id: made.id });
    specimen.expect(await world.entities.probe.count()).toBe(0);
  });
  specimen.it("findOneOrFail on a gone id is a 404 at the route, not a 500", async () => {
    await specimen.expect(client.connection.call("/probe/findOneOrFail", { where: { id: "nope" } })).rejects.toMatchObject({ status: 404 });
  });
});

specimen.describe("virtual over the wire — the subscriber pops it in, diffs it, drops it", () => {
  let unsubscribe, events;
  specimen.beforeAll(async () => {
    events = [];
    unsubscribe = client.repository.subscribe({}, (entity, event) => events.push([event.op, entity?.status ?? null]));
    await sleep.ms(100);                                                     // the stream attaches before the daemon writes
  });
  specimen.afterAll(() => unsubscribe());
  specimen.beforeEach(() => { events.length = 0; });

  specimen.it("a daemon-side create pops the entity into $entities", async () => {
    const born = await world.as(user, () => world.entities.probe.create({ user: user.id }));
    await until(() => client.repository.$entities.get().some((e) => e.id === born.id));
    specimen.expect(events).toEqual([["create", "OPEN"]]);
  });
  specimen.it("a daemon-side updateOne diffs ONE field on the SAME client instance", async () => {
    const born = await world.as(user, () => world.entities.probe.create({ user: user.id }));
    await until(() => client.repository.findOneLocal({ id: born.id }));
    const before = client.repository.findOneLocal({ id: born.id });
    await world.as(user, () => world.entities.probe.updateOne({ id: born.id }, { status: "HOT" }));
    await until(() => before.status === "HOT");
    specimen.expect(client.repository.findOneLocal({ id: born.id })).toBe(before);
  });
  specimen.it("a daemon-side removeOne drops it — virtual gone is gone", async () => {
    const born = await world.as(user, () => world.entities.probe.create({ user: user.id }));
    await until(() => client.repository.findOneLocal({ id: born.id }));
    await world.as(user, () => world.entities.probe.removeOne({ id: born.id }));
    await until(() => !client.repository.findOneLocal({ id: born.id }));
    specimen.expect(events.at(-1)[0]).toBe("delete");
  });
  specimen.it("another user's virtual never reaches this subscriber", async () => {
    await world.as(world.fixtures.stranger, () => world.entities.probe.create({ user: world.fixtures.stranger.id }));
    await sleep.ms(100);
    specimen.expect(events).toEqual([]);
  });
});

specimen.describe("virtual over the wire — breakdown modes", () => {
  specimen.it("daemon remove({}) with a subscriber open: N deletes arrive, the stream stays open", async () => {
    const seen = [];
    const off = client.repository.subscribe({}, (_, event) => seen.push(event.op));
    await sleep.ms(100);
    const born = await Promise.all([1, 2].map(() => world.as(user, () => world.entities.probe.create({ user: user.id }))));
    await until(() => seen.length === 2);
    await world.as(user, () => world.entities.probe.remove({}));
    await until(() => seen.filter((op) => op === "delete").length === 2);
    for (const { id } of born) specimen.expect(client.repository.findOneLocal({ id })).toBe(null);
    off();
  });
  specimen.it("a delete for an id the client never saw is a no-op", async () => {
    const before = client.repository.$entities.get().length;
    client.repository.drop("never-seen");
    specimen.expect(client.repository.$entities.get().length).toBe(before);
  });
  specimen.it("socket drop → reattach → resumed resync drops what the daemon lost", async () => {
    const born = await world.as(user, () => world.entities.probe.create({ user: user.id }));
    client.repository.persisted = true;                                       // the drop-on-revalidate arm (remote-repository.js:71) — a cold find() only casts
    const off = client.repository.subscribe({}, () => {});
    await until(() => client.repository.findOneLocal({ id: born.id }));
    for (const socket of world.gate.sockets) socket.close();                  // every socket dropped; the store untouched
    await world.as(user, () => world.entities.probe.removeOne({ id: born.id }));                    // dies while nobody is listening
    await until(() => !client.repository.findOneLocal({ id: born.id }), 5000); // reattach → resumed → find() → drop
    off();
  });
  specimen.it("a persisted client cache never resurrects a virtual after a daemon restart", async () => {
    globalThis.localStorage ??= new Map();                                    // shim — see hunks
    const born = await world.as(user, () => world.entities.probe.create({ user: user.id }));
    await client.repository.find();
    const key = client.connection.branch("/probe").url.absolute;
    localStorage.setItem(key, JSON.stringify([JSON.parse(JSON.stringify(born))]));
    await world.as(user, () => world.entities.probe.remove({}));                                    // "restart": the process forgot
    const fresh = await consumer(world.url);
    fresh.repository.persist();                                               // hydrates the stale row first
    specimen.expect(fresh.repository.$entities.get().length).toBe(1);
    await fresh.repository.find();                                            // revalidate → daemon says none → drop
    await until(() => fresh.repository.$entities.get().length === 0);
    fresh.transport.close();
  });
});
