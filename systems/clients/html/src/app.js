import { atom, effect, computed, map } from "nanostores";
import { env } from "$env/dynamic/public";

import { Connection } from "@vivalence/typology";
import { Repository, entities } from "./typology/index.js";

export const remotes = {
  lighthouse: new Repository(entities.lighthouse),
  runtime: new Repository(entities.runtime),
};

const connection = new Connection(new URL(env["PUBLIC_VIVA_LIGHTHOUSE_URL"]));
// TODO: await connection. implementing retry.
export const lighthouse = await remotes.lighthouse.spawn(connection);

// lighthouse.logout();

const authorize = ($authority) => async (ctx, next) => {
  const auth = $authority.get();
  if (auth?.access) {
    ctx.request.headers.Authorization = `Bearer ${auth.access}`;
  }
  await next();
  // console.log("runtime auth", { auth });
  // if(ctx.response.error === auth){
  //   await lighthouse.refresh();
  //   await ctx.retry()
  // }
};

effect([lighthouse.$identity, lighthouse.$authority], (identity, authority) => {
  (async () => {
    if (identity && authority) {
      const runtimes = await lighthouse.call("/entities/runtime/find", {});
      for (const remote of runtimes) {
        const connection = new Connection(remote.url) //
          .use(authorize(lighthouse.$authority));
        await remotes.runtime.spawn(connection);
      }
    }
  })();
});

export default { remotes, lighthouse };
