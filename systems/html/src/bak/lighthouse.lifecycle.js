export { Lighthouse } from "../prototypes/lighthouse.js";
export { hydrate } from "../prototypes/persistence.js";

import { Connection, Url, shard } from "@vivalence/typology";
import { Daemon } from "../prototypes/daemon.js";
import { construct, populate as populateDaemon, resolve } from "./daemon.js";

export async function verify(lighthouse) {
  const result = await lighthouse.verify();
  if (result.status === "OK" || result.status === "NETWORK_ERROR") {
    if (!lighthouse.$isAuthorized.get()) throw new Error("Lighthouse unauthorized");
  }
  return result;
}

export async function populate(lighthouse) {
  if (lighthouse.daemons.size) return;

  lighthouse.manifest = await lighthouse.connection.call("/manifest");
  const daemons = await lighthouse.connection.call("/entities/daemon/find");

  await Promise.all(
    daemons.map(async (daemonPojo) => {
      if (lighthouse.daemons.has(daemonPojo.slug)) return;

      const daemonUrl = new Url(daemonPojo.url);
      const connection = new Connection(daemonUrl)
        .use(shard.connection.authorize(lighthouse.$authority))
        .use(shard.connection.batch({ url: daemonUrl }));

      const daemon = new Daemon(connection);
      daemon.lighthouse = lighthouse;

      await construct(daemon);
      await populateDaemon(daemon);
      await resolve(daemon);

      lighthouse.daemons.set(daemon.slug, daemon);
    }),
  );

  lighthouse.$daemons.set([...lighthouse.daemons.values()]);
}

export async function boot(lighthouse) {
  await verify(lighthouse);
  if (!lighthouse.$isAuthorized.get()) return false;
  await populate(lighthouse);
  return true;
}
