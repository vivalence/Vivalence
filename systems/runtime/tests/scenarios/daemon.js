import { Url, Connection, shard, Mode, Path, shards, shape, Aperture, Vector, BufferView, v } from "@vivalence/typology";
import {
  ModeEntity,
  IntentEntity,
  UserEntity,
  SessionEntity,
  LiteralEntity,
  SymbolEntity,
} from "@vivalence/typology/entities";
import { BufferEntity, seed } from "./entities.ts";

import * as routes from "../../daemon/aperture/index.js";
import { INTENTED } from "../../daemon/mode/traits/intented.js";
import { EMITTER } from "../../daemon/mode/traits/emitter.js";

const BUFFERED = (mode, daemon) => {
  mode.aperture.open("/buffered", () => ({
    url: mode.cake.buffer.url.absolute,
    schema: mode.cake.buffer.schema,
  }));
  mode.buffer = (desc = {}) => {
    const em = daemon.entities.em;
    const buffer = em.create(BufferEntity, {
      mode: mode.entity.id,
      data: mode.cake.buffer.cast(desc),
      index: desc.index ?? 0,
    });
    if (desc.literals) buffer.literals.add(desc.literals.map((l) => em.getReference(LiteralEntity, l?.id ?? l)));
    if (desc.symbols) buffer.symbols.add(desc.symbols.map((s) => em.getReference(SymbolEntity, s?.id ?? s)));
    return buffer;
  };
};

export async function create() {
  const { orm, em, fixtures } = await seed();

  const traits = ["BUFFERED", "SELFEVIDENT", "INTENTED", "EMITTER"];
  const mode = new Mode({ manifest: { type: "game", slug: "flashcard", traits } });
  mode.aperture = new Aperture();
  mode.mount = new Path(`/mode/${mode.type}/${mode.slug}`);
  mode.entity = fixtures.mode;

  mode.cake.buffer = new BufferView("buffer/flashcard.svelte.js", v.buffer({
    data: { recall: v.string({ default: "LEARNING" }) },
  }));
  mode.cake.buffer.withUrl(new Url(`http://test/view/${mode.type}/${mode.slug}`));

  mode.cake.dataset = {
    intent: [
      {
        slug: "survival-flashcard",
        name: "Survival Flashcard",
        type: "SELFEVIDENT",
        traits: ["FURNISHED"],
        trait: { FURNISHED: { recall: "LEARNING", seek: { symbols: ["greeting"] } } },
      },
    ],
  };

  mode.cake.emitter = new Vector().open("/literal", async (ctx) => {
    const recall = ctx.input.recall ?? ctx.input.defaults?.recall;
    return ctx.mode.buffer({
      data: { recall },
      literals: [ctx.input.literal],
    });
  });

  const daemon = {
    manifest: { slug: "test-daemon", traits: [] },
    mount: new Path("/daemon/test-daemon"),
    aperture: new Aperture(),
    entities: { em, twitch: new Vector() },
    modes: { game: { flashcard: mode } },
    cargo: { version: "0.0.1", test: true },
    services: {},
    flatmodes() {
      return Object.values(this.modes).flatMap((type) => Object.values(type));
    },
  };

  daemon.aperture.use(shards.context.attach("daemon", daemon));

  daemon.entities.literal = em.getRepository(LiteralEntity);
  daemon.entities.symbol = em.getRepository(SymbolEntity);
  daemon.entities.mode = em.getRepository(ModeEntity);
  daemon.entities.intent = em.getRepository(IntentEntity);
  daemon.entities.session = em.getRepository(SessionEntity);
  daemon.entities.user = em.getRepository(UserEntity);
  daemon.entities.buffer = em.getRepository(BufferEntity);

  const sub = shape.subscriber(daemon.entities.twitch);
  em.getEventManager().registerSubscriber(sub);

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

  await BUFFERED(mode, daemon);
  await INTENTED(mode, daemon);
  await EMITTER(mode, daemon);

  daemon.aperture.branch(mode.mount.absolute).slurp(mode.aperture);

  const die = {
    good: daemon,
    status: { reflection: { code: "ALIVE" } },
    manifest: daemon.manifest,
  };

  await routes.datamap(die);
  await routes.userspace(die);
  await routes.modes(die);
  await routes.freight(die);

  daemon.aperture.open("/datamap", () => shard.datamap.strip(orm.getMetadata()));

  const handler = shape.http(daemon.aperture);
  const conn = new Connection(new Url("http://test"), shard.transport.inline(handler));

  const authedConn = new Connection(new Url("http://test"), shard.transport.inline(handler));
  authedConn.use(async (ctx, next) => {
    ctx.request.headers.set("authorization", "Bearer test-token");
    await next();
  });

  return { daemon, die, handler, conn, authedConn, orm, em, fixtures, mode };
}

// mode.view = { url: `/view/${mode.type}/${mode.slug}` };
// mode.cake.emitter = new Vector().open("/literal", async (ctx) => ({
//   traits: ["FURNISHED"],
//   trait: { FURNISHED: ctx.input.intent?.trait?.FURNISHED ?? ctx.input },
//   literals: [ctx.input.literal?.id],
// }));
