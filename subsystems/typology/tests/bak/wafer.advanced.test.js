import {
  specimen, steer, Vector, Aperture, Url, Path,
  Connection, sleep, shape, shard,
} from "@vivalence/typology"

const LIFECYCLE = "/construct/populate/resolve/integrate"

function deferred() {
  let resolve
  const promise = new Promise(r => { resolve = r })
  return { promise, resolve }
}

function runtime(config) {
  const wafer = new Vector()

  wafer.use(async (die, next) => {
    die.abort = die.input?.abort || new AbortController()
    die.release = deferred()
    die.abort.signal.addEventListener("abort", () => die.release.resolve())
    die.teardown = []
    await next()
    die.teardown.push("disintegrate")
    await die.server?.shutdown()
  })

  const construct = wafer.branch("/construct")
  construct.use(async (die, next) => {
    die.aperture = new Aperture()
    die.latch = new Url(`http://localhost:${config.port}`)
    die.daemons = new Map()
    await next()
    die.teardown.push("construct")
  })

  const populate = construct.branch("/populate")
  populate.use(async (die, next) => {
    for (const mask of config.masks) {
      die.daemons.set(mask.slug, { mask, wafer: daemon(mask) })
    }
    await next()
    die.teardown.push("populate")
  })

  const resolve = populate.branch("/resolve")
  resolve.use(async (die, next) => {
    for (const [slug, entry] of die.daemons) {
      const cast = steer.invoke(entry.wafer, LIFECYCLE)
      entry.product = await cast({
        aperture: die.aperture,
        latch: die.latch,
        abort: die.abort,
      })
    }

    die.aperture.open("/status", () => ({
      status: "ok",
      daemons: [...die.daemons.keys()],
    }))

    await next()
    die.teardown.push("resolve")
  })

  resolve.open("/integrate", async (die) => {
    die.server = Deno.serve({
      port: config.port,
      hostname: "127.0.0.1",
      signal: die.abort.signal,
      onListen() {},
    }, shape.http(die.aperture))

    die.input?.onReady?.({ teardown: die.teardown })

    return die.release.promise
  })

  return wafer
}

function daemon(mask) {
  const wafer = new Vector()

  const construct = wafer.branch("/construct")
  construct.use(async (die, next) => {
    die.daemon = {
      slug: mask.slug,
      mount: new Path(`/daemon/${mask.slug}`),
      aperture: new Aperture(),
      store: new Map(),
    }
    await next()
  })

  const populate = construct.branch("/populate")
  populate.use(async (die, next) => {
    const { aperture, store } = die.daemon

    aperture.open("/manifest", () => ({
      slug: mask.slug,
      type: mask.type || "daemon",
      traits: mask.traits || [],
    }))

    aperture.post("/entities/create", (ctx) => {
      const entity = { id: crypto.randomUUID(), ...ctx.input }
      store.set(entity.id, entity)
      return entity
    })

    aperture.post("/entities/find", () => [...store.values()])

    await next()
    store.clear()
  })

  const resolve = populate.branch("/resolve")
  resolve.use(async (die, next) => {
    if (mask.traits?.includes("EMITTER")) {
      die.daemon.aperture.post("/emit", () => ({
        condition: "NOMINAL",
        buffers: [{ data: { word: mask.slug }, mode: mask.slug }],
      }))
    }
    await next()
  })

  resolve.open("/integrate", async (die) => {
    die.input.aperture
      .branch(die.daemon.mount.nature)
      .slurp(die.daemon.aperture)

    const handler = shape.http(die.daemon.aperture)
    die.daemon.connection = new Connection(
      new Url(`http://internal${die.daemon.mount.nature}`),
      shard.transmitter.inline(handler),
    )
    die.daemon.call = die.daemon.connection.call.bind(die.daemon.connection)

    return die.daemon
  })

  return wafer
}

function client(config) {
  const wafer = new Vector()

  wafer.use(async (die, next) => {
    die.abort = die.input?.abort || new AbortController()
    die.release = deferred()
    die.abort.signal.addEventListener("abort", () => die.release.resolve())
    await next()
  })

  const construct = wafer.branch("/construct")
  construct.use(async (die, next) => {
    die.connection = new Connection(new Url(config.remote))
    die.dataspace = { daemons: new Map() }
    die.dom = { target: { innerHTML: "" }, mounted: false }
    await next()
  })

  const populate = construct.branch("/populate")
  populate.use(async (die, next) => {
    const status = await die.connection.call("/status")
    for (const slug of status.daemons) {
      const manifest = await die.connection.call(`/daemon/${slug}/manifest`)
      die.dataspace.daemons.set(slug, {
        slug,
        manifest,
        connection: die.connection,
        mount: new Path(`/daemon/${slug}`),
      })
    }
    await next()
  })

  const resolve = populate.branch("/resolve")
  resolve.use(async (die, next) => {
    die.terminals = new Map()
    await next()
    for (const [id, entry] of die.terminals) {
      entry.abort.abort()
      await entry.handle
    }
  })

  resolve.open("/integrate", async (die) => {
    die.dom.mounted = true

    die.input?.onReady?.({
      dataspace: die.dataspace,
      dom: die.dom,
      terminals: die.terminals,
      spawn: async (params) => {
        const terminalAbort = new AbortController()
        const ready = deferred()

        const handle = steer.invoke(terminal(params), LIFECYCLE)({
          dataspace: die.dataspace,
          abort: terminalAbort,
          onReady: (api) => ready.resolve(api),
        })

        const api = await ready.promise
        die.terminals.set(api.id, { api, abort: terminalAbort, handle })

        return {
          ...api,
          kill: () => terminalAbort.abort(),
          handle: die.terminals.get(api.id).handle,
        }
      },
    })

    return die.release.promise
  })

  return wafer
}

function terminal(params) {
  const wafer = new Vector()

  wafer.use(async (die, next) => {
    die.abort = die.input?.abort || new AbortController()
    die.release = deferred()
    die.abort.signal.addEventListener("abort", () => die.release.resolve())
    die.teardown = []
    await next()
    die.teardown.push("root")
  })

  const construct = wafer.branch("/construct")
  construct.use(async (die, next) => {
    die.terminal = {
      id: crypto.randomUUID(),
      stall: { queue: [], active: null },
      entities: {
        buffer: new Map(),
        trace: new Map(),
      },
    }
    await next()
    die.teardown.push("construct")
  })

  const populate = construct.branch("/populate")
  populate.use(async (die, next) => {
    const daemon = die.input.dataspace.daemons.get(params.daemon)
    die.terminal.daemon = daemon
    die.terminal.connection = new Connection(
      new Url(daemon.connection.url.absolute),
      daemon.connection.transport,
    )
    await next()
    die.teardown.push("populate")
  })

  const resolve = populate.branch("/resolve")
  resolve.use(async (die, next) => {
    die.terminal.buffer = (data) => {
      const buffer = {
        id: crypto.randomUUID(),
        data,
        terminal: die.terminal.id,
      }
      die.terminal.entities.buffer.set(buffer.id, buffer)
      die.terminal.stall.queue.push(buffer)
      return buffer
    }
    await next()
    die.teardown.push("resolve")
  })

  resolve.open("/integrate", async (die) => {
    die.input?.onReady?.({
      id: die.terminal.id,
      buffer: die.terminal.buffer,
      entities: die.terminal.entities,
      stall: die.terminal.stall,
      teardown: die.teardown,
    })

    return die.release.promise
  })

  return wafer
}

function paladin(config = {}) {
  const wafer = new Vector()

  wafer.use(async (die, next) => {
    die.paladin = { env: {}, scopes: {}, variant: null }
    die.phases = []
    await next()
  })

  const construct = wafer.branch("/construct")
  construct.use(async (die, next) => {
    Object.assign(die.paladin.env, config.env || {})
    die.phases.push("construct")
    await next()
  })

  const populate = construct.branch("/populate")
  populate.use(async (die, next) => {
    die.paladin.scopes = {
      system: die.paladin.env.VIVA_SYSTEM_MOUNT || "/default/system",
      registry: die.paladin.env.VIVA_REGISTRY_MOUNT || "/default/system/registry",
      variant: die.paladin.env.VIVA_VARIANT_MOUNT || "/default/variant",
    }
    die.phases.push("populate")
    await next()
  })

  populate.open("/incarne", async (die) => ({
    env: { ...die.paladin.env },
    scopes: { ...die.paladin.scopes },
    phases: [...die.phases],
    variant: null,
  }))

  const resolve = populate.branch("/resolve")
  resolve.use(async (die, next) => {
    const circuitry = config.circuitry || []
    die.paladin.variant = {
      circuitry,
      daemons: circuitry.flatMap(c => c.daemons || []),
      services: circuitry.flatMap(c => c.services || []),
      runtime: circuitry.map(c => c.runtime).find(Boolean) || {},
    }
    die.phases.push("resolve")
    await next()
  })

  resolve.open("/integrate", async (die) => {
    die.phases.push("integrate")
    return {
      env: { ...die.paladin.env },
      scopes: { ...die.paladin.scopes },
      variant: die.paladin.variant,
      phases: [...die.phases],
    }
  })

  return wafer
}

specimen.describe("runtime → daemon", () => {
  const PORT = 9860
  const abort = new AbortController()
  let handle, conn, runtimeState

  specimen.beforeAll(async () => {
    const ready = deferred()
    handle = steer.invoke(runtime({
      port: PORT,
      masks: [
        { slug: "alpha", traits: [] },
        { slug: "beta", traits: ["EMITTER"] },
      ],
    }), LIFECYCLE)({ abort, onReady: (state) => ready.resolve(state) })

    runtimeState = await ready.promise
    await sleep.ms(100)
    conn = new Connection(new Url(`http://localhost:${PORT}`))
  })

  specimen.afterAll(async () => {
    abort.abort()
    await handle
  })

  specimen.it("serves /status with both daemon slugs", async () => {
    const status = await conn.call("/status")
    specimen.expect(status.status).toBe("ok")
    specimen.expect(status.daemons.sort()).toEqual(["alpha", "beta"])
  })

  specimen.it("daemon manifest accessible at /daemon/:slug/manifest", async () => {
    const manifest = await conn.call("/daemon/alpha/manifest")
    specimen.expect(manifest.slug).toBe("alpha")
    specimen.expect(manifest.type).toBe("daemon")
  })

  specimen.it("daemon entity CRUD via /daemon/:slug/entities/*", async () => {
    const created = await conn.call("/daemon/alpha/entities/create", { name: "test-entity" })
    specimen.expect(created.name).toBe("test-entity")
    specimen.expect(created.id).toBeDefined()

    const found = await conn.call("/daemon/alpha/entities/find")
    specimen.expect(found.length).toBeGreaterThanOrEqual(1)
    specimen.expect(found.find(e => e.name === "test-entity")).toBeDefined()
  })

  specimen.it("daemon stores are isolated", async () => {
    await conn.call("/daemon/beta/entities/create", { name: "beta-only" })

    const alphaEntities = await conn.call("/daemon/alpha/entities/find")
    const betaEntities = await conn.call("/daemon/beta/entities/find")

    const alphaHasBeta = alphaEntities.some(e => e.name === "beta-only")
    specimen.expect(alphaHasBeta).toBe(false)

    const betaHasIt = betaEntities.some(e => e.name === "beta-only")
    specimen.expect(betaHasIt).toBe(true)
  })

  specimen.it("EMITTER trait adds /emit route to beta only", async () => {
    const result = await conn.call("/daemon/beta/emit")
    specimen.expect(result.condition).toBe("NOMINAL")
    specimen.expect(result.buffers[0].data.word).toBe("beta")

    const alphaEmit = await conn.fetch("/daemon/alpha/emit")
    specimen.expect(alphaEmit.status).toBe(404)
  })

  specimen.it("teardown unwinds in reverse on abort", async () => {
    abort.abort()
    await handle

    specimen.expect(runtimeState.teardown).toEqual([
      "resolve", "populate", "construct", "disintegrate",
    ])

    let failed = false
    try { await fetch(`http://127.0.0.1:${PORT}/status`) } catch { failed = true }
    specimen.expect(failed).toBe(true)
  })
})

specimen.describe("client → terminal", () => {
  const PORT = 9861
  const runtimeAbort = new AbortController()
  let runtimeHandle

  specimen.beforeAll(async () => {
    runtimeHandle = steer.invoke(runtime({
      port: PORT,
      masks: [
        { slug: "alpha", traits: ["EMITTER"] },
        { slug: "beta", traits: [] },
      ],
    }), LIFECYCLE)({ abort: runtimeAbort })
    await sleep.ms(200)
  })

  specimen.afterAll(async () => {
    runtimeAbort.abort()
    await runtimeHandle
  })

  specimen.it("client boots, discovers daemons, spawns isolated terminals", async () => {
    const clientAbort = new AbortController()
    const clientReady = deferred()

    const clientHandle = steer.invoke(client({
      remote: `http://localhost:${PORT}`,
    }), LIFECYCLE)({
      abort: clientAbort,
      onReady: (api) => clientReady.resolve(api),
    })

    const app = await clientReady.promise

    specimen.expect(app.dom.mounted).toBe(true)
    specimen.expect(app.dataspace.daemons.has("alpha")).toBe(true)
    specimen.expect(app.dataspace.daemons.has("beta")).toBe(true)

    const termA = await app.spawn({ daemon: "alpha" })
    const termB = await app.spawn({ daemon: "alpha" })

    termA.buffer({ word: "hello" })
    termA.buffer({ word: "world" })
    termB.buffer({ word: "goodbye" })

    specimen.expect(termA.entities.buffer.size).toBe(2)
    specimen.expect(termB.entities.buffer.size).toBe(1)

    const termAWords = [...termA.entities.buffer.values()].map(b => b.data.word)
    specimen.expect(termAWords).toEqual(["hello", "world"])

    const termBWords = [...termB.entities.buffer.values()].map(b => b.data.word)
    specimen.expect(termBWords).toEqual(["goodbye"])

    specimen.expect(termA.stall.queue.length).toBe(2)
    specimen.expect(termB.stall.queue.length).toBe(1)

    termA.kill()
    await termA.handle
    specimen.expect(termA.teardown).toEqual(["resolve", "populate", "construct", "root"])

    termB.buffer({ word: "still alive" })
    specimen.expect(termB.entities.buffer.size).toBe(2)

    clientAbort.abort()
    await clientHandle

    specimen.expect(termB.teardown).toEqual(["resolve", "populate", "construct", "root"])
  })
})

specimen.describe("paladin half-life", () => {
  const config = {
    env: {
      VIVA_SYSTEM_MOUNT: "/opt/viva",
      VIVA_VARIANT_MOUNT: "/opt/viva/variant",
      VIVA_SYSTEM_MODE: "CITIZEN",
    },
    circuitry: [{
      runtime: { port: 2501 },
      daemons: [
        { slug: "br", modules: { kernel: "topology/brazilian" } },
        { slug: "jp", modules: { kernel: "topology/japanese" } },
      ],
      services: [
        { slug: "lighthouse", type: "service" },
      ],
    }],
  }

  specimen.it("half-life returns env + scopes without variant", async () => {
    const incarne = await steer.invoke(paladin(config), "/construct/populate/incarne")()

    specimen.expect(incarne.env.VIVA_SYSTEM_MOUNT).toBe("/opt/viva")
    specimen.expect(incarne.scopes.system).toBe("/opt/viva")
    specimen.expect(incarne.scopes.variant).toBe("/opt/viva/variant")
    specimen.expect(incarne.variant).toBe(null)
    specimen.expect(incarne.phases).toEqual(["construct", "populate"])
  })

  specimen.it("full life returns env + scopes + compiled variant", async () => {
    const full = await steer.invoke(paladin(config), LIFECYCLE)()

    specimen.expect(full.env.VIVA_SYSTEM_MOUNT).toBe("/opt/viva")
    specimen.expect(full.scopes.system).toBe("/opt/viva")
    specimen.expect(full.variant).toBeDefined()
    specimen.expect(full.variant.daemons.length).toBe(2)
    specimen.expect(full.variant.daemons[0].slug).toBe("br")
    specimen.expect(full.variant.services.length).toBe(1)
    specimen.expect(full.variant.runtime.port).toBe(2501)
    specimen.expect(full.phases).toEqual(["construct", "populate", "resolve", "integrate"])
  })

  specimen.it("half-life and full life from same wafer", async () => {
    const w = paladin(config)

    const half = await steer.invoke(w, "/construct/populate/incarne")()
    const full = await steer.invoke(w, LIFECYCLE)()

    specimen.expect(half.variant).toBe(null)
    specimen.expect(full.variant.daemons.length).toBe(2)
    specimen.expect(half.env).toEqual(full.env)
    specimen.expect(half.scopes).toEqual(full.scopes)
  })
})
