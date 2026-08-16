import { MikroORM } from "@mikro-orm/core";
import { config } from "../../viva/datamap/libsql/libsql.viva.js";
import {
  IdentitySchema, IdentityEntity,
  DaemonSchema, DaemonEntity,
  AuthenticatorEmbedSchema,
} from "@vivalence/runtime";

const schemas = [IdentitySchema, DaemonSchema, AuthenticatorEmbedSchema];

export async function seed() {
  const orm = await MikroORM.init({
    ...config({ dbName: ":memory:", entities: schemas }),
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
