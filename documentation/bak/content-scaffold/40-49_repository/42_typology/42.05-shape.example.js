import { Vector, Connection, Url, shape, shard } from "@vivalence/typology"

export const name = "42.05-shape"

export async function run() {
  // ONE declaration. Every fold below consumes this exact vector.
  const vector = new Vector()
    .open("/greet/:name", (ctx) => ({ hello: ctx.params.name }))
    .open("/ping", () => "pong")

  // --- object → a nested CALLABLE, dispatched in-process.
  const local = shape.object(vector)
  console.log("object   →", JSON.stringify(await local.ping({})))

  // --- strip → inert JSON. The wire contract served at /metadata/*.
  const stripped = shape.strip(vector)
  console.log("strip    →", JSON.stringify(stripped))

  // --- connection.wire → the SAME surface, backed by a Connection instead of handlers.
  // shape.http folds the vector into a (Request) → Response; transmitter.inline
  // makes the Connection call it directly, with no socket.
  const handler = shape.http(vector)
  const connection = new Connection(new Url("http://inline"), shard.transmitter.inline(handler))
  const remote = shape.connection.wire(connection, stripped)
  console.log("wire     →", JSON.stringify(Object.keys(remote)))

  // object is EAGER — literal natures only, so `:name` never becomes a key.
  console.log("eager    →", JSON.stringify(Object.keys(local.greet)))

  // proxy is LAZY — it resolves parameters on access, so the path can be spelled out.
  console.log("proxy    →", JSON.stringify(await shape.proxy(vector).greet.bob({})))

  // --- flat / tree → introspection folds, same catamorphism, different codomain.
  console.log("flat     →", JSON.stringify(shape.flat(vector).map((leaf) => leaf.nature)))
  console.log("tree     →", JSON.stringify(shape.tree(vector).map((node) => node.nature)))

  // --- mcp → the trie as JSON-RPC tool definitions ('/' natures become '_' names).
  const server = shape.mcp(vector, { name: "demo" })
  console.log("mcp      →", typeof server === "function" ? "handler" : JSON.stringify(Object.keys(server)))

  if (stripped.branches.ping.effect === undefined) throw new Error("a leaf must strip an effect")
  if (stripped.branches.greet.branches[":name"] === undefined) throw new Error("params survive the strip")
  if (typeof remote.ping !== "function") throw new Error("wire must re-inflate a callable")
  if (shape.flat(vector).length !== 2) throw new Error("flat should list every leaf")
  console.log("tests    →", "4 assertions passed")
}
