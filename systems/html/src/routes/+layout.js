import { Connection, shards } from "@vivalence/typology";
import { entities, Daemon } from "@vivalence/html/typology";
import { lighthouse, dataspace } from "$client";

export const ssr = false;

let booted = false;

export const load = async () => {
  if (booted) return;
  booted = true;

  await entities.lighthouse.lifecycle(lighthouse);

  dataspace.lighthouse.add(lighthouse);

  const daemons = await lighthouse.connection.call("/entities/daemon/find");

  for (const discoveredDaemon of daemons) {
    const exists = await dataspace.daemon //
      .findOne((d) => d.connection.url === discoveredDaemon.url);
    // console.log("@discovered", exists, discoveredDaemon);

    if (exists) continue;

    const connection = new Connection(discoveredDaemon.url) //
      .use(shards.connection.authorize(lighthouse.$authority));

    const daemon = new Daemon(connection);
    daemon.lighthouse = lighthouse;
    await dataspace.daemon.spawn(daemon);

    lighthouse.daemons.add(daemon);

    // console.log("@spawned", daemon);
  }
};
