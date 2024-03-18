import { PUBLIC_SUPABASE_ANON_KEY, PUBLIC_SUPABASE_URL } from "$env/static/public";
import { createBrowserClient, isBrowser, parse } from "@supabase/ssr";
import { setContext } from "svelte";
import Global from "$global";

export const load = async ({ fetch, data, depends }) => {
    depends("supabase:auth");
    Global.post = async (url, body) => {
        const response = await fetch(url, {
            method: "POST",
            headers: {
                "Content-Type": "application/json"
            },
            body: JSON.stringify(body)
        });

        return response.json();
    };
    Global.delete = async (url, body) => {
        const response = await fetch(url, {
            method: "DELETE",
            headers: {
                "Content-Type": "application/json"
            },
            body: JSON.stringify(body)
        });
        return response.json();
    };

    const supabase = createBrowserClient(PUBLIC_SUPABASE_URL, PUBLIC_SUPABASE_ANON_KEY, {
        global: { fetch },
        cookies: {
            get(key) {
                if (!isBrowser()) {
                    return JSON.stringify(data.session);
                }

                const cookie = parse(document.cookie);
                return cookie[key];
            }
        }
    });
    Global.supabase = supabase;

    const {
        data: { session }
    } = await supabase.auth.getSession();

    return { fetch, Global, supabase, session };
};
