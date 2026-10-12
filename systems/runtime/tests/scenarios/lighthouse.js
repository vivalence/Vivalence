import { Aperture, Connection, Controller, Cortex, Datamap, Path, Span, Twitch, Url, shape, shard, steer, v } from "@vivalence/typology";
import { MikroORM } from "@mikro-orm/core";
import { config } from "../../../../commons/datamaps/libsql/libsql.viva.js";
import { ActivityEntity, ActivityRepository, kernel, sets } from "../../entities/index.ts";
import { assemble } from "../../gestalten/belt/assemble.js";
import { mint, strike } from "../../gestalten/belt/traits.js";
import { Lighthouse } from "../../lighthouse/prototype.js";
import { execution as lighthouseExecution } from "../../lighthouse/lifecycle/index.js";
import { userspace } from "../../runtime/lifecycle/integration.js";
import { lifecycle } from "@vivalence/runtime";

const SECRET = "scenario-secret-scenario-secret-scenario";

export async function create({ traits = ["JOINABLE"] } = {}) {
  const { entities, twitch } = assemble([sets.identity, sets.composition, sets.traits, sets.userspace, sets.transient]);
  const orm = await MikroORM.init(config({}, { entities: entities.map((descriptor) => descriptor.schema) }));
  await orm.schema.create();
  const datamap = new Datamap(orm);
  const runtime = {
    datamap,
    slug: "runtime",
    reference: new Path("/runtime/runtime"),
    controller: new Controller({ stdout: new Span("runtime/runtime") }),
    entities: { ...datamap.entities },
    aperture: new Aperture(),
    twitch: new Twitch(),
    cortex: new Cortex(),
    processes: { daemon: { census: () => ({}), create: async () => ({ execute() {} }), kill: async () => {}, remove: async () => {} } },
    instance: { daemons: [], lighthouse: v.primitives.instance.Lighthouse.cast({ secrets: { jwt: SECRET }, traits }) },
  };
  runtime.entities.activity = new ActivityRepository(datamap.entities.em, ActivityEntity);
  for (const held of twitch) runtime.twitch.graft(held);
  runtime.twitch.branch("/after").use(shard.datamap.detached(datamap));
  datamap.registerSubscriber(runtime.twitch);
  runtime.minted = mint({ slug: null, kinds: { note: sets.traits.note }, traits: { note: kernel.note } });
  Object.assign(runtime.entities, strike(runtime.minted, datamap.entities.em, sets.traits));
  const aperture = new Aperture().use(shard.datamap.inject(datamap)).open("/status", () => "RUNNING");

  const die = { aperture, runtime, mask: { secrets: { jwt: SECRET } }, controller: { branch: () => ({}) } };
  runtime.lighthouse = new Lighthouse(runtime.instance.lighthouse);
  await steer.dispatch.execute(lighthouseExecution, { lighthouse: runtime.lighthouse, runtime, aperture, controller: die.controller });
  await userspace(die, async () => {});

  const handler = shape.http(aperture);
  const connect = (token) => {
    const connection = new Connection(new Url("http://runtime"), shard.transmitter.inline(handler));
    if (token) connection.use(async (ctx, next) => (ctx.request.headers.set("authorization", `Bearer ${token}`), await next()));
    return connection;
  };
  const conn = connect();
  const signup = async (username) => {
    const body = await conn.call("/lighthouse/signup", { username, password: `pw-${username}` });
    return { user: body.user, access: body.authority.access, refresh: body.authority.refresh };
  };
  const seedDaemon = (slug, users = []) =>
    datamap.shard.scope(async () => {
      const row = datamap.entities.daemon.create({ slug, mask: { manifest: { type: "daemon", slug } } });
      for (const id of users) row.users.add(await datamap.entities.user.findOneOrFail({ id }));
      await datamap.entities.em.flush();
      return row;
    });
  const mountDaemon = async (slug, { domain = {}, modes: modes = [] } = {}) => {
    await seedDaemon(slug);
    const daemon = { type: "daemon", slug, reference: new Path(`/daemon/${slug}`), domain, aperture: new Aperture(), modes: {}, services: {} };
    await lifecycle.daemon.population.datamap({ runtime, daemon, register: { modes: modes } }, async () => {});
    return daemon;
  };
  return { conn, orm, datamap, aperture, runtime, secret: SECRET, connect, signup, seedDaemon, mountDaemon, close: () => datamap.close() };
}
