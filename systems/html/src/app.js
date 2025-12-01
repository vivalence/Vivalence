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

const url = env["PUBLIC_VIVA_LIGHTHOUSE_REMOTE"];
const connection = new Connection(new Url(url));
export const lighthouse = new Lighthouse(connection);

export default { remotes, lighthouse };

// lighthouse.logout();

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
//       const daemons = await lighthouse.call("/entities/daemon/find", {});
//       for (const remote of daemons) {
//         const connection = new Connection(remote.url) //
//           .use(authorize(lighthouse.$authority));
//         await remotes.daemon.spawn(connection);
//       }
//     }
//   })();
// });
