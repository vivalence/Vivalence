// import { isBrowser } from "@supabase/ssr";
// import supabase from "$lib/supabase.js";
// import urlJoin from "url-join";
// import { env } from "$env/dynamic/public";
// import { vfetch } from "@vivalence/services/client";

// const { PUBLIC_VIVALENCE_ONTOLOGIES_SPANISH_URL: ONTOLOGIES_URL } = env;

// // const vfetch = (params) => {return (url, body) => {const options = {method: "POST", headers: {"Content-Type": "application/json", ...(!!params.cookie && { Cookie: params.cookie }), ...(!!params.session && {Authorization: `Bearer ${JSON.stringify(params.session)}`})}, body: JSON.stringify(body), credentials: "include"}; const path = urlJoin(params.basePath || "", url); const request = (params.fetch || fetch)(path, options); const ok = async () => {try {const response = await request; const json = await response.json(); if (json.error || !json.data) throw new Error(json.error || "No data found"); return json.data;} catch (err) {console.error("[CLIENT FETCH ERROR]"); console.error(err); console.error(params); console.error(url, options); console.error("[/CLIENT FETCH ERROR]"); throw err;}}; const single = async () => {const items = await ok(); if (items[0]) return items[0]; else throw new Error("No single data found");}; const response = async () => await request; return { request, response, ok, single };};};
// // if (isBrowser()) import { vfetch } from "@vivalence/services";

export const handle = async (event) => {
  // console.log("client hooks", event);
  //   const locals = {};
  //   locals.supabase = supabase(event);
  //   locals.getSession = async () => {
  //     const { data } = await locals.supabase.auth.getSession();
  //     return data.session;
  //   };
  //   event.data.session = await locals.getSession();
  //   locals.client = vfetch({
  //     basePath: "/api",
  //     fetch: event.fetch,
  //   });
  //   if (!ONTOLOGIES_URL) throw new Error("ONTOLOGIES_URL not found in env");
  //   locals.ontology = vfetch({
  //     basePath: ONTOLOGIES_URL,
  //     session: event.data.session,
  //   });
  //   event.locals = locals;
  //   return event;
  return event;
};
