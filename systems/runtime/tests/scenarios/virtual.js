import { types } from "@mikro-orm/core";
import { Aperture, Vector, shape, shard, Url, sleep } from "@vivalence/typology";
import { VirtualEntity, VirtualRepository, VirtualSchema, ThreadEntity, UserEntity, ModeEntity } from "@vivalence/runtime";
import { provider, schemas } from "./datamap.js";

// a status, a payload, an owner, a thread, one private handle — every wire, specific to nothing
export class ProbeEntity extends VirtualEntity {
  user; thread;
  status = "OPEN";
  payload = {};
  #torn = false;
  get torn() { return this.#torn; }
  teardown() { this.#torn = true; }          // the mikro beforeDelete hook
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

export const probe = { type: "probe", schema: ProbeSchema };   // no `entity`: the ORM discovers the schema, the provider mints nothing

const describe = (schema) => ({
  type: schema.meta.class.name.toLowerCase().replace("entity", ""),
  schema,
  entity: schema.meta.class,
});

export async function create({ port = 0 } = {}) {
  const datamap = await provider([...schemas.map(describe), probe]);
  const { entities, orm } = datamap;
  const em = orm.em;                                            // the GLOBAL em: every verb routes to the request's fork via getContext()
  entities.probe = new VirtualRepository(em, ProbeEntity);      // the context constructs and holds it — `kernel.constraint = new …`

  // no global context, ever: the fixtures are written inside one, like every write after them
  const { user, stranger, mode, thread } = await datamap.shard.context(async () => {
    const em = orm.em.getContext();
    const user = em.create(UserEntity, { roles: ["USER"], config: {} });
    const stranger = em.create(UserEntity, { roles: ["USER"], config: {} });
    const mode = em.create(ModeEntity, { slug: "test", type: "test", traits: [], installed: "installed" });
    await em.flush();
    em.setFilterParams("user", { user: user.id });
    const thread = em.create(ThreadEntity, { user: user.id, mode: mode.id, traits: [] });
    await em.flush();
    return { user, stranger, mode, thread };
  });

  const twitch = new Vector();
  datamap.subscribe(shape.subscriber(twitch));

  // a daemon-side write rides a request context, as in production: fresh identity map → cold references →
  // to-ones serialize as ids → the Broadcaster's `object.match` (===) meets a `{ user }` filter
  const as = (who, fn) => datamap.shard.context(() => { orm.em.getContext().setFilterParams("user", { user: who.id }); return fn(); });

  const aperture = new Aperture();
  aperture.use(shard.datamap.inject(datamap));
  aperture
    .branch("/probe")
    .use(shard.context.attach("user", user))
    .use(shard.datamap.scope((ctx) => ({ user: ctx.user.id })))
    .slurp(shard.datamap.repository(entities.probe))
    .slurp(shard.datamap.reactive(entities.probe, twitch));
  aperture.open("/datamap", () => shard.datamap.strip(datamap.introspect()));

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
      await datamap.disintegrate();
    },
  };
}
