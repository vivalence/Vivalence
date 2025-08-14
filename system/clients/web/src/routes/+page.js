import { goto } from "$app/navigation";
import { auth } from "@client/auth";

export const ssr = false;

export const load = async (event) => {
  if (auth.isIdentified && (await auth.verify())) {
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
