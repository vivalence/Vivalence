import { Connection, Url, RemoteRepository, shard } from "@vivalence/typology"
import { $authority } from "./session.js"

export function lighthouse(url) {
  return new Connection(url)
    .use(shard.connection.authorize($authority))
    .use(shard.connection.timeout(10000))
}

export async function daemon(lighthouseConnection, slug) {
  const daemons = await lighthouseConnection.call("/entities/daemon/find")
  const entry = daemons.find((d) => d.slug === slug)
  if (!entry) throw new Error(`daemon not found: ${slug}`)

  const connection = new Connection(entry.url)
    .use(shard.connection.authorize($authority))
    .use(shard.connection.timeout(10000))

  const manifest = await connection.call("/manifest")

  const entities = {
    mode: new RemoteRepository().connect(connection.branch("/entities/mode")),
    intent: new RemoteRepository().connect(connection.branch("/entities/intent")),
    literal: new RemoteRepository().connect(connection.branch("/entities/literal")),
    symbol: new RemoteRepository().connect(connection.branch("/entities/symbol")),
    thread: new RemoteRepository().connect(connection.branch("/userspace/entities/thread")),
    buffer: new RemoteRepository().connect(connection.branch("/userspace/entities/buffer")),
  }

  const schema = await connection.call("/datamap")
  shard.datamap.wire(entities, schema)

  return { connection, manifest, entities, slug }
}
