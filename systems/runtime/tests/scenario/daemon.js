import { Url, Connection, shard, Path, shards, compiler, Aperture } from "@vivalence/typology";
import { ModeEntity, UserEntity, SessionEntity, LiteralEntity, SymbolEntity } from "@vivalence/typology/entities";

import * as routes from "../../daemon/aperture/index.js";
import { seed } from "./seed.js";

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
    traits: ["VIEWABLE", "TERMINAL"],
  });
  mode.entity = fixtures.mode;

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
  daemon.entities.session = em.getRepository(SessionEntity);
  daemon.entities.user = em.getRepository(UserEntity);

  const die = {
    good: daemon,
    status: { reflection: { code: "ALIVE" } },
    manifest: daemon.manifest,
  };

  await routes.datamap(die);
  await routes.userspace(die);
  await routes.modes(die);
  await routes.freight(die);

  const handler = compiler.http(daemon.aperture);
  const conn = new Connection(new Url("http://test"), shard.transport.inline(handler));

  return { daemon, die, handler, conn, orm, em, fixtures, mode };
}
