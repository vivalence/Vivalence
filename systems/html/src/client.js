import { atom, effect, computed, map } from "nanostores";
import { env } from "$env/dynamic/public";

import { Stall } from "@vivalence/drapes";
import { Url, Connection } from "@vivalence/typology";
import { Lighthouse, Repository, entities } from "@vivalence/html/typology";

export { generator } from "./generator/index.js";
export const stall = new Stall();

export const remotes = {
  lighthouse: new Repository(entities.lighthouse),
  daemon: new Repository(entities.daemon),
};

const url = new Url(env["PUBLIC_VIVA_LIGHTHOUSE_REMOTE"]);
export const lighthouse = new Lighthouse(new Connection(url));
// lighthouse.logout();

export default { remotes, lighthouse };

// const authorize = ($authority) => async (ctx, next) => {
//   const auth = $authority.get();
//   if (auth?.access) {
//     ctx.request.headers.Authorization = `Bearer ${auth.access}`;
//   }
//   await next();
//   // console.log("daemon auth", { auth });
//   // if(ctx.response.error === auth){
//   //   await lighthouse.refresh();
//   //   await ctx.retry()
//   // }
// };

// effect([lighthouse.$identity, lighthouse.$authority], (identity, authority) => {
//   (async () => {
//     console.log({ identity, authority });
//     if (identity && authority) {
//       // maybe filter by initilized or move to lh lifecycle
//       const daemons = await lighthouse.connection.call("/entities/daemon/find");
//       console.log("daemons from lh", daemons);
//       for (const remote of daemons) {
//         const exists = await remotes.daemon //
//           .findOne((d) => d.connection.url === remote.url);

//         if (exists) continue;

//         const connection = new Connection(remote.url) //
//           .use(authorize(lighthouse.$authority));

//         await remotes.daemon.spawn(connection);

//         //         const connection = new Connection(remote.url) //
//         //           .use(authorize(lighthouse.$authority));
//         //         await remotes.daemon.spawn(connection);
//       }
//     }
//   })();
// });

// const authorize = ($authority) => async (ctx, next) => {
//   const auth = $authority.get();
//   if (auth?.access) {
//     ctx.request.headers.Authorization = `Bearer ${auth.access}`;
//   }
//   await next();
// };
