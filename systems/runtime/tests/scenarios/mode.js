import { Aperture, contexts, Mode, Path, shape, shard, Twitch, Vector } from "@vivalence/typology";
import { RequestContext } from "@mikro-orm/core";
import { seed } from "./fixtures.js";
import { gestalten, traits } from "@vivalence/runtime";
import { connector, lighthouseOf } from "./daemon.js";
const { VIEWABLE, INTENTED, EMITTER, EXPOSED, HARNESSED, TOOLING } = traits.mode;
const { stagger } = gestalten.belt;

function buildDaemon({ datamap, runtime, held }) {
  const daemon = Object.assign(held, {
    type: "daemon",
    aperture: new Aperture(),
    statics: {
      language: {
        known: { slug: "english", name: "English" },
        learning: { slug: "brazilian", name: "Português" },
      },
    },
  });

  const lighthouse = lighthouseOf(datamap, runtime.user);
  daemon.aperture.use(shard.context.spread(contexts.host, daemon)).use(shard.datamap.inject(datamap)).use(lighthouse.authenticate).use(lighthouse.bind);

  return { daemon, lighthouse };
}

async function wireMode(viva, daemon) {
  const em = daemon.entities.em;
  const mode = new Mode({ manifest: viva.manifest });
  mode.aperture = new Aperture();
  mode.aperture.use(shard.context.spread(contexts.host, daemon));
  mode.aperture.use(shard.context.bind("mode", mode));
  mode.reference = new Path(`/mode/${viva.manifest.type}/${viva.manifest.slug}`);

  mode.entity =
    (await daemon.entities.mode.findOne({ slug: viva.manifest.slug })) ??
    daemon.entities.mode.create({
      slug: viva.manifest.slug,
      type: viva.manifest.type,
      traits: viva.manifest.traits,
      installed: "installed",
    });
  await em.flush();
  mode.id = mode.entity.id;

  if (viva.buffer) mode.module.buffer = viva.buffer;
  if (viva.dataset) mode.module.dataset = viva.dataset;
  if (viva.emitter) mode.module.emitter = new Vector().graft(viva.emitter);
  if (viva.harness) mode.module.harness = viva.harness;
  if (viva.aperture) mode.aperture.graft(viva.aperture);
  if (viva.tools) mode.module.tools = viva.tools;

  mode.tools = new Vector();
  mode.tools.use(shard.context.spread(contexts.host, daemon));
  mode.tools.use(shard.context.bind("mode", mode));

  daemon.modes[viva.manifest.type] ??= {};
  daemon.modes[viva.manifest.type][viva.manifest.slug] = mode;

  const finalizers = await stagger(mode, daemon, { VIEWABLE, INTENTED, EMITTER, EXPOSED, TOOLING, ...(daemon.cortex && { HARNESSED }) });
  for (const finalize of finalizers) await finalize();

  daemon.aperture.branch(mode.reference.absolute, mode.aperture);

  return mode;
}

export async function mountMode(viva, options = {}) {
  const world = await seed(options.domain);
  const { orm, em, datamap, fixtures } = world;
  const { daemon, lighthouse } = buildDaemon(world);
  if (options.cortex) daemon.cortex = options.cortex;
  const mode = await wireMode(viva, daemon);

  const handler = shape.http(daemon.aperture);
  const connect = connector(handler);
  const anonymous = await connect();
  const conn = await connect(fixtures.user);

  const scoped = (fn) =>
    RequestContext.create(orm.em, async () => {
      RequestContext.getEntityManager().setFilterParams("user", { user: fixtures.user.id });
      return fn(RequestContext.getEntityManager());
    });

  return { mode, daemon, lighthouse, datamap, orm, em, fixtures, conn, authedConn: conn, anonymous, connect, scoped };
}

export async function mountModes(vivas) {
  const world = await seed();
  const { orm, em, datamap, fixtures } = world;
  const { daemon, lighthouse } = buildDaemon(world);
  const modes = {};
  for (const viva of vivas) {
    modes[viva.manifest.slug] = await wireMode(viva, daemon);
  }
  return { modes, daemon, lighthouse, datamap, orm, em, fixtures };
}
