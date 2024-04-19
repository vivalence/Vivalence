import { json } from "@sveltejs/kit";
import supabase from "$lib/server/supabase.js";

export const handle = async ({ event, resolve }) => {
    event.locals.supabase = supabase(event);

    event.locals.params = () => {
        return JSON.parse(event.url.searchParams.get("body"));
    };
    event.locals.get = async (url, body) => {
        const options = { method: "GET" };
        const urlParams = new URLSearchParams({ body: JSON.stringify(body) }).toString();
        const response = await event.fetch(`${url}?${urlParams}`, options);
        return response.json();
    };
    event.locals.post = async (url, body) => {
        const options = {
            method: "POST",
            headers: {
                "Content-Type": "application/json"
            },
            body: JSON.stringify(body)
        };
        const response = await event.fetch(url, options);
        return response.json();
    };

    event.locals.getSession = async () => {
        const { data } = await event.locals.supabase.auth.getSession();
        // console.log(data);
        return data.session;
    };

    return resolve(event, {
        filterSerializedResponseHeaders(name) {
            return name === "content-range";
        }
    });
};
