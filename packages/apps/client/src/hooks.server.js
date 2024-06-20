import { json } from "@sveltejs/kit";
import { nlp, llm } from "@vivalence/services";
import urlJoin from "url-join";
import supabase from "$lib/server/supabase.js";
import { env } from "$env/dynamic/public";

const { PUBLIC_VIVALENCE_ONTOLOGIES_SPANISH_URL: ONTOLOGIES_URL } = env;

const vfetch = (params) => {
    // @lj duplication due to SSR fetch&path complications
    return (url, body) => {
        const options = {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
                ...(params.cookie && { Cookie: params.cookie })
            },
            body: JSON.stringify(body),
            credentials: "include"
        };

        const path = urlJoin(params.basePath || "", url);
        const request = (params.fetch || fetch)(path, options);

        const ok = async () => {
            try {
                const response = await request;
                const json = await response.json();
                if (json.error || !json.data) throw new Error(json.error || "No data found");
                return json.data;
            } catch (err) {
                console.error("[SERVER FETCH ERROR]");
                console.error(err);
                console.error(params);
                console.error(url, options);
                console.error("[/SERVER FETCH ERROR]");
                throw err;
            }
        };

        const single = async () => {
            const items = await ok();
            if (items[0]) return items[0];
            else throw new Error("No single data found");
        };

        const response = async () => await request;
        return { request, response, ok, single };
    };
};

export const handle = ({ event, resolve }) => {
    const locals = event.locals;

    locals.supabase = supabase(event);
    locals.nlp = nlp;
    locals.llm = llm;

    locals.client = vfetch({
        basePath: `/api`,
        fetch: event.fetch
    });

    if (!ONTOLOGIES_URL) throw new Error("ONTOLOGIES_URL not found in env");

    locals.ontology = vfetch({
        basePath: ONTOLOGIES_URL,
        fetch: event.fetch,
        cookie: event.request.headers.get("cookie")
    });

    locals.getSession = async () => {
        const { data } = await locals.supabase.auth.getSession();
        return data.session;
    };

    event.locals = locals;

    return resolve(event, {
        filterSerializedResponseHeaders(name) {
            return name === "content-range";
        }
    });
};

// depracated event.locals.params = () => {// deprecated return JSON.parse(event.url.searchParams.get("body"));}; event.locals.got = async (url, body) => {// deprecated const options = { method: "GET" }; const urlParams = new URLSearchParams({ body: JSON.stringify(body) }).toString(); const response = await event.fetch(`${url}?${urlParams}`, options); return response.json();};
// deprecated event.locals.post = async (url, body) => {const response = await fetch(url, { body }).response(); return await response.json();};
// const fetch = (url, options) => {const request = event.fetch(url, {method: "POST", ...options, headers: {"Content-Type": "application/json", ...options.headers}, body: JSON.stringify(options.body)}); const ok = async () => {try {const response = await request; const json = await response.json(); if (json.error) throw new Error(json.error); if (!json.data) throw new Error("No data found"); return json.data;} catch (err) {console.error("[FETCH ERROR]"); console.error(url); console.error(options); console.error(err); console.error("[/FETCH ERROR]"); throw new Error(err);}}; const single = async () => {const items = await ok(); if (!items[0]) {console.error("[FETCH ERROR]"); console.error(url); console.error(options); console.error(items); console.error("No single data found"); console.error("[/FETCH ERROR]"); throw new Error("No single data found");} return items[0];}; const response = async () => await request; return {request, response, ok, single};};
// event.locals.client = (url, body) => fetch(`/api/${url}`, { body });
// event.locals.ontology = (url, body) => {return fetch(`${VIVALENCE_ONTOLOGIES_SPANISH_URL}/${url}`, {headers: {// ??required??}, body});};
