import { createBrowserClient, isBrowser, parse } from "@supabase/ssr";
import { env } from "$env/dynamic/public";
const { PUBLIC_SUPABASE_URL, PUBLIC_SUPABASE_ANON_KEY } = env;

export const supabase = (event) => {
  if (!PUBLIC_SUPABASE_URL || !PUBLIC_SUPABASE_ANON_KEY) {
    throw new Error("Missing PUBLIC_SUPABASE_URL or PUBLIC_SUPABASE_ANON_KEY");
  }
  const supabaseClient = createBrowserClient(PUBLIC_SUPABASE_URL, PUBLIC_SUPABASE_ANON_KEY, {
    cookies: {
      get(key) {
        if (isBrowser()) {
          return parse(document.cookie)[key];
        } else {
          return JSON.stringify(event.data.session);
        }
      },
      set: (key, value, options) => {
        // console.log("SUPABASE client cookies set", event);
        event.cookies && event.cookies.set(key, value, options);
      },
      remove: (key, options) => {
        // console.log("SUPABASE client cookies remove");
        event.cookies && event.cookies.delete(key, options);
      },
    },
    // global: { fetch: event.fetch },
  });
  return supabaseClient;
};

export default supabase;
