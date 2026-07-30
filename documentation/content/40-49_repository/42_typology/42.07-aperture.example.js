import { Aperture, Connection, Url, shape, shard } from "@vivalence/typology"

export const name = "42.07-aperture"

export async function run() {
  // An Aperture is a Vector plus a method-keyed leaf fold.
  const aperture = new Aperture()
  aperture.get("/thing", () => ({ read: true }))
  aperture.post("/thing", (ctx) => ({ wrote: ctx.request.body }))

  // Both verbs land on ONE node — the leaf holds a method map, not two leaves.
  console.log("leaf     →", JSON.stringify(Object.keys(aperture.branch("thing").effect.methods)))
  console.log("nodes    →", aperture.patterns.length)

  // shape.http folds the whole trie into a (Request) → Response.
  const handler = shape.http(aperture)
  const read = await handler(new Request("http://x/thing", { method: "GET" }))
  console.log("GET      →", JSON.stringify(await read.json()))

  const wrote = await handler(new Request("http://x/thing", {
    method: "POST",
    headers: { "content-type": "application/json" },
    body: JSON.stringify({ a: 1 }),
  }))
  console.log("POST     →", JSON.stringify(await wrote.json()))

  // An unregistered verb is a 405, not a 404 — the node exists, the method does not.
  const denied = await handler(new Request("http://x/thing", { method: "DELETE" }))
  console.log("DELETE   →", denied.status)

  // The DUAL — a Connection CALLS a trie where an Aperture SERVES one.
  // Its branches mirror the aperture segment-for-segment, which is what makes
  // strip/wire exact: the client hits the endpoints the server mounted.
  const connection = new Connection(new Url("http://inline"), shard.transmitter.inline(handler))
  const thing = connection.branch("/thing")
  console.log("aim      →", JSON.stringify(await thing.aim("")({ via: "connection" })))

  if (aperture.patterns.length !== 1) throw new Error("two verbs must share one node")
  if (denied.status !== 405) throw new Error(`unregistered verb should be 405, got ${denied.status}`)
  console.log("tests    →", "2 assertions passed")
}
