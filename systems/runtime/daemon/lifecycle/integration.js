import { Url, Connection, shard } from "@vivalence/typology";
import { compiler } from "@vivalence/vector";

export async function call(die) {
  const handler = compiler.http(die.good.aperture);
  die.connection = new Connection(new Url("http://internal"), shard.transport.inline(handler));
}

export async function uninstall(daemonDie) {
  const installed = await daemonDie.good.entities.mode.find({});
  const loadedIds = new Set(daemonDie.good.flatmodes().map(({ entity }) => entity.id));

  for (const mode of installed) {
    if (!loadedIds.has(mode.id)) {
      const entity = await daemonDie.good.entities.mode.findOneOrFail({ id: mode.id });
      await daemonDie.good.entities.mode.getEntityManager().removeAndFlush(entity);
    }
  }

  await daemonDie.good.entities.em.flush();
}
