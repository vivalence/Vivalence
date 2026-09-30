import { Url, Connection, shard, Mode, Path, shape, Aperture, Vector, App, middleware, v } from "@vivalence/typology";
import { RequestContext } from "@mikro-orm/core";
import { seed, tiers } from "./fixtures.js";

import { gestalten, lifecycle } from "@vivalence/runtime";
const { INTENTED, EMITTER } = lifecycle.mode.traits;
const { stagger } = gestalten.belt;

const APPLICATION = (mode, daemon) => {
  if (!mode.module.application) return;
  mode.application.buffer = (desc = {}) => {
    const em = daemon.entities.em;
    const buffer = em.create(tiers.buffer.entity, {
      mode: mode.entity.id,
      data: mode.application.fill(desc),
      view: null,
      index: desc.index ?? 0,
    });
    if (desc.literals) buffer.literals.add(desc.literals.map((l) => em.getReference(tiers.literal.entity, l?.id ?? l)));
    if (desc.symbols) buffer.symbols.add(desc.symbols.map((s) => em.getReference(tiers.symbol.entity, s?.id ?? s)));
    return buffer;
  };
};

export async function create() {
  const { orm, em, datamap, entities, fixtures } = await seed();

  const modeTraits = ["APPLICATION", "INTENTED", "EMITTER"];
  const mode = new Mode({ manifest: { type: "game", slug: "flashcard", traits: modeTraits } });
  mode.aperture = new Aperture();
  mode.reference = new Path(`/mode/${mode.manifest.type}/${mode.manifest.slug}`);
  mode.entity = fixtures.mode;
  mode.id = fixtures.mode.id;

  mode.application = mode.module.application = new App("buffer/flashcard.svelte", v.buffer({
    data: { recall: v.string({ default: "LEARNING" }) },
  })); // mirror real Mode: mode.application === mode.module.application

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
    return ctx.mode.application.buffer({
      data: { recall },
      literals: [ctx.input.literal],
    });
  });

  // const daemon = {
  //   ...
  //   entities: { em, twitch: new Vector() },
  //   ...
  // };
  const daemon = {
    manifest: { slug: "test-daemon", traits: [] },
    reference: new Path("/daemon/test-daemon"),
    aperture: new Aperture(),
    twitch: new Vector(),
    entities,
    modes: { game: { flashcard: mode } },
    cargo: { version: "0.0.1", test: true },
    services: {},
    flatmodes() {
      return Object.values(this.modes).flatMap((type) => Object.values(type));
    },
  };

  daemon.aperture.use(shard.context.bind("daemon", daemon));

  datamap.registerSubscriber(shape.subscriber(daemon.twitch));

  const TOKENS = { "test-token": "test-identity", "fresh-token": "fresh-identity" };
  const enrolled = new Map([["test-identity", fixtures.user]]);
  daemon.aperture.use(async (ctx, next) => {
    ctx.authority = {
      authenticate: async (token) => {
        const id = TOKENS[token];
        if (!id) throw new Error("invalid token");
        return {
          identity: { id },
          getUser: async () => enrolled.get(id) ?? null,
          enroll: async () => {
            if (!enrolled.has(id)) enrolled.set(id, { ...fixtures.user, id });
            return enrolled.get(id);
          },
        };
      },
    };
    await next();
  });

  for (const finalize of await stagger(mode, daemon, { APPLICATION, INTENTED, EMITTER })) await finalize();

  daemon.aperture.branch(mode.reference.absolute).slurp(mode.aperture);

  daemon.datamap = datamap;
  const die = { daemon };

  await middleware.compose([lifecycle.daemon.aperture.datamap, lifecycle.daemon.aperture.userspace, lifecycle.daemon.aperture.modes, lifecycle.daemon.aperture.freight])(die);

  // daemon.aperture.open("/datamap", () => shard.datamap.strip(orm.getMetadata()));
  daemon.aperture.open("/datamap", () => shard.datamap.strip(daemon.datamap.getMetadata()));

  const handler = shape.http(daemon.aperture);
  const conn = new Connection(new Url("http://test"), shard.transmitter.inline(handler));

  const authedConn = new Connection(new Url("http://test"), shard.transmitter.inline(handler));
  authedConn.use(async (ctx, next) => {
    ctx.request.headers.set("authorization", "Bearer test-token");
    await next();
  });

  const freshConn = new Connection(new Url("http://test"), shard.transmitter.inline(handler));
  freshConn.use(async (ctx, next) => {
    ctx.request.headers.set("authorization", "Bearer fresh-token");
    await next();
  });

  const scoped = (fn) => RequestContext.create(orm.em, async () => {
    const scopedEm = RequestContext.getEntityManager();
    scopedEm.setFilterParams("user", { user: fixtures.user.id });
    return fn(scopedEm);
  });

  return { daemon, die, handler, conn, authedConn, freshConn, orm, em, fixtures, mode, scoped };
}
