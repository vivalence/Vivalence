import { Aperture, Connection, contexts, middleware, Mode, Path, shape, shard, steer, Twitch, Url, v, Vector } from "@vivalence/typology";
import { RequestContext } from "@mikro-orm/core";
import { seed } from "./fixtures.js";
import { gestalten, lifecycle, traits } from "@vivalence/runtime";
import { authenticate, signer } from "../../subjects/lighthouse/signer.js";
import { userspace as userspaceBeat } from "../../subjects/runtime/lifecycle/integration.js";

const { VIEWABLE, INTENTED, EMITTER } = traits.mode;
const { stagger } = gestalten.belt;

export const SECRET = "scenario-secret-scenario-secret-scenario";

export const lighthouseOf = (datamap, users) => ({
  secret: SECRET,
  users,
  authenticate: authenticate({ secret: SECRET, users }),
  bind: datamap.shard.bind("user", (ctx) => ({ user: ctx.user.id })),
});

export const connector = (handler) => async (user) => {
  const connection = new Connection(new Url("http://test"), shard.transmitter.inline(handler));
  if (!user) return connection;
  const access = await signer(SECRET).access(user);
  return connection.use(async (ctx, next) => (ctx.request.headers.set("authorization", `Bearer ${access}`), await next()));
};

export async function create({ domain = {} } = {}) {
  const world = await seed(domain);
  const { orm, em, datamap, entities, runtime, fixtures, held } = world;

  const modeTraits = ["VIEWABLE", "INTENTED", "EMITTER"];
  const mode = new Mode({ manifest: { type: "game", slug: "flashcard", traits: modeTraits } });
  mode.aperture = new Aperture();
  mode.reference = new Path(`/mode/${mode.manifest.type}/${mode.manifest.slug}`);
  mode.entity = fixtures.mode;
  mode.id = fixtures.mode.id;

  mode.module.buffer = v.buffer({
    data: { recall: v.string({ default: "LEARNING" }) },
  });

  mode.module.dataset = {
    intent: [
      {
        slug: "survival-flashcard",
        name: "Survival Flashcard",
        traits: ["MASKED"],
        trait: { MASKED: { where: { symbols: ["greeting"] } } },
      },
    ],
  };

  mode.module.emitter = new Vector().open("/literal", async (ctx) => {
    const recall = ctx.input.recall;
    return ctx.mode.buffer({
      data: { recall },
      literals: [ctx.input.literal],
    });
  });

  const daemon = Object.assign(held, { type: "daemon", aperture: new Aperture(), modes: { game: { flashcard: mode } } });

  const lighthouse = lighthouseOf(datamap, runtime.user);
  daemon.aperture.use(shard.context.spread(contexts.host, daemon)).use(shard.datamap.inject(datamap)).use(lighthouse.authenticate).use(lighthouse.bind);

  if (domain.aperture) {
    domain.aperture.use(shard.context.spread(contexts.host, daemon));
    daemon.aperture.graft(domain.aperture);
    daemon.call = shape.proxy(domain.aperture, steer.strategy.direct);
  }

  for (const finalize of await stagger(mode, daemon, { VIEWABLE, INTENTED, EMITTER })) await finalize();

  daemon.aperture.branch(mode.reference.absolute, mode.aperture);

  const die = { daemon };
  await middleware.compose([lifecycle.daemon.integration.datamap, lifecycle.daemon.integration.entities])(die);

  const handler = shape.http(daemon.aperture);
  const connect = connector(handler);
  const anonymous = await connect();
  const conn = await connect(fixtures.user);

  const runtimeAperture = new Aperture().use(shard.datamap.inject(datamap));
  await userspaceBeat({ aperture: runtimeAperture, runtime: { datamap, entities: runtime, twitch: world.twitch, lighthouse } }, async () => {});
  runtimeAperture.branch(daemon.reference.nature, daemon.aperture);
  const userspace = await connector(shape.http(runtimeAperture))(fixtures.user);

  const scoped = (fn) => RequestContext.create(orm.em, async () => {
    const scopedEm = RequestContext.getEntityManager();
    scopedEm.setFilterParams("user", { user: fixtures.user.id });
    return fn(scopedEm);
  });

  return { daemon, die, lighthouse, handler, conn, authedConn: conn, anonymous, userspace, runtimeAperture, connect, orm, em, datamap, fixtures, mode, scoped };
}
