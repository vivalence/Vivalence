// TODO temporary — m76 probe rig: the tangled lighthouse attachment, in-process, in-memory sqlite, inline transport
import { MikroORM, defineConfig } from "@mikro-orm/sqlite";
import { Aperture, Connection, Datamap, Url, Vector, shape, shard } from "@vivalence/typology";
import { AuthenticatorEmbedSchema, IdentitySchema, DaemonSchema, TerminalSchema } from "./subsystems/typology/entities/lighthouse/index.ts";
import { attachment as exported } from "./commons/lighthouses/multiplayer/attachment/index.js";

export async function lighthouse() {
  const orm = await MikroORM.init(
    defineConfig({
      dbName: ":memory:",
      entities: [IdentitySchema, DaemonSchema, TerminalSchema, AuthenticatorEmbedSchema],
      allowGlobalContext: true,
      debug: false,
    }),
  );
  await orm.schema.createSchema();
  const datamap = new Datamap(orm);
  const here = new URL(".", import.meta.url).pathname;
  const mask = {
    secrets: { jwt: "probe-secret-probe-secret-probe-secret" },
    mountpoint: { branch: (p) => ({ absolute: here + "rig-" + p.replace(/^\//, "") }) },
    statics: {},
  };
  const service = { attachment: new Aperture(), manifest: { type: "lighthouse", slug: "multiplayer" }, datamap, entities: datamap.entities };
  service.twitch = new Vector();
  service.twitch.branch("/after").use(shard.datamap.detached(datamap));
  datamap.registerSubscriber(shape.subscriber(service.twitch));
  service.attachment
    .use(shard.datamap.inject(datamap))
    .use(shard.context.bind("service", service))
    .use(shard.context.bind("mask", mask));
  service.attachment.graft(exported);

  const handler = shape.http(service.attachment);
  const connect = (token) => {
    const connection = new Connection(new Url("http://lighthouse"), shard.transmitter.inline(handler));
    if (token) connection.use(async (ctx, next) => {
      ctx.request.headers.set("authorization", `Bearer ${token}`);
      await next();
    });
    return connection;
  };

  const signup = async (username) => {
    const body = await connect().call("/auth/signup", { username, password: "pw-" + username });
    return { identity: body.identity, access: body.authority.access };
  };

  const seedDaemon = async (slug, identities) => {
    const daemon = datamap.entities.daemon.create({ slug, remote: `http://${slug}:2501`, reported: "RUNNING" });
    for (const id of identities) {
      const identity = await datamap.entities.identity.findOneOrFail({ id });
      identity.daemons.add(daemon);
    }
    await datamap.entities.em.flush();
    return daemon;
  };

  const close = async () => {
    await orm.close();
  };

  return { orm, datamap, service, connect, signup, seedDaemon, close };
}
