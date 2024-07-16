import { fetch } from "@vivalence/shared/server.js";

export default async function locals(ctx, next) {
  ctx.state = ctx.state || {};
  ctx.locals = ctx.locals || {};

  // // Set up vfetch client
  // ctx.locals.client = vfetch({
  //   basePath: path.join(PUBLIC_CLIENT_URL, "api"),
  //   session: ctx.state.session,
  // });

  await next();
}

// // import path from "path";
// // import { nlp, llm, vfetch } from "@vivalence/services/server";
// // import * as ontology from "./ontology";
// // import * as api from "./api";
// // import createsupabaseclient from "./supabase";

// // const { public_client_url } = process.env;

// async function locals(ctx, next) {
//     const locals = {};

//     locals.nlp = nlp;
//     locals.llm = llm;

//     locals.supabase = createsupabaseclient(ctx);
//     locals.getuser = async () => {
//         const { data } = await locals.supabase.auth.getuser();
//         return data.user;
//     };
//     locals.getsession = async () => {
//         const { data } = await locals.supabase.auth.getsession();
//         return data.session;
//     };
//     locals.session = await locals.getsession();

//     locals.user = await locals.getuser();

//     locals.self = { api, ontology };

//     locals.client = vfetch({
//         basepath: path.join(public_client_url, "api"),
//         session: locals.session
//     });

//     ctx.locals = locals;

//     await next();
// }
