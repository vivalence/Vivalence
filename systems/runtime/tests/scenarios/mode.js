import { Url, Connection, Mode, Path, Aperture, Vector, shape, shard } from "@vivalence/typology";
import { RequestContext } from "@mikro-orm/core";
import { seed, tiers } from "./fixtures.js";
import { INTENTED, EMITTER, EXPOSED, HARNESSED, TOOLED, stagger } from "@vivalence/runtime/daemon/traits";

// ── test-only APPLICATION ─────────────────────────────────────────────
// No paladin, no bundler. Mirrors the real trait's buffer factory: fill()
// (Default-only) — never cast(), whose Convert pass mauls MikroORM Collections.
// Entity classes via tiers.<type>.entity = the actually-registered classes.
function APPLICATION(mode, daemon) {
  if (!mode.module.app) return;
  mode.app.buffer = async (desc = {}) => {
    const em = daemon.entities.em;
    const buffer = em.create(tiers.buffer.entity, {
      mode: mode.entity.id,
      data: mode.app.fill(desc),
      view: null,
      index: desc.index ?? 0,
    });
    if (desc.thread) {
      const thread = await daemon.entities.thread.findOne(desc.thread);
      buffer.thread = thread;
      buffer.index = thread.counter++;
    }
    if (desc.literals) buffer.literals.add(await daemon.entities.literal.findByIdentifiers(desc.literals));
    if (desc.symbols) buffer.symbols.add(await daemon.entities.symbol.findByIdentifiers(desc.symbols));
    return buffer;
  };
}

// ── daemon scaffold ────────────────────────────────────────────────
// entities = the datamap repos, keyed by type — exactly daemon.good.entities
// in the real runtime. Aperture carries the daemon on ctx (effects read
// ctx.daemon.entities) + a test authority for any auth-gated branch.
function buildDaemon(datamap, fixtures) {
  const daemon = {
    manifest: { slug: "test-daemon", traits: [] },
    mount: new Path("/daemon/test-daemon"),
    aperture: new Aperture(),
    twitch: new Vector(),
    entities: datamap.entities,
    modes: {},
    statics: {
      language: {
        known: { slug: "english", name: "English" },
        learning: { slug: "brazilian", name: "Português" },
      },
    },
    cargo: { version: "0.0.1", test: true, "audio/thanks.mp3": true },
    services: {},
    flatmodes() {
      return Object.values(this.modes).flatMap((type) => Object.values(type));
    },
  };

  datamap.subscribe(shape.subscriber(daemon.twitch));

  daemon.aperture.use(shard.context.bind("daemon", daemon));
  daemon.aperture.use(async (ctx, next) => {
    ctx.authority = {
      authenticate: async (token) => {
        if (token === "test-token") return { getUser: async () => fixtures.user };
        throw new Error("invalid token");
      },
    };
    await next();
  });

  return daemon;
}

// ── wire a single .viva.js into the daemon ─────────────────────────
async function wireMode(viva, daemon) {
  const em = daemon.entities.em;
  const mode = new Mode({ manifest: viva.manifest });
  mode.aperture = new Aperture();
  mode.aperture.use(shard.context.bind("daemon", daemon));
  mode.aperture.use(shard.context.bind("mode", mode));
  mode.mount = new Path(`/mode/${viva.manifest.type}/${viva.manifest.slug}`);

  mode.entity =
    (await em.findOne(tiers.mode.entity, { slug: viva.manifest.slug })) ??
    em.create(tiers.mode.entity, {
      slug: viva.manifest.slug,
      type: viva.manifest.type,
      traits: viva.manifest.traits,
      installed: "installed",
    });
  await em.flush();
  mode.id = mode.entity.id;

  if (viva.app) {
    mode.app = mode.module.app = viva.app; // mirror real Mode: Object.assign makes mode.app === mode.module.app
  }
  if (viva.dataset) mode.module.dataset = viva.dataset;
  if (viva.emitter) mode.module.emitter = new Vector().slurp(viva.emitter);
  if (viva.harness) mode.module.harness = viva.harness;
  if (viva.aperture) mode.aperture.slurp(viva.aperture); // exported aperture endpoints
  if (viva.tools) mode.module.tools = viva.tools;

  mode.tools = new Vector();
  mode.tools.use(shard.context.bind("daemon", daemon));
  mode.tools.use(shard.context.bind("mode", mode));

  daemon.modes[viva.manifest.type] ??= {};
  daemon.modes[viva.manifest.type][viva.manifest.slug] = mode;

  const finalizers = await stagger(mode, daemon, { APPLICATION, INTENTED, EMITTER, EXPOSED, TOOLED, ...(daemon.cortex && { HARNESSED }) });
  for (const finalize of finalizers) await finalize();

  daemon.aperture.branch(mode.mount.absolute).slurp(mode.aperture); // → conn-reachable

  return mode;
}

// ── public API ─────────────────────────────────────────────────────

export async function mountMode(viva, options = {}) {
  const { orm, em, datamap, fixtures } = await seed();
  const daemon = buildDaemon(datamap, fixtures);
  if (options.cortex) daemon.cortex = options.cortex;
  const mode = await wireMode(viva, daemon);

  const handler = shape.http(daemon.aperture);
  const conn = new Connection(new Url("http://test"), shard.transmitter.inline(handler));
  const authedConn = new Connection(new Url("http://test"), shard.transmitter.inline(handler));
  authedConn.use(async (ctx, next) => {
    ctx.request.headers.set("authorization", "Bearer test-token");
    await next();
  });

  const scoped = (fn) =>
    RequestContext.create(orm.em, async () => {
      RequestContext.getEntityManager().setFilterParams("user", { user: fixtures.user.id });
      return fn(RequestContext.getEntityManager());
    });

  return { mode, daemon, datamap, orm, em, fixtures, conn, authedConn, scoped };
}

export async function mountModes(vivas) {
  const { orm, em, datamap, fixtures } = await seed();
  const daemon = buildDaemon(datamap, fixtures);
  const modes = {};
  for (const viva of vivas) {
    modes[viva.manifest.slug] = await wireMode(viva, daemon);
  }
  return { modes, daemon, datamap, orm, em, fixtures };
}
