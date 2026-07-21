import { specimen, shape, steer, Vector, v } from "@vivalence/typology"
import { house } from "../../scenarios/cats/index.js"

specimen.describe("shape.tree", () => {
  specimen.it("a dead tree mirrors the trie", () => {
    const { vector } = house()
    const tree = shape.tree(vector)
    specimen.expect(tree.length).toBe(3)
    specimen.expect(tree[0].nature).toBe("hunt")
    specimen.expect(tree[1].nature).toBe("purr")
    specimen.expect(tree[2].nature).toBe("nap")

    const hunt = tree.find((node) => node.nature === "hunt")
    specimen.expect(hunt.children.length).toBe(3)
    specimen.expect(hunt.children[0].nature).toBe("stalk")
    specimen.expect(hunt.children[1].nature).toBe("pounce")
    specimen.expect(hunt.children[2].nature).toBe("retreat")

    const purr = tree.find((node) => node.nature === "purr")
    specimen.expect(purr.signature.keyed).toEqual({ command: "p" })
    specimen.expect(purr.signature.valence).toBe("emit purr sound")
    specimen.expect(purr.signature.directed).toEqual({ variant: "icon", icon: "waveform" })
    specimen.expect(purr.invoke).toBe(undefined)
    specimen.expect(purr.children).toBe(undefined)
  })

  specimen.it("a live tree arms its leaves and spares the source", async () => {
    const purring = house()
    const purr = shape.tree(purring.vector, steer.strategy.request).find((node) => node.nature === "purr")
    specimen.expect(typeof purr.invoke).toBe("function")
    specimen.expect(await purr.invoke({ volume: 5 })).toEqual({ energy: 9 })

    const hunting = house()
    const dead = JSON.stringify(shape.tree(hunting.vector))
    const hunt = shape.tree(hunting.vector, steer.strategy.request).find((node) => node.nature === "hunt")
    const stalk = hunt.children.find((node) => node.nature === "stalk")
    specimen.expect(typeof stalk.invoke).toBe("function")
    specimen.expect(await stalk.invoke({ patience: 3 })).toEqual({ energy: 8 })
    specimen.expect(hunt.invoke).toBe(undefined)

    specimen.expect(JSON.stringify(shape.tree(hunting.vector))).toBe(dead)
  })

  specimen.it("middleware rolls up and a guard judges input", async () => {
    const trace = []
    const layered = new Vector()
    layered.use(async (context, next) => { trace.push("root"); await next() })
    layered
      .branch("api")
      .use(async (context, next) => { trace.push("branch"); await next() })
      .open("call", () => { trace.push("leaf"); return "done" })

    const tree = shape.tree(layered, steer.strategy.request)
    const api = tree.find((node) => node.nature === "api")
    const call = api.children.find((node) => node.nature === "call")
    await call.invoke()
    specimen.expect(trace).toEqual(["root", "branch", "leaf"])

    const guarded = new Vector()
    guarded.open(
      { nature: "feed", input: v.object({ limit: v.integer() }) },
      (context) => context.input.limit,
    )
    const guardedTree = shape.tree(guarded, steer.strategy.guarded)
    specimen.expect(await guardedTree[0].invoke({ limit: 5 })).toBe(5)

    let threw = false
    try { await guardedTree[0].invoke({ limit: "abc" }) }
    catch (error) { threw = error.code === "VALIDATION" }
    specimen.expect(threw).toBe(true)
  })
})
