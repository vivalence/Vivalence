import { specimen, shape, steer } from "@vivalence/typology"
import { Vector, v } from "@vivalence/typology"
import { house } from "../../scenarios/cats/index.js"

specimen.describe("shape.tree", () => {
  specimen.describe("dead output (no strategy)", () => {
    specimen.it("produces merged children at root", () => {
      const { vector } = house()
      const result = shape.tree(vector)
      specimen.expect(result.length).toBe(3)
      specimen.expect(result[0].nature).toBe("hunt")
      specimen.expect(result[1].nature).toBe("purr")
      specimen.expect(result[2].nature).toBe("nap")
    })

    specimen.it("branches nest as children", () => {
      const { vector } = house()
      const result = shape.tree(vector)
      const hunt = result.find((n) => n.nature === "hunt")
      specimen.expect(hunt.children.length).toBe(3)
      specimen.expect(hunt.children[0].nature).toBe("stalk")
      specimen.expect(hunt.children[1].nature).toBe("pounce")
      specimen.expect(hunt.children[2].nature).toBe("retreat")
    })

    specimen.it("passes signature through whole", () => {
      const { vector } = house()
      const result = shape.tree(vector)
      const purr = result.find((n) => n.nature === "purr")
      specimen.expect(purr.signature.keyed).toEqual({ command: "p" })
      specimen.expect(purr.signature.valence).toBe("emit purr sound")
      specimen.expect(purr.signature.directed).toEqual({ variant: "icon", icon: "waveform" })
    })

    specimen.it("leaves have no invoke", () => {
      const { vector } = house()
      const result = shape.tree(vector)
      specimen.expect(result.find((n) => n.nature === "purr").invoke).toBe(undefined)
    })

    specimen.it("leaves have no children", () => {
      const { vector } = house()
      const result = shape.tree(vector)
      specimen.expect(result.find((n) => n.nature === "purr").children).toBe(undefined)
    })
  })

  specimen.describe("live output (with strategy)", () => {
    specimen.it("leaves carry invoke function", async () => {
      const { vector } = house()
      const result = shape.tree(vector, steer.strategy.request)
      const purr = result.find((n) => n.nature === "purr")
      specimen.expect(typeof purr.invoke).toBe("function")
      const output = await purr.invoke({ volume: 5 })
      specimen.expect(output).toEqual({ energy: 9 })
    })

    specimen.it("branch leaves carry invoke", async () => {
      const { vector } = house()
      const result = shape.tree(vector, steer.strategy.request)
      const hunt = result.find((n) => n.nature === "hunt")
      const stalk = hunt.children.find((n) => n.nature === "stalk")
      specimen.expect(typeof stalk.invoke).toBe("function")
      const output = await stalk.invoke({ patience: 3 })
      specimen.expect(output).toEqual({ energy: 8 })
    })

    specimen.it("trajectories have no invoke", () => {
      const { vector } = house()
      const result = shape.tree(vector, steer.strategy.request)
      const hunt = result.find((n) => n.nature === "hunt")
      specimen.expect(hunt.invoke).toBe(undefined)
    })

    specimen.it("source vector is not mutated", () => {
      const { vector } = house()
      const before = JSON.stringify(shape.tree(vector))
      shape.tree(vector, steer.strategy.request)
      const after = JSON.stringify(shape.tree(vector))
      specimen.expect(after).toBe(before)
    })
  })

  specimen.describe("middleware rollup", () => {
    specimen.it("accumulates middleware through branches", async () => {
      const trace = []
      const vector = new Vector()

      vector.use(async (_, next) => { trace.push("root"); await next() })
      vector
        .branch("api")
        .use(async (_, next) => { trace.push("branch"); await next() })
        .open("call", () => { trace.push("leaf"); return "done" })

      const result = shape.tree(vector, steer.strategy.request)
      const api = result.find((n) => n.nature === "api")
      const call = api.children.find((n) => n.nature === "call")
      await call.invoke()
      specimen.expect(trace).toEqual(["root", "branch", "leaf"])
    })

    specimen.it("guarded strategy validates input", async () => {
      const vector = new Vector()
      vector.open(
        { nature: "feed", input: v.object({ limit: v.integer() }) },
        (ctx) => ctx.input.limit,
      )

      const result = shape.tree(vector, steer.strategy.guarded)
      specimen.expect(await result[0].invoke({ limit: 5 })).toBe(5)

      let threw = false
      try { await result[0].invoke({ limit: "abc" }) }
      catch (error) { threw = error.code === "VALIDATION" }
      specimen.expect(threw).toBe(true)
    })
  })
})
