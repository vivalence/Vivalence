import { Vector, shape } from "@vivalence/typology"

export const name = "47.03-connection"

export function run() {
  const vector = new Vector().affect((context) => ({ ...context, root: true }))
  vector.open("/echo", (context) => context)
  vector.open("/ping", () => "pong")

  const wire = shape.strip(vector)
  console.log("wire   →", JSON.stringify(wire))
  console.log("routes →", JSON.stringify(Object.keys(wire.branches)))

  if (wire.effect === undefined) throw new Error("root effect not stripped")
  if (!wire.branches.echo) throw new Error("echo route missing from wire")
  if (!wire.branches.ping) throw new Error("ping route missing from wire")
  console.log("tests  →", "3 assertions passed")
}
