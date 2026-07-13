import { Vector, shape } from "@vivalence/typology"

export const suite = {
  name: "stripwire",
  tests: {
    "strip carries the branch": () => {
      const vector = new Vector()
      vector.open("/echo", (context) => context)
      const stripped = shape.strip(vector)
      console.log("stripped →", JSON.stringify(stripped))
      if (!stripped.branches?.echo) throw new Error("echo branch missing from strip")
    },
    "root effect strips (no path is a path)": () => {
      const stripped = shape.strip(new Vector().affect((context) => context))
      console.log("root effect →", JSON.stringify(stripped.effect))
      if (stripped.effect === undefined) throw new Error("root effect not stripped")
    },
  },
}
