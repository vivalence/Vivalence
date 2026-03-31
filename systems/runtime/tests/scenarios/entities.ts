import { MikroORM } from "@mikro-orm/core";
import { SqliteDriver } from "@mikro-orm/sqlite";
import { types, EntitySchema, type Opt } from "@mikro-orm/core";

import {
  LiteralEntity,
  LiteralSchema,
  LiteralRepository,
  BufferEntity,
  ModeEntity,
  ModeSchema,
  IntentSchema,
  UserSchema,
  ThreadSchema,
  IntentEntity,
  UserEntity,
  ThreadEntity,
  SymbolEntity,
} from "@vivalence/typology/entities";

import {
  SymbolConcrete,
  BufferConcrete,
} from "@vivalence/typology/scenarios";

export enum LiteralTraits {
  TRANSLATED = "TRANSLATED",
  ANNOTATED = "ANNOTATED",
  VOCALIZED = "VOCALIZED",
}

// Extends base repo with a stub .feed() that the domain kernel normally provides.
// Real .feed() does due/novel spaced-repetition split; this just returns literals.
class TestLiteralRepository extends LiteralRepository {
  async feed({ limit, blacklist, where, populate }: any) {
    const filters: any = { ...where };
    if (blacklist?.literals?.length) {
      filters.id = { $nin: blacklist.literals.map((literal: any) => literal?.id ?? literal) };
    }
    return this.find(filters, { limit, populate });
  }
}

export const LiteralDomain = new EntitySchema({
  class: LiteralEntity,
  extends: LiteralSchema,
  tableName: "Literal",
  name: "Literal",
  repository: () => TestLiteralRepository,
  properties: {
    traits: {
      items: () => LiteralTraits,
      enum: true,
      array: true,
      defaultRaw: `'[]'`,
      type: types.json,
    },
  },
});

const schemas = [
  LiteralDomain,
  SymbolConcrete,
  BufferConcrete,
  ModeSchema,
  IntentSchema,
  UserSchema,
  ThreadSchema,
];

export { SymbolConcrete as SymbolDomain, BufferConcrete as BufferDomain };
export { LiteralEntity, SymbolEntity, BufferEntity };

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
    trait: { TRANSLATED: { known: "hello", learning: "olá" } },
    symbol: {},
  });

  const goodbye = em.create(LiteralEntity, {
    slug: "goodbye",
    traits: ["TRANSLATED"],
    trait: { TRANSLATED: { known: "goodbye", learning: "tchau" } },
    symbol: {},
  });

  const thanks = em.create(LiteralEntity, {
    slug: "thanks",
    traits: ["TRANSLATED"],
    trait: { TRANSLATED: { known: "thanks", learning: "obrigado" } },
    symbol: {},
  });

  const please = em.create(LiteralEntity, {
    slug: "please",
    traits: ["TRANSLATED"],
    trait: { TRANSLATED: { known: "please", learning: "por favor" } },
    symbol: {},
  });

  const greeting = em.create(SymbolEntity, {
    slug: "greeting",
    traits: ["ONTOLOGICAL"],
    trait: {},
  });

  await em.flush();

  hello.symbols.add(greeting);
  goodbye.symbols.add(greeting);
  thanks.symbols.add(greeting);
  please.symbols.add(greeting);
  await em.flush();

  const mode = em.create(ModeEntity, {
    slug: "flashcard",
    type: "game",
    traits: ["BUFFERED", "SELFEVIDENT", "INTENTED", "EMITTER"],
    installed: true,
  });

  await em.flush();

  const intent = em.create(IntentEntity, {
    slug: "survival-flashcard",
    type: "SELFEVIDENT",
    traits: ["FURNISHED"],
    name: "Survival Flashcard",
    trait: { FURNISHED: { recall: "LEARNING", where: { symbols: ["greeting"] } } },
    mode,
  });

  await em.flush();

  const thread = em.create(ThreadEntity, {
    user,
    mode,
    intent,
    trait: {},
    cursor: 0,
    counter: 0,
  });

  await em.flush();

  return {
    orm,
    em,
    fixtures: { user, hello, goodbye, thanks, please, greeting, mode, intent, thread },
  };
}
