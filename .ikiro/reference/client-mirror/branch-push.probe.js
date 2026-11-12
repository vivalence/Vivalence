import { sleep, Aperture, Vector, Connection, Url, shard, shape, RemoteEntityManager, RemoteRepository } from "@vivalence/typology";
import { datamap } from "@vivalence/runtime/scenarios";

const PORT = 9891;
const scenario = await datamap.seed();
const { repos, fixtures } = scenario;
const twitch = new Vector();
const aperture = new Aperture();

aperture.branch("/mode/entities/literal").graft(shard.datamap.repository(repos.literal));
aperture
  .branch("/daemon/entities/literal")
  .graft(shard.datamap.repository(repos.literal))
  .graft(shard.datamap.reactive(repos.literal, twitch));
scenario.datamap.registerSubscriber(twitch);

const abort = new AbortController();
Deno.serve({ port: PORT, signal: abort.signal, onListen() {} }, shape.http(aperture));
await sleep.ms(100);

const connection = new Connection(new Url(`http://localhost:${PORT}`));
const created = await connection.call("/daemon/entities/literal/create", {
  data: { slug: "probe-branch", mode: fixtures.mode.id, daemon: fixtures.daemon.slug, trait: {} },
});

const em = new RemoteEntityManager(connection);
em.register("literal", new RemoteRepository());
const branch = (path) =>
  new RemoteRepository().connect(connection.branch(`${path}/entities/literal`)).manage(em, "literal");
const mode = branch("/mode");
const daemon = branch("/daemon");

const [loaded] = await mode.find({ id: created.id });
const pushes = [];
const off = daemon.subscribe({ id: { $in: [created.id] } }, (merged) => pushes.push(merged));
await sleep.ms(100);

await connection.call("/daemon/entities/literal/updateOne", { where: { id: created.id }, data: { trait: { PROBED: 1 } } });
await sleep.ms(300);

const unsubscribed = await mode.find({ id: created.id });
console.log(JSON.stringify({
  loadedThroughMode: loaded.trait,
  pushesOnDaemon: pushes.length,
  pushIsLoadedObject: pushes[0] === loaded,
  storeSize: em.stores.literal.get().length,
}, null, 2));

off();
await connection.call("/daemon/entities/literal/updateOne", { where: { id: created.id }, data: { trait: { PROBED: 2 } } });
await sleep.ms(300);
console.log(JSON.stringify({ afterUnsubscribe: loaded.trait, pushesTotal: pushes.length, refoundIsSame: unsubscribed[0] === loaded }, null, 2));

abort.abort();
await scenario.orm.close();
Deno.exit(0);
