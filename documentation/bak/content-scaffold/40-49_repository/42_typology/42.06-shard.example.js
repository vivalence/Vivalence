import { Vector, Connection, Url, shape, shard, Span } from "@vivalence/typology"

export const name = "42.06-shard"

export async function run() {
  const span = new Span()
  span.open({ nature: "shard" })

  // The server: an ordinary vector, folded to an HTTP handler.
  const served = new Vector().open("/echo", (ctx) => ({ saw: ctx.request.body }))
  const handler = shape.http(served)

  // The client: a Connection whose TRANSPORT is a chain of shards.
  // transmitter.inline swaps the socket for a direct call — same Context path, no port.
  const connection = new Connection(new Url("http://inline"), shard.transmitter.inline(handler))
  span.note({ transport: "inline" })

  // Shards are middleware over the transport. Each .use() wraps the next.
  const order = []
  connection.use(async (ctx, next) => { order.push("outer:in"); await next(); order.push("outer:out") })
  connection.use(async (ctx, next) => { order.push("inner:in"); await next(); order.push("inner:out") })

  const result = await connection.call("/echo", { hi: true })
  span.note({ called: "/echo", result })
  console.log("result   →", JSON.stringify(result))
  console.log("onion    →", JSON.stringify(order))

  // retry is a shard too — it wraps dispatch, it does not replace it.
  const flaky = new Connection(new Url("http://inline"), shard.transmitter.inline(handler))
  flaky.use(shard.connection.timeout(1000))
  const timed = await flaky.call("/echo", { via: "timeout" })
  span.note({ shard: "connection.timeout", timed })
  console.log("timeout  →", JSON.stringify(timed))

  span.close()

  if (order.join(",") !== "outer:in,inner:in,inner:out,outer:out")
    throw new Error(`koa onion order violated: ${order}`)
  console.log("tests    →", "1 assertion passed")

  return span.records
}
