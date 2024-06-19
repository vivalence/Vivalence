import { isBrowser } from "@supabase/ssr";
import supabase from "$lib/supabase.js";
import urlJoin from "url-join";
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

export const handle = (event) => {
    const locals = {};

    locals.supabase = supabase(event);

    locals.client = vfetch({
        basePath: "/api",
        fetch: event.fetch
    });

    locals.ontology = vfetch({
        basePath: ONTOLOGIES_URL,
        cookie: isBrowser() ? document.cookie : "",
        fetch: event.fetch
    });

    locals.getSession = async () => {
        const { data } = await locals.supabase.auth.getSession();
        return data.session;
    };

    event.locals = locals;
    return event;
};
