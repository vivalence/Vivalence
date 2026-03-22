import { MikroORM } from "@mikro-orm/core";
import { SqliteDriver } from "@mikro-orm/sqlite";
import { Url, Connection, shard, shape, Aperture } from "@vivalence/typology";
import {
  IdentitySchema, IdentityEntity,
  DaemonSchema, DaemonEntity,
  AuthenticatorEmbedSchema,
} from "@vivalence/typology/entities";

const schemas = [IdentitySchema, DaemonSchema, AuthenticatorEmbedSchema];

export async function seed() {
  const orm = await MikroORM.init({
    driver: SqliteDriver,
    dbName: ":memory:",
    entities: schemas,
    allowGlobalContext: true,
  });

  await orm.schema.refreshDatabase();
  const em = orm.em;

  const identity = em.create(IdentityEntity, {
    slug: "beef",
    authentication: {
      provider: "password",
      credentials: { username: "beef", password: "hashed" },
      tokens: {},
    },
  });

  const daemon = em.create(DaemonEntity, {
    slug: "test-language",
    url: "http://localhost:5173/daemon/test-language",
  });

  await em.flush();

  const repos = {
    identity: em.getRepository(IdentityEntity),
    daemon: em.getRepository(DaemonEntity),
  };

  return { orm, em, repos, fixtures: { identity, daemon } };
}

export async function create() {
  const { orm, em, repos, fixtures } = await seed();

  const aperture = new Aperture();

  aperture
    .branch("/entities/identity")
    .slurp(shard.datamap.repository(repos.identity));

  aperture
    .branch("/entities/daemon")
    .slurp(shard.datamap.repository(repos.daemon));

  const handler = shape.http(aperture);
  const conn = new Connection(new Url("http://test"), shard.transport.inline(handler));

  return { conn, orm, em, repos, fixtures, aperture };
}
