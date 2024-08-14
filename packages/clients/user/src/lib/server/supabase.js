import { createServerClient } from "@supabase/ssr";
import { env } from "$env/dynamic/public";
const { PUBLIC_SUPABASE_URL, PUBLIC_SUPABASE_ANON_KEY } = env;

export const supabase = (event) => {
  if (!PUBLIC_SUPABASE_URL || !PUBLIC_SUPABASE_ANON_KEY) {
    throw new Error("Missing PUBLIC_SUPABASE_URL or PUBLIC_SUPABASE_ANON_KEY");
  }

  const supabaseClient = createServerClient(PUBLIC_SUPABASE_URL, PUBLIC_SUPABASE_ANON_KEY, {
    cookies: {
      get: (key) => {
        const authHeader = event.request.headers.get("Authorization");

        if (event.cookies && event.cookies.get) {
          const cookie = event.cookies.get(key);
          return cookie;
        }
        if (authHeader && authHeader.startsWith("Bearer ")) {
          const token = authHeader.slice(7);
          const session = JSON.parse(token);
          return session;
        }
      },
      set: (key, value, options) => {
        event.cookies.set(key, value, options);
      },
      remove: (key, options) => {
        event.cookies.delete(key, options);
      },
    },
  });
  return supabaseClient;
};

export default supabase;
