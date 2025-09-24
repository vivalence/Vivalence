import { effect } from "nanostores";
import { lighthouse } from "@client/app";

export const load = async (event) => {
  //
};

// if (!lighthouse.isIdentified.get()) await goto("/");
// effect([lighthouse.$authority], (authority) => {
//   console.log("/viva effect {authority}", authority);
//   if (!authority) goto("/");
// });
// import { auth, user } from "@client/app";
// // import user from "../lib/identity/user.js";
// // import { env } from "$env/dynamic/public";

// export const load = async (event) => {
//   console.log("routes/page load auth.verify", await auth.verify());
//   // await user(app);
//   // app.call.use(app.identity.useIdentity);
//   // console.log(app.identity.getIdentity().shards[0]);
//   // if ! identity / redirect @login
//   // const ctx = await context(event);

//   return {};
// };
// import { redirect } from "@sveltejs/kit";
// import { get } from "svelte/store";
// // import { isIdentified } from "@client/app";

// export const ssr = false;

// export const load = async (event) => {
//   // console.log(await verify());
//   // if ((event.url.pathname !== "/" && !isIdentified()) || !(await verify()))
//   // if (event.url.pathname !== "/" && !isIdentified()) redirect(307, "/");
// };
