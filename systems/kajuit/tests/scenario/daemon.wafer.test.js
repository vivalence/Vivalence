import { specimen, steer, RemoteRepository, shard } from "@vivalence/typology"
import { daemon as daemonScenario } from "@vivalence/runtime/scenarios"
import { Daemon } from "../../src/daemon/daemon.js"
import { Dataspace } from "../../src/daemon/dataspace.js"
import { Mode } from "../../src/entities/mode.js"
import { Intent } from "../../src/entities/intent.js"
import { daemon as daemonWafer } from "../../src/daemon/daemon.wafer.js"

const castDaemon = steer.dispatch.invoke(daemonWafer, "/construct/populate/resolve/full",
  (carry, effect) => async (die) => {
    await carry(die, async () => { die.output = await effect(die) })
    return die.output
  },
)

let scenario
let result

specimen.beforeAll(async () => {
  localStorage.clear()
  scenario = await daemonScenario.create()

  scenario.daemon.aperture.open("/manifest", () => scenario.daemon.manifest)
  scenario.daemon.aperture.open("/cargo", () => scenario.daemon.cargo)

  const lighthouse = {
    manifest: { slug: "test-lighthouse" },
    $authority: { get: () => ({}) },
    daemons: new Set(),
  }

  result = await castDaemon({
    good: new Daemon(scenario.conn),
    variant: { lighthouse },
  })
})

specimen.afterAll(async () => {
  await scenario.orm.close()
})

specimen.describe("daemon client wafer", () => {

  specimen.describe("construct", () => {
    specimen.it("manifest populated from daemon", () => {
      specimen.expect(result.manifest).toBeDefined()
      specimen.expect(result.slug).toBe("test-daemon")
    })

    specimen.it("mount path set from slug", () => {
      specimen.expect(result.mount.nature).toBe("/daemon/test-daemon")
    })

    specimen.it("link path set from lighthouse + daemon slug", () => {
      specimen.expect(result.link.nature).toContain("test-lighthouse")
      specimen.expect(result.link.nature).toContain("test-daemon")
    })

    specimen.it("cargo fetched", () => {
      specimen.expect(result.cargo).toBeDefined()
      specimen.expect(result.cargo.version).toBe("0.0.1")
    })

    specimen.it("call bound to connection", () => {
      specimen.expect(typeof result.call).toBe("function")
    })
  })

  specimen.describe("populate", () => {
    specimen.it("dataspace created as entities", () => {
      specimen.expect(result.entities).toBeInstanceOf(Dataspace)
    })

    specimen.it("repos registered and accessible", () => {
      specimen.expect(result.entities.mode).toBeInstanceOf(RemoteRepository)
      specimen.expect(result.entities.intent).toBeInstanceOf(RemoteRepository)
      specimen.expect(result.entities.thread).toBeInstanceOf(RemoteRepository)
      specimen.expect(result.entities.buffer).toBeInstanceOf(RemoteRepository)
      specimen.expect(result.entities.trace).toBeInstanceOf(RemoteRepository)
      specimen.expect(result.entities.literal).toBeInstanceOf(RemoteRepository)
    })

    specimen.it("modes and intents eagerly populated", () => {
      specimen.expect(result.entities.mode.$entities.get().length).toBeGreaterThan(0)
      specimen.expect(result.entities.intent.$entities.get().length).toBeGreaterThan(0)
    })
  })

  specimen.describe("resolve", () => {
    specimen.it("modes fetched and enriched", async () => {
      const modes = result.entities.mode.$entities.get()
      specimen.expect(modes.length).toBeGreaterThan(0)
      specimen.expect(modes[0]).toBeInstanceOf(Mode)
      specimen.expect(modes[0].daemon).toBe(result)
      specimen.expect(modes[0].mount).toBeDefined()
      specimen.expect(modes[0].connection).toBeDefined()
      specimen.expect(typeof modes[0].call).toBe("function")
    })

    specimen.it("APPLICATION modes have buffer factory", () => {
      const modes = result.entities.mode.$entities.get()
      const buffered = modes.find(mode => mode.implements("APPLICATION"))
      specimen.expect(buffered).toBeDefined()
      specimen.expect(typeof buffered.buffer).toBe("function")
      specimen.expect(buffered.buffered).toBeDefined()
    })

    specimen.it("intents fetched and linked to modes", () => {
      const modes = result.entities.mode.$entities.get()
      const mode = modes[0]
      specimen.expect(mode.intents).toBeInstanceOf(Set)
      specimen.expect(mode.intents.size).toBeGreaterThan(0)
    })

    specimen.it("mode resolve hook enriches on find", async () => {
      const fresh = await result.entities.mode.find()
      specimen.expect(fresh[0].daemon).toBe(result)
      specimen.expect(fresh[0].mount).toBeDefined()
    })
  })
})
