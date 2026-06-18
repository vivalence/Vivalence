import { Vector, Path, is, shard } from "@vivalence/typology"
import { Dataspace } from "./dataspace.js"

export const daemon = new Vector()

daemon.use(async (die, next) => {
  die.good.lighthouse = die.variant.lighthouse
  die.good.call = die.good.connection.call.bind(die.good.connection)
  await next()
})

daemon
  .branch("/construct")
  .use(async (die, next) => {
    const [manifest, schema, cargo] = await Promise.all([
      die.good.connection.call("/manifest"),
      die.good.connection.call("/datamap"),
      die.good.connection.call("/cargo"),
    ])

    die.good.manifest = manifest
    die.good.mount = new Path(`/daemon/${manifest.slug}`)
    die.good.cargo = cargo
    die.schema = schema

    die.good.link = new Path(`/${die.good.lighthouse.manifest.slug}/${manifest.slug}`).rebase("/viva")

    await next()
  })

  .branch("/populate")
  .use(async (die, next) => {
    die.good.entities = new Dataspace(die.good, die.schema, {
      mode: "/entities/mode",
      intent: "/entities/intent",
      thread: "/userspace/entities/thread",
      buffer: "/userspace/entities/buffer",
      trace: "/userspace/entities/trace",
      literal: "/entities/literal",
    })

    await die.good.entities.populate(["mode", "intent"])

    await next()
  })

  .branch("/resolve")
  .use(async (die, next) => {
    const modeRepo = die.good.entities.mode
    const intentRepo = die.good.entities.intent

    for (const mode of modeRepo.$entities.get()) {
      mode.daemon = die.good
      mode.mount = die.good.mount.branch(`/mode/${mode.type}/${mode.slug}`)
      mode.connection = die.good.connection.branch(mode.mount.nature)
      mode.call = mode.connection.call.bind(mode.connection)
      mode.link = die.good.link.branch(`/${mode.type}/${mode.slug}`)
      mode.intents = new Set()

      if (mode.implements("BUFFERED")) {
        mode.buffered = await mode.connection.call("/buffered")
        mode.buffer = (desc = {}) => ({
          mode: mode.id,
          data: { ...(mode.buffered?.schema?.data ?? {}), ...(desc.data ?? {}) },
          literals: desc.literals ?? [],
          symbols: desc.symbols ?? [],
        })
      }
    }

    for (const intent of intentRepo.$entities.get()) {
      const mode = typeof intent.mode === "object" ? intent.mode : modeRepo.findOneLocal({ id: intent.mode })
      if (!mode) throw new Error("Intent's mode not found")
      intent.mode = mode

      intent.link = mode.link.branch(`/${intent.slug}`)

      if (intent.type === "APPLICATIVE" && intent.trait?.FEEDING) {
        intent.emit = mode.connection
          .clone()
          .use(async (context, next) => {
            await next()
            const body = context.response.body
            if (body?.buffers) {
              body.buffers = body.buffers.map((pojo) => {
                pojo.mode = modeRepo.findOneLocal({ id: is.id(pojo.mode) ? pojo.mode : pojo.mode?.id }) ?? pojo.mode
                return pojo
              })
            }
          })
          .aim(intent.trait.FEEDING.mount, {
            intent: intent.id,
            ...(intent.trait.FEEDING.mask ?? {}),
          })
      }

      mode.intents.add(intent)
    }

    modeRepo.resolve = (mode) => {
      const enriched = modeRepo.findOneLocal({ id: mode.id })
      if (enriched && enriched !== mode) Object.assign(mode, enriched)
    }

    intentRepo.resolve = (intent) => {
      const mode = typeof intent.mode === "object" ? intent.mode : modeRepo.findOneLocal({ id: intent.mode })
      if (mode) intent.mode = mode
    }

    die.good.entities.thread.resolve = (thread) => {
      thread.daemon = die.good
      const mode = typeof thread.mode === "object" ? thread.mode : modeRepo.findOneLocal({ id: thread.mode })
      if (mode) thread.mode = mode
      if (thread.intent) {
        const intent = typeof thread.intent === "object" ? thread.intent : intentRepo.findOneLocal({ id: thread.intent })
        if (intent) thread.intent = intent
      }
    }

    await next()
  })

  .open("/full", async (die) => die.good)
