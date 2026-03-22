import { Aperture, Broadcaster, object } from "@vivalence/typology"

const ALLOWED = new Set(["populate", "orderBy", "limit", "offset", "fields", "exclude", "onConflictFields", "onConflictAction", "onConflictExcludeFields"])

function sanitize(options = {}) {
  const safe = {}
  for (const key of Object.keys(options)) {
    if (ALLOWED.has(key)) safe[key] = options[key]
  }
  return safe
}

function scoped(target, fn) {
  return async (input, ctx) => {
    if (ctx.scope) {
      input[target] = object.merge(ctx.scope, input[target] || {})
    }
    return fn(input, ctx)
  }
}

export function errors() {
  return async (ctx, next) => {
    try {
      await next()
    } catch (error) {
      const name = error.constructor?.name
      if (name === "NotFoundError") {
        ctx.response.status = 404
        ctx.output = { code: "NOT_FOUND", message: error.message }
      } else if (name === "ValidationError") {
        ctx.response.status = 400
        ctx.output = { code: "VALIDATION", message: error.message }
      } else if (name === "UniqueConstraintViolationException") {
        ctx.response.status = 409
        ctx.output = { code: "CONFLICT", message: error.message }
      } else {
        console.error(error)
        ctx.response.status = 500
        ctx.output = { code: "INTERNAL", message: error.message }
      }
    }
  }
}

export function repository(repo) {
  const aperture = new Aperture()
  const em = () => repo.getEntityManager()

  aperture.use(errors())

  aperture.post(
    "/find",
    scoped("where", async (input) => repo.find(input.where || {}, sanitize(input.options))),
  )

  aperture.post(
    "/findOne",
    scoped("where", async (input, ctx) => {
      const result = await repo.findOne(input.where || {}, sanitize(input.options))
      ctx.response.status = 200
      return result
    }),
  )

  aperture.post(
    "/findOneOrFail",
    scoped("where", async (input) =>
      repo.findOneOrFail(input.where || {}, sanitize(input.options)),
    ),
  )

  aperture.post(
    "/findAndCount",
    scoped("where", async (input) => repo.findAndCount(input.where || {}, sanitize(input.options))),
  )

  aperture.post(
    "/count",
    scoped("where", async (input) => repo.count(input.where || {}, sanitize(input.options))),
  )

  aperture.post(
    "/create",
    scoped("data", async (input) => {
      const entity = repo.create(input.data || {})
      await em().flush()
      return entity
    }),
  )

  aperture.post(
    "/upsert",
    scoped("data", async (input) => {
      const entity = await repo.upsert(input.data || {}, sanitize(input.options))
      await em().flush()
      return entity
    }),
  )

  if (typeof repo.ensure === "function") {
    aperture.post(
      "/ensure",
      scoped("data", async (input) => {
        const entity = await repo.ensure(input.data || {})
        await em().flush()
        return entity
      }),
    )
  }

  aperture.post(
    "/update",
    scoped("where", async (input) => {
      const entity = await repo.findOneOrFail(input.where || {})
      entity.assign(input.data || {})
      await em().flush()
      return entity
    }),
  )

  aperture.post(
    "/remove",
    scoped("where", async (input) => {
      const entity = await repo.findOneOrFail(input.where || {})
      em().remove(entity)
      await em().flush()
      return { ok: true }
    }),
  )

  return aperture
}

export function reactive(repo, twitch) {
  const aperture = new Aperture()
  const broadcaster = new Broadcaster()
  const name = repo.getEntityName().toLowerCase().replace("entity", "")

  for (const op of ["create", "update", "delete"]) {
    twitch.open(`/${name}/${op}/after`, (ctx) => {
      const serialized = ctx.input.entity?.toJSON?.() ?? ctx.input.entity
      broadcaster.push({ op, entity: serialized }, ctx.input.entity)
    })
  }

  aperture.get("/subscribe", async (input, ctx) => {
    const filter = { ...(input?.where || {}), ...(ctx.scope || {}) }
    const { iterable, unsubscribe } = broadcaster.subscribe(filter)
    ctx.request.raw?.signal?.addEventListener("abort", unsubscribe)
    ctx.response.publish(iterable)
  })

  return aperture
}

export function ingest(repo) {
  const aperture = new Aperture()
  const em = () => repo.getEntityManager()

  aperture.use(errors())

  aperture.post("/ingest", async (input, ctx) => {
    const results = []
    for await (const event of ctx.request.subscribe()) {
      if (event.op === "create") {
        const entity = repo.create(event.data || {})
        await em().flush()
        results.push(entity)
      } else if (event.op === "update") {
        const entity = await repo.findOneOrFail(event.where || {})
        entity.assign(event.data || {})
        await em().flush()
        results.push(entity)
      } else if (event.op === "delete") {
        const entity = await repo.findOneOrFail(event.where || {})
        em().remove(entity)
        await em().flush()
        results.push({ ok: true, id: entity.id })
      }
    }
    return results
  })

  return aperture
}

export function scope(resolve) {
  return async (ctx, next) => {
    ctx.scope = resolve(ctx)
    await next()
  }
}

export function strip(metadata) {
  const schema = {}
  const all = metadata.getAll()
  for (const [name, meta] of Object.entries(all)) {
    if (meta.abstract || meta.pivotTable) continue
    const normalized = name.toLowerCase().replace("entity", "")
    const properties = {}
    for (const prop of Object.values(meta.properties)) {
      if (prop.kind === "scalar" || prop.kind === "embedded") continue
      properties[prop.name] = {
        kind: prop.kind,
        target: prop.targetMeta?.name?.toLowerCase().replace("entity", ""),
      }
    }
    schema[normalized] = { properties }
  }
  return schema
}

export function wire(entities, schema) {
  for (const [name, meta] of Object.entries(schema)) {
    if (!entities[name]) continue
    const stores = {}
    for (const [prop, rel] of Object.entries(meta.properties)) {
      if (rel.target && entities[rel.target]) stores[rel.target] = entities[rel.target]
    }
    entities[name]._schema = { ...meta, _stores: stores }
  }
}
