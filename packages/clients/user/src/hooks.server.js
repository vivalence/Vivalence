import supabase from "$lib/server/supabase.js";

export const handle = async ({ event, resolve, ...props }) => {
  event.locals = event.locals || {};
  event.data = event.data || {};

  event.locals.supabase = supabase(event);

  event.locals.getUser = async () => {
    const { data } = await event.locals.supabase.auth.getUser();
    return data.user;
  };
  event.locals.getSession = async () => {
    const { data } = await event.locals.supabase.auth.getSession();
    return data.session;
  };

  event.data.session = await event.locals.getSession();

  return resolve(event, {
    filterSerializedResponseHeaders(name) {
      return name === "content-range";
    },
  });
};

// import { json } from "@sveltejs/kit";
// import { llm, nlp, vfetch } from "@vivalence/services/server";
// // import urlJoin from "url-join";
// import { env } from "$env/dynamic/public";

// const { PUBLIC_VIVALENCE_ONTOLOGIES_SPANISH_URL: ONTOLOGIES_URL } = env;

// // const vfetch = (params) => {return (url, body) => {const options = {method: "POST", headers: {"Content-Type": "application/json", ...(!!params.cookie && { Cookie: params.cookie }), ...(!!params.session && {Authorization: `Bearer ${JSON.stringify(params.session)}`})}, body: JSON.stringify(body), credentials: "include"}; const path = urlJoin(params.basePath || "", url); const request = (params.fetch || fetch)(path, options); const ok = async () => {try {const response = await request; const json = await response.json(); if (json.error || !json.data) throw new Error(json.error || "No data found"); return json.data;} catch (err) {console.error("[SERVER FETCH ERROR]"); console.error(err); console.error(params); console.error(url, options); console.error("[/SERVER FETCH ERROR]"); throw err;}}; const single = async () => {const items = await ok(); if (items[0]) return items[0]; else throw new Error("No single data found");}; const response = async () => await request; return { request, response, ok, single };};};

// export const handle = async (props) => {
//   console.log("server hooks", props);
//   //   const locals = event.locals;
//   //   locals.supabase = supabase(event);
//   //   locals.nlp = nlp;
//   //   locals.llm = llm;
//   //   locals.session = await locals.getSession();
//   //   locals.user = await locals.getUser();
//   //   locals.client = vfetch({
//   //     basePath: `/api`,
//   //     fetch: event.fetch,
//   //   });
//   //   if (!ONTOLOGIES_URL) throw new Error("ONTOLOGIES_URL not found in env");
//   //   locals.ontology = vfetch({
//   //     basePath: ONTOLOGIES_URL,
//   //     session: locals.session,
//   //   });
//   //   event.locals = locals;
//   return props.resolve(props.event, {
//     filterSerializedResponseHeaders(name) {
//       return name === "content-range";
//     },
//   });
// };
