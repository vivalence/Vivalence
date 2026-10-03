import { MikroORM } from "@mikro-orm/core";
import { config } from "../../datamaps/libsql/libsql.viva.js";
import {
  AuthenticatorEmbedSchema,
  DaemonEntity,
  DaemonSchema,
  IdentityEntity,
  IdentitySchema,
  TerminalSchema,
} from "@vivalence/runtime";

const schemas = [IdentitySchema, DaemonSchema, TerminalSchema, AuthenticatorEmbedSchema];

export async function seed() {
  const orm = await MikroORM.init({
    ...config({}, { entities: schemas }),
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
    remote: "http://localhost:5173/daemon/test-language",
  });

  await em.flush();

  const repos = {
    identity: em.getRepository(IdentityEntity),
    daemon: em.getRepository(DaemonEntity),
  };

  return { orm, em, repos, fixtures: { identity, daemon } };
}
