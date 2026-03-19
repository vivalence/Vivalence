import { MikroORM } from "@mikro-orm/core";
import { SqliteDriver } from "@mikro-orm/sqlite";
import { schemas, LiteralEntity, SymbolEntity } from "./domain.ts";
import { ModeEntity, UserEntity, SessionEntity } from "@vivalence/typology/entities";

export async function seed() {
  const orm = await MikroORM.init({
    driver: SqliteDriver,
    dbName: ":memory:",
    entities: schemas,
    allowGlobalContext: true,
  });

  await orm.schema.refreshDatabase();
  const em = orm.em;

  const user = em.create(UserEntity, { roles: ["USER"], config: {} });
  await em.flush();

  const hello = em.create(LiteralEntity, {
    slug: "hello",
    traits: ["TRANSLATED"],
    data: { TRANSLATED: { known: "hello", learning: "olá" } },
    symbol: {},
  });

  const goodbye = em.create(LiteralEntity, {
    slug: "goodbye",
    traits: ["TRANSLATED"],
    data: { TRANSLATED: { known: "goodbye", learning: "tchau" } },
    symbol: {},
  });

  const greeting = em.create(SymbolEntity, {
    slug: "greeting",
    traits: ["ONTOLOGICAL"],
    data: {},
  });

  await em.flush();

  hello.symbols.add(greeting);
  goodbye.symbols.add(greeting);
  await em.flush();

  const mode = em.create(ModeEntity, {
    slug: "flashcard",
    type: "game",
    traits: ["VIEWABLE"],
    installed: true,
  });

  const session = em.create(SessionEntity, {
    user,
    data: {},
    cursor: 0,
    counter: 0,
  });

  await em.flush();

  return {
    orm,
    em,
    fixtures: { user, hello, goodbye, greeting, mode, session },
  };
}
