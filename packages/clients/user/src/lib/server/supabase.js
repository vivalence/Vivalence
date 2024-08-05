// import { createServerClient } from "@supabase/ssr";
// import { env } from "$env/dynamic/public";
// const { PUBLIC_SUPABASE_URL, PUBLIC_SUPABASE_ANON_KEY } = env;

// export const supabase = (event) => {
//   if (!PUBLIC_SUPABASE_URL || !PUBLIC_SUPABASE_ANON_KEY) {
//     throw new Error("Missing PUBLIC_SUPABASE_URL or PUBLIC_SUPABASE_ANON_KEY");
//   }

//   const supabaseClient = createServerClient(PUBLIC_SUPABASE_URL, PUBLIC_SUPABASE_ANON_KEY, {
//     cookies: {
//       get: (key) => {
//         const authHeader = event.request.headers.get("Authorization");
//         const cookie = event.cookies.get(key);
//         // console.log("supabase server cookies get cookie", key, !!cookie);
//         // console.log("supabase server cookies get authHeader", authHeader && authHeader.slice(0, 50));

//         if (cookie) {
//           return cookie;
//         }
//         if (authHeader && authHeader.startsWith("Bearer ")) {
//           const token = authHeader.slice(7);
//           const session = JSON.parse(token);
//           return session;
//         }
//       },
//       set: (key, value, options) => {
//         // console.log("supabase setting cookie", key, value, options);
//         event.cookies.set(key, value, options);
//       },
//       remove: (key, options) => {
//         // console.log("supabase deleting cookie", key, options);
//         event.cookies.delete(key, options);
//       },
//     },
//   });
//   return supabaseClient;
// };

// export default supabase;
