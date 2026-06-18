import { Url, Mode, Path, Aperture, Vector, View, v, shape, shard } from "@vivalence/typology";
import { RequestContext } from "@mikro-orm/core";
import {
  LiteralEntity,
  SymbolEntity,
  ModeEntity,
  IntentEntity,
  UserEntity,
  ThreadEntity,
} from "@vivalence/typology/entities";
import { BufferEntity, seed } from "./entities.ts";
import { INTENTED, EMITTER } from "@vivalence/runtime/daemon/traits";

// ── test-only VIEWABLE ─────────────────────────────────────────────
// No paladin, no bundler. Wires mode.buffer() as a pure entity factory.
function VIEWABLE(mode, daemon) {
  mode.aperture.open("/buffered", () => ({
    url: mode.cake.view.url.absolute,
    schema: mode.cake.view.mask,
  }));
  mode.buffer = (desc = {}) => {
    const em = daemon.entities.em;
    const buffer = em.create(BufferEntity, {
      mode: mode.entity.id,
      data: mode.cake.view.cast(desc),
      index: desc.index ?? 0,
    });
    if (desc.literals) buffer.literals.add(desc.literals.map((literal) => em.getReference(LiteralEntity, literal?.id ?? literal)));
    if (desc.symbols) buffer.symbols.add(desc.symbols.map((symbol) => em.getReference(SymbolEntity, symbol?.id ?? symbol)));
    return buffer;
  };
}

// ── daemon scaffold ────────────────────────────────────────────────
function buildDaemon(em) {
  const daemon = {
    manifest: { slug: "test-daemon", traits: [] },
    mount: new Path("/daemon/test-daemon"),
    aperture: new Aperture(),
    twitch: new Vector(),
    entities: { em },
    modes: {},
    cargo: { version: "0.0.1", test: true },
    services: {},
    flatmodes() {
      return Object.values(this.modes).flatMap((type) => Object.values(type));
    },
  };

  daemon.entities.literal = em.getRepository(LiteralEntity);
  daemon.entities.symbol = em.getRepository(SymbolEntity);
  daemon.entities.mode = em.getRepository(ModeEntity);
  daemon.entities.intent = em.getRepository(IntentEntity);
  daemon.entities.thread = em.getRepository(ThreadEntity);
  daemon.entities.user = em.getRepository(UserEntity);
  daemon.entities.buffer = em.getRepository(BufferEntity);

  const subscriber = shape.subscriber(daemon.twitch);
  em.getEventManager().registerSubscriber(subscriber);

  return daemon;
}

// ── wire a single .viva.js into the daemon ─────────────────────────
async function wireMode(viva, daemon, em) {
  const mode = new Mode({ manifest: viva.manifest });
  mode.aperture = new Aperture();
  mode.mount = new Path(`/mode/${viva.manifest.type}/${viva.manifest.slug}`);

  const entity = await em.findOne(ModeEntity, { slug: viva.manifest.slug })
    ?? em.create(ModeEntity, {
      slug: viva.manifest.slug,
      type: viva.manifest.type,
      traits: viva.manifest.traits,
      installed: true,
    });
  await em.flush();
  mode.entity = entity;
  mode.id = entity.id;

  if (viva.view) {
    mode.cake.view = viva.view;
    mode.cake.view.withUrl(new Url(`http://test/view/${viva.manifest.type}/${viva.manifest.slug}`));
  }
  if (viva.dataset) mode.cake.dataset = viva.dataset;
  if (viva.emitter) mode.cake.emitter = new Vector().slurp(viva.emitter);

  daemon.modes[viva.manifest.type] ??= {};
  daemon.modes[viva.manifest.type][viva.manifest.slug] = mode;

  if (viva.manifest.traits.includes("VIEWABLE") && viva.view) VIEWABLE(mode, daemon);
  if (viva.manifest.traits.includes("INTENTED") && viva.dataset) await INTENTED(mode, daemon);
  if (viva.manifest.traits.includes("EMITTER") && viva.emitter) await EMITTER(mode, daemon);

  return mode;
}

// ── public API ─────────────────────────────────────────────────────

export async function mountMode(viva) {
  const { orm, em, fixtures } = await seed();
  const daemon = buildDaemon(em);
  const mode = await wireMode(viva, daemon, em);
  const scoped = (fn) => RequestContext.create(orm.em, async () => {
    const scopedEm = RequestContext.getEntityManager();
    scopedEm.setFilterParams("user", { user: fixtures.user.id });
    return fn(scopedEm);
  });
  return { mode, daemon, orm, em, fixtures, scoped };
}

export async function mountModes(vivas) {
  const { orm, em, fixtures } = await seed();
  const daemon = buildDaemon(em);
  const modes = {};
  for (const viva of vivas) {
    modes[viva.manifest.slug] = await wireMode(viva, daemon, em);
  }
  return { modes, daemon, orm, em, fixtures };
}
