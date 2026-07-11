import { specimen, shape, steer } from "@vivalence/typology"
import { Vector, v } from "@vivalence/typology"
import { house } from "../../scenarios/cats/index.js"

specimen.describe("shape.flat", () => {
  specimen.it("collects all leaf effects into flat array", () => {
    const { vector } = house()
    const result = shape.flat(vector)
    specimen.expect(result.length).toBe(5)
    specimen.expect(result.map((n) => n.nature)).toEqual(["stalk", "pounce", "retreat", "purr", "nap"])
  })

  specimen.it("each node has nature, signature, no path", () => {
    const { vector } = house()
    const result = shape.flat(vector)
    const purr = result.find((n) => n.nature === "purr")
    specimen.expect(purr.nature).toBe("purr")
    specimen.expect(purr.signature).toBeTruthy()
    specimen.expect(purr.path).toBe(undefined)
  })

  specimen.it("passes signature through whole", () => {
    const { vector } = house()
    const result = shape.flat(vector)
    const purr = result.find((n) => n.nature === "purr")
    specimen.expect(purr.signature.keyed).toEqual({ command: "p" })
    specimen.expect(purr.signature.valence).toBe("emit purr sound")
  })

  specimen.it("leaves have no invoke without strategy", () => {
    const { vector } = house()
    const result = shape.flat(vector)
    specimen.expect(result[0].invoke).toBe(undefined)
  })

  specimen.it("leaves carry invoke with strategy", async () => {
    const { vector } = house()
    const result = shape.flat(vector, steer.strategy.request)
    const purr = result.find((n) => n.nature === "purr")
    specimen.expect(typeof purr.invoke).toBe("function")
    const output = await purr.invoke({ volume: 5 })
    specimen.expect(output).toEqual({ energy: 9 })
  })

  specimen.it("nested effects carry invoke with middleware", async () => {
    const trace = []
    const vector = new Vector()

    vector.use(async (_, next) => { trace.push("root"); await next() })
    vector
      .branch("api")
      .use(async (_, next) => { trace.push("branch"); await next() })
      .open("call", () => { trace.push("leaf"); return "done" })

    const result = shape.flat(vector, steer.strategy.request)
    specimen.expect(result.length).toBe(1)
    specimen.expect(result[0].nature).toBe("call")
    await result[0].invoke()
    specimen.expect(trace).toEqual(["root", "branch", "leaf"])
  })

  specimen.it("trajectories do not appear as nodes", () => {
    const { vector } = house()
    const result = shape.flat(vector)
    const natures = result.map((n) => n.nature)
    specimen.expect(natures.includes("hunt")).toBe(false)
  })
})
