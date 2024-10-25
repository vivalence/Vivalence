import config from "@vivalence/config";
import { createClient } from "jsr:@supabase/supabase-js@2";

const { SUPABASE_URL, SUPABASE_ANON_KEY } = config.env;
if (!SUPABASE_URL || !SUPABASE_ANON_KEY) {
  throw new Error("Missing Supabase URL or Anon Key");
}

const supabaseUserClient = createClient(SUPABASE_URL, SUPABASE_ANON_KEY, {});
// cookies: {get: (key) => {const authHeader = ctx.header.authorization; const cookie = ctx.cookies.get(key); if (authHeader && authHeader.startsWith("Bearer ")) {const token = authHeader.slice(7); const session = JSON.parse(token); return session;} else if (cookie) {return decodeURIComponent(cookie);} else {return null;}}}

export default supabaseUserClient;

// import { createClient } from "@supabase/supabase-js";

// const { PUBLIC_SUPABASE_URL, PUBLIC_SUPABASE_SERVICE_ROLE_KEY, PUBLIC_SUPABASE_ANON_KEY } = process.env;

// export const supabase = createClient(PUBLIC_SUPABASE_URL, PUBLIC_SUPABASE_SERVICE_ROLE_KEY);

// export const fetchSupabaseData = async () => {
//   const url = PUBLIC_SUPABASE_URL + "/rest/v1/test";
//   const headers = new Headers({
//     apikey: PUBLIC_SUPABASE_ANON_KEY,
//     Authorization: "Bearer " + PUBLIC_SUPABASE_ANON_KEY,
//     "Content-Type": "application/json",
//     Prefer: "return=representation",
//   });

//   try {
//     const response = await fetch(url, {
//       method: "GET",
//       headers: headers,
//     });

//     if (!response.ok) throw new Error("Network response was not ok");

//     const data = await response.json();
//     return data;
//   } catch (error) {
//     console.error("Error fetching data: ", error);
//     throw error;
//   }
// };

// export default supabase;
