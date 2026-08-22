import { Vector, Connection, Url, shape, shard } from "@vivalence/typology"

export const name = "42.07-connection"

// A Connection is a TREE of connections, not a URL builder. Branches are
// memoized, and a child's transport re-enters the PARENT's middleware chain —
// so a shard mounted at the root applies to every descendant call.
export async function run() {
  const served = new Vector()
    .open("/entities/thread/find", () => ({ threads: 2 }))
    .open("/entities/buffer/find", () => ({ buffers: 5 }))

  const handler = shape.http(served)
  const root = new Connection(new Url("http://inline"), shard.transmitter.inline(handler))

  // one shard, mounted once, at the root
  const seen = []
  root.use(async (ctx, next) => { seen.push(ctx.request.url.pathname); await next() })

  // branches are MEMOIZED — the same path returns the same node
  const entities = root.branch("/entities")
  console.log("memoized →", entities === root.branch("/entities"))

  // a child call re-enters the root chain: the shard sees it
  const thread = entities.branch("/thread")
  console.log("thread   →", JSON.stringify(await thread.aim("/find")({})))
  console.log("buffer   →", JSON.stringify(await entities.branch("/buffer").aim("/find")({})))

  // aim() pre-binds a body; the caller's body is merged over it
  const bound = thread.aim("/find", { scope: "mine" })
  await bound({ limit: 10 })

  console.log("url      →", thread.url.branch("/find").pathname)
  console.log("observed →", JSON.stringify(seen))

  if (entities !== root.branch("/entities")) throw new Error("branches must be memoized")
  if (seen.length !== 3) throw new Error(`root shard must see every descendant call, saw ${seen.length}`)
  if (!seen.every((path) => path.startsWith("/entities")))
    throw new Error("child calls must carry their full branched path")
  console.log("tests    →", "3 assertions passed")
}
