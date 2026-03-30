import { effect } from "nanostores";
import { Connection, shard } from "@vivalence/typology";
import { Daemon, lifecycle as daemonLifecycle } from "../daemon.js";

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

export function hydrate(lighthouse) {
  hydrateFromStorage(lighthouse);
  persistToStorage(lighthouse);
}

async function populate(lighthouse) {
  const { dataspace } = await import("$client");
  const daemons = await lighthouse.connection.call("/entities/daemon/find");

  await Promise.all(
    daemons.map(async (daemonPojo) => {
      const exists = await dataspace.daemon.findOne({ "connection.url": daemonPojo.url });
      if (exists) return;

      const connection = new Connection(daemonPojo.url) //
        .use(shard.connection.authorize(lighthouse.$authority));

      const daemon = new Daemon(connection);

      daemon.lighthouse = lighthouse;
      await daemonLifecycle(daemon);
      dataspace.daemon.merge(daemon);
      lighthouse.daemons.add(daemon);
    }),
  );
}

export async function lifecycle(lighthouse) {
  const verifyResult = await lighthouse.verify();

  if (verifyResult.status === "OK" || verifyResult.status === "NETWORK_ERROR") {
    if (!lighthouse.$isAuthorized.get()) throw new Error("Lighthouse unauthorized");
  }

  lighthouse.manifest = await lighthouse.connection.call("/manifest");

  await populate(lighthouse);

  return lighthouse;
}
