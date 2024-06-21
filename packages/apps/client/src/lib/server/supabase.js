import { createServerClient } from "@supabase/ssr";
import { env } from "$env/dynamic/public";
const { PUBLIC_SUPABASE_URL, PUBLIC_SUPABASE_ANON_KEY } = env;

export const supabase = (event) => {
    if (!PUBLIC_SUPABASE_URL || !PUBLIC_SUPABASE_ANON_KEY)
        throw new Error("Missing PUBLIC_SUPABASE_URL or PUBLIC_SUPABASE_ANON_KEY");

    const supabaseClient = createServerClient(PUBLIC_SUPABASE_URL, PUBLIC_SUPABASE_ANON_KEY, {
        cookies: {
            get: (key) => {
                console.log("cookie", key, event.cookies.get(key).slice(0, 20));
                return event.cookies.get(key);
            },
            set: (key, value, options) => {
                console.log("setting cookie", key, value, options);
                event.cookies.set(key, value, options);
            },
            remove: (key, options) => {
                console.log("deleting cookie", key, options);
                event.cookies.delete(key, options);
            }
        }
    });
    return supabaseClient;
};

export default supabase;
