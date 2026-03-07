import { effect } from "nanostores";
import { Connection, shards } from "@vivalence/typology";
import { Daemon } from "@vivalence/html/typology";
import { dataspace } from "$client";

const STORAGE_KEY = (url) => `lighthouse:${url}`;

const hydrateFromStorage = (lighthouse) => {
  const key = STORAGE_KEY(lighthouse.connection.url);
  const stored = localStorage.getItem(key);

  if (stored) {
    try {
      const { authority, identity } = JSON.parse(stored);
      if (authority) lighthouse.$authority.set(authority);
      if (identity) lighthouse.$identity.set(identity);
    } catch {
      localStorage.removeItem(key);
    }
  }
};

const persistToStorage = (lighthouse) => {
  const key = STORAGE_KEY(lighthouse.connection.url);

  return effect([lighthouse.$authority, lighthouse.$identity], (authority, identity) => {
    if (authority || identity) {
      localStorage.setItem(key, JSON.stringify({ authority, identity }));
    } else {
      localStorage.removeItem(key);
    }
  });
};

async function populate(lighthouse) {
  const daemons = await lighthouse.connection.call("/entities/daemon/find");

  for (const daemonPojo of daemons) {
    const exists = await dataspace.daemon.findOne({ "connection.url": daemonPojo.url });
    // $entities.get().find((d) => d.connection.url === daemonPojo.url);
    if (exists) continue;

    const connection = new Connection(daemonPojo.url) //
      .use(shards.connection.authorize(lighthouse.$authority));

    const daemon = new Daemon(connection);

    daemon.lighthouse = lighthouse;
    await dataspace.daemon.spawn(daemon);
    lighthouse.daemons.add(daemon);
  }
}

export async function lifecycle(lighthouse) {
  hydrateFromStorage(lighthouse);

  const verifyResult = await lighthouse.verify();

  if (verifyResult.status === "OK" || verifyResult.status === "NETWORK_ERROR") {
    if (!lighthouse.$isAuthorized.get()) throw new Error("Lighthouse unauthorized");
    // else lighthouse.manifest = await lighthouse.connection.call("/manifest");
    // something something retry()
  }

  lighthouse.manifest = await lighthouse.connection.call("/manifest");

  persistToStorage(lighthouse);

  await populate(lighthouse);

  return lighthouse;
}
