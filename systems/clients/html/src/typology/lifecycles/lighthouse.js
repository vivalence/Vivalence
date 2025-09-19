import { effect } from "nanostores";
import { Connection } from "@vivalence/typology";
import { Lighthouse } from "../prototypes/lighthouse.js";

const hydrateFromStorage = (lighthouse) => {
  const stored = localStorage.getItem(
    `lighthouse:${lighthouse.connection.url}`,
  );
  if (stored) {
    const { authority, identity } = JSON.parse(stored);
    lighthouse.$authority.set(authority);
    lighthouse.$identity.set(identity);
  }
};

const persistToStorage = (lighthouse) => {
  effect([lighthouse.$authority, lighthouse.$identity], (auth, identity) => {
    localStorage.setItem(
      `lighthouse:${lighthouse.connection.url}`,
      JSON.stringify({ authority: auth, identity }),
    );
  });
};

async function handshake(lighthouse) {
  lighthouse.manifest = await lighthouse.call("/manifest");

  // console.log(lighthouse.connection.state.get());
  // console.log(lighthouse.connection.status.code.get());
  // console.log(lighthouse.authority.get(), lighthouse.identity.get());
}

async function validate(lighthouse) {
  const auth = lighthouse.$authority.get();
  if (!auth?.access) return;
  const result = await lighthouse.verify();
  if (!result.valid) await lighthouse.refresh();
}

async function identity(lighthouse) {
  //  if we have authority tokens, load identity.
  //
}

export async function lifecycle(lighthouse) {
  hydrateFromStorage(lighthouse);
  await handshake(lighthouse);
  await validate(lighthouse);
  await identity(lighthouse);
  persistToStorage(lighthouse);
  return lighthouse;
}

export default lifecycle;
