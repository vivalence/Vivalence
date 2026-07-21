import { specimen, shape, steer, Vector } from "@vivalence/typology"
import { house } from "../../scenarios/cats/index.js"

specimen.describe("shape.flat", () => {
  specimen.it("a trie flattens to its leaves", () => {
    const { vector } = house()
    const flattened = shape.flat(vector)
    specimen.expect(flattened.length).toBe(5)
    specimen.expect(flattened.map((node) => node.nature)).toEqual(["stalk", "pounce", "retreat", "purr", "nap"])
    specimen.expect(flattened.map((node) => node.nature).includes("hunt")).toBe(false)

    const purr = flattened.find((node) => node.nature === "purr")
    specimen.expect(purr.nature).toBe("purr")
    specimen.expect(purr.signature).toBeTruthy()
    specimen.expect(purr.path).toBe(undefined)
    specimen.expect(purr.signature.keyed).toEqual({ command: "p" })
    specimen.expect(purr.signature.valence).toBe("emit purr sound")
    specimen.expect(flattened[0].invoke).toBe(undefined)
  })

  specimen.it("a strategy arms each leaf", async () => {
    const { vector } = house()
    const flattened = shape.flat(vector, steer.strategy.request)
    const purr = flattened.find((node) => node.nature === "purr")
    specimen.expect(typeof purr.invoke).toBe("function")
    specimen.expect(await purr.invoke({ volume: 5 })).toEqual({ energy: 9 })

    const trace = []
    const layered = new Vector()
    layered.use(async (context, next) => { trace.push("root"); await next() })
    layered
      .branch("api")
      .use(async (context, next) => { trace.push("branch"); await next() })
      .open("call", () => { trace.push("leaf"); return "done" })

    const armed = shape.flat(layered, steer.strategy.request)
    specimen.expect(armed.length).toBe(1)
    specimen.expect(armed[0].nature).toBe("call")
    await armed[0].invoke()
    specimen.expect(trace).toEqual(["root", "branch", "leaf"])
  })
})
