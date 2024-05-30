import dotenv from "dotenv";
dotenv.config({ path: "/Users/finn/vivalence/code/spanish/app/postgres/.env" });

import { createClient } from "@supabase/supabase-js";

const { PUBLIC_SUPABASE_URL, PUBLIC_SUPABASE_ANON_KEY } = process.env;

export const supabase = createClient(
  PUBLIC_SUPABASE_URL,
  PUBLIC_SUPABASE_ANON_KEY,
);

export const fetchSupabaseData = async () => {
  const url = PUBLIC_SUPABASE_URL + "/rest/v1/test";
  const headers = new Headers({
    apikey: PUBLIC_SUPABASE_ANON_KEY,
    Authorization: "Bearer " + PUBLIC_SUPABASE_ANON_KEY,
    "Content-Type": "application/json",
    Prefer: "return=representation",
  });

  try {
    const response = await fetch(url, {
      method: "GET",
      headers: headers,
    });

    if (!response.ok) throw new Error("Network response was not ok");

    const data = await response.json();
    return data;
  } catch (error) {
    console.error("Error fetching data: ", error);
    throw error;
  }
};

export default supabase;
