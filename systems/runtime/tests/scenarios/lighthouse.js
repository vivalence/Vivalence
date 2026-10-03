// systems/runtime/tests/scenarios/lighthouse.js:1
import { Aperture, Connection, Datamap, Url, Vector, shape, shard } from "@vivalence/typology";
import { lighthouse } from "./fixtures.js";
import { accio } from "./registry.js";

export async function create() {
  const { orm, em, repos, fixtures } = await lighthouse.seed();
  const { attachment, manifest } = await accio("@commons/lighthouse/multiplayer");
  const datamap = new Datamap(orm);
  const mask = { secrets: { jwt: "scenario-secret-scenario-secret-scenario" }, statics: {}, attachment };
  const service = {
    manifest,
    attachment: new Aperture(),
    controller: { status: "RUNNING" },
    datamap,
    entities: datamap.entities,
  };

  service.twitch = new Vector();
  service.twitch.branch("/after").use(shard.datamap.detached(datamap));
  datamap.registerSubscriber(shape.subscriber(service.twitch));
  service.attachment.use(shard.datamap.inject(datamap));

  service.attachment
    .open("/status", () => service.controller.status)
    .open("/manifest", () => service.manifest)
    .use(shard.context.bind("service", service))
    .use(shard.context.bind("mask", mask));
  service.attachment.graft(mask.attachment);

  const handler = shape.http(service.attachment);
  const connect = (token) => {
    const connection = new Connection(new Url("http://lighthouse"), shard.transmitter.inline(handler));
    if (token) {
      connection.use(async (ctx, next) => {
        ctx.request.headers.set("authorization", `Bearer ${token}`);
        await next();
      });
    }
    return connection;
  };
  const conn = connect();

  const signup = async (username) => {
    const body = await conn.call("/auth/signup", { username, password: `pw-${username}` });
    return { identity: body.identity, access: body.authority.access, refresh: body.authority.refresh };
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

  const close = () => datamap.close();

  return { conn, orm, em, repos, fixtures, datamap, service, mask, connect, signup, seedDaemon, close };
}
