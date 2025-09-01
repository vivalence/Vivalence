import { goto } from "$app/navigation";
import { get } from "svelte/store";
import { authority, isIdentified, verify } from "@client/app";

export const ssr = false;

export const load = async (event) => {
  if (isIdentified() && (await verify())) {
    goto("/viva");
  }
};

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
