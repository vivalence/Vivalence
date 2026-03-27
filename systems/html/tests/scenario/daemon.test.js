import { specimen, shard, RemoteRepository } from "@vivalence/typology"
import { daemon } from "@vivalence/runtime/scenarios"
import { Mode } from "../../src/typology/entities/mode.js"
import { Intent } from "../../src/typology/entities/intent.js"

let scenario

specimen.beforeAll(async () => {
  scenario = await daemon.create()
})

specimen.afterAll(async () => {
  await scenario.orm.close()
})

specimen.describe("daemon entities", () => {
  specimen.it("mode wrapped in prototype", async () => {
    const mode = new RemoteRepository(Mode).connect(scenario.conn.branch("/entities/mode"))
    const modes = await mode.find()
    specimen.expect(modes.length).toBeGreaterThan(0)
    specimen.expect(modes[0]).toBeInstanceOf(Mode)
    specimen.expect(modes[0].traits).toContain("BUFFERED")
  })

  specimen.it("schema strip and wire", async () => {
    const schema = await scenario.conn.call("/datamap")
    const literal = new RemoteRepository()
    const symbol = new RemoteRepository()
    shard.datamap.wire({ literal, symbol }, schema)
    specimen.expect(literal._schema._stores.symbol).toBe(symbol)
    specimen.expect(symbol._schema._stores.literal).toBe(literal)
  })

  specimen.it("cross-repo identity through wired hydration", async () => {
    const symbol = new RemoteRepository().connect(scenario.conn.branch("/entities/symbol"))
    const literal = new RemoteRepository().connect(scenario.conn.branch("/entities/literal"))
    const schema = await scenario.conn.call("/datamap")
    shard.datamap.wire({ symbol, literal }, schema)

    await symbol.find()
    const literals = await literal.find({}, { populate: ["symbols"] })
    specimen.expect(literals[0].symbols.length).toBeGreaterThan(0)
    specimen.expect(literals[0].symbols[0]).toBe(symbol.$entities.get()[0])
  })

  specimen.it("thread create through authed connection", async () => {
    const mode = new RemoteRepository().connect(scenario.conn.branch("/entities/mode"))
    const thread = new RemoteRepository().connect(scenario.authedConn.branch("/userspace/entities/thread"))
    const modes = await mode.find()
    const created = await thread.create({
      mode: modes[0].id, trait: {}, cursor: 0, counter: 0,
    })
    specimen.expect(created.id).toBeDefined()
    specimen.expect(created.user).toBeTruthy()
  })
})
