import { effect } from "nanostores";
import { Connection } from "@vivalence/typology";
import { Lighthouse } from "./prototype.js";

const hydrateFromStorage = (lighthouse) => {
  const key = `lighthouse:${lighthouse.connection.url}`;
  const stored = localStorage.getItem(key);

  // console.log("hydrate", lighthouse, { key, stored });

  if (stored) {
    const { authority, identity } = JSON.parse(stored);
    lighthouse.$authority.set(authority);
    lighthouse.$identity.set(identity);
  }
};

const persistToStorage = (lighthouse) => {
  const key = `lighthouse:${lighthouse.connection.url}`;

  effect([lighthouse.$authority, lighthouse.$identity], (auth, identity) => {
    const value = JSON.stringify({ authority: auth, identity });
    // console.log("persiting lighhouse", lighthouse, { key, value });
    localStorage.setItem(key, value);
  });
};

async function validate(lighthouse) {
  const auth = lighthouse.$authority.get();
  if (!auth?.access) return;
  const result = await lighthouse.verify();
  if (!result.valid) await lighthouse.refresh();
}

export async function lifecycle(lighthouse) {
  // console.log("cycling lighthouse", lighthouse);
  hydrateFromStorage(lighthouse);
  await validate(lighthouse);
  lighthouse.manifest = await lighthouse.call("/manifest");
  persistToStorage(lighthouse);
  // console.log("cycled lighthouse", lighthouse);
  return lighthouse;
}
// console.log(lighthouse.connection.state.get());
// console.log(lighthouse.connection.status.code.get());
// console.log(lighthouse.authority.get(), lighthouse.identity.get());
