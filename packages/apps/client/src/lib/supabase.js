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
        // console.log("supabase client cookies get session", event.data.session);
        // console.log("supabase client cookies get is browser cookie", key, isBrowser() && document.cookie);
        if (isBrowser()) {
          return parse(document.cookie)[key];
        } else {
          return JSON.stringify(event.data.session);
        }
      },
    },
    global: { fetch: event.fetch },
  });
  return supabaseClient;
};

export default supabase;
