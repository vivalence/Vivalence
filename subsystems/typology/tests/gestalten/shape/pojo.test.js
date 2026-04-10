import { specimen, shape, steer, stamp } from "@vivalence/typology"
import { Vector, v } from "@vivalence/typology"
import { house } from "../../scenarios/cats/index.js"

specimen.describe("shape.pojo", () => {
  specimen.describe("dead output (no strategy)", () => {
    specimen.it("produces effects and trajectories at root", () => {
      const { vector } = house()
      const result = shape.pojo(vector)
      specimen.expect(result.effects.length).toBe(2)
      specimen.expect(result.trajectories.length).toBe(1)
      specimen.expect(result.effects[0].nature).toBe("purr")
      specimen.expect(result.effects[1].nature).toBe("nap")
      specimen.expect(result.trajectories[0].nature).toBe("hunt")
    })

    specimen.it("branches nest as children with split shape", () => {
      const { vector } = house()
      const result = shape.pojo(vector)
      const hunt = result.trajectories[0].children
      specimen.expect(hunt.effects.length).toBe(3)
      specimen.expect(hunt.trajectories.length).toBe(0)
      specimen.expect(hunt.effects[0].nature).toBe("stalk")
      specimen.expect(hunt.effects[1].nature).toBe("pounce")
      specimen.expect(hunt.effects[2].nature).toBe("retreat")
    })

    specimen.it("plucks signature keys", () => {
      const { vector } = house()
      const result = shape.pojo(vector)
      const purr = result.effects[0]
      specimen.expect(purr.signature.keyed).toEqual({ command: "p" })
      specimen.expect(purr.signature.valence).toBe("emit purr sound")
      specimen.expect(purr.signature.directed).toEqual({ variant: "icon", icon: "waveform" })
    })

    specimen.it("leaves have no invoke", () => {
      const { vector } = house()
      const result = shape.pojo(vector)
      specimen.expect(result.effects[0].invoke).toBe(undefined)
    })

    specimen.it("survives JSON roundtrip", () => {
      const { vector } = house()
      const result = shape.pojo(vector)
      const roundtripped = JSON.parse(JSON.stringify(result))
      specimen.expect(roundtripped).toEqual(result)
    })
  })

  specimen.describe("live output (with strategy)", () => {
    specimen.it("leaves carry invoke function", async () => {
      const { vector } = house()
      const result = shape.pojo(vector, steer.request)
      const purr = result.effects[0]
      specimen.expect(typeof purr.invoke).toBe("function")
      const output = await purr.invoke({ volume: 5 })
      specimen.expect(output).toEqual({ energy: 9 })
    })

    specimen.it("branch leaves carry invoke", async () => {
      const { vector } = house()
      const result = shape.pojo(vector, steer.request)
      const stalk = result.trajectories[0].children.effects[0]
      specimen.expect(typeof stalk.invoke).toBe("function")
      const output = await stalk.invoke({ patience: 3 })
      specimen.expect(output).toEqual({ energy: 8 })
    })

    specimen.it("trajectories have no invoke", () => {
      const { vector } = house()
      const result = shape.pojo(vector, steer.request)
      specimen.expect(result.trajectories[0].invoke).toBe(undefined)
    })

    specimen.it("source vector is not mutated", () => {
      const { vector } = house()
      const before = JSON.stringify(stamp.press(vector))
      shape.pojo(vector, steer.request)
      const after = JSON.stringify(stamp.press(vector))
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

      const result = shape.pojo(vector, steer.request)
      const leaf = result.trajectories[0].children.effects[0]
      await leaf.invoke()
      specimen.expect(trace).toEqual(["root", "branch", "leaf"])
    })

    specimen.it("guarded strategy validates input", async () => {
      const vector = new Vector()
      vector.open(
        { nature: "feed", input: v.object({ limit: v.integer() }) },
        (ctx) => ctx.input.limit,
      )

      const result = shape.pojo(vector, steer.guarded)
      specimen.expect(await result.effects[0].invoke({ limit: 5 })).toBe(5)

      let threw = false
      try { await result.effects[0].invoke({ limit: "abc" }) }
      catch (error) { threw = error.code === "VALIDATION" }
      specimen.expect(threw).toBe(true)
    })
  })
})
