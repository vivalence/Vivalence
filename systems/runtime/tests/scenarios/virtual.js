import { types } from "@mikro-orm/core";
import { Aperture, Twitch, shape, shard, Url, sleep } from "@vivalence/typology";
import { VirtualEntity, VirtualRepository, VirtualSchema, ThreadEntity, UserEntity, ModeEntity, DaemonEntity } from "@vivalence/runtime";
import { provider, descriptors, DAEMON } from "./datamap.js";

export class ProbeEntity extends VirtualEntity {
  user; thread;
  status = "OPEN";
  payload = {};
  #torn = false;
  get torn() { return this.#torn; }
  teardown() { this.#torn = true; }
}

export const ProbeSchema = new VirtualSchema({
  class: ProbeEntity,
  hooks: { beforeDelete: ["teardown"] },
  properties: {
    user:   { kind: "m:1", entity: () => UserEntity },
    thread: { kind: "m:1", entity: () => ThreadEntity, nullable: true },
    status: { type: types.string },
    payload: { type: types.json },
  },
});

export const probe = { type: "probe", schema: ProbeSchema };

export async function create({ port = 0 } = {}) {
  const datamap = await provider([...descriptors, probe]);
  const { entities, orm } = datamap;
  const em = orm.em;
  entities.probe = new VirtualRepository(em, ProbeEntity);

  const { user, stranger, mode, thread } = await datamap.shard.scope(async () => {
    const em = orm.em.getContext();
    const user = em.create(UserEntity, { slug: "finn" });
    const stranger = em.create(UserEntity, { slug: "kiro" });
    em.create(DaemonEntity, { slug: DAEMON, mask: {} });
    await em.flush();
    const mode = em.create(ModeEntity, { daemon: DAEMON, slug: "test", type: "test", traits: [], installed: "installed" });
    await em.flush();
    em.setFilterParams("user", { user: user.id });
    const thread = em.create(ThreadEntity, { user: user.id, mode: mode.id, traits: [] });
    await em.flush();
    return { user, stranger, mode, thread };
  });

  const twitch = new Twitch();
  datamap.registerSubscriber(twitch);

  const as = (who, fn) => datamap.shard.scope(() => { orm.em.getContext().setFilterParams("user", { user: who.id }); return fn(); });

  const aperture = new Aperture();
  aperture.use(shard.datamap.inject(datamap));
  aperture
    .branch("/probe")
    .use(shard.context.attach("user", user))
    .use(shard.datamap.scope((ctx) => ({ user: ctx.user.id })))
    .graft(shard.datamap.repository(entities.probe))
    .graft(shard.datamap.reactive(entities.probe, twitch));
  aperture.open("/datamap", () => shard.datamap.strip(datamap.getMetadata()));

  const gate = shard.serve.multiplex(aperture);
  aperture.open("/multiplex", gate);
  const abort = new AbortController();
  const server = Deno.serve({ port, signal: abort.signal, onListen() {} }, shape.http(aperture));
  await sleep.ms(50);

  return {
    orm, em, datamap, entities, twitch, aperture, gate, as,
    fixtures: { user, stranger, mode, thread },
    url: new Url(`http://localhost:${server.addr.port}`),
    async close() {
      await as(user, () => entities.probe.remove({}));
      abort.abort();
      await sleep.ms(20);
      await datamap.close();
    },
  };
}
