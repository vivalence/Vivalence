import config from "@vivalence/config";
import { createServerClient } from "@supabase/ssr";

let supabaseUserClient;

export default function createSupabaseUserClient(ctx) {
  if (!supabaseUserClient) {
    const { SUPABASE_URL, SUPABASE_ANON_KEY } = config.env;
    if (!SUPABASE_URL || !SUPABASE_ANON_KEY) {
      throw new Error("Missing Supabase URL or Anon Key");
    }

    supabaseUserClient = createServerClient(SUPABASE_URL, SUPABASE_ANON_KEY, {
      cookies: {
        get: async (key) => {
          const cookie = await ctx.cookies.get(key);
          const authHeader = ctx.request.headers.authorization;

          if (authHeader && authHeader.startsWith("Bearer ")) {
            const token = authHeader.slice(7);
            const session = JSON.parse(token);
            return session;
          } else if (cookie) {
            return decodeURIComponent(cookie);
          } else {
            return null;
          }
        },
        set: async (key, value, options) => {
          if (options && options.expires) {
            await ctx.cookies.set(key, value, {
              expires: options.expires,
              secure: true,
              httpOnly: true,
              sameSite: "strict",
            });
          } else {
            await ctx.cookies.set(key, value, {
              secure: true,
              httpOnly: true,
              sameSite: "strict",
            });
          }
        },
        remove: async (key) => {
          await ctx.cookies.set(key, "", {
            expires: new Date(0),
            secure: true,
            httpOnly: true,
            sameSite: "strict",
          });
        },
      },
    });
  }
  return supabaseUserClient;
}
