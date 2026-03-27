import { MikroORM, EntitySchema } from "@mikro-orm/core"
import { SqliteDriver } from "@mikro-orm/sqlite"
import {
  LiteralEntity, LiteralSchema,
  SymbolEntity, SymbolSchema,
  BufferEntity, BufferSchema,
  ModeEntity, ModeSchema,
  IntentEntity, IntentSchema,
  UserEntity, UserSchema,
  ThreadEntity, ThreadSchema,
} from "@vivalence/typology/entities"

const LiteralConcrete = new EntitySchema({
  class: LiteralEntity, extends: LiteralSchema,
  tableName: "Literal", name: "Literal",
})

const SymbolConcrete = new EntitySchema({
  class: SymbolEntity, extends: SymbolSchema,
  tableName: "Symbol", name: "Symbol",
})

const BufferConcrete = new EntitySchema({
  class: BufferEntity, extends: BufferSchema,
  tableName: "Buffer", name: "Buffer",
})

export const schemas = [
  LiteralConcrete, SymbolConcrete, BufferConcrete,
  ModeSchema, IntentSchema, UserSchema, ThreadSchema,
]

export async function seed() {
  const orm = await MikroORM.init({
    driver: SqliteDriver,
    dbName: ":memory:",
    entities: schemas,
    allowGlobalContext: true,
  })

  await orm.schema.refreshDatabase()
  const em = orm.em

  const user = em.create(UserEntity, { roles: ["USER"], config: {} })
  await em.flush()

  const symbol = em.create(SymbolEntity, { slug: "greeting", trait: {} })
  const hello = em.create(LiteralEntity, { slug: "hello", trait: {}, symbol: {} })
  const goodbye = em.create(LiteralEntity, { slug: "goodbye", trait: {}, symbol: {} })
  await em.flush()

  hello.symbols.add(symbol)
  goodbye.symbols.add(symbol)
  await em.flush()

  const mode = em.create(ModeEntity, {
    slug: "test", type: "test", traits: ["VIEWABLE"], installed: true,
  })
  await em.flush()

  const repos = {
    literal: em.getRepository(LiteralEntity),
    symbol: em.getRepository(SymbolEntity),
    buffer: em.getRepository(BufferEntity),
    mode: em.getRepository(ModeEntity),
    intent: em.getRepository(IntentEntity),
    user: em.getRepository(UserEntity),
    thread: em.getRepository(ThreadEntity),
  }

  return { orm, em, repos, fixtures: { user, symbol, hello, goodbye, mode } }
}
