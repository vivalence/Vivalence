import paladin from "@vivalence/paladin";
import { Connection, shard, shape } from "@vivalence/typology";

export const ledger = async (die, next) => {
  const log = paladin.ledger.log(die.runtime.instance.manifest.slug);
  die.controller.stdout.to((record) => log.append({ json: record }));
  await next();
};

export const serve = async (die, next) => {
  const url = die.mask.statics.serve;
  die.runtime.aperture.open("/multiplex", shard.serve.multiplex(die.runtime.aperture));
  const server = Deno.serve(
    { port: Number(url.port), hostname: url.hostname, signal: die.controller.abort.signal, onListen() {} },
    shard.cors.wrap(shape.http(die.runtime.aperture)),
  );
  try {
    await next();
  } finally {
    await server.shutdown();
  }
};

export const announce = async (die, next) => {
  const remote = die.runtime.instance.lighthouse?.statics?.remote;
  if (remote) {
    const connection = new Connection(remote);
    const origin = die.runtime.instance.runtime?.statics?.serve?.origin;
    const daemons = await die.runtime.processes.daemon.find();

    for (const daemon of daemons) {
      await connection.call("/entities/daemon/ensure", { data: { slug: daemon.slug, url: daemon.url.absolute } });
    }

    if (origin) {
      const evicted = await connection.call("/entities/daemon/remove", {
        where: { url: { $like: `${origin}%` }, slug: { $nin: daemons.map((daemon) => daemon.slug) } },
      });
      if (evicted?.count) console.log(`[announce] pruned ${evicted.count} stale daemons`, evicted.ids);
    }
  }
  await next();
};
