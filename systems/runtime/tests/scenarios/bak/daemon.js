// import { Url, Connection, shard, Path, shards, shape, Aperture, Vector } from "@vivalence/typology";
// import { ModeEntity, IntentEntity, UserEntity, SessionEntity, LiteralEntity, SymbolEntity } from "@vivalence/typology/entities";
// import { BufferEntity } from "./domain.ts";
// import * as routes from "../../daemon/aperture/index.js";
// import { INTENTED } from "../../daemon/mode/traits/intented.js";
// import { EMITTER } from "../../daemon/mode/traits/emitter.js";
// import { seed } from "./seed.js";

class TestMode {
  constructor({ type, slug, traits }) {
    this.type = type;
    this.slug = slug;
    this.traits = traits || [];
    this.manifest = { type, slug, traits: this.traits };
    this.mount = new Path(`/mode/${type}/${slug}`);
    this.aperture = new Aperture();
    this.cake = {};
    this.entity = null;
    this.view = traits.includes("VIEWABLE")
      ? { url: `/view/${type}/${slug}` }
      : null;
  }

  implements(trait) {
    return this.traits.includes(trait);
  }
}

export async function create() {
  const { orm, em, fixtures } = await seed();

  const mode = new TestMode({
    type: "game",
    slug: "flashcard",
    traits: ["VIEWABLE", "SELFEVIDENT", "INTENTED", "EMITTER"],
  });
  mode.entity = fixtures.mode;

  mode.cake.dataset = {
    intent: [
      {
        slug: "survival-flashcard",
        name: "Survival Flashcard",
        type: "SELFEVIDENT",
        traits: ["FURNISHED"],
        trait: { FURNISHED: { recall: "LEARNING" } },
        symbols: ["greeting"],
      },
    ],
  };

  mode.cake.emitter = new Vector()
    .open("/literal", async (ctx) => ({
      traits: ["FURNISHED"],
      trait: { FURNISHED: ctx.input.intent?.trait?.FURNISHED ?? ctx.input },
      literals: [ctx.input.literal?.id],
    }));

  const daemon = {
    manifest: { slug: "test-daemon", traits: [] },
    mount: new Path("/daemon/test-daemon"),
    aperture: new Aperture(),
    entities: { em },
    modes: { game: { flashcard: mode } },
    cargo: { version: "0.0.1", test: true },
    services: {},
    flatmodes() {
      return Object.values(this.modes)
        .flatMap((type) => Object.values(type));
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

  const handler = shape.http(daemon.aperture);
  const conn = new Connection(new Url("http://test"), shard.transmitter.inline(handler));

  return { daemon, die, handler, conn, orm, em, fixtures, mode };
}
