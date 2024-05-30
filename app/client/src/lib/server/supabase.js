import { createServerClient } from "@supabase/ssr";
import { env } from "$env/dynamic/public";
const { PUBLIC_SUPABASE_URL, PUBLIC_SUPABASE_ANON_KEY } = env;

export const supabase = (event) => {
    const supabaseClient = createServerClient(PUBLIC_SUPABASE_URL, PUBLIC_SUPABASE_ANON_KEY, {
        cookies: {
            get: (key) => {
                return event.cookies.get(key);
            },
            set: (key, value, options) => {
                event.cookies.set(key, value, options);
            },
            remove: (key, options) => {
                event.cookies.delete(key, options);
            }
        }
    });
    return supabaseClient;
};

export default supabase;
