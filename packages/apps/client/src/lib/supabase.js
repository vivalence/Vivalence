import { createBrowserClient, isBrowser, parse } from "@supabase/ssr";
import { env } from "$env/dynamic/public";

const { PUBLIC_SUPABASE_URL, PUBLIC_SUPABASE_ANON_KEY } = env;

export const supabase = (event) => {
    if (!PUBLIC_SUPABASE_URL || !PUBLIC_SUPABASE_ANON_KEY)
        throw new Error("Missing PUBLIC_SUPABASE_URL or PUBLIC_SUPABASE_ANON_KEY");
    const supabaseClient = createBrowserClient(PUBLIC_SUPABASE_URL, PUBLIC_SUPABASE_ANON_KEY, {
        cookies: {
            get(key) {
                if (!isBrowser()) {
                    return JSON.stringify(event.data.session);
                } else {
                    return parse(document.cookie)[key];
                }
            }
        }
        // global: { fetch: event.fetch }
    });
    return supabaseClient;
};

export default supabase;
