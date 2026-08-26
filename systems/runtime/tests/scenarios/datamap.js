import { MikroORM, EntitySchema, RequestContext } from "@mikro-orm/core"
import { config } from "../../../../registry/viva/datamap/libsql/libsql.viva.js"
import {
  LiteralEntity, LiteralSchema,
  SymbolEntity, SymbolSchema,
  BufferEntity, BufferSchema,
  ModeEntity, ModeSchema, ModeRepository,
  IntentEntity, IntentSchema,
  UserEntity, UserSchema,
  ThreadEntity, ThreadSchema,
  DataRepository,
} from "@vivalence/runtime"

const LiteralConcrete = new EntitySchema({
  class: LiteralEntity, extends: LiteralSchema,
  tableName: "Literal", name: "Literal",
  repository: () => DataRepository,
})

const SymbolConcrete = new EntitySchema({
  class: SymbolEntity, extends: SymbolSchema,
  tableName: "Symbol", name: "Symbol",
  repository: () => DataRepository,
})

const BufferConcrete = new EntitySchema({
  class: BufferEntity, extends: BufferSchema,
  tableName: "Buffer", name: "Buffer",
  repository: () => DataRepository,
})

export { SymbolConcrete, BufferConcrete }

// ── in-memory datamap provider ─────────────────────────────────────
// Same contract as @vivalence/datamap/libsql provider() but sqlite :memory:.
// Takes the instance array ({ type, schema, entity, repository, subscriber }[])
// and returns the provider interface the runtime expects.
export const shard = (orm) => ({
  context: (fn) => RequestContext.create(orm.em, fn),
  carry: () => {
    const current = RequestContext.currentRequestContext()
    return current ? (task) => RequestContext.storage.run(current, task) : (task) => task()
  },
  bind: (name, resolve) => async (ctx, next) => {
    RequestContext.getEntityManager()?.setFilterParams(name, resolve(ctx))
    await next()
  },
})

export async function provider(instance, subscribers = instance.map((v) => v.subscriber)) {
  const orm = await MikroORM.init({
    ...config({ dbName: ":memory:", entities: instance.map((v) => v.schema), subscribers }),
    allowGlobalContext: true,
  })

  await orm.schema.refreshDatabase()

  const entities = { em: orm.em }
  for (const { type, entity } of instance) {
    if (!entity || !type) continue
    entities[type] = orm.em.getRepository(entity)
  }

  return {
    orm,
    entities,
    shard: shard(orm),
    subscribe: (subscriber) => orm.em.getEventManager().registerSubscriber(subscriber),
    introspect: () => orm.getMetadata(),
    disintegrate: () => orm.close(),
  }
}

export const schemas = [
  LiteralConcrete, SymbolConcrete, BufferConcrete,
  ModeSchema, IntentSchema, UserSchema, ThreadSchema,
]

export async function seed() {
  const orm = await MikroORM.init({
    ...config({ dbName: ":memory:", entities: schemas }),
    allowGlobalContext: true,
  })

  await orm.schema.refreshDatabase()
  const em = orm.em

  const user = em.create(UserEntity, { roles: ["USER"], config: {} })
  await em.flush()
  em.setFilterParams("user", { user: user.id })

  const symbol = em.create(SymbolEntity, { slug: "greeting", trait: {} })
  const hello = em.create(LiteralEntity, { slug: "hello", trait: {}, symbol: {} })
  const goodbye = em.create(LiteralEntity, { slug: "goodbye", trait: {}, symbol: {} })
  await em.flush()

  hello.symbols.add(symbol)
  goodbye.symbols.add(symbol)
  await em.flush()

  const mode = em.create(ModeEntity, {
    slug: "test", type: "test", traits: ["APPLICATION"], installed: "installed",
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

  return { orm, em, repos, shard: shard(orm), fixtures: { user, symbol, hello, goodbye, mode } }
}
