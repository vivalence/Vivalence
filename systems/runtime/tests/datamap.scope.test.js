import { specimen, sleep } from "@vivalence/typology"
import { datamap } from "@vivalence/runtime/scenarios"

// A scope is one unit of work: a request, a boot step, an install. It forks the ROOT manager.
// It never inherits the filter params of whatever scope happens to be ambient when it opens:
// prod 11-24, a dataset install's `daemon` param reached every later request and hid the
// surfaces of the other daemons (/attached/surface answered 404).

let held

specimen.beforeAll(async () => {
  held = await datamap.provider(datamap.descriptors)
})

specimen.afterAll(async () => {
  await held.close()
})

const within = (slug) =>
  held.shard.scope(async () => {
    held.entities.em.setFilterParams("daemon", { daemon: slug })
    await sleep.ms(5)
    return held.entities.em.getFilterParams("daemon").daemon
  })

specimen.describe("a datamap scope starts from the root manager", () => {
  specimen.it("two scopes in parallel each read their own filter param", async () => {
    specimen.expect(await Promise.all([within("spanish"), within("chess")])).toEqual(["spanish", "chess"])
  })

  specimen.it("a scope opened inside another scope does not inherit its filter param", async () => {
    const inherited = await held.shard.scope(async () => {
      held.entities.em.setFilterParams("daemon", { daemon: "droneaid" })
      return held.shard.scope(async () => held.entities.em.getFilterParams("daemon"))
    })
    specimen.expect(inherited).toBe(undefined)
  })

  specimen.it("the root manager is not written by a scope", async () => {
    await within("droneaid")
    specimen.expect(held.entities.em.getFilterParams("daemon")).toBe(undefined)
  })
})
