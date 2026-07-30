import { Vector, Connection, Url, shape, shard } from "@vivalence/typology"

export const name = "42.05-yields"

// The streaming contract is declared on the EDGE and survives the wire.
// Three files carry it: the trait declares `yields`, strip plucks it,
// wire reads it and hands back a stream caller instead of a POST caller.
export async function run() {
  const vector = new Vector()
    .open("/render", () => ({ done: true }))
    .open({ nature: "/stream", yields: { type: "object" } }, async function* () {
      yield { part: "one" }
      yield { part: "two" }
    })

  // 1 — declare. The edge carries `yields`; the node does not.
  const [renderEdge, streamEdge] = [...vector.trajectories.keys()]
  console.log("edges    →", JSON.stringify({ [renderEdge.nature]: renderEdge.yields ?? null, [streamEdge.nature]: !!streamEdge.yields }))

  // 2 — strip. `yields` crosses the wire as part of the contract.
  const contract = shape.strip(vector)
  console.log("contract →", JSON.stringify(contract))

  // 3 — wire. aim() branches on `effect.yields`: streaming leaf vs plain call.
  const handler = shape.http(vector)
  const connection = new Connection(new Url("http://inline"), shard.transmitter.inline(handler))
  const remote = shape.connection.wire(connection, contract)

  const plain = await remote.render({})
  console.log("render   →", JSON.stringify(plain))

  const collected = []
  for await (const packet of remote.stream({})) collected.push(packet)
  console.log("stream   →", JSON.stringify(collected))

  if (renderEdge.yields !== undefined) throw new Error("a non-streaming edge declares no yields")
  if (contract.branches.stream.effect.yields === undefined)
    throw new Error("yields must survive the strip — it is the streaming contract")
  if (contract.branches.render.effect.yields !== undefined)
    throw new Error("a plain leaf must not gain a yields on the wire")
  if (collected.length !== 2) throw new Error(`stream should yield 2 packets, got ${collected.length}`)
  console.log("tests    →", "4 assertions passed")
}
