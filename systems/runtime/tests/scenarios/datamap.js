import { MikroORM, RequestContext } from "@mikro-orm/core"
import * as typology from "@vivalence/typology"
import { Datamap, Twitch } from "@vivalence/typology"
import { config } from "../../../../commons/datamaps/libsql/libsql.viva.js"
import { sets, DaemonEntity, UserEntity } from "@vivalence/runtime"
import { assemble } from "../../gestalten/belt/assemble.js"
import { mint, presets, strike } from "../../gestalten/belt/traits.js"

export const DAEMON = "test-daemon"

export const stack = [sets.identity, sets.composition, sets.traits, sets.userspace, sets.transient]

const assembled = assemble(stack)

export const descriptors = assembled.entities

export const twitches = assembled.twitch

// ── in-memory datamap provider ─────────────────────────────────────
// Same contract as @vivalence/datamap/libsql provider() but sqlite :memory:.
// Takes the descriptors ({ type, schema, entity, repository, twitch }[]) and returns the Datamap
// the runtime expects; the caller registers its twitch through datamap.registerSubscriber(twitch).
export const shard = (orm) => ({
  scope: (fn) => RequestContext.create(orm.em, fn),
  carry: () => {
    const current = RequestContext.currentRequestContext()
    return current ? (task) => RequestContext.storage.run(current, task) : (task) => task()
  },
  bind: (name, resolve) => async (ctx, next) => {
    RequestContext.getEntityManager()?.setFilterParams(name, resolve(ctx))
    await next()
  },
})

export async function provider(instance) {
  const orm = await MikroORM.init({
    ...config({}, { entities: instance.map((v) => v.schema) }),
    allowGlobalContext: true,
  })

  await orm.schema.refresh()

  return new Datamap(orm)
}

// the daemon's own repositories: every kernel kind scoped to DAEMON through mikro's filter, the kernel's traits
export const struck = (em, traits = presets) => strike(mint({ slug: DAEMON, kinds: sets.traits, traits }), em, sets.traits)

export async function seed() {
  const datamap = await provider(descriptors)
  const { orm } = datamap
  const em = orm.em
  const twitch = new Twitch()
  for (const held of assembled.twitch) twitch.graft(held)
  twitch.branch("/after").use(typology.shard.datamap.detached(datamap))
  datamap.registerSubscriber(twitch)

  const user = em.create(UserEntity, { slug: "beef" })
  const daemon = em.create(DaemonEntity, { slug: DAEMON, mask: { manifest: { type: "daemon", slug: DAEMON } } })
  await em.flush()
  em.setFilterParams("user", { user: user.id })

  const repos = { ...datamap.entities, ...struck(em) }

  const mode = repos.mode.create({ slug: "test", type: "test", traits: ["APPLICATION"], installed: "installed" })
  await em.flush()

  const symbol = repos.symbol.create({ slug: "greeting", mode, trait: {} })
  const hello = repos.literal.create({ slug: "hello", mode, trait: {}, symbol: {} })
  const goodbye = repos.literal.create({ slug: "goodbye", mode, trait: {}, symbol: {} })
  await em.flush()

  hello.symbols.add(symbol)
  goodbye.symbols.add(symbol)
  await em.flush()

  return { orm, em, datamap, twitch, repos, shard: shard(orm), fixtures: { user, daemon, symbol, hello, goodbye, mode } }
}
