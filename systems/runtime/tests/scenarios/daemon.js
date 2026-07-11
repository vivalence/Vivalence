import { Url, Connection, shard, Mode, Path, shape, Aperture, Vector, App, v } from "@vivalence/typology";
import { RequestContext } from "@mikro-orm/core";
import { seed } from "./entities.ts";
import { tiers } from "./variant.js";

import * as routes from "@vivalence/runtime/daemon/aperture";
import { INTENTED, EMITTER } from "@vivalence/runtime/daemon/traits";

const APPLICATION = (mode, daemon) => {
  mode.aperture.open("/buffered", () => ({
    url: mode.module.app.url.absolute,
    schema: mode.module.app.mask,
  }));
  mode.app.buffer = (desc = {}) => {
    const em = daemon.entities.em;
    const buffer = em.create(tiers.buffer.entity, {
      mode: mode.entity.id,
      data: mode.app.fill(desc),
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
  mode.mount = new Path(`/mode/${mode.type}/${mode.slug}`);
  mode.entity = fixtures.mode;
  mode.id = fixtures.mode.id;

  mode.app = mode.module.app = new App("buffer/flashcard.svelte", v.buffer({
    data: { recall: v.string({ default: "LEARNING" }) },
  })); // mirror real Mode: mode.app === mode.module.app
  mode.app.withUrl(new Url(`http://test/view/${mode.type}/${mode.slug}`));

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
    return ctx.mode.app.buffer({
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
    mount: new Path("/daemon/test-daemon"),
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

  daemon.aperture.use(shard.context.attach("daemon", daemon));

  datamap.subscribe(shape.subscriber(daemon.twitch));

  daemon.aperture.use(async (ctx, next) => {
    ctx.authority = {
      authenticate: async (token) => {
        if (token === "test-token") {
          return { getUser: async () => fixtures.user };
        }
        throw new Error("invalid token");
      },
    };
    await next();
  });

  await APPLICATION(mode, daemon);
  await INTENTED(mode, daemon);
  const commit = await EMITTER(mode, daemon);
  if (commit) await commit();

  daemon.aperture.branch(mode.mount.absolute).slurp(mode.aperture);

  const die = {
    good: daemon,
    datamap,
    status: { reflection: { code: "ALIVE" } },
    manifest: daemon.manifest,
  };

  await routes.datamap(die);
  await routes.userspace(die);
  await routes.modes(die);
  await routes.freight(die);

  // daemon.aperture.open("/datamap", () => shard.datamap.strip(orm.getMetadata()));
  daemon.aperture.open("/datamap", () => shard.datamap.strip(die.datamap.introspect()));

  const handler = shape.http(daemon.aperture);
  const conn = new Connection(new Url("http://test"), shard.transmitter.inline(handler));

  const authedConn = new Connection(new Url("http://test"), shard.transmitter.inline(handler));
  authedConn.use(async (ctx, next) => {
    ctx.request.headers.set("authorization", "Bearer test-token");
    await next();
  });

  const scoped = (fn) => RequestContext.create(orm.em, async () => {
    const scopedEm = RequestContext.getEntityManager();
    scopedEm.setFilterParams("user", { user: fixtures.user.id });
    return fn(scopedEm);
  });

  return { daemon, die, handler, conn, authedConn, orm, em, fixtures, mode, scoped };
}
