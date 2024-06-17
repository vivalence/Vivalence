import { json } from "@sveltejs/kit";
import path from "path";
import supabase from "$lib/server/supabase.js";
import { env } from "$env/dynamic/private";
const { VIVALENCE_ONTOLOGIES_SPANISH_URL } = env;

export const handle = async ({ event, resolve }) => {
    event.locals.supabase = supabase(event);

    // deprecated
    event.locals.params = () => {
        return JSON.parse(event.url.searchParams.get("body"));
    };
    event.locals.got = async (url, body) => {
        const options = { method: "GET" };
        const urlParams = new URLSearchParams({ body: JSON.stringify(body) }).toString();
        const response = await event.fetch(`${url}?${urlParams}`, options);
        return response.json();
    };

    const fetch = (url, options) => {
        const request = event.fetch(url, {
            method: "POST",
            ...options,
            headers: {
                "Content-Type": "application/json",
                ...options.headers
            },
            body: JSON.stringify(options.body)
        });

        const ok = async () => {
            try {
                const response = await request;
                const json = await response.json();
                if (json.error) throw new Error(json.error);
                if (!json.data) throw new Error("No data found");
                return json.data;
            } catch (err) {
                console.error("[FETCH ERROR]");
                console.error(url);
                console.error(options);
                console.error(err);
                console.error("[/FETCH ERROR]");
                throw new Error(err);
            }
        };
        const single = async () => {
            const items = await ok();
            if (!items[0]) {
                console.error("[FETCH ERROR]");
                console.error(url);
                console.error(options);
                console.error(items);
                console.error("No single data found");
                console.error("[/FETCH ERROR]");
                throw new Error("No single data found");
            }
            return items[0];
        };
        const response = async () => await request;

        return {
            request,
            response,
            ok,
            single
        };
    };

    event.locals.fetch = fetch;
    event.locals.post = async (url, body) => {
        const response = await fetch(url, { body }).response();
        return await response.json();
    }; // deprecated
    event.locals.client = (url, body) => fetch(`/api/${url}`, { body });
    event.locals.ontology = (url, body) => {
        return fetch(`${VIVALENCE_ONTOLOGIES_SPANISH_URL}/${url}`, {
            headers: {
                // ??required??
                Cookie: event.request.headers.get("cookie")
            },
            body
        });
    };

    event.locals.getSession = async () => {
        const { data } = await event.locals.supabase.auth.getSession();
        return data.session;
    };

    return resolve(event, {
        filterSerializedResponseHeaders(name) {
            return name === "content-range";
        }
    });
};
