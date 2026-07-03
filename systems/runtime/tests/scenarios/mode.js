import { Url, Connection, Mode, Path, Aperture, Vector, shape, shard } from "@vivalence/typology";
import { RequestContext } from "@mikro-orm/core";
import { seed } from "./entities.ts";
import { tiers } from "./variant.js";
import { INTENTED, EMITTER, EXPOSED } from "@vivalence/runtime/daemon/traits";

// ── test-only APPLICATION ─────────────────────────────────────────────
// No paladin, no bundler. Mirrors the real trait's buffer factory: fill()
// (Default-only) — never cast(), whose Convert pass mauls MikroORM Collections.
// Entity classes via tiers.<type>.entity = the actually-registered classes.
function APPLICATION(mode, daemon) {
  mode.aperture.open("/buffered", () => ({
    url: mode.module.app.url.absolute,
    schema: mode.module.app.mask,
  }));
  mode.buffer = (desc = {}) => {
    const em = daemon.entities.em;
    const buffer = em.create(tiers.buffer.entity, {
      mode: mode.entity.id,
      data: mode.module.app.fill(desc),
      index: desc.index ?? 0,
    });
    if (desc.literals)
      buffer.literals.add(desc.literals.map((literal) => em.getReference(tiers.literal.entity, literal?.id ?? literal)));
    if (desc.symbols)
      buffer.symbols.add(desc.symbols.map((symbol) => em.getReference(tiers.symbol.entity, symbol?.id ?? symbol)));
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
    cargo: { version: "0.0.1", test: true },
    services: {},
    flatmodes() {
      return Object.values(this.modes).flatMap((type) => Object.values(type));
    },
  };

  datamap.subscribe(shape.subscriber(daemon.twitch));

  daemon.aperture.use(shard.context.attach("daemon", daemon));
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
  mode.mount = new Path(`/mode/${viva.manifest.type}/${viva.manifest.slug}`);

  mode.entity =
    (await em.findOne(tiers.mode.entity, { slug: viva.manifest.slug })) ??
    em.create(tiers.mode.entity, {
      slug: viva.manifest.slug,
      type: viva.manifest.type,
      traits: viva.manifest.traits,
      installed: true,
    });
  await em.flush();
  mode.id = mode.entity.id;

  if (viva.app) {
    mode.module.app = viva.app;
    mode.module.app.withUrl(new Url(`http://test/view/${viva.manifest.type}/${viva.manifest.slug}`));
  }
  if (viva.dataset) mode.module.dataset = viva.dataset;
  if (viva.emitter) mode.module.emitter = new Vector().slurp(viva.emitter);
  if (viva.aperture) mode.aperture.slurp(viva.aperture); // exported aperture endpoints

  daemon.modes[viva.manifest.type] ??= {};
  daemon.modes[viva.manifest.type][viva.manifest.slug] = mode;

  const traits = viva.manifest.traits;
  if (traits.includes("APPLICATION") && viva.app) APPLICATION(mode, daemon);
  if (traits.includes("INTENTED") && viva.dataset) await INTENTED(mode, daemon);
  if (traits.includes("EMITTER") && viva.emitter) await EMITTER(mode, daemon);
  if (traits.includes("EXPOSED")) {
    const finalize = EXPOSED(mode);
    if (finalize) await finalize();
  }

  daemon.aperture.branch(mode.mount.absolute).slurp(mode.aperture); // → conn-reachable

  return mode;
}

// ── public API ─────────────────────────────────────────────────────

export async function mountMode(viva) {
  const { orm, em, datamap, fixtures } = await seed();
  const daemon = buildDaemon(datamap, fixtures);
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
