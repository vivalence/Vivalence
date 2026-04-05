import { specimen, steer } from "@vivalence/typology"
import { Vector } from "@vivalence/typology"

const LIFECYCLE = "/construct/populate/resolve/integrate"

function deferred() {
  let resolve
  const promise = new Promise(r => { resolve = r })
  return { promise, resolve }
}

specimen.describe("wafer", () => {

  specimen.describe("completing", () => {
    specimen.it("traverses lifecycle phases and returns product", async () => {
      const boot = new Vector()

      const construct = boot.branch("/construct")
      construct.use(async (die, next) => {
        die.phases = ["construct"]
        await next()
      })

      const populate = construct.branch("/populate")
      populate.use(async (die, next) => {
        die.phases.push("populate")
        await next()
      })

      const resolve = populate.branch("/resolve")
      resolve.use(async (die, next) => {
        die.phases.push("resolve")
        await next()
      })

      resolve.open("/integrate", async (die) => {
        die.phases.push("integrate")
        return [...die.phases]
      })

      const cast = steer.invoke(boot, LIFECYCLE)
      const product = await cast()

      specimen.expect(product).toEqual(["construct", "populate", "resolve", "integrate"])
    })

    specimen.it("passes cast input as die.input", async () => {
      const boot = new Vector()

      boot.branch("/construct").open("/integrate", async (die) => ({
        received: die.input,
      }))

      const cast = steer.invoke(boot, "/construct/integrate")
      const product = await cast({ name: "paladin", port: 1729 })

      specimen.expect(product.received).toEqual({ name: "paladin", port: 1729 })
    })
  })

  specimen.describe("teardown", () => {
    specimen.it("unwinds in reverse phase order", async () => {
      const boot = new Vector()
      const teardown = []

      const construct = boot.branch("/construct")
      construct.use(async (die, next) => {
        await next()
        teardown.push("construct")
      })

      const populate = construct.branch("/populate")
      populate.use(async (die, next) => {
        await next()
        teardown.push("populate")
      })

      const resolve = populate.branch("/resolve")
      resolve.use(async (die, next) => {
        await next()
        teardown.push("resolve")
      })

      resolve.open("/integrate", async () => "done")

      await steer.invoke(boot, LIFECYCLE)()

      specimen.expect(teardown).toEqual(["resolve", "populate", "construct"])
    })
  })

  specimen.describe("alive", () => {
    specimen.it("blocks until release, then unwinds", async () => {
      const release = deferred()
      const teardown = []
      const boot = new Vector()

      boot.use(async (die, next) => {
        await next()
        teardown.push("root")
      })

      const construct = boot.branch("/construct")
      construct.use(async (die, next) => {
        await next()
        teardown.push("construct")
      })

      construct.open("/integrate", async () => release.promise)

      const cast = steer.invoke(boot, "/construct/integrate")
      let resolved = false
      const handle = cast().then(() => { resolved = true })

      await new Promise(r => setTimeout(r, 10))
      specimen.expect(resolved).toBe(false)

      release.resolve("shutdown")
      await handle

      specimen.expect(resolved).toBe(true)
      specimen.expect(teardown).toEqual(["construct", "root"])
    })
  })

  specimen.describe("partial application", () => {
    specimen.it("alternative effect at branch point stops early", async () => {
      const boot = new Vector()

      const construct = boot.branch("/construct")
      construct.use(async (die, next) => {
        die.constructed = true
        await next()
      })

      const populate = construct.branch("/populate")
      populate.use(async (die, next) => {
        die.populated = true
        await next()
      })

      populate.open("/snapshot", async (die) => ({
        constructed: die.constructed,
        populated: die.populated,
      }))

      populate.branch("/resolve").open("/integrate", async () => "full")

      const full = await steer.invoke(boot, LIFECYCLE)()
      specimen.expect(full).toBe("full")

      const partial = await steer.invoke(boot, "/construct/populate/snapshot")()
      specimen.expect(partial).toEqual({ constructed: true, populated: true })
    })
  })

  specimen.describe("recursive cast", () => {
    specimen.it("parent casts child wafers, child product mounts into parent", async () => {
      function child(name) {
        const boot = new Vector()

        boot.branch("/construct").use(async (die, next) => {
          die.child = { name, parent: die.input?.parent }
          await next()
        })

        boot.branch("/construct").open("/integrate", async (die) => die.child)

        return boot
      }

      const parent = new Vector()

      parent.branch("/construct").use(async (die, next) => {
        die.children = []
        await next()
      })

      const resolve = parent.branch("/construct/resolve")
      resolve.use(async (die, next) => {
        for (const name of ["alpha", "beta"]) {
          const product = await steer.invoke(child(name), "/construct/integrate")({ parent: "root" })
          die.children.push(product)
        }
        await next()
      })

      resolve.open("/integrate", async (die) => die.children)

      const product = await steer.invoke(parent, "/construct/resolve/integrate")()

      specimen.expect(product).toEqual([
        { name: "alpha", parent: "root" },
        { name: "beta", parent: "root" },
      ])
    })
  })

})
